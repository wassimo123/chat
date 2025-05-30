import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { EtablissementService } from '../../services/etablissement.service';
import { Etablissement } from '../../models/etablissement.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { ViewportScroller } from '@angular/common';

interface FilterServices {
  wifi: boolean;
  emporter: boolean;
  piscine: boolean;
  parking: boolean;
  reservation: boolean;
  petitDejeuner: boolean;
  terrasse: boolean;
  accessibilite: boolean;
  paiementCarte: boolean;
  livraison: boolean;
  climatisation: boolean;
  serviceChambre: boolean;
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
  styleUrls: ['./restaurant.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class RestaurantComponent implements OnInit {
  searchQuery: string = '';
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;
  filterStars: { [key: number]: boolean } = { 3: false, 4: false, 5: false };
  filterServices = {
    wifi: false,
    emporter: false,
    piscine: false,
    parking: false,
    reservation: false,
    petitDejeuner: false,
    terrasse: false,
    accessibilite: false,
    paiementCarte: false,
    livraison: false,
    climatisation: false,
    serviceChambre: false,
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

  constructor(private router: Router, private etablissementService: EtablissementService,private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
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
        this.Restaurant.reverse(); ////wasssimmmmm
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
        return 'wifi';
      case 'piscine':
        return 'piscine';
      case 'spa':
        return 'spa';
      case 'restaurant':
        return 'restaurant';
      case 'à emporter':
        return 'emporter';
      case 'réservation':
        return 'reservation';
      case 'petit-déjeuner inclus':
        return 'petitDejeuner';
      case 'terrasse':
        return 'terrasse';
      case 'accessibilité pmr':
        return 'accessibilite';
      case 'paiement par carte':
        return 'paiementCarte';
      case 'livraison':
        return 'livraison';
      case 'climatisation':
        return 'climatisation';
      case 'service de chambre':
        return 'serviceChambre';
      default:
        return service.toLowerCase(); // fallback
    }
  }
  

  filterRestaurant() {
    let filtered = this.Restaurant.filter((item: RestaurantDisplay) => {
      // Recherche par nom ou description
      const matchesSearch =
        item.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
  
      // Filtrage par prix
      const matchesPrice =
        (!this.filterPriceMin || item.price >= this.filterPriceMin) &&
        (!this.filterPriceMax || item.price <= this.filterPriceMax);
  
      // Filtrage par étoiles
      const selectedStars = Object.keys(this.filterStars)
        .filter(star => this.filterStars[parseInt(star)])
        .map(star => parseInt(star));
      const matchesStars =
        selectedStars.length === 0 || selectedStars.some(star => Math.floor(item.rating) === star);
  
      // Filtrage par services
      const selectedServices = Object.keys(this.filterServices)
        .filter(service => this.filterServices[service as keyof FilterServices]);
  
      const matchesServices =
        selectedServices.length === 0 ||
        selectedServices.every(service =>
          item.services.map(s => s.toLowerCase()).includes(service.toLowerCase())
        );
  
      // Retour du résultat global
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