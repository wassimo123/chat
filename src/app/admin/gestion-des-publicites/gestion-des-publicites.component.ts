import { Component, OnInit, HostListener } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { PubliciteService } from '../../services/publicite.service';
import Swal from 'sweetalert2';
import { EtablissementService } from 'src/app/services/etablissement.service';
export interface Horaires {
  is24_7: boolean;
  specialHours: string;
  lundi: { open: string; close: string; closed: boolean };
  mardi: { open: string; close: string; closed: boolean };
  mercredi: { open: string; close: string; closed: boolean };
  jeudi: { open: string; close: string; closed: boolean };
  vendredi: { open: string; close: string; closed: boolean };
  samedi: { open: string; close: string; closed: boolean };
  dimanche: { open: string; close: string; closed: boolean };
}

export interface SocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

export interface Publicite {
  _id: number;
  partenaireId: string;
  nom: string;
  adresse: string;
  type: string; // E.g. "Restaurant", "Hôtel", "Café"
  pack: string; // E.g. "Standard", "Premium", etc.
  statut: string; // E.g. "En attente", "Validée", "Refusée"
  visibility: string; // E.g. "public", "private"
  informations: {
    description: string;
    services: string[];
    socialMedia: SocialMedia;
    horaires: Horaires;
    telephone: string;
    email: string;
    siteWeb: string;
    ville: string;
    pays: string;
    codePostal: string;
    showMap: boolean;
    photos: string[]; // List of image URLs (base64 or actual paths)
  };
  etablissement: {
    _id: string; // The establishment's ID
    nom: string;
    adresse: string;
    type: string;
    statut: string;
    visibility: string;
    codePostal: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    siteWeb: string;
    description: string;
    services: string[];
    horaires: Horaires;
    photos: string[];
    reseauxSociaux: SocialMedia;
  };
  utilisateurId: string; // Added the utilisateurId property here
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-gestion-des-publicites',
  templateUrl: './gestion-des-publicites.component.html',
  styleUrls: ['./gestion-des-publicites.component.css']
})
export class GestionDesPublicitesComponent implements OnInit {
  selectedPublicite: Publicite | null = null; // Corrected type to Publicite
  showDetailsModal: boolean = false;
  searchQuery: string = '';
  isProfileMenuOpen: boolean = false;
  notifications: any[] = [];
  isAuthenticated: boolean = false;
  publicites: Publicite[] = []; // Add publicites array to store fetched publicités
  currentDateTime: Date = new Date();
  
  selectedEtablissement: any = null;  // Declare this property to store fetched establishment details


  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private etablissementService: EtablissementService, // Inject EtablissementService

    private publiciteService: PubliciteService // Inject PubliciteService to fetch publicités
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

    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.filter(notif => !notif.read);
    });

    // Fetch publicités on init
    this.loadPublicites();
  }

  loadPublicites(): void {
    this.publiciteService.getAllPublicites().subscribe({
      next: (data) => {
        console.log('Publicités chargées :', data);
        this.publicites = data; // Assign fetched publicités to the publicites array
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors du chargement des publicités.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33'
        });
      }
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
  validerPublicite(id: number): void {
    // Find the publicite by ID
    const found = this.publicites.find(pub => pub._id === id);
  
    // Check if the publicite exists
    if (found) {
      this.selectedPublicite = found;  // Assign found publicite
  
      Swal.fire({
        title: 'Confirmer la validation',
        text: 'Êtes-vous sûr de vouloir valider cette publicité ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, valider',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Call the service method to validate the publicite
          this.publiciteService.validatePublicite(found._id).subscribe({
            next: () => {
              // After successful validation, reload the list and show success
              this.loadPublicites();
              Swal.fire({
                title: 'Succès',
                text: 'La publicité a été validée avec succès.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
              });
            },
            error: (err) => {
              // Show error if the request fails
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la validation de la publicité.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
              });
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'La publicité n\'a pas été trouvée.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  }
  
  refuserPublicite(id: number): void {
    const found = this.publicites.find(pub => pub._id === id);
    // Check if the publicite exists
    if (found) {
      this.selectedPublicite = found;  // Assign found publicite
      console.log('Selected publicite:', this.selectedPublicite._id);  // Log the entire object
  
     

      Swal.fire({
        title: 'Confirmer le refus',
        text: 'Êtes-vous sûr de vouloir refuser cette publicité ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, refuser',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Pass only the id to delete the publicite
          this.publiciteService.deletePublicite(found._id).subscribe({
            next: () => {
              // After successfully deleting the publicite, reload the list
              this.loadPublicites();
              Swal.fire({
                title: 'Succès',
                text: 'La publicité a été refusée avec succès.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
              });
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Une erreur est survenue lors du refus de la publicité.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
              });
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Publicité non trouvée.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  }
  
// In the component where you handle the fetching of publicite
consulterPublicite(id: number): void {
  const found = this.publicites.find(pub => pub._id === id);
  if (found) {
    this.selectedPublicite = found; // Assign found publicite
    console.log('Selected publicite etablissement ID:', this.selectedPublicite.etablissement._id);
    // Check if the selected publicite has an etablissementId, then fetch the establishment details
    if (this.selectedPublicite && this.selectedPublicite.etablissement._id) {
      this.etablissementService.getEtablissementByvaliderId(this.selectedPublicite.etablissement._id).subscribe({
        next: (response) => {
          this.selectedEtablissement = response; // Store the fetched establishment details
          this.showDetailsModal = true;
 
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la récupération des détails de l\'établissement.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun établissement trouvé pour cette publicité.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  }
}


  getHorairesForDay(day: string): { open: string; close: string; closed: boolean } | null {
    if (this.selectedPublicite && this.selectedPublicite.informations.horaires) {
      const horaires = this.selectedPublicite.informations.horaires;
      // Check if the day is a valid schedule entry (exclude is24_7 and specialHours)
      if (day in horaires && day !== 'is24_7' && day !== 'specialHours') {
        const schedule = horaires[day as keyof typeof horaires];
        if (schedule && typeof schedule === 'object' && 'open' in schedule && 'close' in schedule && 'closed' in schedule) {
          return schedule as { open: string; close: string; closed: boolean };
        }
      }
    }
    return null;
  }
}
