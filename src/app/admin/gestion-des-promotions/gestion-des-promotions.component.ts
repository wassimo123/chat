import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { PromotionService, Etablissement } from '../../services/promotion.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Promotion } from '../../models/promotion.model';


Chart.register(...registerables);

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
  styleUrls: ['./gestion-des-promotions.component.css'],
})
export class GestionDesPromotionsComponent implements OnInit, AfterViewInit {
  @ViewChild('typeChart') typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  typeChart: Chart | null = null;
  statusChart: Chart | null = null;
  isDetailModalOpen: boolean = false;
  promotionDetails: Promotion | null = null;

  selectedEstablishmentType: string = '';
  showEstablishmentFilter: boolean = false;
  showEstablishmentListFilter: boolean = false;


  promotions: Promotion[] = [];
  notifications: any[] = [];
  etablissements: Etablissement[] = [];
  filteredEtablissements: Etablissement[] = [];
  etablissementsType: Etablissement[] = [];
  availableTypes: string[] = ['Hôtel', 'Restaurant', 'Café', 'Sfax'];
  selectedType: string = '';

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
  days: string[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  isAuthenticated: boolean = false;
  isProfileMenuOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  sortField: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectAll: boolean = false;

  selectedFile: File | null = null;

  constructor(
    private promotionService: PromotionService,
    private notificationService: NotificationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      this.isAuthenticated = false;
      this.router.navigate(['/connexion'], { queryParams: { error: 'unauthorized' } });
      return;
    }
  
    const user = JSON.parse(userData);
    if (!user || !user.email) {
      this.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.router.navigate(['/connexion'], { queryParams: { error: 'unauthorized' } });
      return;
    }
  
    this.isAuthenticated = true;
    
    this.promotionService.getEtablissements().subscribe({
      next: (etabs) => {
        this.etablissements = etabs;
        this.filteredEtablissements = [...etabs];
        this.loadPromotions();
      },
      error: (err) => {
        this.showNotification(err.message, 'error');
      },
    });
  
  //   this.notificationService.notifications$.subscribe((notifications) => {
  //     let unreadNotifications = notifications.filter((notif) => !notif.read);
  //     const checkPromises = unreadNotifications.map((notif) => {
  //       if (!notif.email) {
  //         return Promise.resolve(null);
  //       }
  //       return this.userService
  //         .checkUserExists(notif.email)
  //         .toPromise()
  //         .then(
  //           (response) => {
  //             if (response && response.exists) {
  //               return notif;
  //             } else {
  //               console.log(`Utilisateur avec email ${notif.email} n'existe plus, suppression de la notification.`);
  //               return null;
  //             }
  //           },
  //           (error) => {
  //             console.error(`Erreur lors de la vérification de l'utilisateur ${notif.email}:`, error);
  //             return null;
  //           }
  //         );
  //     });
  
  //     Promise.all(checkPromises).then((results) => {
  //       this.notifications = results.filter((notif) => notif !== null) as any[];
  //     });
  //   });
  // }
  // this.notificationService.notifications$.subscribe((notifications) => {
  //   let unreadNotifications = notifications.filter((notif) => !notif.read);
  //   const checkPromises = unreadNotifications.map((notif) => {
  //     if (!notif.email) {
  //       return Promise.resolve(null);
  //     }
  //     return this.userService.checkUserExists(notif.email).toPromise().then(
  //       (response) => {
  //         if (response && Array.isArray(response) && response[0].exists) {
  //           return notif; // User exists
  //         } else {
  //           console.log(`Utilisateur avec email ${notif.email} n'existe plus, suppression de la notification.`);
  //           // this.notificationService.removeNotificationsByEmail(notif.email); 
  //           return null; // User doesn't exist or error
  //         }
  //       },
  //       (error) => {
  //         console.error(`Erreur lors de la vérification de l'utilisateur ${notif.email}:`, error);
  //         this.showNotification(`Erreur lors de la vérification de l'email ${notif.email}: ${error.message}`, 'error');
  //         return null;
  //       }
  //     );
  //   });

  //   Promise.all(checkPromises).then((results) => {
  //     this.notifications = results.filter((notif) => notif !== null) as any[];
  //   });
  // });
  this.notificationService.notifications$.subscribe(notifications => {
    console.log('Notifications reçues:', notifications);
    let unreadNotifications = notifications.filter(notif => !notif.read);
    const updatedNotifications: any[] = [];
    let checkPromises = unreadNotifications.map(notif => {
      if (!notif.email) {
        return Promise.resolve(null);
      }
      return this.userService.checkUserExists(notif.email).toPromise().then(
        (response) => {
          if (response && response.exists) {
            return notif;
          } else {
            console.log(`Utilisateur avec email ${notif.email} n'existe plus, suppression de la notification.`);
            return null;
          }
        },
        error => {
          console.error(`Erreur lors de la vérification de l'utilisateur ${notif.email}:`, error);
          return null;
        }
      );
    });

    Promise.all(checkPromises).then(results => {
      const validNotifications = results.filter(notif => notif !== null);
      this.notifications = validNotifications;
    });
  });
}

  ngAfterViewInit(): void {
    if (this.isAuthenticated) {
      this.initCharts();
    }
  }

  loadAllEtablissements(): void {
    this.promotionService.getEtablissements().subscribe({
      next: (etabs) => {
        this.etablissements = etabs;
        this.filteredEtablissements = [...etabs]; // Initialize with all establishments
      },
      error: (err) => {
        this.showNotification(err.message, 'error');
      },
    });
  }

  // Select a type and filter establishments
selectEstablishmentType(type: string): void {
  this.selectedEstablishmentType = type === '' ? '' : type; // Reset to empty string for "Tous"
  this.showEstablishmentFilter = false;
  this.currentPage = 1;

  if (type) {
    this.promotionService.getEtablissementsByType(type).subscribe({
      next: (etabs) => {
        this.filteredEtablissements = etabs;
        this.selectedEstablishment = ''; // Reset establishment filter when type changes
        this.filterPromotions();
      },
      error: () => {
        this.showNotification('Erreur lors du chargement des établissements', 'error');
      },
    });
  } else {
    this.filteredEtablissements = [...this.etablissements]; // Reset to all establishments
    this.selectedEstablishment = '';
    this.filterPromotions();
  }
}

loadPromotions(): void {
  this.promotionService.getPromotions().subscribe({
    next: (promotions) => {
      const today = new Date();

      this.promotions = promotions.map((p: any) => {
        const etab = this.etablissements.find((e) => e._id === p.etablissementId);

        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);

        // Mettre à jour localement le statut si expiré
        let status = p.status;
        if (status === 'active' && endDate < today) {
          status = 'expired';
        }

        return {
          ...p,
          id: p._id,
          selected: false,
          status: status, // mise à jour locale
          etablissementId: {
            _id: p.etablissementId,
            nom: etab ? etab.nom : 'Inconnu',
            type: etab ? etab.type : '',
          },
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          establishmentName: etab ? etab.nom : 'Inconnu',
          photo: p.photo ?? null,
        };
      });

      //  Afficher uniquement les promotions actives
      // this.promotions = this.promotions.filter(p => p.status === 'active');

      this.filteredPromotions = [...this.promotions];
      this.updateStats();
      this.updatePagination();
      this.updateCharts();
    },
    error: (err: Error) => {
      this.showNotification(err.message, 'error');
    },
  });
}


  onTypeChange(): void {
    this.etablissementsType = [];
    this.currentPromotion.etablissementId = { _id: '', nom: '', type: '' };
    if (this.selectedType) {
      this.promotionService.getEtablissementsByType(this.selectedType).subscribe({
        next: (etabs) => {
          this.etablissementsType = etabs;
          if (!etabs.some((e) => e._id === this.currentPromotion.etablissementId._id)) {
            this.currentPromotion.etablissementId = { _id: '', nom: '', type: '' };
          }
        },
        error: () => {
          this.showNotification('Erreur lors du chargement des établissements', 'error');
        },
      });
    }
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
          this.promotions.filter((p) => p.status === 'pending').length,
          this.promotions.filter((p) => p.status === 'expired').length,
        ];

        this.statusChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Actif', 'En Attente', 'Expiré'],
            datasets: [
              {
                data: statusCounts,
                backgroundColor: [
                  'rgba(87, 181, 231, 1)',
                  'rgba(141, 211, 199, 1)',
                  'rgba(251, 191, 114, 1)',
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
        this.promotions.filter((p) => p.status === 'pending').length,
        this.promotions.filter((p) => p.status === 'expired').length,
      ];
      this.statusChart.data.datasets[0].data = statusCounts;
      this.statusChart.update();
    }
  }

  createEmptyPromotion(): Promotion {
    return {
      id: '',
      name: '',
      discount: '',
      startDate: '',
      endDate: '',
      status: '',
      type: '',
      code: '',
      limit: null,
      description: '',
      photo: null, // Updated to allow null or string/array
      prixAvant: null,
      prixApres: null,
      conditions: {
        minPurchase: false,
        minPurchaseAmount: null,
        newCustomers: false,
        specificItems: false,
        specificDays: false,
        days: {},
      },
      etablissementId: {
        _id: '',
        nom: '',
        type: '',
      },
      selected: false,
    };
  }
//saghari
photoPreviewUrl: string | null = null; // Pour prévisualiser

onPhotoChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string; // ✅ uniquement pour affichage
      this.currentPromotion.photo = this.photoPreviewUrl;
    };
    reader.readAsDataURL(file);
  }
}

removePhoto(): void {
  this.selectedFile = null;
  this.photoPreviewUrl = null;
  this.currentPromotion.photo = null; // annule photo existante
}
getPhotoUrl(photo: string | string[] | null | undefined): string {
  if (Array.isArray(photo) && photo.length > 0) {
    return `http://localhost:5000${photo[0]}`; // Use the first photo if it’s an array
  }
  if (typeof photo === 'string') {
    // Check if the photo is already a base64 string (starts with "data:image")
    if (photo.startsWith('data:image')) {
      return photo; // Base64 string, use directly
    }
    return `http://localhost:5000${photo}`; // Assume it’s a path, prepend the server URL
  }
  return 'https://via.placeholder.com/300'; // Fallback for null/undefined
}

  

  openAddPromotionModal(): void {
    this.modalTitle = 'Ajouter une promotion';
    this.currentPromotion = this.createEmptyPromotion();
    this.selectedType = '';
    this.etablissementsType = [];
    this.selectedFile = null;
    this.photoPreviewUrl = null;
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.router.navigate(['/connexion']);
  }

  editPromotion(promotion: Promotion): void {
    this.modalTitle = 'Modifier la promotion';
    if (!promotion.id) {
      this.showNotification('ID de la promotion manquant.', 'error');
      return;
    }
    this.promotionService.getPromotion(promotion.id).subscribe({
      next: (updatedPromotion: any) => {
        const etab = this.etablissements.find((e) => e._id === updatedPromotion.etablissementId);
        this.currentPromotion = {
          ...updatedPromotion,
          id: updatedPromotion._id,
          etablissementId: {
            _id: updatedPromotion.etablissementId,
            nom: etab ? etab.nom : 'Inconnu',
            type: etab ? etab.type : '',
          },
          startDate: new Date(updatedPromotion.startDate).toISOString().split('T')[0],
          endDate: new Date(updatedPromotion.endDate).toISOString().split('T')[0],
          selected: false,
          establishmentName: etab ? etab.nom : 'Inconnu',
        };
        this.selectedType = this.currentPromotion.etablissementId.type;
        this.etablissementsType = [];
        if (this.selectedType) {
          this.promotionService.getEtablissementsByType(this.selectedType).subscribe({
            next: (etabs) => {
              this.etablissementsType = etabs;
            },
            error: () => {
              this.showNotification('Erreur lors du chargement des établissements', 'error');
            },
          });
        }
        this.selectedFile = null;
        this.isModalOpen = true;
      },
      error: (err: Error) => {
        this.showNotification(err.message, 'error');
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedFile = null;
    this.selectedType = '';
    this.etablissementsType = [];
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
    if (
      !this.currentPromotion.name ||
      !this.currentPromotion.etablissementId._id ||
      !this.currentPromotion.type ||
      !this.currentPromotion.discount ||
      !this.currentPromotion.startDate ||
      !this.currentPromotion.endDate ||
      !this.currentPromotion.status
    ) {
      this.showNotification('Veuillez remplir tous les champs obligatoires, y compris le type et le statut.', 'error');
      return;
    }

    const validTypes: string[] = ['percentage', 'fixed', 'freeitem', 'bundle', 'special'];
    if (!validTypes.includes(this.currentPromotion.type)) {
      this.showNotification('Veuillez sélectionner un type valide.', 'error');
      return;
    }

    const validStatuses: string[] = ['active', 'pending', 'expired'];
    if (!validStatuses.includes(this.currentPromotion.status)) {
      this.showNotification('Veuillez sélectionner un statut valide.', 'error');
      return;
    }

    const startDate = new Date(this.currentPromotion.startDate);
    const endDate = new Date(this.currentPromotion.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.showNotification('Format de date invalide.', 'error');
      return;
    }
    if (startDate > endDate) {
      this.showNotification('La date de début doit être antérieure à la date de fin.', 'error');
      return;
    }
    const promotionData = { ...this.currentPromotion, photo: undefined };
    if (!this.currentPromotion.id) {
      this.promotionService.addPromotion(this.currentPromotion, this.selectedFile || undefined).subscribe({
        next: () => {
          this.closeModal();
          this.loadPromotions();
          this.showNotification('Promotion ajoutée avec succès !', 'success');
        },
        error: (err: Error) => {
          this.showNotification(err.message, 'error');
        },
      });
    } else {
      this.promotionService
      .updatePromotion(this.currentPromotion.id, this.currentPromotion, this.selectedFile ? [this.selectedFile] : undefined)
    
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadPromotions();
            this.showNotification('Promotion modifiée avec succès !', 'success');
          },
          error: (err: Error) => {
            this.showNotification(err.message, 'error');
          },
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
        },
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

  // Toggle the type filter dropdown
toggleEstablishmentFilter(): void {
  this.showEstablishmentFilter = !this.showEstablishmentFilter;
  this.showStatusFilter = false;
  this.showEstablishmentListFilter = false; // Close other dropdowns
}
// Toggle the establishment filter dropdown (for the optional second dropdown)
toggleEstablishmentListFilter(): void {
  this.showEstablishmentListFilter = !this.showEstablishmentListFilter;
  this.showStatusFilter = false;
  this.showEstablishmentFilter = false; // Close other dropdowns
}

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.currentPage = 1;
    this.filterPromotions();
  }

  selectEstablishment(establishmentId: string): void {
    this.selectedEstablishment = establishmentId;
    this.showEstablishmentListFilter = false;
    this.currentPage = 1;
    this.filterPromotions();
  }

  filterPromotions(): void {
    this.filteredPromotions = this.promotions.filter((promotion) => {
      const matchesSearch = this.tableSearchQuery
        ? promotion.name.toLowerCase().includes(this.tableSearchQuery.toLowerCase())
        : true;
      const matchesStatus = this.selectedStatus ? promotion.status === this.selectedStatus : true;
      const matchesEstablishmentType = this.selectedEstablishmentType
        ? promotion.etablissementId.type === this.selectedEstablishmentType
        : true;
      const matchesEstablishment = this.selectedEstablishment
        ? promotion.etablissementId._id === this.selectedEstablishment
        : true;
  
      return matchesSearch && matchesStatus && matchesEstablishmentType && matchesEstablishment;
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
        case 'establishmentName':
          valueA = a.etablissementId.nom;
          valueB = b.etablissementId.nom;
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
    this.paginatedPromotions.forEach((promotion) => (promotion.selected = this.selectAll));
  }

  toggleSelection(promotion: Promotion): void {
    promotion.selected = !promotion.selected;
    this.selectAll = this.paginatedPromotions.every((p) => p.selected);
  }

  viewPromotion(promotion: Promotion): void {
    if (!promotion.id) {
      this.showNotification('ID de la promotion manquant.', 'error');
      return;
    }
  
    this.promotionService.getPromotion(promotion.id).subscribe({
      next: (promo: any) => {
        const etab = this.etablissements.find((e) => e._id === promo.etablissementId);
        this.promotionDetails = {
          ...promo,
          id: promo._id,
          etablissementId: {
            _id: promo.etablissementId,
            nom: etab ? etab.nom : 'Inconnu',
            type: etab ? etab.type : '',
          },
          startDate: new Date(promo.startDate).toISOString(),
          endDate: new Date(promo.endDate).toISOString(),
          establishmentName: etab ? etab.nom : 'Inconnu',
          photo: promo.photo ?? null,
          // Ensure photo is handled as string or array
        }; 
        console.log('promotionDetails.photo:', this.promotionDetails?.photo);
        this.photoPreviewUrl = null;
        this.isDetailModalOpen = true;
      },
      error: (err: Error) => {
        this.showNotification(err.message, 'error');
      },
    });
  }
// Getter to return photos as an array (or empty array if not an array)
get photoArray(): string[] {
  const photo = this.promotionDetails?.photo ?? null;
  if (Array.isArray(photo)) {
    return photo; // Already an array
  }
  if (typeof photo === 'string') {
    return [photo]; // Convert string to array
  }
  return []; // Return empty array if null or undefined
}



isPhotoString(photos: string | string[] | null | undefined): photos is string {
  return typeof photos === 'string';
}

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.promotionDetails = null;
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En Attente';
      case 'expired':
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  }

  getEstablishmentName(id: string | undefined): string {
    if (!id) return 'Inconnu';
    const etab = this.etablissements.find((e) => e._id === id);
    return etab ? etab.nom : 'Inconnu';
  }

  updateEtablissementDetails(etablissementId: string): void {
    const selectedEtab = this.etablissementsType.find((etab) => etab._id === etablissementId);
    if (selectedEtab) {
      this.currentPromotion.etablissementId = {
        _id: selectedEtab._id,
        nom: selectedEtab.nom,
        type: selectedEtab.type || this.selectedType,
      };
    } else {
      this.currentPromotion.etablissementId = { _id: '', nom: '', type: '' };
    }
  }

isPhotoArray(photos: string | string[] | null | undefined): photos is string[] {
  return Array.isArray(photos);
}


  // Helper method to get selected days for conditions
  getSelectedDays(days: { [key: string]: boolean }): string {
    const selected = this.days.filter(day => days[day]);
    return selected.length ? selected.join(', ') : 'Aucun jour spécifié';
  }
}




