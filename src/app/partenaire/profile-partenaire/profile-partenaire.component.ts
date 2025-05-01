import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-partenaire',
  templateUrl: './profile-partenaire.component.html',
  styleUrls: ['./profile-partenaire.component.css']
})
export class ProfilePartenaireComponent implements OnInit {
  user: any = null;
  isProfileMenuOpen: boolean = false;
  isPasswordModalOpen: boolean = false;
  showMessageModal: boolean = false;
  messageModalType: 'success' | 'error' = 'success';
  messageModalTitle: string = '';
  messageModalMessage: string = '';

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrengthClass: string = '';
  passwordMatchClass: string = 'text-gray-500';
  passwordMatchMessage: string = '';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    // Récupérer les informations de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      // Vérifier que le rôle est bien "Partenaire"
      if (this.user.role !== 'Partenaire') {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Accès non autorisé';
        this.messageModalMessage = 'Seuls les partenaires peuvent accéder à cette page.';
        setTimeout(() => {
          this.router.navigate(['/connexion']);
        }, 2000);
      }
    } else {
      this.router.navigate(['/connexion']);
    }
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }

  openPasswordModal() {
    this.isPasswordModalOpen = true;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrengthClass = '';
    this.passwordMatchClass = 'text-gray-500';
    this.passwordMatchMessage = '';
  }

  closeMessageModal() {
    this.showMessageModal = false;
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordStrength() {
    const password = this.newPassword;
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      this.passwordStrengthClass = 'bg-green-500';
    } else if (password.length >= 6) {
      this.passwordStrengthClass = 'bg-yellow-500';
    } else {
      this.passwordStrengthClass = 'bg-red-500';
    }
  }

  checkPasswordMatch() {
    if (this.newPassword && this.confirmPassword) {
      if (this.newPassword === this.confirmPassword) {
        this.passwordMatchClass = 'text-green-500';
        this.passwordMatchMessage = 'Les mots de passe correspondent.';
      } else {
        this.passwordMatchClass = 'text-red-500';
        this.passwordMatchMessage = 'Les mots de passe ne correspondent pas.';
      }
    } else {
      this.passwordMatchClass = 'text-gray-500';
      this.passwordMatchMessage = '';
    }
  }

  handlePasswordSubmit() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const passwordData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.userService.changePassword(passwordData).subscribe(
      (response) => {
        this.showMessageModal = true;
        this.messageModalType = 'success';
        this.messageModalTitle = 'Succès';
        this.messageModalMessage = 'Mot de passe changé avec succès.';
        this.closePasswordModal();
      },
      (error) => {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = error.error.message || 'Erreur lors du changement de mot de passe.';
      }
    );
  }

  updateProfile() {
    // Vérifier que les champs requis sont remplis
    if (!this.user.telephone || !this.user.adresse) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Mettre à jour uniquement les champs modifiables (téléphone et adresse)
    const updatedUser = {
      telephone: this.user.telephone,
      adresse: this.user.adresse
    };

    this.userService.updateUser(this.user.matriculeFiscale, updatedUser).subscribe(
      (response) => {
        // Recharger les données de l'utilisateur depuis le serveur pour s'assurer que tout est synchronisé
        this.userService.getUserByEmail(this.user.email).subscribe(
          (userData) => {
            this.user = userData;
            localStorage.setItem('user', JSON.stringify(userData));
            this.showMessageModal = true;
            this.messageModalType = 'success';
            this.messageModalTitle = 'Succès';
            this.messageModalMessage = 'Profil mis à jour avec succès.';
          },
          (error) => {
            this.showMessageModal = true;
            this.messageModalType = 'error';
            this.messageModalTitle = 'Erreur';
            this.messageModalMessage = 'Erreur lors de la récupération des données utilisateur après la mise à jour.';
          }
        );
      },
      (error) => {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = error.error.message || 'Erreur lors de la mise à jour du profil.';
      }
    );
  }
}

