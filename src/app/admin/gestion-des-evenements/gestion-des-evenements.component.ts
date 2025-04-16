import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { EvenementService } from '../../services/evenement.service';
import { Evenement, Stats } from '../../models/evenement.model';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

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

  evenements: Evenement[] = [];
  filteredEvents: Evenement[] = [];
  paginatedEvents: Evenement[] = [];
  stats: Stats = { total: 0, upcoming: 0, participants: 0, participationRate: 0 };

  tableSearchQuery = '';
  selectedStatus = 'Tous';
  selectedSort = '';
  showSortFilter = false;

  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  isModalOpen = false;
  modalTitle = '';
  currentEvent: Evenement = this.getDefaultEvent();

  isDeleteModalOpen = false;
  eventToDelete: Evenement | null = null;

  selectAll = false;
  isProfileMenuOpen = false;
  notificationCount = 3;
  searchQuery = '';

  showMessageModal = false;
  messageModalType: 'success' | 'error' = 'success';
  messageModalTitle = '';
  messageModalMessage = '';

  constructor(private evenementService: EvenementService) {}

  ngOnInit(): void {
    this.loadEvenements();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  loadEvenements(): void {
    this.evenementService.getEvenements().subscribe({
      next: (evenements: Evenement[]) => {
        this.evenements = evenements.map((e: Evenement) => ({
          ...e,
          selected: false
        }));
        this.filteredEvents = this.evenements;
        this.updateStats();
        this.updatePagination();
        this.updateCharts();
      },
      error: (err: any) => {
        this.showNotification('Erreur lors du chargement des événements: ' + err.message, 'error');
      }
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
            labels: ['Gastronomie', 'Musique', 'Littérature', 'Cinéma'],
            datasets: [{
              data: [24, 18, 15, 12],
              backgroundColor: [
                'rgba(87, 181, 231, 1)',
                'rgba(141, 211, 199, 1)',
                'rgba(251, 191, 114, 1)',
                'rgba(252, 141, 98, 1)'
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
    const today = new Date();
    this.stats.total = this.evenements.length;
    this.stats.upcoming = this.evenements.filter(e => new Date(e.date) > today).length;
    this.stats.participants = this.evenements.reduce((sum, e) => sum + e.participants, 0);
    this.stats.participationRate = Math.round(
      this.evenements.length ? (this.stats.participants / this.evenements.reduce((sum, e) => sum + e.capacite, 0)) * 100 : 0
    );
  }

  filterEvents(): void {
    this.filteredEvents = this.evenements.filter((e) => {
      const matchesSearch =
        e.nom.toLowerCase().includes(this.tableSearchQuery.toLowerCase()) ||
        e.lieu.toLowerCase().includes(this.tableSearchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'Tous' || e.statut === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.updateCharts();
  }

  updateCharts(): void {
    if (this.eventsByMonthChart && this.eventsByCategoryChart) {
      const monthCounts = Array(12).fill(0);
      this.filteredEvents.forEach(e => {
        const month = new Date(e.date).getMonth();
        monthCounts[month]++;
      });
      this.eventsByMonthChart.data.datasets[0].data = monthCounts;
      this.eventsByMonthChart.update();

      const categoryCounts: { [key: string]: number } = {
        Gastronomie: 0,
        Musique: 0,
        Littérature: 0,
        Cinéma: 0
      };
      const validCategories = ['Gastronomie', 'Musique', 'Littérature', 'Cinéma'];
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
      } else if (field === 'date') {
        valueA = new Date(a.date);
        valueB = new Date(b.date);
      } else if (field === 'participants') {
        valueA = a.participants;
        valueB = b.participants;
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
  }

  selectSort(sort: string): void {
    this.selectedSort = sort;
    this.showSortFilter = false;
    this.sortBy(sort.toLowerCase());
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
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
      date: '',
      heureDebut: '',
      heureFin: '',
      lieu: '',
      ville: '',
      capacite: 0,
      participants: 0,
      categorie: '',
      organisateur: '',
      description: '',
      estPublic: true,
      statut: 'À venir',
      selected: false
    };
  }

  openAddEventModal(): void {
    this.modalTitle = 'Ajouter un événement';
    this.currentEvent = this.getDefaultEvent();
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  editEvent(event: Evenement): void {
    this.modalTitle = 'Modifier un événement';
    this.currentEvent = { ...event };
    this.isModalOpen = true;
  }

  saveEvent(): void {
    if (!this.currentEvent.nom || !this.currentEvent.date || !this.currentEvent.heureDebut || !this.currentEvent.lieu || !this.currentEvent.ville || !this.currentEvent.capacite || !this.currentEvent.categorie) {
      this.showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (this.modalTitle === 'Ajouter un événement') {
      this.evenementService.addEvenement(this.currentEvent).subscribe({
        next: (response: Evenement) => {
          this.evenements.push({ ...response, selected: false });
          this.closeModal();
          this.updateStats();
          this.filterEvents();
          this.showNotification('Événement ajouté avec succès !', 'success');
        },
        error: (err: any) => {
          this.showNotification('Erreur lors de l’ajout: ' + err.message, 'error');
        }
      });
    } else if (this.currentEvent.id) {
      this.evenementService.updateEvenement(this.currentEvent.id, this.currentEvent).subscribe({
        next: (response: Evenement) => {
          const index = this.evenements.findIndex((e) => e.id === response.id);
          if (index !== -1) this.evenements[index] = { ...response, selected: false };
          this.closeModal();
          this.updateStats();
          this.filterEvents();
          this.showNotification('Événement modifié avec succès !', 'success');
        },
        error: (err: any) => {
          this.showNotification('Erreur lors de la mise à jour: ' + err.message, 'error');
        }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openDeleteModal(event: Evenement): void {
    this.eventToDelete = event;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.eventToDelete = null;
  }

  deleteEvent(): void {
    if (this.eventToDelete && this.eventToDelete.id) {
      this.evenementService.deleteEvenement(this.eventToDelete.id).subscribe({
        next: () => {
          this.evenements = this.evenements.filter(e => e.id !== this.eventToDelete!.id);
          this.closeDeleteModal();
          this.updateStats();
          this.filterEvents();
          this.showNotification('Événement supprimé avec succès !', 'success');
        },
        error: (err: any) => {
          this.showNotification('Erreur lors de la suppression: ' + err.message, 'error');
        }
      });
    }
  }

  viewEvent(event: Evenement): void {
    console.log('Voir événement:', event);
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
      default: return 'bg-gray-100';
    }
  }

  getCategoryIconClass(category: string): string {
    switch (category) {
      case 'Gastronomie': return 'text-green-500';
      case 'Musique': return 'text-blue-500';
      case 'Littérature': return 'text-yellow-500';
      case 'Cinéma': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Gastronomie': return 'ri-restaurant-line';
      case 'Musique': return 'ri-music-line';
      case 'Littérature': return 'ri-book-open-line';
      case 'Cinéma': return 'ri-movie-line';
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