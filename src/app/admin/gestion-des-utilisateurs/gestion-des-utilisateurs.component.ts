import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';

interface User {
  matriculeFiscale: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  telephone: string;
  adresse: string;
  dateCreation: string;
  isArchived?: boolean;
}

@Component({
  selector: 'app-gestion-des-utilisateurs',
  templateUrl: './gestion-des-utilisateurs.component.html',
  styleUrls: ['./gestion-des-utilisateurs.component.css']
})
export class GestionDesUtilisateursComponent implements OnInit {
  searchQuery: string = '';
  tableSearchQuery: string = '';
  
  isProfileMenuOpen: boolean = false;
  isModalOpen: boolean = false;
  modalTitle: string = 'Ajouter un utilisateur';
  currentUser: User = { 
    matriculeFiscale: '', 
    nom: '', 
    prenom: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    telephone: '', 
    adresse: '', 
    dateCreation: '' 
  };

  isPasswordModalOpen: boolean = false;
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

  users: User[] = [];
  filteredUsers = [...this.users];
  notificationCount: number = 3;

  showArchiveConfirmation = false;
  userToArchive: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = this.users.filter(user => !user.isArchived);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = 'Erreur lors du chargement des utilisateurs.';
      }
    });
  }

  archiveUser(matriculeFiscale: string): void {
    this.userToArchive = matriculeFiscale;
    this.showArchiveConfirmation = true;
  }

  cancelArchive(): void {
    this.showArchiveConfirmation = false;
    this.userToArchive = null;
  }

  confirmArchive(): void {
    if (!this.userToArchive) {
      return;
    }
  
    this.userService.archiveUser(this.userToArchive).subscribe({
      next: (response) => {
        console.log('Utilisateur archivé:', response);
        this.loadUsers();
        this.showMessageModal = true;
        this.messageModalType = 'success';
        this.messageModalTitle = 'Succès';
        this.messageModalMessage = 'Utilisateur archivé avec succès.';
        this.showArchiveConfirmation = false;
        this.userToArchive = null;
      },
      error: (error) => {
        console.error('Erreur lors de l\'archivage :', error);
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = error?.error?.message || 'Erreur lors de l\'archivage.';
        this.showArchiveConfirmation = false;
        this.userToArchive = null;
      }
    });
  }
  

  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      if (user.isArchived) return false;
      
      if (!this.tableSearchQuery) return true;
      
      const searchStr = this.tableSearchQuery.toLowerCase();
      return (
        user.matriculeFiscale.toLowerCase().includes(searchStr) ||
        user.nom.toLowerCase().includes(searchStr) ||
        user.prenom.toLowerCase().includes(searchStr) ||
        user.email.toLowerCase().includes(searchStr)
      );
    });
  }

  openAddUserModal() {
    this.modalTitle = 'Ajouter un utilisateur';
    this.currentUser = { 
      matriculeFiscale: '', 
      nom: '', 
      prenom: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      telephone: '', 
      adresse: '', 
      dateCreation: '' ,
    };
    this.isModalOpen = true;
  }

  editUser(user: User) {
    this.modalTitle = "Modifier l'utilisateur";
    this.currentUser = { ...user, password: undefined, confirmPassword: undefined };
    this.isModalOpen = true;
  }
  saveUser() {
    // Vérification des champs obligatoires
    if (!this.currentUser.matriculeFiscale || 
        !this.currentUser.nom || 
        !this.currentUser.prenom || 
        !this.currentUser.email || 
        !this.currentUser.telephone || 
        !this.currentUser.adresse) {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Pour un nouvel utilisateur, vérifier les mots de passe
    if (this.modalTitle === 'Ajouter un utilisateur') {
      if (!this.currentUser.password || !this.currentUser.confirmPassword) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = 'Les mots de passe sont obligatoires.';
        return;
      }

      if (this.currentUser.password !== this.currentUser.confirmPassword) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = 'Les mots de passe ne correspondent pas.';
        return;
      }
    }

    // Ajouter la date de création si non définie
    if (!this.currentUser.dateCreation) {
      this.currentUser.dateCreation = new Date().toISOString().split('T')[0];
    }

    if (this.modalTitle === 'Ajouter un utilisateur') {
      // Création d'un nouvel utilisateur
      this.userService.createUsers(this.currentUser).subscribe({
        next: (response) => {
          console.log('Utilisateur ajouté avec succès:', response);
          this.users.push(response);
          this.filterUsers();
          this.closeModal();
          this.showMessageModal = true;
          this.messageModalType = 'success';
          this.messageModalTitle = 'Succès';
          this.messageModalMessage = 'Utilisateur ajouté avec succès.';
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
          this.showMessageModal = true;
          this.messageModalType = 'error';
          this.messageModalTitle = 'Erreur';
          this.messageModalMessage = error.error?.message || 'Erreur lors de l\'ajout de l\'utilisateur.';
        }
      });
    } else {
      // Mise à jour d'un utilisateur existant
      this.userService.updateUser(this.currentUser.matriculeFiscale, this.currentUser).subscribe({
        next: (response) => {
          console.log('Utilisateur mis à jour avec succès:', response);
          const index = this.users.findIndex(u => u.matriculeFiscale === response.matriculeFiscale);
          if (index !== -1) {
            this.users[index] = response;
          }
          this.filterUsers();
          this.closeModal();
          this.showMessageModal = true;
          this.messageModalType = 'success';
          this.messageModalTitle = 'Succès';
          this.messageModalMessage = 'Utilisateur mis à jour avec succès.';
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
          this.showMessageModal = true;
          this.messageModalType = 'error';
          this.messageModalTitle = 'Erreur';
          this.messageModalMessage = error.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
        }
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentUser = {
      matriculeFiscale: '',
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      adresse: '',
      dateCreation: ''
    };
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }

  showPasswordModal() {
    this.isPasswordModalOpen = true;
    this.isProfileMenuOpen = false;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrengthClass = '';
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
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
    if (this.currentUser.confirmPassword || this.confirmPassword) {
      const passwordToCheck = this.currentUser.password || this.newPassword;
      const confirmPasswordToCheck = this.currentUser.confirmPassword || this.confirmPassword;
      if (passwordToCheck === confirmPasswordToCheck) {
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

    this.showMessageModal = true;
    this.messageModalType = 'success';
    this.messageModalTitle = 'Succès';
    this.messageModalMessage = 'Votre mot de passe a été modifié avec succès.';
    this.closePasswordModal();
  }

  closeMessageModal() {
    this.showMessageModal = false;
  }
}
