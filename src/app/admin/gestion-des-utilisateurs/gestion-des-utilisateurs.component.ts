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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.filteredUsers = this.users.filter(user => !user.isArchived); // Affiche uniquement les utilisateurs non archivés
    });
  }

  // archiveUser(matriculeFiscale: string): void {
  //   if (confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?')) {
  //     this.userService.archiveUser(matriculeFiscale).subscribe(
  //       response => {
  //         console.log('Utilisateur archivé:', response);
  //         // Recharger la liste des utilisateurs après archivage
  //         this.loadUsers();
  //         this.showMessageModal = true;
  //         this.messageModalType = 'success';
  //         this.messageModalTitle = 'Succès';
  //         this.messageModalMessage = 'Utilisateur archivé avec succès.';
  //       },
  //       error => {
  //         console.error('Erreur lors de l\'archivage :', error);
  //         this.showMessageModal = true;
  //         this.messageModalType = 'error';
  //         this.messageModalTitle = 'Erreur';
  //         this.messageModalMessage = error.error?.message || 'Erreur lors de l\'archivage.';
  //       }
  //     );
  //   }
  // }
  archiveUser(matriculeFiscale: string): void {
    if (!matriculeFiscale) {
      console.warn('Matricule fiscale invalide.');
      return;
    }
  
    const confirmation = confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?');
    if (!confirmation) return;
  
    this.userService.archiveUser(matriculeFiscale).subscribe({
      next: (response) => {
        console.log('Utilisateur archivé:', response);
  
        // Recharger uniquement les utilisateurs actifs (non archivés)
        this.loadUsers();
  
        // Affichage du message de succès
        this.showMessageModal = true;
        this.messageModalType = 'success';
        this.messageModalTitle = 'Succès';
        this.messageModalMessage = 'Utilisateur archivé avec succès.';
      },
      error: (error) => {
        console.error('Erreur lors de l\'archivage :', error);
  
        // Affichage du message d'erreur
        this.showMessageModal = true;
        this.messageModalType = 'error';
        this.messageModalTitle = 'Erreur';
        this.messageModalMessage = error?.error?.message || 'Erreur lors de l\'archivage.';
      }
    });
  }
  

  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (!this.tableSearchQuery || 
        `${user.matriculeFiscale} ${user.nom}${user.adresse} ${user.prenom}`.toLowerCase().includes(this.tableSearchQuery.toLowerCase()))
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
    if (this.currentUser.matriculeFiscale && 
        this.currentUser.nom && 
        this.currentUser.prenom && 
        this.currentUser.email && 
        this.currentUser.telephone && 
        this.currentUser.adresse) {
      
      // Vérifier les mots de passe uniquement si les deux champs sont remplis
      if (this.currentUser.password && this.currentUser.confirmPassword) {
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
      }
  
      if (!this.currentUser.dateCreation) {
        this.currentUser.dateCreation = new Date().toISOString().split('T')[0];
      }
  
      // Créer un objet à envoyer au backend
      const { password, confirmPassword, ...userToSave } = this.currentUser;
      // Inclure password et confirmPassword uniquement s'ils sont remplis
      const finalUserToSave = {
        ...userToSave,
        ...(password && confirmPassword ? { password, confirmPassword } : {})
      };
  
      if (this.users.some(u => u.matriculeFiscale === this.currentUser.matriculeFiscale)) {
        this.userService.updateUser(this.currentUser.matriculeFiscale, finalUserToSave).subscribe(
          (response: User) => {
            console.log('Utilisateur mis à jour avec succès:', response);
            const index = this.users.findIndex(u => u.matriculeFiscale === response.matriculeFiscale);
            this.users[index] = response;
            this.filterUsers();
            this.closeModal();
            this.showMessageModal = true;
            this.messageModalType = 'success';
            this.messageModalTitle = 'Succès';
            this.messageModalMessage = 'Utilisateur mis à jour avec succès.';
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            this.showMessageModal = true;
            this.messageModalType = 'error';
            this.messageModalTitle = 'Erreur';
            this.messageModalMessage = error.error?.message || 'Erreur lors de la mise à jour.';
          }
        );
      } else {
        this.userService.createUsers(finalUserToSave).subscribe(
          (response: User) => {
            console.log('Utilisateur ajouté avec succès:', response);
            this.users.push(response);
            this.filterUsers();
            this.closeModal();
            this.showMessageModal = true;
            this.messageModalType = 'success';
            this.messageModalTitle = 'Succès';
            this.messageModalMessage = 'Utilisateur ajouté avec succès.';
          },
          (error: any) => {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
            this.showMessageModal = true;
            this.messageModalType = 'error';
            this.messageModalTitle = 'Erreur';
            this.messageModalMessage = error.error?.message || 'Erreur lors de l\'ajout.';
          }
        );
      }
    } else {
      this.showMessageModal = true;
      this.messageModalType = 'error';
      this.messageModalTitle = 'Erreur';
      this.messageModalMessage = 'Veuillez remplir tous les champs obligatoires.';
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
