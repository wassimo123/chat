import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

interface Event {
  id: number;
  title: string;
  category: string;
  location: string;
  image: string;
  description: string;
  price: string;
  date: string;
  startDate: Date;
  status: string;
  isNew: boolean;
  favorited: boolean;
}

interface FilterOption {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  events: Event[] = [
    {
      id: 1,
      title: 'Festival International de Sfax',
      category: 'Festival',
      location: 'Théâtre Municipal de Sfax',
      image:
        'https://readdy.ai/api/search-image?query=cultural%20festival%20with%20traditional%20music%20performance%2C%20colorful%20stage%2C%20crowd%20enjoying%2C%20professional%20lighting%2C%20evening%20atmosphere%2C%20high%20quality%20photography&width=400&height=250&seq=1&orientation=landscape',
      description:
        'Une célébration de la musique et de la culture avec des artistes internationaux.',
      price: '45 DT',
      date: '20-25 Avril 2025',
      startDate: new Date('2025-04-20'),
      status: 'Places limitées',
      isNew: true,
      favorited: false,
    },
    {
      id: 2,
      title: 'Exposition d’Art Contemporain',
      category: 'Exposition',
      location: 'Galerie Municipale',
      image:
        'https://readdy.ai/api/search-image?query=art%20exhibition%20in%20modern%20gallery%20space%2C%20contemporary%20paintings%20and%20sculptures%2C%20people%20viewing%20artwork%2C%20elegant%20lighting%2C%20professional%20photography&width=400&height=250&seq=2&orientation=landscape',
      description:
        'Découvrez les œuvres de 15 artistes contemporains tunisiens.',
      price: 'Gratuit',
      date: '18 Avril - 2 Mai 2025',
      startDate: new Date('2025-04-18'),
      status: 'Entrée libre',
      isNew: false,
      favorited: false,
    },
    {
      id: 3,
      title: 'Concert Symphonique',
      category: 'Concert',
      location: 'Palais des Congrès',
      image:
        'https://readdy.ai/api/search-image?query=concert%20hall%20with%20orchestra%20performing%2C%20classical%20music%2C%20elegant%20interior%2C%20dramatic%20lighting%2C%20audience%20in%20formal%20attire%2C%20professional%20photography&width=400&height=250&seq=3&orientation=landscape',
      description:
        'L’Orchestre Symphonique de Sfax présente les œuvres de Mozart.',
      price: '60 DT',
      date: '22 Avril 2025',
      startDate: new Date('2025-04-22'),
      status: 'Dernières places',
      isNew: false,
      favorited: false,
    },
    {
      id: 4,
      title: 'Les Misérables',
      category: 'Théâtre',
      location: 'Théâtre Municipal',
      image:
        'https://readdy.ai/api/search-image?query=theater%20performance%2C%20dramatic%20stage%20lighting%2C%20actors%20performing%2C%20elegant%20theater%20interior%2C%20audience%20watching%2C%20professional%20photography&width=400&height=250&seq=4&orientation=landscape',
      description:
        'Une adaptation moderne du chef-d’œuvre de Victor Hugo.',
      price: '35 DT',
      date: '24-26 Avril 2025',
      startDate: new Date('2025-04-24'),
      status: 'Prévente',
      isNew: false,
      favorited: false,
    },
    {
      id: 5,
      title: 'Festival Gastronomique',
      category: 'Gastronomie',
      location: 'Place de la République',
      image:
        'https://readdy.ai/api/search-image?query=food%20festival%2C%20gourmet%20dishes%2C%20chef%20demonstrations%2C%20people%20tasting%20food%2C%20outdoor%20setting%2C%20professional%20photography&width=400&height=250&seq=5&orientation=landscape',
      description:
        'Découvrez les saveurs de la cuisine méditerranéenne.',
      price: '25 DT',
      date: '27-28 Avril 2025',
      startDate: new Date('2025-04-27'),
      status: 'Pass journée',
      isNew: false,
      favorited: false,
    },
    {
      id: 6,
      title: 'Sfax Tech Conference',
      category: 'Conférence',
      location: 'Centre des Congrès',
      image:
        'https://readdy.ai/api/search-image?query=conference%20room%2C%20business%20presentation%2C%20professional%20speakers%2C%20audience%20listening%2C%20modern%20venue%2C%20professional%20photography&width=400&height=250&seq=6&orientation=landscape',
      description:
        'L’avenir de la technologie et de l’innovation en Tunisie.',
      price: '80 DT',
      date: '30 Avril 2025',
      startDate: new Date('2025-04-30'),
      status: 'Early Bird',
      isNew: false,
      favorited: false,
    },
  ];

  filteredEvents: Event[] = [];
  categories: FilterOption[] = [
    { name: 'Festivals', selected: false },
    { name: 'Concerts', selected: false },
    { name: 'Expositions', selected: false },
    { name: 'Spectacles', selected: false },
    { name: 'Conférences', selected: false },
  ];
  dateOptions: FilterOption[] = [
    { name: 'Aujourd’hui', selected: false },
    { name: 'Cette semaine', selected: false },
    { name: 'Ce week-end', selected: false },
    { name: 'Ce mois', selected: false },
  ];
  locations: FilterOption[] = [
    { name: 'Centre-ville', selected: false },
    { name: 'Médina', selected: false },
    { name: 'Zone touristique', selected: false },
    { name: 'Plage', selected: false },
  ];
  searchQuery: string = '';
  priceRange: number = 100;
  accessiblePMR: boolean = false;
  freeParking: boolean = false;
  sortOption: string = 'dateAsc';
  selectedEvent: Event | null = null;
  showReserveModal: boolean = false;
  showNotifyModal: boolean = false;
  reservation = { name: '', email: '', phone: '', date: '', persons: 1, payment: 'card' };
  notificationEmail: string = '';

  ngOnInit() {
    this.filteredEvents = [...this.events];
  }

  filterEvents() {
    this.filteredEvents = this.events.filter((event) => {
      const matchesSearch = this.searchQuery
        ? event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;

      const matchesCategory = this.categories.some((c) => c.selected)
        ? this.categories.some((c) => c.selected && c.name === event.category)
        : true;

      const matchesPrice = this.priceRange
        ? event.price === 'Gratuit' ||
          parseFloat(event.price) <= this.priceRange
        : true;

      const today = new Date();
      const matchesDate = this.dateOptions.some((d) => d.selected)
        ? this.dateOptions.some((d) => {
            if (!d.selected) return false;
            if (d.name === 'Aujourd’hui') {
              return (
                event.startDate.toDateString() === today.toDateString()
              );
            } else if (d.name === 'Cette semaine') {
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              return (
                event.startDate >= today && event.startDate <= weekEnd
              );
            } else if (d.name === 'Ce week-end') {
              const weekendStart = new Date(today);
              weekendStart.setDate(
                today.getDate() + (6 - today.getDay())
              );
              const weekendEnd = new Date(weekendStart);
              weekendEnd.setDate(weekendStart.getDate() + 1);
              return (
                event.startDate >= weekendStart &&
                event.startDate <= weekendEnd
              );
            } else if (d.name === 'Ce mois') {
              const monthEnd = new Date(today);
              monthEnd.setMonth(today.getMonth() + 1);
              return (
                event.startDate >= today && event.startDate <= monthEnd
              );
            }
            return false;
          })
        : true;

      const matchesLocation = this.locations.some((l) => l.selected)
        ? this.locations.some((l) =>
            l.selected &&
            event.location.toLowerCase().includes(l.name.toLowerCase())
          )
        : true;

      const matchesAccessibility = this.accessiblePMR
        ? event.status.includes('Accessible') // Assuming events have accessibility info
        : true;

      const matchesParking = this.freeParking
        ? event.status.includes('Parking') // Assuming events have parking info
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesDate &&
        matchesLocation &&
        matchesAccessibility &&
        matchesParking
      );
    });

    this.sortEvents();
  }

  sortEvents() {
    this.filteredEvents.sort((a, b) => {
      switch (this.sortOption) {
        case 'dateAsc':
          return a.startDate.getTime() - b.startDate.getTime();
        case 'dateDesc':
          return b.startDate.getTime() - a.startDate.getTime();
        case 'priceAsc':
          const aPrice =
            a.price === 'Gratuit' ? 0 : parseFloat(a.price);
          const bPrice =
            b.price === 'Gratuit' ? 0 : parseFloat(b.price);
          return aPrice - bPrice;
        case 'priceDesc':
          const aPriceDesc =
            a.price === 'Gratuit' ? 0 : parseFloat(a.price);
          const bPriceDesc =
            b.price === 'Gratuit' ? 0 : parseFloat(b.price);
          return bPriceDesc - aPriceDesc;
        default:
          return 0;
      }
    });
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      Festival: 'bg-red-500',
      Exposition: 'bg-blue-500',
      Concert: 'bg-purple-500',
      Théâtre: 'bg-green-500',
      Gastronomie: 'bg-orange-500',
      Conférence: 'bg-indigo-500',
    };
    return classes[category] || 'bg-gray-500';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Places limitées': 'bg-yellow-100 text-yellow-800',
      'Entrée libre': 'bg-green-100 text-green-800',
      'Dernières places': 'bg-red-100 text-red-800',
      Prévente: 'bg-blue-100 text-blue-800',
      'Pass journée': 'bg-purple-100 text-purple-800',
      'Early Bird': 'bg-gray-100 text-gray-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  toggleFavorite(event: Event) {
    event.favorited = !event.favorited;
  }

  openEventModal(event: Event) {
    this.selectedEvent = event;
    this.showReserveModal = true;
  }

  openNotifyModal(event: Event) {
    this.selectedEvent = event;
    this.showNotifyModal = true;
  }

  closeModal() {
    this.showReserveModal = false;
    this.showNotifyModal = false;
    this.selectedEvent = null;
    this.reservation = {
      name: '',
      email: '',
      phone: '',
      date: '',
      persons: 1,
      payment: 'card',
    };
    this.notificationEmail = '';
  }

  submitReservation() {
    console.log('Réservation soumise :', this.reservation);
    this.closeModal();
  }

  submitNotification() {
    console.log(
      'Notification demandée pour :',
      this.selectedEvent,
      'Email :',
      this.notificationEmail
    );
    this.closeModal();
  }
}