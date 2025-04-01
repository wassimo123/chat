import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';

interface FilterServices {
  Piscine: boolean;
  Spa: boolean;
  Restaurant: boolean;
  Wifi: boolean;
}

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css']
})
export class HotelsComponent implements OnInit {
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

  itemsPerPage: number = 3;
  currentItems: number = this.itemsPerPage;

  hotels: any[] = [
    {
      id: 2,
      nom: 'Royal Sfax',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/c331f3dc04a9a6af680b0e2947b16522.jpg',
      rating: 5,
      reviews: 256,
      description: 'Hôtel 5 étoiles offrant un confort moderne.',
      price: 320,
      services: ['Piscine', 'Spa', 'Restaurant', 'Wifi'],
      address: '456 Boulevard Royal, Sfax',
      hours: '24/7',
      phone: '+216 74 987 654'
    },
    {
      id: 4,
      nom: 'Hôtel Les Oliviers Palace',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/b1f351d8b3bbd3405fcf95c6d3a5355e.jpg',
      rating: 4.8,
      reviews: 128,
      description: 'Situé au cœur de Sfax, l\'Hôtel Les Oliviers Palace offre une expérience de luxe unique.',
      price: 320,
      services: ['Piscine', 'Restaurant', 'Wifi'],
      address: '321 Avenue des Oliviers, Sfax',
      hours: '24/7',
      phone: '+216 74 654 321'
    },
    {
      id: 5,
      nom: 'Hôtel Borj Dhiafa',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/f4c14da105f7b0748c2a51ad3034dfbb.jpg',
      rating: 4.6,
      reviews: 96,
      description: 'Un cadre élégant et raffiné combinant confort moderne et architecture traditionnelle.',
      price: 250,
      services: ['Restaurant', 'Wifi'],
      address: '654 Rue Borj Dhiafa, Sfax',
      hours: '24/7',
      phone: '+216 74 321 654'
    },
    {
      id: 6,
      nom: 'Hôtel Mercure Sfax',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/702d21ceeadc1c21e7a232d1f2dc6d1d.jpg',
      rating: 4.7,
      reviews: 156,
      description: 'Idéal pour les voyageurs d\'affaires et les touristes avec des chambres modernes.',
      price: 280,
      services: ['Restaurant', 'Wifi'],
      address: '987 Boulevard Mercure, Sfax',
      hours: '24/7',
      phone: '+216 74 789 123'
    }
  ];
  filteredHotels: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filterHotels();
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
        this.filteredHotels.sort((a, b) => b.price - a.price);
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
}