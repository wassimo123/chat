import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
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

  // Données du profil
  profileImage: string = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxOX4mkcW8pH9FbpI9rTBkokiMxSY2GJ3eyw&s';
  profile = {
    firstName: 'Affes',
    lastName: 'Wassim',
    email: 'wassimaffes947@gmail.com',
    language: 'fr',
    timezone: 'Tunisie'
  };
  originalProfile: any = null;

  // Toast pour les modifications du profil
  toastMessage: string | null = null;
  toastType: 'success' | 'info' = 'success';

  // Nombre de notifications non lues (mocké pour l'instant)
  notificationCount: number = 3;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit() {
    // Sauvegarde des données initiales pour la réinitialisation
    this.originalProfile = { ...this.profile };
  }

  // Ouvre/ferme le menu de profil
  toggleProfileMenu() {
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

  // Ouvre l'input de fichier pour changer la photo de profil
  triggerFileInput() {
    this.photoInput.nativeElement.click();
  }

  // Met à jour la photo de profil
  updateProfileImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
        this.showToast('Photo de profil mise à jour avec succès', 'success');
      };
      reader.readAsDataURL(file);
    }
  }

  // Réinitialise le formulaire
  resetForm() {
    this.profile = { ...this.originalProfile };
    this.showToast('Les modifications ont été annulées', 'info');
  }

  // Soumet le formulaire de profil
  handleProfileSubmit() {
    this.originalProfile = { ...this.profile };
    this.showToast('Profil mis à jour avec succès', 'success');
  }

  // Affiche un toast
  showToast(message: string, type: 'success' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  // Affiche le modal pour changer le mot de passe
  showPasswordModal() {
    this.isPasswordModalOpen = true;
    this.isProfileMenuOpen = false;
  }

  // Ferme le modal pour changer le mot de passe
  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrengthClass = '';
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
  }

  // Vérifie la force du mot de passe
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

  // Vérifie si les mots de passe correspondent
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

  // Valide le mot de passe selon les critères
  validatePassword(password: string): boolean {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;
    return hasLower && hasUpper && hasNumber && hasSpecial && length;
  }

  // Soumet le formulaire de changement de mot de passe
  handlePasswordSubmit() {
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

    // Ici, vous feriez normalement un appel API pour changer le mot de passe
    this.showMessageModal = true;
    this.messageModalType = 'success';
    this.messageModalTitle = 'Succès';
    this.messageModalMessage = 'Votre mot de passe a été modifié avec succès.';
    this.closePasswordModal();
  }

  // Ferme le modal de message
  closeMessageModal() {
    this.showMessageModal = false;
  }
}