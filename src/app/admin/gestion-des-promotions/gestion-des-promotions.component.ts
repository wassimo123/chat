import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { PromotionService, Promotion } from '../../services/promotion.service';

Chart.register(...registerables);

interface Establishment {
  id: number;
  name: string;
}

interface PromoStats {
  total: number;
  percentage: number;
  fixed: number;
  freeitem: number;
  bundle: number;
  special: number;
}

@Component({
  selector: 'app-gestion-des-promotions',
  templateUrl: './gestion-des-promotions.component.html',
  styleUrls: ['./gestion-des-promotions.component.css']
})
export class GestionDesPromotionsComponent implements OnInit, AfterViewInit {
  @ViewChild('typeChart') typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  typeChart: Chart | null = null;
  statusChart: Chart | null = null;

  promotions: Promotion[] = [];
  establishments: Establishment[] = [
    { id: 1, name: "Le Bistrot Parisien" },
    { id: 2, name: "Café de la Place" },
    { id: 3, name: "Restaurant La Méditerranée" },
    { id: 4, name: "Brasserie du Commerce" },
    { id: 5, name: "L'Atelier Gourmand" }
  ];

  stats: PromoStats = { total: 0, percentage: 0, fixed: 0, freeitem: 0, bundle: 0, special: 0 };
  filteredPromotions: Promotion[] = [];
  paginatedPromotions: Promotion[] = [];
  isModalOpen: boolean = false;
  isArchiveModalOpen: boolean = false;
  showMessageModal: boolean = false;
  messageModalType: 'success' | 'error' = 'success';
  messageModalTitle: string = '';
  messageModalMessage: string = '';
  modalTitle: string = '';
  currentPromotion: Promotion = this.createEmptyPromotion();
  promotionToArchive: Promotion | null = null;
  searchQuery: string = '';
  tableSearchQuery: string = '';
  selectedStatus: string = '';
  selectedEstablishment: string = '';
  showStatusFilter: boolean = false;
  showEstablishmentFilter: boolean = false;
  days: string[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  notificationCount: number = 3;
  isProfileMenuOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  sortField: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectAll: boolean = false;

  selectedFiles: File[] = [];

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions.map(p => ({
          ...p,
          id: p._id,
          selected: false,
          startDate: new Date(p.startDate).toISOString().split('T')[0],
          endDate: new Date(p.endDate).toISOString().split('T')[0]
        }));
        this.filteredPromotions = [...this.promotions];
        this.updateStats();
        this.updatePagination();
        this.updateCharts();
      },
      error: (err: Error) => {
        this.showNotification(err.message, 'error');
      }
    });
  }

  initCharts(): void {
    if (this.typeChartRef && this.typeChartRef.nativeElement) {
      const ctx = this.typeChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.typeChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Pourcentage', 'Montant fixe', 'Article gratuit', 'Offre groupée', 'Offre spéciale'],
            datasets: [
              {
                data: [
                  this.stats.percentage,
                  this.stats.fixed,
                  this.stats.freeitem,
                  this.stats.bundle,
                  this.stats.special,
                ],
                backgroundColor: [
                  'rgba(87, 181, 231, 1)',
                  'rgba(141, 211, 199, 1)',
                  'rgba(251, 191, 114, 1)',
                  'rgba(252, 141, 98, 1)',
                  'rgba(190, 186, 218, 1)',
                ],
                borderWidth: 2,
                borderColor: '#fff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 20, font: { size: 12 } },
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
              },
            },
          },
        });
      }
    }

    if (this.statusChartRef && this.statusChartRef.nativeElement) {
      const ctx = this.statusChartRef.nativeElement.getContext('2d');
      if (ctx) {
        const statusCounts = [
          this.promotions.filter((p) => p.status === 'active').length,
          this.promotions.filter((p) => p.status === 'scheduled').length,
          this.promotions.filter((p) => p.status === 'expired').length,
          this.promotions.filter((p) => p.status === 'pending').length, // Changé de 'draft' à 'pending'
        ];

        this.statusChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Actif', 'Programmé', 'Expiré', 'En Attente'], // Changé de 'Brouillon' à 'En Attente'
            datasets: [
              {
                data: statusCounts,
                backgroundColor: [
                  'rgba(87, 181, 231, 1)',
                  'rgba(141, 211, 199, 1)',
                  'rgba(251, 191, 114, 1)',
                  'rgba(252, 141, 98, 1)', // Couleur pour 'En Attente' (anciennement 'Brouillon')
                ],
                borderRadius: 8,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
              },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#1f2937' } },
              x: { grid: { display: false }, ticks: { color: '#1f2937' } },
            },
          },
        });
      }
    }
  }

  updateStats(): void {
    this.stats.total = this.promotions.length;
    this.stats.percentage = this.promotions.filter((p) => p.type === 'percentage').length;
    this.stats.fixed = this.promotions.filter((p) => p.type === 'fixed').length;
    this.stats.freeitem = this.promotions.filter((p) => p.type === 'freeitem').length;
    this.stats.bundle = this.promotions.filter((p) => p.type === 'bundle').length;
    this.stats.special = this.promotions.filter((p) => p.type === 'special').length;
  }

  updateCharts(): void {
    if (this.typeChart && this.statusChart) {
      this.updateStats();
      this.typeChart.data.datasets[0].data = [
        this.stats.percentage,
        this.stats.fixed,
        this.stats.freeitem,
        this.stats.bundle,
        this.stats.special,
      ];
      this.typeChart.update();

      const statusCounts = [
        this.promotions.filter((p) => p.status === 'active').length,
        this.promotions.filter((p) => p.status === 'scheduled').length,
        this.promotions.filter((p) => p.status === 'expired').length,
        this.promotions.filter((p) => p.status === 'pending').length, // Changé de 'draft' à 'pending'
      ];
      this.statusChart.data.datasets[0].data = statusCounts;
      this.statusChart.update();
    }
  }

  createEmptyPromotion(): Promotion {
    return {
      name: '',
      establishmentId: 0,
      discount: '',
      startDate: '',
      endDate: '',
      status: 'pending', // Changé de 'draft' à 'pending'
      type: '',
      code: '',
      limit: undefined,
      description: '',
      photos: [],
      conditions: {
        minPurchase: false,
        minPurchaseAmount: undefined,
        newCustomers: false,
        specificItems: false,
        specificDays: false,
        days: {}
      },
      selected: false
    };
  }

  onPhotosChange(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    const previewPhotos = this.currentPromotion.photos ? [...this.currentPromotion.photos] : [];

    for (let file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!previewPhotos.includes(e.target.result)) {
          previewPhotos.push(e.target.result);
        }
        this.currentPromotion.photos = [...previewPhotos];
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(photo: string): void {
    this.currentPromotion.photos = this.currentPromotion.photos?.filter(p => p !== photo) || [];
    this.selectedFiles = this.selectedFiles.filter(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        return e.target.result !== photo;
      };
      return true;
    });
  }

  openAddPromotionModal(): void {
    this.modalTitle = 'Ajouter une promotion';
    this.currentPromotion = this.createEmptyPromotion();
    this.selectedFiles = [];
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  editPromotion(promotion: Promotion): void {
    this.modalTitle = 'Modifier la promotion';
    if (!promotion.id) {
      this.showNotification('ID de la promotion manquant.', 'error');
      return;
    }
    this.promotionService.getPromotion(promotion.id).subscribe({
      next: (updatedPromotion) => {
        this.currentPromotion = {
          ...updatedPromotion,
          id: updatedPromotion._id,
          startDate: new Date(updatedPromotion.startDate).toISOString().split('T')[0],
          endDate: new Date(updatedPromotion.endDate).toISOString().split('T')[0],
          selected: false
        };
        this.selectedFiles = [];
        this.isModalOpen = true;
      },
      error: (err: Error) => {
        this.showNotification(err.message, 'error');
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedFiles = [];
  }

  openArchiveModal(promotion: Promotion): void {
    this.promotionToArchive = promotion;
    this.isArchiveModalOpen = true;
  }

  closeArchiveModal(): void {
    this.isArchiveModalOpen = false;
    this.promotionToArchive = null;
  }

  savePromotion(): void {
    if (!this.currentPromotion.name || !this.currentPromotion.establishmentId || !this.currentPromotion.type ||
        !this.currentPromotion.discount || !this.currentPromotion.startDate || !this.currentPromotion.endDate ||
        !this.currentPromotion.status) {
      this.showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (!this.currentPromotion.id) {
      this.promotionService.addPromotion(this.currentPromotion, this.selectedFiles).subscribe({
        next: (promotion) => {
          this.closeModal();
          this.loadPromotions();
          this.showNotification('Promotion ajoutée avec succès !', 'success');
        },
        error: (err: Error) => {
          this.showNotification(err.message, 'error');
        }
      });
    } else {
      this.promotionService.updatePromotion(this.currentPromotion.id, this.currentPromotion, this.selectedFiles).subscribe({
        next: (promotion) => {
          this.closeModal();
          this.loadPromotions();
          this.showNotification('Promotion modifiée avec succès !', 'success');
        },
        error: (err: Error) => {
          this.showNotification(err.message, 'error');
        }
      });
    }
  }

  archivePromotion(): void {
    if (this.promotionToArchive && this.promotionToArchive.id) {
      this.promotionService.archivePromotion(this.promotionToArchive.id).subscribe({
        next: () => {
          this.closeArchiveModal();
          this.loadPromotions();
          this.showNotification('Promotion archivée avec succès !', 'success');
        },
        error: (err: Error) => {
          this.showNotification(err.message, 'error');
        }
      });
    }
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.messageModalType = type;
    this.messageModalTitle = type === 'success' ? 'Succès' : 'Erreur';
    this.messageModalMessage = message;
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onSearch(): void {
    this.tableSearchQuery = this.searchQuery;
    this.currentPage = 1;
    this.filterPromotions();
  }

  toggleStatusFilter(): void {
    this.showStatusFilter = !this.showStatusFilter;
    this.showEstablishmentFilter = false;
  }

  toggleEstablishmentFilter(): void {
    this.showEstablishmentFilter = !this.showEstablishmentFilter;
    this.showStatusFilter = false;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.currentPage = 1;
    this.filterPromotions();
  }

  selectEstablishment(establishmentId: string): void {
    this.selectedEstablishment = establishmentId;
    this.showEstablishmentFilter = false;
    this.currentPage = 1;
    this.filterPromotions();
  }

  filterPromotions(): void {
    this.filteredPromotions = this.promotions.filter(promotion => {
      const matchesSearch = this.tableSearchQuery
        ? promotion.name.toLowerCase().includes(this.tableSearchQuery.toLowerCase())
        : true;
      const matchesStatus = this.selectedStatus
        ? promotion.status === this.selectedStatus
        : true;
      const matchesEstablishment = this.selectedEstablishment
        ? promotion.establishmentId === +this.selectedEstablishment
        : true;

      return matchesSearch && matchesStatus && matchesEstablishment;
    });

    this.sortPromotions();
    this.updatePagination();
    this.updateCharts();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortPromotions();
  }

  sortPromotions(): void {
    this.filteredPromotions.sort((a, b) => {
      let valueA: string;
      let valueB: string;

      switch (this.sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'establishmentId':
          valueA = this.getEstablishmentName(a.establishmentId);
          valueB = this.getEstablishmentName(b.establishmentId);
          break;
        case 'discount':
          valueA = a.discount;
          valueB = b.discount;
          break;
        case 'startDate':
          valueA = a.startDate;
          valueB = b.startDate;
          break;
        case 'endDate':
          valueA = a.endDate;
          valueB = b.endDate;
          break;
        case 'status':
          valueA = this.getStatusLabel(a.status);
          valueB = this.getStatusLabel(b.status);
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }

      return this.sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPromotions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPromotions = this.filteredPromotions.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredPromotions.length);
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.paginatedPromotions.forEach(promotion => (promotion.selected = this.selectAll));
  }

  toggleSelection(promotion: Promotion): void {
    promotion.selected = !promotion.selected;
    this.selectAll = this.paginatedPromotions.every(p => p.selected);
  }

  viewPromotion(promotion: Promotion): void {
    if (!promotion.id) {
      this.showNotification('ID de la promotion manquant.', 'error');
      return;
    }
    this.promotionService.getPromotion(promotion.id).subscribe({
      next: (promo) => {
        console.log('Détails de la promotion:', promo);
      },
      error: (err: Error) => {
        this.showNotification(err.message, 'error');
      }
    });
  }

  getEstablishmentName(id: number): string {
    return this.establishments.find(e => e.id === id)?.name || 'Inconnu';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending': // Changé de 'draft' à 'pending'
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif'; // Inchangé
      case 'scheduled':
        return 'Programmé'; // Inchangé
      case 'expired':
        return 'Expiré'; // Inchangé
      case 'pending': // Changé de 'draft' à 'pending'
        return 'En Attente'; // Changé de 'Brouillon' à 'En Attente'
      default:
        return 'Inconnu';
    }
  }
}