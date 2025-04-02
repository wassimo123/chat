import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';

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
  currentUser: any = { 
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

  users: any[] = [];
  filteredUsers = [...this.users];
  notificationCount: number = 3;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.filteredUsers = [...this.users];
    });
  }

  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (!this.tableSearchQuery || 
        `${user.matriculeFiscale} ${user.nom} ${user.prenom}`.toLowerCase().includes(this.tableSearchQuery.toLowerCase()))
    );
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
      dateCreation: '' 
    };
    this.isModalOpen = true;
  }

  editUser(user: any) {
    this.modalTitle = "Modifier l'utilisateur";
    this.currentUser = { ...user };
    this.isModalOpen = true;
  }

  saveUser() {
    if (this.currentUser.matriculeFiscale && 
        this.currentUser.nom && 
        this.currentUser.prenom && 
        this.currentUser.email && 
        this.currentUser.password && 
        this.currentUser.confirmPassword &&
        this.currentUser.telephone && 
        this.currentUser.adresse) {
      
      if (this.currentUser.password !== this.currentUser.confirmPassword) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = 'Les mots de passe ne correspondent pas';
        return;
      }

      if (!this.validatePassword(this.currentUser.password)) {
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur de validation';
        this.messageModalMessage = 'Le mot de passe ne respecte pas les critères de sécurité requis.';
        return;
      }

      if (!this.currentUser.dateCreation) {
        this.currentUser.dateCreation = new Date().toISOString();
      }

      this.userService.createUsers(this.currentUser).subscribe(
        (response) => {
          console.log('Utilisateur ajouté avec succès:', response);
          this.users.push(response);
          this.filterUsers();
          this.closeModal();
        },
        (error) => {
          console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
        }
      );
    } else {
      console.warn("Veuillez remplir tous les champs obligatoires.");
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

  archiveUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?')) {
      console.log('Utilisateur archivé:', id);
    }
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