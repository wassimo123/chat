import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  // Propriétés pour la barre de recherche
  searchQuery: string = '';

  // Contrôle l'affichage du menu de profil
  isProfileMenuOpen: boolean = false;

  // Contrôle l'affichage du modal pour changer le mot de passe
  isPasswordModalOpen: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordStrengthClass: string = '';
  passwordMatchMessage: string = '';
  passwordMatchClass: string = '';

  // Contrôle l'affichage du modal de message (succès/erreur)
  showMessageModal: boolean = false;
  messageModalType: 'error' | 'success' = 'error';
  messageModalTitle: string = '';
  messageModalMessage: string = '';

  // Liste des notifications
  notifications = [
    { id: 1, type: 'info', icon: 'ri-information-line', message: 'Nouvelle mise à jour disponible', time: 'Il y a 10 minutes' },
    { id: 2, type: 'success', icon: 'ri-check-line', message: 'Utilisateur activé avec succès', time: 'Il y a 1 heure' },
    { id: 4, type: 'error', icon: 'ri-error-warning-line', message: 'Erreur lors de la connexion', time: 'Il y a 3 heures' }
  ];

  constructor() {}

  ngOnInit() {}

  // Méthode pour la recherche dans l'en-tête
  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  // Supprime une notification
  dismissNotification(id: number) {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    console.log('Notification supprimée:', id);
  }

  // Ouvre/ferme le menu de profil
  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Ferme le menu de profil si clic en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }

  
}