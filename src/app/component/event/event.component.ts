import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EvenementService } from '../../services/evenement.service';
import { Evenement } from '../../models/evenement.model';
import { forkJoin, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { ViewportScroller } from '@angular/common';


interface FilterOption {
  name: string;
  selected: boolean;
}

interface EvenementWithName extends Evenement {
  establishmentName?: string;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
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
export class EventComponent implements OnInit {
  events: EvenementWithName[] = [];
  filteredEvents: EvenementWithName[] = [];
  paginatedEvents: EvenementWithName[] = [];
  categories: FilterOption[] = [
    { name: 'Gastronomie', selected: false },
    { name: 'Musique', selected: false },
    { name: 'Littérature', selected: false },
    { name: 'Cinéma', selected: false },
    { name: 'Art', selected: false },
    { name: 'Sport', selected: false },
    { name: 'Festivals', selected: false },
    { name: 'Conférences', selected: false },
    { name: 'Autre', selected: false },
  ];
  locations: FilterOption[] = [
    { name: 'Route Centre Ville', selected: false },
    { name: 'Route Bab Bhar', selected: false },
    { name: 'Route Gremda', selected: false },
    { name: 'Route Lafran', selected: false },
    { name: 'Route Manzel Chaker', selected: false },
    { name: 'Route Sidi Mansour', selected: false },
    { name: 'Route Sakiet Ezzit', selected: false },
    { name: 'Route El Ain', selected: false },
    { name: 'Route Thyna', selected: false },
  ];
  searchQuery: string = '';
  priceMin: number = 0;
  priceMax: number = 200;
  dateFrom: string = '';
  dateTo: string = '';
  sortOption: string = '';
  selectedEvent: EvenementWithName | null = null;
  showReserveModal: boolean = false;
  showNotifyModal: boolean = false;
  notificationEmail: string = '';
  newsletterEmail: string = '';
  newsletterMessage: string = '';
  newsletterSuccess: boolean = false;
  notificationMessage: string = '';
  notificationSuccess: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  private establishmentNames: Map<string, string> = new Map();

  constructor(
    private evenementService: EvenementService,
    private http: HttpClient,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.loadEvents();
  }

  loadEvents(): void {
    this.evenementService.getEvenements().subscribe({
      next: (events: Evenement[]) => {
        console.log('Événements chargés :', events);
        this.events = events.map((e: Evenement) => ({
          ...e,
          photo: e.photo
            ? (e.photo.startsWith('data:') || e.photo.startsWith('http'))
              ? e.photo
              : `http://localhost:5000${e.photo}`
            : 'https://via.placeholder.com/400x250',
        })) as EvenementWithName[];

        const establishmentIds = [...new Set(this.events.map(e => e.etablissementId).filter(id => id))];
        console.log('IDs des établissements à récupérer :', establishmentIds);

        const requests: Observable<{ _id: string; nom: string }>[] = establishmentIds.map(id =>
          this.evenementService.getEtablissementById(id._id)
        );

        if (requests.length > 0) {
          forkJoin(requests).subscribe({
            next: (etablissements) => {
              console.log('Établissements récupérés :', etablissements);
              etablissements.forEach(etab => {
                this.establishmentNames.set(etab._id, etab.nom);
              });

              this.events = this.events.map(event => ({
                ...event,
                establishmentName: this.establishmentNames.get(event.etablissementId._id) || 'Inconnu',
              }));  

              this.filteredEvents = this.events.filter(e => e.statut === 'À venir');
              this.sortEvents();
              this.updatePagination();
            },
            error: (err) => {
              console.error('Erreur lors du chargement des noms des établissements:', err);
              this.events = this.events.map(event => ({
                ...event,
                establishmentName: 'Inconnu',
              }));
              this.filteredEvents = this.events.filter(e => e.statut === 'À venir');
              this.sortEvents();
              this.updatePagination();
            }
          });
        } else {
          console.log('Aucun establishmentId à récupérer');
          this.events = this.events.map(event => ({
            ...event,
            establishmentName: 'Inconnu',
          }));
          this.filteredEvents = this.events.filter(e => e.statut === 'À venir');
          this.sortEvents();
          this.updatePagination();
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des événements:', err);
      }
    });
  }

  refreshEvents(): void {
    this.sortOption = '';
    this.establishmentNames.clear();
    this.loadEvents();
  }

  filterEvents() {
    this.filteredEvents = this.events.filter((event) => {
      if (event.statut !== 'À venir') {
        return false;
      }

      const matchesSearch = this.searchQuery
        ? event.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (event.typeEtablissement?.toLowerCase() || '').includes(this.searchQuery.toLowerCase())
        : true;

      const matchesCategory = this.categories.some((c) => c.selected)
        ? this.categories.some((c) => c.selected && c.name === event.categorie)
        : true;

      const matchesPrice =
        event.prix.estGratuit ||
        (event.prix.montant >= (this.priceMin || 0) &&
         event.prix.montant <= (this.priceMax || Infinity));

      const matchesDate = this.dateFrom || this.dateTo
        ? (() => {
            const eventDate = new Date(event.dateDebut);
            const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
            const toDate = this.dateTo ? new Date(this.dateTo) : null;
            if (fromDate && toDate) {
              return eventDate >= fromDate && eventDate <= toDate;
            } else if (fromDate) {
              return eventDate >= fromDate;
            } else if (toDate) {
              return eventDate <= toDate;
            }
            return true;
          })()
        : true;

      const matchesLocation = this.locations.some((l) => l.selected)
        ? this.locations.some((l) =>
            l.selected &&
            event.lieu.toLowerCase().includes(l.name.toLowerCase())
          )
        : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesDate && matchesLocation;
    });

    this.sortEvents();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortEvents() {
    this.filteredEvents.sort((a, b) => {
      switch (this.sortOption) {
        case 'recent':
        case '':
          return b.id.localeCompare(a.id);
        case 'dateAsc':
          return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
        case 'dateDesc':
          return new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime();
        case 'priceAsc':
          const aPrice = a.prix.estGratuit ? 0 : a.prix.montant;
          const bPrice = b.prix.estGratuit ? 0 : b.prix.montant;
          return aPrice - bPrice;
        case 'priceDesc':
          const aPriceDesc = a.prix.estGratuit ? 0 : a.prix.montant;
          const bPriceDesc = b.prix.estGratuit ? 0 : b.prix.montant;
          return bPriceDesc - aPriceDesc;
        default:
          return 0;
      }
    });
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCategoryClass(categorie: string): string {
    switch (categorie) {
      case 'Gastronomie': return 'bg-green-100';
      case 'Musique': return 'bg-blue-100';
      case 'Littérature': return 'bg-yellow-100';
      case 'Cinéma': return 'bg-red-100';
      case 'Art': return 'bg-purple-100';
      case 'Sport': return 'bg-green-200';
      case 'Festivals': return 'bg-pink-100';
      case 'Conférences': return 'bg-blue-200';
      case 'Autre': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  }

  getTypeEtablissementClass(type: string | undefined): string {
    switch (type) {
      case 'Restaurant': return 'bg-blue-100 text-blue-800';
      case 'Hôtel': return 'bg-purple-100 text-purple-800';
      case 'Commerce': return 'bg-orange-100 text-orange-800';
      case 'Café': return 'bg-brown-100 text-brown-800';
      case 'Autre': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryIconClass(categorie: string): string {
    switch (categorie) {
      case 'Gastronomie': return 'text-green-500';
      case 'Musique': return 'text-blue-500';
      case 'Littérature': return 'text-yellow-500';
      case 'Cinéma': return 'text-red-500';
      case 'Art': return 'text-purple-500';
      case 'Sport': return 'text-green-600';
      case 'Festivals': return 'text-pink-500';
      case 'Conférences': return 'text-blue-600';
      case 'Autre': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  getCategoryIcon(categorie: string): string {
    switch (categorie) {
      case 'Gastronomie': return 'ri-restaurant-line';
      case 'Musique': return 'ri-music-line';
      case 'Littérature': return 'ri-book-open-line';
      case 'Cinéma': return 'ri-movie-line';
      case 'Art': return 'ri-paint-brush-line';
      case 'Sport': return 'ri-run-line';
      case 'Festivals': return 'ri-star-line';
      case 'Conférences': return 'ri-mic-line';
      case 'Autre': return 'ri-calendar-line';
      default: return 'ri-calendar-line';
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'À venir': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-indigo-100 text-indigo-800';
      case 'Terminé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getFormattedPrice(event: Evenement): string {
    return event.prix.estGratuit ? 'Gratuit' : `${event.prix.montant} DT`;
  }

  handleImageError(event: Event, evenement: EvenementWithName): void {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250';
    evenement.photo = 'https://via.placeholder.com/400x250';
  }

  openEventModal(event: EvenementWithName) {
    this.selectedEvent = event;
    this.showReserveModal = true;
  }

  openNotifyModal(event: EvenementWithName) {
    this.selectedEvent = event;
    this.showNotifyModal = true;
  }

  closeModal() {
    this.showReserveModal = false;
    this.showNotifyModal = false;
    this.selectedEvent = null;
    this.notificationEmail = '';
    this.notificationMessage = '';
  }

  submitNotification() {
    if (this.notificationEmail && this.selectedEvent) {
      this.http.post(`http://localhost:5000/api/evenements/${this.selectedEvent.id}/notify`, { email: this.notificationEmail })
        .subscribe({
          next: (response: any) => {
            this.notificationMessage = 'Votre demande de notification a été enregistrée avec succès !';
            this.notificationSuccess = true;
            setTimeout(() => {
              this.closeModal();
            }, 2000);
          },
          error: (err) => {
            this.notificationMessage = 'Erreur lors de l\'enregistrement de la notification. Veuillez réessayer.';
            this.notificationSuccess = false;
            console.error('Erreur lors de l\'enregistrement de la notification:', err);
          }
        });
    }
  }

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      this.http.post('http://localhost:5000/api/newsletter/subscribe', { email: this.newsletterEmail })
        .subscribe({
          next: (response: any) => {
            this.newsletterMessage = response.message || 'Merci pour votre inscription !';
            this.newsletterSuccess = true;
            setTimeout(() => {
              this.newsletterMessage = '';
              this.newsletterEmail = '';
            }, 3000);
          },
          error: (err) => {
            this.newsletterMessage = err.error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
            this.newsletterSuccess = false;
            console.error('Erreur lors de l\'inscription à la newsletter:', err);
          }
        });
    } else {
      this.newsletterMessage = 'Veuillez entrer un email valide.';
      this.newsletterSuccess = false;
    }
  }
}