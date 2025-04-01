import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-gestion-des-utilisateurs',
  templateUrl: './gestion-des-utilisateurs.component.html',
  styleUrls: ['./gestion-des-utilisateurs.component.css']
})
export class GestionDesUtilisateursComponent implements OnInit {
  // Propriétés pour la barre de recherche
  searchQuery: string = '';
  tableSearchQuery: string = '';
  statusFilter: string = '';

  // Contrôle l'affichage du menu de profil
  isProfileMenuOpen: boolean = false;

  // Contrôle l'affichage du modal pour ajouter/modifier un utilisateur
  isModalOpen: boolean = false;
  modalTitle: string = 'Ajouter un utilisateur';
  currentUser: any = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };

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

  // Liste des utilisateurs
  
  users: any[] = [];
  notificationCount: number = 3;

  constructor(private userService: UserService) {}

  ngOnInit() {

    this.userService.getUsers().subscribe(data => this.users = data);
    console.log(this.users)
    this.filterUsers();
    
  }
  filteredUsers = [...this.users];
  // Méthode pour la recherche dans l'en-tête
  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  // Filtrer les utilisateurs selon les critères
  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (!this.tableSearchQuery || `${user.nom} ${user.prenom}`.toLowerCase().includes(this.tableSearchQuery.toLowerCase())) &&
      (!this.statusFilter || user.statut === this.statusFilter)
    );
  }

  // Ouvre le modal pour ajouter un utilisateur
  openAddUserModal() {
    this.modalTitle = 'Ajouter un utilisateur';
    this.currentUser = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
    this.isModalOpen = true;
  }

  // Ouvre le modal pour modifier un utilisateur
  editUser(user: any) {
    this.modalTitle = "Modifier l'utilisateur";
    this.currentUser = { ...user };
    this.isModalOpen = true;
  }

  // Sauvegarde l'utilisateur (ajout ou modification)
  saveUser() {
    if (this.currentUser.nom && this.currentUser.prenom && this.currentUser.email) {
      if (!this.currentUser.dateCreation) {
        this.currentUser.dateCreation = new Date().toLocaleDateString('fr-FR');
      }
      if (!this.currentUser.id) {
        this.currentUser.id = this.users.length + 1;
        this.users.push({ ...this.currentUser });
      } else {
        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        this.users[index] = { ...this.currentUser };
      }
      this.filterUsers();
      this.closeModal();
    }
  }

  // Ferme le modal d'ajout/modification d'utilisateur
  closeModal() {
    this.isModalOpen = false;
    this.currentUser = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
  }

  // Archive un utilisateur
  archiveUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?')) {
      console.log('Utilisateur archivé:', id);
      // Ici, vous pourriez mettre à jour la liste des utilisateurs
    }
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