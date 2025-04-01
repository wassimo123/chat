import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent {
  events = [
    {
      title: 'Festival International de Sfax',
      date: '25-30 Mars 2025',
      category: 'Culturel',
      location: 'Théâtre Municipal',
      image: 'https://public.readdy.ai/ai/img_res/9f2980834c9b1a8c751d65069d4b8217.jpg',
      description: 'Une célébration de la culture et des arts avec des artistes internationaux. Concerts, expositions et spectacles au programme.'
    },
    {
      title: 'Forum Économique de Sfax',
      date: '2-3 Avril 2025',
      category: 'Professionnel',
      location: 'Centre des Congrès',
      image: 'https://public.readdy.ai/ai/img_res/a189f5d29971b7edba30191628465212.jpg',
      description: 'Rencontre des acteurs économiques majeurs de la région. Conférences et networking au programme.'
    },
    {
      title: 'Festival Gastronomique',
      date: '15-17 Avril 2025',
      category: 'Gastronomique',
      location: 'Place de la Médina',
      image: 'https://public.readdy.ai/ai/img_res/0918669707b30b8bb51c955ddf95283c.jpg',
      description: 'Découverte des saveurs traditionnelles de Sfax. Dégustations et ateliers culinaires.'
    },
    {
      title: 'Marathon de Sfax',
      date: '20 Avril 2025',
      category: 'Sportif',
      location: 'Place de la République',
      image: 'https://public.readdy.ai/ai/img_res/18abfa45e4f55a1111808afc6f3c0872.jpg',
      description: 'Course internationale à travers les plus beaux sites de la ville. Parcours de 42km et 21km.'
    }
  ];

  filteredEvent = [...this.events];
  selectedCategory: string = 'all';
  selectedEvent: any = null;
  showReserveModal = false;
  showNotifyModal = false;
  reservation = { name: '', email: '', phone: '', date: '', persons: 1, payment: 'card' };
  notificationEmail = '';

  openEventModal(event: any) {
    this.selectedEvent = event;
    this.showReserveModal = true;
  }

  openNotifyModal(item: any) {
    this.selectedEvent = item;
    this.showNotifyModal = true;
  }

  closeModal() {
    this.showReserveModal = false;
    this.showNotifyModal = false;
    this.selectedEvent = null;
    this.reservation = { name: '', email: '', phone: '', date: '', persons: 1, payment: 'card' };
    this.notificationEmail = '';
  }

  submitReservation() {
    console.log('Réservation soumise :', this.reservation);
    this.closeModal();
  }

  submitNotification() {
    console.log('Notification demandée pour :', this.selectedEvent, 'Email :', this.notificationEmail);
    this.closeModal();
  }

  filterCategory() {
    if (this.selectedCategory === 'all') {
      this.filteredEvent = [...this.events];
    } else {
      this.filteredEvent = this.events.filter(event => event.category === this.selectedCategory);
    }
    console.log('Événements filtrés :', this.filteredEvent);
  }
}