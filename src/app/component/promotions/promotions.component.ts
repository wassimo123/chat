import { Component, OnInit,HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { PromotionService, Etablissement } from '../../services/promotion.service';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface FilterOption {
  name: string;
  selected: boolean;
}

export interface Promotion {
  name: string;
  photo?: string;
  prixAvant?: number;
  prixApres?: number;
  startDate: string;
  endDate: string;
  description?: string;
  code?: string;
  etablissementType?: string;
  etablissementName?: string;
  type?: string;
  discount?: string;
  limit?: string;
  conditions?: {
    minPurchase?: boolean;
    minPurchaseAmount?: number | null;
    newCustomers?: boolean;
    specificItems?: string[];
    specificDays?: string[];
    days: { [key: string]: boolean };
  };
}

interface ExtendedPromotion extends Promotion {
  _id: string;
  image: string;
  title: string;
  price: string;
  originalPrice: string;
  expiry: Date;
  isNew: boolean;
  expiringSoon: boolean;
  bookmarked: boolean;
  category: string;
  etablissementName: string;
  description: string;
  code: string;
  status?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css'],
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
export class PromotionsComponent implements OnInit {
  constructor(private router: Router, private promotionService: PromotionService,private viewportScroller: ViewportScroller , private eRef: ElementRef) {}

  promotions: ExtendedPromotion[] = [];
  filteredPromotions: ExtendedPromotion[] = [];
  newsletterEmail: string = '';
  newsletterSuccess: boolean = false;
  isDuplicate: boolean = false;
  emailError: boolean = false;
  showPromotionDetailModal: boolean = false;
  isLoading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 9;
  priceMin: number = 0;
  priceMax: number = 500;
  selectedPromotion: ExtendedPromotion | null = null;
  showNotifyModal: boolean = false;
  notificationEmail: string = '';
  notificationMessage: string = '';
  notificationSuccess: boolean = false;

  categories: FilterOption[] = [
    { name: 'Restaurants', selected: false },
    { name: 'Hôtels', selected: false },
    { name: 'Sfax', selected: false },
    { name: 'Cafés', selected: false },
  ];
  promotionTypes: FilterOption[] = [
    { name: 'Pourcentage de réduction', selected: false },
    { name: 'Montant fixe', selected: false },
    { name: 'Article gratuit', selected: false },
    { name: 'Offre groupée', selected: false },
    { name: 'Offre spéciale', selected: false },
  ];
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  sortOption: string = 'recent';
  newOffersOnly: boolean = false;
  expiringSoon: boolean = false;

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.loadPromotions();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Vérifie si le clic est à l'extérieur de la modale de détails
    if (this.showPromotionDetailModal && this.selectedPromotion) {
      const modalDetail = document.querySelector('.promotion-detail-modal');
      if (modalDetail && !modalDetail.contains(targetElement) && !targetElement.closest('.info-button')) {
        this.closeModal();
      }
    }

    // Vérifie si le clic est à l'extérieur de la modale de notification
    if (this.showNotifyModal && this.selectedPromotion) {
      const modalNotify = document.querySelector('.notify-modal');
      if (modalNotify && !modalNotify.contains(targetElement) && !targetElement.closest('.notify-icon')) {
        this.closeModal();
      }
    }
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe({
      next: (promotions: any[]) => {
        const now = new Date();
  
        this.promotions = promotions
          .map(p => {
            return {
              ...p,
              createdAt: new Date(p.createdAt),
              image: p.photo || 'https://via.placeholder.com/300',
              title: p.name || 'Sans titre',
              price: p.prixApres !== undefined && p.prixApres !== null ? (+p.prixApres).toFixed(2) : 'N/A',
              originalPrice: p.prixAvant !== undefined && p.prixAvant !== null ? (+p.prixAvant).toFixed(2) : 'N/A',
              expiry: new Date(p.endDate),
              isNew: new Date(p.startDate) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              expiringSoon: new Date(p.endDate) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              bookmarked: false,
              category: p.etablissementType || 'Inconnu',
              etablissementName: p.etablissementName || 'Inconnu',
              description: p.description || 'Aucune description disponible.',
              code: p.code || 'Aucun code',
              conditions: {
                minPurchase: p.conditions?.minPurchase ?? false,
                minPurchaseAmount: p.conditions?.minPurchaseAmount ?? null,
                newCustomers: p.conditions?.newCustomers ?? false,
                specificItems: p.conditions?.specificItems ?? [],
                specificDays: p.conditions?.specificDays ?? [],
                days: p.conditions?.days ?? {}
              },
            };
          })
          .filter(p => p.status === 'active');

        this.filteredPromotions = [...this.promotions];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des promotions :', err);
      }
    });
  }

  onFiltersChange(): void {
    this.filterPromotions();
  }

  confirmNotification(): void {
    if (!this.notificationEmail.trim() || !/^\S+@\S+\.\S+$/.test(this.notificationEmail)) {
      this.notificationSuccess = false;
      this.notificationMessage = 'Veuillez entrer un e-mail valide.';
      return;
    }

    if (!this.selectedPromotion) {
      this.notificationSuccess = false;
      this.notificationMessage = 'Aucune promotion sélectionnée.';
      return;
    }

    this.isLoading = true;
    this.promotionService.notifyPromotion(this.notificationEmail, this.selectedPromotion['_id']).subscribe({
      next: (res) => {
        this.notificationSuccess = true;
        this.notificationMessage = res.message || 'Inscription à la notification réussie ! Un e-mail de confirmation vous a été envoyé.';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
        }, 3000);
      },
      error: (err) => {
        this.notificationSuccess = false;
        this.notificationMessage = err.error?.message || 'Une erreur est survenue lors de l’inscription.';
        this.isLoading = false;
      }
    });
  }

  getPromotionTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      percentage: 'Pourcentage de réduction',
      fixed: 'Montant fixe',
      freeitem: 'Article gratuit',
      bundle: 'Offre groupée',
      special: 'Offre spéciale',
    };
    return typeMap[type] || type;
  }

  subscribe() {
    const email = this.newsletterEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Reset all flags
    this.newsletterSuccess = false;
    this.isDuplicate = false;
    this.emailError = false;

    if (!isValidEmail) {
      this.emailError = true;
      return;
    }

    this.promotionService.subscribeToNewsletter(email).subscribe({
      next: (res) => {
        this.newsletterSuccess = true;
        this.newsletterEmail = '';
        setTimeout(() => {
          this.newsletterSuccess = false;
        }, 5000);
      },
      error: (err) => {
        if (err.message === 'Cet email est déjà inscrit à la newsletter.') {
          this.isDuplicate = true;
          setTimeout(() => {
            this.isDuplicate = false;
          }, 5000);
        } else {
          this.emailError = true;
        }
      }
    });
  }

  filterPromotions() {
    this.filteredPromotions = this.promotions.filter((promo) => {
      const matchesSearch = this.searchQuery
        ? promo.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          promo.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          promo.etablissementName.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;

      const matchesCategory = this.categories.some((c) => c.selected)
        ? this.categories.some((c) => {
            const singularName = c.name.replace(/s$/, '');
            return c.selected && singularName.toLowerCase() === promo.category?.toLowerCase();
          })
        : true;

      const matchesType = this.promotionTypes.some((t) => t.selected)
        ? this.promotionTypes.some((t) => t.selected && t.name === this.getPromotionTypeLabel(promo.type || ''))
        : true;

      const promoPrice = promo.price === 'N/A' ? 0 : parseFloat(promo.price) || 0;
      const matchesPrice = promoPrice >= this.priceMin && promoPrice <= this.priceMax;

      const matchesDate =
        !this.startDate || !this.endDate
          ? true
          : new Date(this.startDate) <= new Date(promo.endDate) &&
            new Date(this.endDate) >= new Date(promo.startDate);

      const matchesNew = this.newOffersOnly ? promo.isNew : true;
      const matchesExpiring = this.expiringSoon ? promo.expiringSoon : true;

      return matchesSearch && matchesCategory && matchesType && matchesPrice && matchesDate && matchesNew && matchesExpiring;
    });

    this.sortPromotions();
  }

  sortPromotions() {
    this.filteredPromotions.sort((a, b) => {
      switch (this.sortOption) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dateAsc':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'dateDesc':
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        case 'discountAsc':
          const discountA = parseFloat(a.discount?.replace('%', '') || '0');
          const discountB = parseFloat(b.discount?.replace('%', '') || '0');
          return discountA - discountB;
        case 'discountDesc':
          const discountBDesc = parseFloat(b.discount?.replace('%', '') || '0');
          const discountADesc = parseFloat(a.discount?.replace('%', '') || '0');
          return discountBDesc - discountADesc;
        default:
          return 0;
      }
    });
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPromotions = this.filteredPromotions.slice(start, end);
  }

  openPromotionModal(promotion: ExtendedPromotion) {
    this.selectedPromotion = promotion;
    this.showPromotionDetailModal = true;
    this.showNotifyModal = false;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPromotions.length / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  paginatedPromotions: ExtendedPromotion[] = [];

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  toggleBookmark(promotion: ExtendedPromotion) {
    promotion.bookmarked = !promotion.bookmarked;
  }

  redirectToBookingSite(url: string) {
    window.open(url, '_blank');
  }

  openNotifyModal(promotion: ExtendedPromotion) {
    this.selectedPromotion = promotion;
    this.showNotifyModal = true;
    this.showPromotionDetailModal = false;
    this.notificationEmail = '';
    this.notificationMessage = '';
    this.notificationSuccess = false;
  }

  closeModal() {
    this.selectedPromotion = null;
    this.showPromotionDetailModal = false;
    this.showNotifyModal = false;
    this.notificationEmail = '';
    this.notificationMessage = '';
    this.notificationSuccess = false;
  }

  getValidDays(days: { [key: string]: boolean } | undefined): string[] {
    if (!days || typeof days !== 'object') return [];
  
    const dayNames: { [key: string]: string } = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      lundi: 'Lundi',
      mardi: 'Mardi',
      mercredi: 'Mercredi',
      jeudi: 'Jeudi',
      vendredi: 'Vendredi',
      samedi: 'Samedi',
      dimanche: 'Dimanche'
    };
  
    return Object.entries(days)
      .filter(([_, isValid]) => isValid)
      .map(([key]) => dayNames[key.toLowerCase()] || key);
  }

  getCategoryIconData(category: string): { icon: string, bgClass: string, colorClass: string } {
    const cat = category?.toLowerCase();
  
    if (cat.includes('restaurant')) {
      return { icon: 'ri-restaurant-2-line', bgClass: 'bg-red-100', colorClass: 'text-red-600' };
    }
    if (cat.includes('hôtel') || cat.includes('hotel')) {
      return { icon: 'ri-hotel-bed-line', bgClass: 'bg-blue-100', colorClass: 'text-blue-600' };
    }
    if (cat.includes('café')) {
      return { icon: 'ri-cup-line', bgClass: 'bg-yellow-100', colorClass: 'text-yellow-600' };
    }
    if (cat.includes('sfax')) {
      return { icon: 'ri-map-pin-2-line', bgClass: 'bg-green-100', colorClass: 'text-green-600' };
    }
  
    return { icon: 'ri-price-tag-3-line', bgClass: 'bg-gray-100', colorClass: 'text-gray-600' };
  }

  getCategoryBadgeClass(type: string): string {
    switch (type) {
      case 'Hôtel':
        return 'bg-purple-100 text-purple-800';
      case 'Café':
        return 'bg-cafe-light text-cafe-dark';
      case 'Sfax':
        return 'bg-gray-200 text-gray-800';
      case 'Restaurant':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}