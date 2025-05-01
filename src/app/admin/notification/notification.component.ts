
import { Component, OnInit, HostListener } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  searchQuery: string = '';
  isProfileMenuOpen: boolean = false;
  notifications: any[] = [];
  isAuthenticated: boolean = false; // Ajout de la propriété isAuthenticated
  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private emailService: EmailService,
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

    this.notificationService.notifications$.subscribe(notifications => {
      console.log('Notifications reçues:', notifications);
      
      // Filtrer les notifications non lues
      let unreadNotifications = notifications.filter(notif => !notif.read);

      // Vérifier l'existence de chaque utilisateur associé à une notification
      const updatedNotifications: any[] = [];
      let checkPromises = unreadNotifications.map(notif => {
        if (!notif.email) {
          // Si la notification n'a pas d'email, on la supprime directement
          return Promise.resolve(null);
        }
        return this.userService.checkUserExists(notif.email).toPromise().then(
          (response) => {
            // Vérifier si la réponse est définie et si l'utilisateur existe
            if (response && response.exists) {
              return notif; // Garder la notification si l'utilisateur existe
            } else {
              console.log(`Utilisateur avec email ${notif.email} n'existe plus, suppression de la notification.`);
              return null; // Ne pas garder la notification si l'utilisateur n'existe plus
            }
          },
          error => {
            console.error(`Erreur lors de la vérification de l'utilisateur ${notif.email}:`, error);
            return null; // En cas d'erreur, supprimer la notification pour éviter des problèmes
          }
        );
      });

      // Résoudre toutes les promesses et mettre à jour les notifications
      Promise.all(checkPromises).then(results => {
        const validNotifications = results.filter(notif => notif !== null);
        this.notifications = validNotifications;
        
        // Mettre à jour les notifications dans le service pour persister les changements
        // Commenté temporairement car updateNotifications n'existe pas encore
        // if (validNotifications.length !== unreadNotifications.length) {
        //   this.notificationService.updateNotifications(validNotifications);
        // }
      });
    });
  }

  onSearch(): void {
    console.log('Recherche:', this.searchQuery);
  }

  dismissNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }

  markAsRead1(id: number): void {
    const notification = this.notifications.find(notif => notif.id === id);
    if (!notification || !notification.email) {
      Swal.fire({
        title: 'Erreur',
        text: 'Informations de notification invalides.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Erreur',
        text: 'Vous devez être connecté en tant qu\'administrateur pour activer un compte.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/connexion']);
      });
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous activer ce compte ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#16A34A',
      cancelButtonColor: '#DC2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.checkUserExists(notification.email).subscribe({
          next: (response) => {
            // Vérifier si la réponse est définie et si l'utilisateur existe
            if (!response || !response.exists) {
              this.notificationService.removeNotification(id);
              console.log(`Utilisateur ${notification.email} non trouvé, notification supprimée.`);
              return;
            }

            if (response.status === 'pending') {
              this.userService.updateUserStatus(notification.email, 'active').subscribe({
                next: () => {
                  this.emailService.sendConfirmationEmail(notification.email).subscribe({
                    next: () => {
                      this.notificationService.markAsRead(id);
                      Swal.fire({
                        title: 'Succès',
                        text: 'Compte activé ! Un e-mail de confirmation a été envoyé.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                      });
                    },
                    error: (err) => {
                      Swal.fire({
                        title: 'Erreur',
                        text: 'Erreur lors de l\'envoi de l\'e-mail de confirmation.',
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false
                      });
                      console.error('Erreur e-mail confirmation:', err);
                    }
                  });
                },
                error: (err) => {
                  let errorMessage = 'Erreur lors de l\'activation du compte.';
                  if (err.status === 401) {
                    errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                    Swal.fire({
                      title: 'Erreur',
                      text: errorMessage,
                      icon: 'error',
                      timer: 2000,
                      showConfirmButton: false
                    }).then(() => {
                      this.router.navigate(['/connexion']);
                    });
                  } else if (err.status === 500) {
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                    Swal.fire({
                      title: 'Erreur',
                      text: errorMessage,
                      icon: 'error',
                      timer: 2000,
                      showConfirmButton: false
                    });
                  } else {
                    Swal.fire({
                      title: 'Erreur',
                      text: errorMessage,
                      icon: 'error',
                      timer: 2000,
                      showConfirmButton: false
                    });
                  }
                  console.error('Erreur activation compte:', err);
                }
              });
            } else {
              this.emailService.sendCancellationEmail(notification.email).subscribe({
                next: () => {
                  this.notificationService.removeNotification(id);
                  Swal.fire({
                    title: 'Annulation',
                    text: 'Le compte existe déjà avec un statut non en attente. Un e-mail d\'annulation a été envoyé.',
                    icon: 'warning',
                    timer: 2000,
                    showConfirmButton: false
                  });
                },
                error: (err) => {
                  Swal.fire({
                    title: 'Erreur',
                    text: 'Erreur lors de l\'envoi de l\'e-mail d\'annulation.',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                  });
                  console.error('Erreur e-mail annulation:', err);
                }
              });
            }
          },
          error: (err) => {
            if (err.status === 404) {
              this.notificationService.removeNotification(id);
              console.log(`Utilisateur ${notification.email} non trouvé (404), notification supprimée.`);
              return;
            }

            let errorMessage = 'Erreur lors de la vérification du compte.';
            if (err.status === 401) {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/connexion']);
              });
            } else if (err.status === 500) {
              errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              });
            }
            console.error('Erreur vérification compte:', err);
          }
        });
      }
    });
  }

  markAsRead2(id: number): void {
    const notification = this.notifications.find(notif => notif.id === id);
    if (!notification || !notification.email) {
      Swal.fire({
        title: 'Erreur',
        text: 'Informations de notification invalides.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Erreur',
        text: 'Vous devez être connecté en tant qu\'administrateur pour supprimer un partenaire.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/connexion']);
      });
      return;
    }

    Swal.fire({
      title: 'Suppression',
      text: 'Voulez-vous supprimer ce partenaire ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.checkUserExists(notification.email).subscribe({
          next: (response) => {
            // Vérifier si la réponse est définie et si l'utilisateur existe
            if (!response || !response.exists) {
              this.notificationService.removeNotification(id);
              console.log(`Utilisateur ${notification.email} non trouvé, notification supprimée.`);
              return;
            }

            this.emailService.sendCancellationEmail(notification.email).subscribe({
              next: () => {
                this.userService.deleteUser(notification.email).subscribe({
                  next: () => {
                    this.notificationService.removeNotification(id);
                    Swal.fire({
                      title: 'Succès',
                      text: 'Partenaire supprimé avec succès ! Un e-mail d\'annulation a été envoyé.',
                      icon: 'success',
                      timer: 1500,
                      showConfirmButton: false
                    });
                  },
                  error: (err) => {
                    let errorMessage = 'Erreur lors de la suppression du partenaire.';
                    if (err.status === 401) {
                      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                      Swal.fire({
                        title: 'Erreur',
                        text: errorMessage,
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false
                      }).then(() => {
                        this.router.navigate(['/connexion']);
                      });
                    } else if (err.status === 500) {
                      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                      Swal.fire({
                        title: 'Erreur',
                        text: errorMessage,
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false
                      });
                    } else {
                      Swal.fire({
                        title: 'Erreur',
                        text: errorMessage,
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false
                      });
                    }
                    console.error('Erreur suppression partenaire:', err);
                  }
                });
              },
              error: (err) => {
                let errorMessage = 'Erreur lors de l\'envoi de l\'e-mail d\'annulation.';
                if (err.status === 401) {
                  errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                  Swal.fire({
                    title: 'Erreur',
                    text: errorMessage,
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                  }).then(() => {
                    this.router.navigate(['/connexion']);
                  });
                } else if (err.status === 500) {
                  errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                  Swal.fire({
                    title: 'Erreur',
                    text: errorMessage,
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                  });
                } else {
                  Swal.fire({
                    title: 'Erreur',
                    text: errorMessage,
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false
                  });
                }
                console.error('Erreur e-mail annulation:', err);
              }
            });
          },
          error: (err) => {
            if (err.status === 404) {
              this.notificationService.removeNotification(id);
              console.log(`Utilisateur ${notification.email} non trouvé (404), notification supprimée.`);
              return;
            }

            let errorMessage = 'Erreur lors de la vérification du compte.';
            if (err.status === 401) {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/connexion']);
              });
            } else if (err.status === 500) {
              errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                title: 'Erreur',
                text: errorMessage,
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              });
            }
            console.error('Erreur vérification compte:', err);
          }
        });
      }
    });
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleProfileMenu() {
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