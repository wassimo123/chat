import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { PromotionService } from '../../services/promotion.service';
import { Router } from '@angular/router';

interface Promotion {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  discount?: string;
  price: string;
  originalPrice: string;
  bookingUrl: string;
  expiry: Date;
  code: string;
  type: string;
  isNew: boolean;
  expiringSoon: boolean;
  bookmarked: boolean;
}

interface FilterOption {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css'],
})
export class PromotionsComponent implements OnInit {
    constructor(private router: Router, private promotionsService: PromotionService) {}
    promos: any[] = [];

  promotions: Promotion[] = [
    {
      id: 1,
      title: 'Menu Dégustation à -30%',
      category: 'Restaurants',
      image:
        'https://public.readdy.ai/ai/img_res/0d25b5cd337457dd071c49ec105809c5.jpg',
      description:
        "Profitez d'une réduction exceptionnelle sur notre menu dégustation 5 plats, boissons incluses.",
      discount: '-30%',
      price: '150 DT',
      originalPrice: '214 DT',
      bookingUrl: 'https://www.tripadvisor.fr/Restaurants-g297948-Sfax_Sfax_Governorate.html',
      expiry: new Date('2025-04-30'),
      code: 'RIVAGE30',
      type: 'Réduction',
      isNew: true,
      expiringSoon: false,
      bookmarked: false,
    },
    {
      id: 2,
      title: 'Séjour prolongé',
      category: 'Hôtels',
      image:
        'https://public.readdy.ai/ai/img_res/32d93e2005d8f1af43c7ff4508b57d47.jpg',
      description:
        "Réservez 2 nuits et bénéficiez d'une 3ème nuit gratuite dans notre établissement 5 étoiles.",
      discount: '2 nuits + 1 offerte',
      price: '300 DT',
      originalPrice: '450 DT',
      bookingUrl: 'https://www.booking.com/hotel/tn/les-oliviers-palace.fr.html',
      expiry: new Date('2025-05-15'),
      code: 'AZUR3NUITS',
      type: '2-pour-1',
      isNew: false,
      expiringSoon: false,
      bookmarked: false,
    },
    {
      id: 3,
      title: 'Duo Massage & Spa',
      category: 'Bien-être',
      image:
        'https://public.readdy.ai/ai/img_res/e13af13a8124215c0e0f6bcfa6e73400.jpg',
      description:
        'Venez à deux et payez pour une seule personne sur tous nos soins signature et accès au spa.',
      discount: '2-pour-1',
      price: '120 DT',
      originalPrice: '240 DT',
      bookingUrl: 'https://www.booking.com/hotel/tn/les-oliviers-palace.fr.html',
      expiry: new Date('2025-04-10'),
      code: 'DUOSPA',
      type: '2-pour-1',
      isNew: false,
      expiringSoon: true,
      bookmarked: false,
    },
    {
      id: 4,
      title: 'Soldes mi-saison',
      category: 'Commerces',
      image:
        'https://public.readdy.ai/ai/img_res/62655534414c750c9aa928b3b1f4a631.jpg',
      description:
        "Profitez de 50% de réduction sur toute notre collection printemps-été et un cadeau offert dès 100€ d'achat.",
      discount: '-50%',
      price: '50 DT',
      originalPrice: '100 DT',
      bookingUrl: '#',
      expiry: new Date('2025-04-25'),
      code: 'En magasin uniquement',
      type: 'Réduction',
      isNew: false,
      expiringSoon: false,
      bookmarked: false,
    },
    {
      id: 5,
      title: 'Happy Hour Gourmand',
      category: 'Restaurants',
      image:
        'https://public.readdy.ai/ai/img_res/fc73e879e864f6d0189cdebe41268ad1.jpg',
      description:
        'Tous les jours de 16h à 18h, profitez de -40% sur toutes nos pâtisseries et boissons chaudes.',
      discount: 'Happy Hour',
      price: '10 DT',
      originalPrice: '17 DT',
      bookingUrl: '#',
      expiry: new Date('2025-06-30'),
      code: 'Sur présentation',
      type: 'Happy hour',
      isNew: true,
      expiringSoon: false,
      bookmarked: false,
    },
    {
      id: 6,
      title: 'Pack Famille Aventure',
      category: 'Loisirs',
      image:
        'https://public.readdy.ai/ai/img_res/928ba4329f1957994210092e3c89597c.jpg',
      description:
        "Entrée gratuite pour les enfants (jusqu'à 12 ans) pour 2 adultes payants + goûter offert.",
      discount: 'Famille',
      price: '80 DT',
      originalPrice: '120 DT',
      bookingUrl: '#',
      expiry: new Date('2025-05-31'),
      code: 'FAMILLEAVENTURE',
      type: 'Cadeau offert',
      isNew: false,
      expiringSoon: false,
      bookmarked: false,
    },
  ];

  filteredPromotions: Promotion[] = [];
  categories: FilterOption[] = [
    { name: 'Restaurants', selected: false },
    { name: 'Hôtels', selected: false },
    { name: 'Commerces', selected: false },
    { name: 'Loisirs', selected: false },
    { name: 'Bien-être', selected: false },
  ];
  promotionTypes: FilterOption[] = [
    { name: 'Réduction', selected: false },
    { name: '2-pour-1', selected: false },
    { name: 'Cadeau offert', selected: false },
    { name: 'Happy hour', selected: false },
  ];
  searchQuery: string = '';
  priceRange: number = 250;
  startDate: string = '';
  endDate: string = '';
  newOffersOnly: boolean = false;
  expiringSoon: boolean = false;
  sortOption: string = 'recent';
  personalizedAlerts: boolean = false;

/*ngOnInit(): void {
  this.promotionsService.getPromotions().subscribe({
    next: (promotions) => {
      console.log("promos:", promotions);
      this.promos = promotions;
      this.filteredPromotions = promotions; // move it here
    },
    error: (error) => {
      console.error('Erreur lors du chargement des promotions:', error);
    }
  });
}
*/

ngOnInit() {
  this.filteredPromotions = [...this.promotions];
}
  

  filterPromotions() {
    this.filteredPromotions = this.promotions.filter((promo) => {
      const matchesSearch = this.searchQuery
        ? promo.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          promo.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;

      const matchesCategory = this.categories.some((c) => c.selected)
        ? this.categories.some((c) => c.selected && c.name === promo.category)
        : true;

      const matchesType = this.promotionTypes.some((t) => t.selected)
        ? this.promotionTypes.some((t) => t.selected && t.name === promo.type)
        : true;

      const matchesPrice = this.priceRange
        ? parseFloat(promo.price) <= this.priceRange
        : true;

      const matchesDate = this.startDate || this.endDate
        ? (!this.startDate ||
            new Date(this.startDate) <= promo.expiry) &&
          (!this.endDate || new Date(this.endDate) >= promo.expiry)
        : true;

      const matchesNew = this.newOffersOnly ? promo.isNew : true;
      const matchesExpiring = this.expiringSoon ? promo.expiringSoon : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesDate &&
        matchesNew &&
        matchesExpiring
      );
    });

    this.sortPromotions();
  }

  sortPromotions() {
    this.filteredPromotions.sort((a, b) => {
      switch (this.sortOption) {
        case 'recent':
          return b.isNew ? 1 : -1;
        case 'expiry':
          return a.expiry.getTime() - b.expiry.getTime();
        case 'discountAsc':
          return (
            parseFloat(a.discount?.replace('%', '') || '0') -
            parseFloat(b.discount?.replace('%', '') || '0')
          );
        case 'discountDesc':
          return (
            parseFloat(b.discount?.replace('%', '') || '0') -
            parseFloat(a.discount?.replace('%', '') || '0')
          );
        default:
          return 0;
      }
    });
  }

  toggleBookmark(promotion: Promotion) {
    promotion.bookmarked = !promotion.bookmarked;
  }

  redirectToBookingSite(url: string) {
    window.open(url, '_blank');
  }
}