import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  isAuthenticated: boolean = false;
  isProfileMenuOpen: boolean = false;
  notifications: any[] = [];

  showCurrentPassword: boolean = false;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordStrengthClass: string = '';
  passwordMatchMessage: string = '';
  passwordMatchClass: string = '';

  showMessageModal: boolean = false;
  messageModalType: 'error' | 'success' = 'error';
  messageModalTitle: string = '';
  messageModalMessage: string = '';

  profile = {
    matriculeFiscale: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    language: 'fr',
    timezone: 'Tunisie'
  };
  originalProfile: any = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'info' = 'success';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
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

    this.profile.email = user.email || '';
    this.profile.firstName = user.prenom || '';
    this.profile.lastName = user.nom || '';
    this.profile.matriculeFiscale = user.matriculeFiscale || '';
    this.profile.telephone = user.telephone || '';
    this.profile.adresse = user.adresse || '';
    this.profile.password = user.password || '';

    this.userService.getUserByEmail(this.profile.email).subscribe(
      (response) => {
        console.log('Réponse de getUserByEmail:', response);
        this.profile.firstName = response.prenom || '';
        this.profile.lastName = response.nom || '';
        this.profile.email = response.email || '';
        this.profile.matriculeFiscale = response.matriculeFiscale || '';
        this.profile.password = response.password || '';
        this.profile.telephone = response.telephone || '';
        this.profile.adresse = response.adresse || '';
        this.originalProfile = { ...this.profile };
      },
      (error) => {
        console.error('Erreur lors de la récupération des données du profil:', error);
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = 'Impossible de charger les données du profil. Veuillez vous reconnecter.';
        setTimeout(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          this.router.navigate(['/connexion']);
        }, 2000);
      }
    );

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

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetForm() {
    this.profile = { ...this.originalProfile };
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrengthClass = '';
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.showToast('Les modifications ont été annulées', 'info');
  }

  handleProfileSubmit() {
    if (!this.profile.telephone || !this.profile.adresse) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Veuillez remplir tous les champs obligatoires (téléphone et adresse).';
      return;
    }

    if (
      this.profile.firstName !== this.originalProfile.firstName ||
      this.profile.lastName !== this.originalProfile.lastName ||
      this.profile.email !== this.originalProfile.email
    ) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Le nom, prénom et email ne peuvent pas être modifiés.';
      return;
    }

    let passwordChanged = false;
    if (this.currentPassword || this.newPassword || this.confirmPassword) {
      if (!this.validatePassword(this.newPassword)) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur de validation';
        this.messageModalMessage = 'Le nouveau mot de passe ne respecte pas les critères de sécurité requis.';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur de validation';
        this.messageModalMessage = 'Les nouveaux mots de passe ne correspondent pas.';
        return;
      }

      const passwordData = {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      };

      this.userService.changePassword(passwordData).subscribe(
        (response) => {
          this.profile.password = this.newPassword;
          passwordChanged = true;
          this.finalizeSubmit(passwordChanged);
        },
        (error) => {
          console.error('Erreur lors du changement de mot de passe:', error);
          this.showMessageModal = true;
          this.messageModalType = 'error';
          this.messageModalTitle = 'Erreur';
          this.messageModalMessage = error.error?.message || 'Erreur lors du changement de mot de passe.';
        }
      );
    } else {
      this.finalizeSubmit(passwordChanged);
    }
  }

  finalizeSubmit(passwordChanged: boolean) {
    const updatedUser = {
      matriculeFiscale: this.profile.matriculeFiscale,
      prenom: this.profile.firstName,
      nom: this.profile.lastName,
      email: this.profile.email,
      telephone: this.profile.telephone,
      adresse: this.profile.adresse,
      ...(passwordChanged && { password: this.profile.password, confirmPassword: this.profile.password })
    };

    this.userService.updateUser(this.profile.matriculeFiscale, updatedUser).subscribe(
      (response) => {
        this.originalProfile = { ...this.profile };
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.prenom = this.profile.firstName;
        userData.nom = this.profile.lastName;
        userData.email = this.profile.email;
        userData.telephone = this.profile.telephone;
        userData.adresse = this.profile.adresse;
        userData.password = this.profile.password;
        localStorage.setItem('user', JSON.stringify(userData));
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showOldPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        this.showToast('Profil mis à jour avec succès', 'success');
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = error.error?.message || 'Erreur lors de la mise à jour du profil.';
      }
    );
  }

  showToast(message: string, type: 'success' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  checkPasswordStrength() {
    const password = this.newPassword;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial, length].filter(Boolean).length;

    if (strength <= 2) {
      this.passwordStrengthClass = 'weak';
    } else if (strength <= 4) {
      this.passwordStrengthClass = 'medium';
    } else {
      this.passwordStrengthClass = 'strong';
    }
  }

  checkPasswordMatch() {
    if (this.confirmPassword) {
      if (this.newPassword === this.confirmPassword) {
        this.passwordMatchMessage = 'Les mots de passe correspondent';
        this.passwordMatchClass = 'text-green-600';
      } else {
        this.passwordMatchMessage = 'Les mots de passe ne correspondent pas';
        this.passwordMatchClass = 'text-red-600';
      }
    } else {
      this.passwordMatchMessage = '';
      this.passwordMatchClass = '';
    }
  }

  validatePassword(password: string): boolean {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;
    return hasLower && hasUpper && hasNumber && hasSpecial && length;
  }

  closeMessageModal() {
    this.showMessageModal = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }
}