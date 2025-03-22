import { Component, OnInit, HostListener } from '@angular/core';
import { EChartsOption } from 'echarts';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  searchQuery: string = ''; 
  isProfileMenuOpen: boolean = false; 

  
  notifications = [
    { id: 1, type: 'info', icon: 'ri-information-line', message: 'Nouvelle mise à jour disponible', time: 'Il y a 10 minutes' },
    { id: 2, type: 'success', icon: 'ri-check-line', message: 'Utilisateur activé avec succès', time: 'Il y a 1 heure' },
    { id: 3, type: 'warning', icon: 'ri-alert-line', message: 'Stock presque épuisé', time: 'Il y a 2 heures' },
    { id: 4, type: 'error', icon: 'ri-error-warning-line', message: 'Erreur lors de la connexion', time: 'Il y a 3 heures' }
  ];

  ngOnInit() {}

  onSearch() {
    console.log('Recherche:', this.searchQuery);
    
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  dismissNotification(id: number) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    console.log('Notification supprimée:', id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isProfileMenuOpen = false;
    }
  }
}