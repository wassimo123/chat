import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { EtablissementService } from '../../services/etablissement.service';
import { Etablissement } from '../../models/etablissement.model';

interface FilterServices {
  Piscine: boolean;
  Spa: boolean;
  Restaurant: boolean;
  Wifi: boolean;
}

interface RestaurantDisplay {
  id: string;
  nom: string;
  type: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  price: number;
  services: string[];
  address: string;
  hours: string;
  phone: string;
  siteWeb: string;
}

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css']
})
export class RestaurantComponent implements OnInit {
  searchQuery: string = '';
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;
  filterStars: { [key: number]: boolean } = { 3: false, 4: false, 5: false };
  filterServices: FilterServices = {
    Piscine: false,
    Spa: false,
    Restaurant: false,
    Wifi: false
  };
  showFilters: boolean = false;
  sortOption: string = 'default';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  itemsPerPage: number = 10;
  currentItems: number = this.itemsPerPage;

  Restaurant: RestaurantDisplay[] = [];
  filteredRestaurant: RestaurantDisplay[] = [];
restaurant: any;

  constructor(private router: Router, private etablissementService: EtablissementService) {}

  ngOnInit() {
    this.fetchRestaurant();
  }

  fetchRestaurant() {
    this.isLoading = true;
    this.errorMessage = null;
    this.etablissementService.getRestaurant().subscribe({
      next: (restaurant: Etablissement[]) => {
        this.Restaurant = restaurant.map((restaurant: Etablissement) => {
          let imageUrl = 'https://r-xx.bstatic.com/xdata/images/restaurant/608x352/281564416.webp?k=d34be48dc235d2aba463351d30aa399a184946441e78177d1ed6e66c427e5e81&o=';
      
          if (restaurant.photos?.length) {
            const photo = restaurant.photos[0];
            if (typeof photo === 'string') {
              imageUrl = `http://localhost:5000/${photo.replace(/\\/g, '/')}`;
            } else if (photo instanceof File) {
              imageUrl = URL.createObjectURL(photo);
            }
            console.log("imageUrl", imageUrl);
          }
      
          return {
            id: restaurant.id ?? '',
            nom: restaurant.nom,
            type: restaurant.type,
            image: imageUrl,
            rating: 4,
            reviews: 100,
            description: restaurant.description || 'Aucune description disponible',
            price: 200,
            services: restaurant.services?.map((s: string) => this.normalizeService(s)) || [],
            address: restaurant.adresse,
            hours: restaurant.horaires?.is24_7 ? '24/7' : 'Horaires non spécifiés',
            phone: restaurant.telephone,
            siteWeb: restaurant.siteWeb
          };
        });
        this.filteredRestaurant = this.Restaurant;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching restaurants:', error);
        this.errorMessage = 'Impossible de charger les restaurants. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  normalizeService(service: string): string {
    switch (service.toLowerCase()) {
      case 'wifi gratuit':
        return 'Wifi';
      case 'piscine':
        return 'Piscine';
      case 'spa':
        return 'Spa';
      case 'restaurant':
        return 'Restaurant';
      default:
        return service;
    }
  }

  filterRestaurant() {
    let filtered = this.Restaurant.filter((item: RestaurantDisplay) => {
      const matchesSearch = item.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPrice = (!this.filterPriceMin || item.price >= (this.filterPriceMin ?? 0)) &&
                           (!this.filterPriceMax || item.price <= (this.filterPriceMax ?? Infinity));
      const selectedStars = Object.keys(this.filterStars)
        .filter(star => this.filterStars[parseInt(star)])
        .map(star => parseInt(star));
      const matchesStars = selectedStars.length === 0 || selectedStars.some(star => Math.floor(item.rating) === star);
      const selectedServices = Object.keys(this.filterServices)
        .filter(service => this.filterServices[service as keyof FilterServices]);
      const matchesServices = selectedServices.length === 0 || selectedServices.every(service => item.services.includes(service));

      return matchesSearch && matchesPrice && matchesStars && matchesServices;
    });

    this.filteredRestaurant = filtered.slice(0, this.currentItems);
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortOption = target.value;
      this.sortRestaurants(target.value);
    }
  }

  sortRestaurants(sortType: string) {
    switch (sortType) {
      case 'priceAsc':
        this.filteredRestaurant.sort((a: RestaurantDisplay, b: RestaurantDisplay) => a.price - b.price);
        break;
      case 'priceDesc':
        this.filteredRestaurant.sort((a: RestaurantDisplay, b: RestaurantDisplay) => b.price - a.price);
        break;
      case 'rating':
        this.filteredRestaurant.sort((a: RestaurantDisplay, b: RestaurantDisplay) => b.rating - a.rating);
        break;
      default:
        this.filterRestaurant();
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  goToWebsite(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  goToDetails(restaurant: RestaurantDisplay): void {
    console.log("restaurant:", restaurant);
    if (!restaurant.id) {
      console.error('Restaurant ID is undefined!');
      return;
    }
    this.router.navigate(['/etablissements', restaurant.id]);
  }

  loadMore() {
    this.currentItems += this.itemsPerPage;
    this.filterRestaurant();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  canLoadMore(): boolean {
    let filtered = this.Restaurant.filter((item: RestaurantDisplay) => {
      const matchesSearch = item.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPrice = (!this.filterPriceMin || item.price >= (this.filterPriceMin ?? 0)) &&
                           (!this.filterPriceMax || item.price <= (this.filterPriceMax ?? Infinity));
      const selectedStars = Object.keys(this.filterStars)
        .filter(star => this.filterStars[parseInt(star)])
        .map(star => parseInt(star));
      const matchesStars = selectedStars.length === 0 || selectedStars.some(star => Math.floor(item.rating) === star);
      const selectedServices = Object.keys(this.filterServices)
        .filter(service => this.filterServices[service as keyof FilterServices]);
      const matchesServices = selectedServices.length === 0 || selectedServices.every(service => item.services.includes(service));

      return matchesSearch && matchesPrice && matchesStars && matchesServices;
    });

    return this.currentItems < filtered.length;
  }
}