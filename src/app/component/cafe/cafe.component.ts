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


interface CafeDisplay {
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

  Cafe: CafeDisplay[] = [];
  filteredCafe: CafeDisplay[] = [];

  constructor(private router: Router, private etablissementService: EtablissementService) {}

  ngOnInit() {
    this.fetchCafe();
  }

  fetchCafe() {
    this.isLoading = true;
    this.errorMessage = null;
    this.etablissementService.getCafe().subscribe({
      next: (cafe: Etablissement[]) => {
        // Map API response to match the component's expected structure
        this.Cafe = cafe.map((cafe: Etablissement) => {
          let imageUrl = 'https://r-xx.bstatic.com/xdata/images/cafe/608x352/281564416.webp?k=d34be48dc235d2aba463351d30aa399a184946441e78177d1ed6e66c427e5e81&o=';
      
          if (cafe.photos?.length) {
            const photo = cafe.photos[0];
            if (typeof photo === 'string') {
              imageUrl = `http://localhost:5000/${photo.replace(/\\/g, '/')}`;
            } else if (photo instanceof File) {
              imageUrl = URL.createObjectURL(photo);
            }
            console.log("imageUrl", imageUrl);
          }
      
          return {
            id: cafe.id ?? '', 
            nom: cafe.nom,
            type: cafe.type,
            image: imageUrl,
            rating: 4,
            reviews: 100,
            description: cafe.description || 'Aucune description disponible',
            price: 200,
            services: cafe.services?.map((s: string) => this.normalizeService(s)) || [],
            address: cafe.adresse,
            hours: cafe.horaires?.is24_7 ? '24/7' : 'Horaires non spécifiés',
            phone: cafe.telephone,
            siteWeb: cafe.siteWeb
          };
        });
        this.filteredCafe = this.Cafe; // Directly show all cafes
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching cafes:', error);
        this.errorMessage = 'Impossible de charger les cafés. Veuillez réessayer plus tard.';
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

  filterCafe() {
    let filtered = this.Cafe.filter(item => {
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

    this.filteredCafe = filtered.slice(0, this.currentItems);
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortOption = target.value;
      this.sortCafes(target.value);
    }
  }

  sortCafes(sortType: string) {
    switch (sortType) {
      case 'priceAsc':
        this.filteredCafe.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        this.filteredCafe.sort((a, b) => b.price - b.price);
        break;
      case 'rating':
        this.filteredCafe.sort((a, b) => b.rating - a.rating);
        break;
      default:
        this.filterCafe();
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  loadMore() {
    this.currentItems += this.itemsPerPage;
    this.filterCafe();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  canLoadMore(): boolean {
    let filtered = this.Cafe.filter(item => {
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

  goToWebsite(url: string) {
    if (url) {
      window.open(url, '_blank'); // Opens in a new tab
    }
  }

  goToDetails(cafe: CafeDisplay): void {
    console.log("cafe:", cafe);
    if (!cafe.id) {
      console.error('Cafe ID is undefined!');
      return;
    }
    this.router.navigate(['/etablissements', cafe.id]);
  }
}