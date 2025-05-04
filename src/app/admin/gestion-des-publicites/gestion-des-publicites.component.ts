import { Component, OnInit, HostListener } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-des-publicites',
  templateUrl: './gestion-des-publicites.component.html',
  styleUrls: ['./gestion-des-publicites.component.css']
})
export class GestionDesPublicitesComponent implements OnInit {
  searchQuery: string = '';
  isProfileMenuOpen: boolean = false;
  notifications: any[] = [];
  isAuthenticated: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérification de l'authentification
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

    // Souscription aux notifications pour afficher le compteur
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.filter(notif => !notif.read);
    });
  }

  onSearch(): void {
    console.log('Recherche:', this.searchQuery);
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.router.navigate(['/connexion']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }
}