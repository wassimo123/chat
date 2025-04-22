import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { EtablissementService } from '../../services/etablissement.service';

interface FilterServices {
  Piscine: boolean;
  Spa: boolean;
  Restaurant: boolean;
  Wifi: boolean;
}

@Component({
  selector: 'app-cafe',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './cafe.component.html',
  styleUrls: ['./cafe.component.css']
})
export class CafeComponent implements OnInit {
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

  hotels: any[] = [];
  filteredHotels: any[] = [];

  constructor(private router: Router, private etablissementService: EtablissementService) {}

  ngOnInit() {
    this.fetchHotels();
  }

  fetchHotels() {
    this.isLoading = true;
    this.errorMessage = null;
    this.etablissementService.getCafes().subscribe({
      next: (hotels) => {
        // Map API response to match the component's expected structure
        this.hotels = hotels.map(hotel => {
          let imageUrl = 'https://r-xx.bstatic.com/xdata/images/hotel/608x352/281564416.webp?k=d34be48dc235d2aba463351d30aa399a184946441e78177d1ed6e66c427e5e81&o='; // Fallback placeholder
      
          if (hotel.photos?.length) {
            const photo = hotel.photos[0];
            if (typeof photo === 'string') {
              imageUrl = `http://localhost:5000/${photo.replace(/\\/g, '/')}`;
            } else if (photo instanceof File) {
              imageUrl = URL.createObjectURL(photo);
            }
            console.log("imageUrl",imageUrl);
          }
      
          return {
            id: hotel.id,
            nom: hotel.nom,
            type: hotel.type,
            image: imageUrl,
            rating: 4,
            reviews: 100,
            description: hotel.description || 'Aucune description disponible',
            price: 200,
            services: hotel.services?.map((s: string) => this.normalizeService(s)) || [],
            address: hotel.adresse,
            hours: hotel.horaires?.is24_7 ? '24/7' : 'Horaires non spécifiés',
            phone: hotel.telephone,
            siteWeb:hotel.siteWeb
          };
        });
        this.filteredHotels = this.hotels; // Directly show all hotels
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching hotels:', error);
        this.errorMessage = 'Impossible de charger les hôtels. Veuillez réessayer plus tard.';
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

  filterHotels() {
    let filtered = this.hotels.filter(item => {
      const matchesSearch = item.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPrice = (!this.filterPriceMin || item.price >= this.filterPriceMin) &&
                           (!this.filterPriceMax || item.price <= this.filterPriceMax);
      const selectedStars = Object.keys(this.filterStars)
        .filter(star => this.filterStars[parseInt(star)])
        .map(star => parseInt(star));
      const matchesStars = selectedStars.length === 0 || selectedStars.some(star => Math.floor(item.rating) === star);
      const selectedServices = Object.keys(this.filterServices)
        .filter(service => this.filterServices[service as keyof FilterServices]);
      const matchesServices = selectedServices.length === 0 || selectedServices.every(service => item.services.includes(service));

      return matchesSearch && matchesPrice && matchesStars && matchesServices;
    });

    this.filteredHotels = filtered.slice(0, this.currentItems);
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortOption = target.value;
      this.sortHotels(target.value);
    }
  }

  sortHotels(sortType: string) {
    switch (sortType) {
      case 'priceAsc':
        this.filteredHotels.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        this.filteredHotels.sort((a, b) => b.price - b.price);
        break;
      case 'rating':
        this.filteredHotels.sort((a, b) => b.rating - a.rating);
        break;
      default:
        this.filterHotels();
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  openBookingModal(hotel: any) {
    this.router.navigate(['/hotel', hotel.id]);
  }

  loadMore() {
    this.currentItems += this.itemsPerPage;
    this.filterHotels();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  canLoadMore(): boolean {
    let filtered = this.hotels.filter(item => {
      const matchesSearch = item.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPrice = (!this.filterPriceMin || item.price >= this.filterPriceMin) &&
                           (!this.filterPriceMax || item.price <= this.filterPriceMax);
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

  goToWebsite(url:any) {
    if (url) {
      window.open(url, '_blank'); // Opens in a new tab
    }

  }
}