import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { EvenementService } from '../../services/evenement.service';
import { Evenement, Stats } from '../../models/evenement.model';
import { UserService } from '../../services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
Chart.register(...registerables);
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-des-evenements',
  templateUrl: './gestion-des-evenements.component.html',
  styleUrls: ['./gestion-des-evenements.component.css']
})
export class GestionDesEvenementsComponent implements OnInit, AfterViewInit {
  @ViewChild('eventsByMonthChart') eventsByMonthChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventsByCategoryChart') eventsByCategoryChartRef!: ElementRef<HTMLCanvasElement>;

  eventsByMonthChart: Chart | null = null;
  eventsByCategoryChart: Chart | null = null;
  isAuthenticated: boolean = false;
  evenements: Evenement[] = [];
  filteredEvents: Evenement[] = [];
  paginatedEvents: Evenement[] = [];
  stats: Stats = { total: 0, upcoming: 0, inProgress: 0, completed: 0 };
  notifications: any[] = [];
  isViewMode = false;
  tableSearchQuery = '';
  selectedStatus = 'Tous';
  selectedTypeEtablissement = 'Tous';
  selectedSort = '';
  showSortFilter = false;
  showStatusFilter = false;
  showTypeEtablissementFilter = false;

  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  isModalOpen = false;
  modalTitle = '';
  currentEvent: Evenement = this.getDefaultEvent();

  isArchiveModalOpen = false;
  eventToArchive: Evenement | null = null;

  photoPreview: string | null = null;
  selectedFile: File | null = null;
  etablissementsType: { _id: string; nom: string }[] = [];

  selectAll = false;
  isProfileMenuOpen = false;
  notificationCount = 3;
  searchQuery = '';

  showMessageModal = false;
  messageModalType: 'success' | 'error' = 'success';
  messageModalTitle = '';
  messageModalMessage = '';

  private readonly API_BASE_URL = 'http://localhost:5000';

  constructor(
    private evenementService: EvenementService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

    this.loadEvenements();
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
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Gestion du menu profil
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }

    // Fermeture du modal d'ajout/modification/visualisation si clic en dehors
    if (
      this.isModalOpen &&
      !target.closest('.max-w-lg') && // Conteneur du modal (ajout/modif)
      !target.closest('.max-w-5xl') && // Conteneur du modal (visualisation)
      !target.closest('.bg-primary') && // Bouton "Ajouter un événement"
      !target.closest('.ri-pencil-line') && // Bouton "Modifier"
      !target.closest('.ri-eye-line') && // Bouton "Visualiser"
      !target.closest('.ri-archive-line') // Bouton "Archiver" (par sécurité)
    ) {
      this.closeModal();
    }

    // Fermeture du modal d'archivage si clic en dehors
    if (
      this.isArchiveModalOpen &&
      !target.closest('.max-w-md') && // Conteneur du modal d'archivage
      !target.closest('.ri-archive-line') // Bouton "Archiver"
    ) {
      this.closeArchiveModal();
    }

    // Fermeture des filtres si clic en dehors
    if (
      this.showStatusFilter &&
      !target.closest('.relative') // Conteneur du filtre de statut
    ) {
      this.showStatusFilter = false;
    }

    if (
      this.showTypeEtablissementFilter &&
      !target.closest('.relative') // Conteneur du filtre de type d'établissement
    ) {
      this.showTypeEtablissementFilter = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.isAuthenticated) {
      this.initCharts();
    }
  }

  private getTimestampFromId(id: string): number {
    const timestampHex = id.substring(0, 8);
    return parseInt(timestampHex, 16) * 1000;
  }

  loadEvenements(): void {
    this.evenementService.getEvenements().subscribe({
      next: (evenements: Evenement[]) => {
        this.evenements = evenements.map((e: Evenement) => ({
          ...e,
          selected: false
        }));
        console.log(" this.evenements", this.evenements)
        this.evenements.sort((a, b) => this.getTimestampFromId(b.id) - this.getTimestampFromId(a.id));
        this.filteredEvents = this.evenements;
        this.updateStats();
        this.updatePagination();
        this.updateCharts();
      },
      // error: (err: any) => {
      //   this.showNotification('Erreur lors du chargement des événements: ' + err.message, 'error');
      // }
    });
  }

  initCharts(): void {
    if (this.eventsByMonthChartRef && this.eventsByMonthChartRef.nativeElement) {
      const ctx = this.eventsByMonthChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.eventsByMonthChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
              data: [5, 7, 10, 12, 9, 8, 6, 4, 7, 8, 5, 6],
              backgroundColor: 'rgba(87, 181, 231, 1)',
              borderRadius: 4
            }]
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
                borderWidth: 1
              }
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#1f2937' } },
              x: { grid: { display: false }, ticks: { color: '#1f2937' } }
            }
          }
        });
      }
    }

    if (this.eventsByCategoryChartRef && this.eventsByCategoryChartRef.nativeElement) {
      const ctx = this.eventsByCategoryChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.eventsByCategoryChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Gastronomie', 'Musique', 'Littérature', 'Cinéma', 'Art', 'Sport', 'Conférences', 'Festivals', 'Autre'],
            datasets: [{
              data: [24, 18, 15, 12, 10, 8, 5, 7, 5],
              backgroundColor: [
                'rgba(87, 181, 231, 1)',
                'rgba(141, 211, 199, 1)',
                'rgba(251, 191, 114, 1)',
                'rgba(252, 141, 98, 1)',
                'rgba(186, 147, 216, 1)',
                'rgba(104, 211, 145, 1)',
                'rgba(255, 159, 243, 1)',
                'rgba(255, 217, 102, 1)',
                'rgba(163, 163, 163, 1)'
              ],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1
              }
            }
          }
        });
      }
    }
  }

  updateStats(): void {
    this.stats.total = this.evenements.length;
    this.stats.upcoming = this.evenements.filter(e => e.statut === 'À venir').length;
    this.stats.inProgress = this.evenements.filter(e => e.statut === 'En cours').length;
    this.stats.completed = this.evenements.filter(e => e.statut === 'Terminé').length;
  }

  filterEvents(): void {
    this.filteredEvents = this.evenements.filter((e) => {
      const matchesSearch =
        e.nom.toLowerCase().includes(this.tableSearchQuery.toLowerCase()) ||
        e.lieu.toLowerCase().includes(this.tableSearchQuery.toLowerCase()) ||
        e.etablissementId.type.toLowerCase().includes(this.tableSearchQuery.toLowerCase());

      let matchesStatus = true;
      if (this.selectedStatus !== 'Tous') {
        matchesStatus = e.statut === this.selectedStatus;
      }

      const matchesType = this.selectedTypeEtablissement === 'Tous' || e.etablissementId.type === this.selectedTypeEtablissement;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.currentPage = 1;
    this.updatePagination();
    this.updateCharts();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.router.navigate(['/connexion']);
  }

  updateCharts(): void {
    if (this.eventsByMonthChart) {
      const monthCounts = Array(12).fill(0);
      this.filteredEvents.forEach(e => {
        const month = new Date(e.dateDebut).getMonth();
        monthCounts[month]++;
      });
      this.eventsByMonthChart.data.datasets[0].data = monthCounts;
      this.eventsByMonthChart.update();
    }

    if (this.eventsByCategoryChart) {
      const categoryCounts: { [key: string]: number } = {
        Gastronomie: 0,
        Musique: 0,
        Littérature: 0,
        Cinéma: 0,
        Art: 0,
        Sport: 0,
        Conférences: 0,
        Festivals: 0,
        Autre: 0
      };
      const validCategories = ['Gastronomie', 'Musique', 'Littérature', 'Cinéma', 'Art', 'Sport', 'Conférences', 'Festivals', 'Autre'];
      this.filteredEvents.forEach(e => {
        if (validCategories.includes(e.categorie)) {
          categoryCounts[e.categorie]++;
        }
      });
      this.eventsByCategoryChart.data.datasets[0].data = Object.values(categoryCounts);
      this.eventsByCategoryChart.update();
    }
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredEvents.sort((a, b) => {
      let valueA: any, valueB: any;
      if (field === 'nom' || field === 'lieu') {
        valueA = a[field].toLowerCase();
        valueB = b[field].toLowerCase();
      } else if (field === 'dateDebut') {
        valueA = new Date(a.dateDebut);
        valueB = new Date(b.dateDebut);
      } else if (field === 'prix') {
        valueA = a.prix.montant;
        valueB = b.prix.montant;
      } else if (field === 'estPublic') {
        valueA = a.estPublic;
        valueB = b.estPublic;
      }
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(start, end);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredEvents.length);
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

  toggleSortFilter(): void {
    this.showSortFilter = !this.showSortFilter;
    this.showStatusFilter = false;
    this.showTypeEtablissementFilter = false;
  }

  toggleStatusFilter(): void {
    this.showStatusFilter = !this.showStatusFilter;
    this.showSortFilter = false;
    this.showTypeEtablissementFilter = false;
  }

  toggleTypeEtablissementFilter(): void {
    this.showTypeEtablissementFilter = !this.showTypeEtablissementFilter;
    this.showSortFilter = false;
    this.showStatusFilter = false;
  }

  selectSort(sort: string): void {
    this.selectedSort = sort;
    this.showSortFilter = false;
    this.sortBy(sort.toLowerCase());
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.filterEvents();
  }

  selectTypeEtablissement(type: string): void {
    this.selectedTypeEtablissement = type;
    this.showTypeEtablissementFilter = false;
    this.filterEvents();
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.paginatedEvents.forEach((e) => (e.selected = this.selectAll));
  }

  toggleSelection(event: Evenement): void {
    event.selected = !event.selected;
    this.selectAll = this.paginatedEvents.every((e) => e.selected);
  }

  getDefaultEvent(): Evenement {
    return {
      id: '',
      nom: '',
      dateDebut: '',
      dateFin: '',
      heureDebut: '',
      heureFin: '',
      lieu: '',
      ville: '',
      capacite: 0,
      categorie: '',
      organisateur: '',
      description: '',
      estPublic: true,
      statut: '',
      typeEtablissement: '',
      etablissementId: {
        _id:'',
        nom: '',
        type: ''
      },
      selected: false,
      photo: '',
      prix: {
        estGratuit: false,
        montant: 0
      }
    };
  }

  openAddEventModal(): void {
    this.modalTitle = 'Ajouter un événement';
    this.currentEvent = this.getDefaultEvent();
    this.photoPreview = null;
    this.selectedFile = null;
    this.etablissementsType = [];
    this.isViewMode = false;
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  editEvent(event: Evenement): void {
    console.log("event", event);
    console.log("event.etablissementId", event.etablissementId);
  
    this.currentEvent = {
      ...event,
      photo: event.photo || '',
      prix: { ...event.prix },
      etablissementId: event.etablissementId ? { ...event.etablissementId } : { _id: '', nom: '', type: '' },
    };
  
    this.photoPreview = event.photo
      ? event.photo.startsWith('data:') || event.photo.startsWith('http')
        ? event.photo
        : `${this.API_BASE_URL}${event.photo}`
      : null;
    this.selectedFile = null;
  
    // Fetch establishments for the selected type
    if (this.currentEvent.etablissementId.type) {
      this.evenementService.getEtablissementsByType(this.currentEvent.etablissementId.type).subscribe({
        next: (etabs) => {
          this.etablissementsType = etabs;
          // Ensure the current establishment is still in the list; if not, reset only the _id
          if (!etabs.some((e) => e._id === this.currentEvent.etablissementId._id)) {
            this.currentEvent.etablissementId._id = ''; // Reset only the _id, keep the type
          }
        },
        error: (err: any) => {
          this.showNotification('Erreur lors du chargement des établissements: ' + err.message, 'error');
          this.etablissementsType = [];
          this.currentEvent.etablissementId._id = '';
        },
      });
    }
  
    this.isViewMode = false;
    this.isModalOpen = true;
  }

  saveEvent(): void {
    // Array to collect validation error messages
    const errors: string[] = [];

    // Validate each required field
    if (!this.currentEvent.nom) errors.push(" nom ");
    if (!this.currentEvent.dateDebut) errors.push("date de début ");
    if (!this.currentEvent.dateFin) errors.push(" date de fin ");
    if (!this.currentEvent.heureDebut) errors.push("L'heure de début ");
    if (!this.currentEvent.lieu) errors.push(" lieu ");
    if (!this.currentEvent.ville) errors.push("ville");
    if (!this.currentEvent.capacite || this.currentEvent.capacite <= 0) errors.push("capacité ");
    if (!this.currentEvent.categorie) errors.push("catégorie ");
    if (!this.currentEvent.etablissementId.type) errors.push(" type d'établissement");
    if (!this.currentEvent.etablissementId) errors.push("établissement ");
    if (!this.currentEvent.statut) errors.push(" statut");
    if (this.currentEvent.estPublic === undefined || this.currentEvent.estPublic === null) {
      errors.push(" visibilité ");
    }
    if (this.currentEvent.prix.estGratuit === false) {
      if (!this.currentEvent.prix.montant || this.currentEvent.prix.montant <= 0) {
        errors.push(" prix ");
      }
    }

    // Validate dates
    const startDate = new Date(this.currentEvent.dateDebut);
    const endDate = new Date(this.currentEvent.dateFin);
    if (this.currentEvent.dateDebut && this.currentEvent.dateFin && endDate < startDate) {
      errors.push("La date de fin ne peut pas être antérieure à la date de début.");
    }

    // If there are validation errors, display them
    if (errors.length > 0) {
      this.showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    console.log('Données de l\'événement avant envoi :', {
      nom: this.currentEvent.nom,
      typeEtablissement: this.currentEvent.etablissementId.type,
      etablissementId: this.currentEvent.etablissementId,
      prix: this.currentEvent.prix,
    });

    const formData = new FormData();
  Object.keys(this.currentEvent).forEach(key => {
    if (key !== 'photo' && key !== 'id' && key !== 'prix' && key !== 'typeEtablissement' && key !== 'etablissementId' && this.currentEvent[key as keyof Evenement] !== undefined) {
      formData.append(key, this.currentEvent[key as keyof Evenement]!.toString());
    }
  });
  formData.append('etablissementId', this.currentEvent.etablissementId._id);
  formData.append('prix', JSON.stringify(this.currentEvent.prix));
  if (this.selectedFile) {
    formData.append('photo', this.selectedFile);
  }

  if (this.modalTitle === 'Ajouter un événement') {
    this.evenementService.addEvenement(formData).subscribe({
      next: (response: Evenement) => {
        // Fetch the establishment details after adding the event
        this.evenementService.getEtablissementById(response.etablissementId._id).subscribe({
          next: (etab) => {
            const newEvent = {
              ...response,
              selected: false,
              etablissementId: {
                _id: etab._id,
                nom: etab.nom,
                type: response.etablissementId.type, // Type is already in the response
              },
            };
            this.evenements.unshift(newEvent);
            this.evenements.sort((a, b) => this.getTimestampFromId(b.id) - this.getTimestampFromId(a.id));
            this.closeModal();
            this.updateStats();
            this.filterEvents();
            this.showNotification('Événement ajouté avec succès !', 'success');
          },
          error: (err: any) => {
            this.showNotification('Erreur lors de la récupération des détails de l\'établissement: ' + err.message, 'error');
          },
        });
      },
      error: (err: any) => {
        this.showNotification('Erreur lors de l’ajout: ' + err.message, 'error');
      },
    });
  } else if (this.currentEvent.id) {
    this.evenementService.updateEvenement(this.currentEvent.id, formData).subscribe({
      next: (response: Evenement) => {
        // Fetch the establishment details after updating the event
        this.evenementService.getEtablissementById(response.etablissementId._id).subscribe({
          next: (etab) => {
            const updatedEvent = {
              ...response,
              selected: false,
              etablissementId: {
                _id: etab._id,
                nom: etab.nom,
                type: response.etablissementId.type,
              },
            };
            const index = this.evenements.findIndex((e) => e.id === response.id);
            if (index !== -1) this.evenements[index] = updatedEvent;
            this.evenements.sort((a, b) => this.getTimestampFromId(b.id) - this.getTimestampFromId(a.id));
            this.closeModal();
            this.updateStats();
            this.filterEvents();
            this.showNotification('Événement modifié avec succès !', 'success');
          },
          error: (err: any) => {
            this.showNotification('Erreur lors de la récupération des détails de l\'établissement: ' + err.message, 'error');
          },
        });
      },
      error: (err: any) => {
        this.showNotification('Erreur lors de la mise à jour: ' + err.message, 'error');
      },
    });
  }
}

  closeModal(): void {
    this.isModalOpen = false;
    this.isViewMode = false;
    this.photoPreview = null;
    this.selectedFile = null;
    this.etablissementsType = [];
  }

  openArchiveModal(event: Evenement): void {
    this.eventToArchive = event;
    this.isArchiveModalOpen = true;
  }

  closeArchiveModal(): void {
    this.isArchiveModalOpen = false;
    this.eventToArchive = null;
  }

  archiveEvent(): void {
    if (this.eventToArchive && this.eventToArchive.id) {
      this.evenementService.archiveEvenement(this.eventToArchive.id).subscribe({
        next: (response: Evenement) => {
          const index = this.evenements.findIndex((e) => e.id === response.id);
          if (index !== -1) {
            this.evenements[index] = { ...response, selected: false };
          }
          this.evenements.sort((a, b) => this.getTimestampFromId(b.id) - this.getTimestampFromId(a.id));
          this.closeArchiveModal();
          this.updateStats();
          this.filterEvents();
          this.showNotification('Événement archivé avec succès !', 'success');
        },
        error: (err: any) => {
          this.showNotification('Erreur lors de l’archivage: ' + err.message, 'error');
        }
      });
    }
  }

  getEstablishmentName(): string {
    const establishment = this.etablissementsType.find((e) => e._id === this.currentEvent.etablissementId._id);
    return establishment ? establishment.nom : 'Non spécifié';
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const filetypes = /jpeg|jpg|png|gif/;
      const isValidType = filetypes.test(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) {
        this.showNotification(`Le fichier ${file.name} n'est pas une image valide (JPEG, PNG, GIF requis).`, 'error');
        return;
      }
      if (!isValidSize) {
        this.showNotification(`Le fichier ${file.name} dépasse la limite de 5MB.`, 'error');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result as string;
      };
      reader.onerror = () => {
        this.showNotification(`Erreur lors de la lecture du fichier ${file.name}.`, 'error');
      };
      reader.readAsDataURL(file);

      input.value = '';
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
  }

  handleImageError(): void {
    this.showNotification(`Impossible de charger l'image. Elle peut avoir été supprimée ou le serveur est inaccessible.`, 'error');
    this.photoPreview = null;
    this.selectedFile = null;
  }

  
  onTypeChange(): void {
    if (this.currentEvent.etablissementId.type) {
      this.evenementService.getEtablissementsByType(this.currentEvent.etablissementId.type).subscribe({
        next: (etabs) => {
          this.etablissementsType = etabs;
          console.log('Établissements récupérés pour type', this.currentEvent.etablissementId.type, ':', etabs);
          // Only reset _id if the current establishment is not in the new list
          if (!etabs.some((e) => e._id === this.currentEvent.etablissementId._id)) {
            this.currentEvent.etablissementId._id = '';
          }
        },
        error: (err: any) => {
          this.showNotification('Erreur lors du chargement des établissements: ' + err.message, 'error');
          this.etablissementsType = [];
          this.currentEvent.etablissementId._id = '';
        },
      });
    } else {
      this.etablissementsType = [];
      this.currentEvent.etablissementId._id = '';
    }
  }

  viewEvent(event: Evenement): void {
    this.modalTitle = "Détails de l'événement";
    this.currentEvent = {
      ...event,
      organisateur: event.organisateur || '',
      description: event.description || '',
      photo: event.photo || '',
      etablissementId: { ...event.etablissementId },
      prix: { ...event.prix },
    };
    this.photoPreview = event.photo
      ? event.photo.startsWith('data:') || event.photo.startsWith('http')
        ? event.photo
        : `${this.API_BASE_URL}${event.photo}`
      : null;
    this.selectedFile = null;
  
    // Fetch establishments for the selected type
    if (this.currentEvent.etablissementId.type) {
      this.onTypeChange();
    }
  
    this.isViewMode = true;
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onSearch(): void {
    this.tableSearchQuery = this.searchQuery;
    this.currentPage = 1;
    this.filterEvents();
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

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Gastronomie': return 'bg-green-100';
      case 'Musique': return 'bg-blue-100';
      case 'Littérature': return 'bg-yellow-100';
      case 'Cinéma': return 'bg-red-100';
      case 'Art': return 'bg-purple-100';
      case 'Sport': return 'bg-green-200';
      case 'Conférences': return 'bg-pink-100';
      case 'Festivals': return 'bg-yellow-200';
      case 'Autre': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  }

  getCategoryIconClass(category: string): string {
    switch (category) {
      case 'Gastronomie': return 'text-green-500';
      case 'Musique': return 'text-blue-500';
      case 'Littérature': return 'text-yellow-500';
      case 'Cinéma': return 'text-red-500';
      case 'Art': return 'text-purple-500';
      case 'Sport': return 'text-green-600';
      case 'Conférences': return 'text-pink-500';
      case 'Festivals': return 'text-yellow-600';
      case 'Autre': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Gastronomie': return 'ri-restaurant-line';
      case 'Musique': return 'ri-music-line';
      case 'Littérature': return 'ri-book-open-line';
      case 'Cinéma': return 'ri-movie-line';
      case 'Art': return 'ri-paint-brush-line';
      case 'Sport': return 'ri-run-line';
      case 'Conférences': return 'ri-mic-line';
      case 'Festivals': return 'ri-star-line';
      case 'Autre': return 'ri-calendar-line';
      default: return 'ri-calendar-line';
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'À venir': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-indigo-100 text-indigo-800';
      case 'Terminé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
