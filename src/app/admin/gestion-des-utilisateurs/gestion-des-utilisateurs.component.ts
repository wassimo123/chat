import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router'; // Ajout de Router
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
  status?: 'pending' | 'active' | 'inactive';
  role?: string;
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
  notifications: any[] = [];

  isPasswordModalOpen: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordStrengthClass: string = '';
  passwordMatchMessage: string = '';
  passwordMatchClass: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  showMessageModal: boolean = false;
  messageModalType: 'error' | 'success' = 'error';
  messageModalTitle: string = '';
  messageModalMessage: string = '';

  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 1;


  
  showArchiveConfirmation = false;
  userToArchive: string | null = null;
  isAuthenticated: boolean = false; // Ajout de la propriété isAuthenticated

  constructor(private userService: UserService, private notificationService: NotificationService,private router: Router) {}

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


    this.loadUsers();
    
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

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = this.users.filter(user => 
          user.status === 'active' && 
          !user.isArchived && 
          user.role?.toLowerCase() !== 'admin'
        );
        this.totalItems = this.filteredUsers.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginatedUsers();
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

  onSearch(): void {
    this.tableSearchQuery = this.searchQuery;
    this.currentPage = 1;
    this.filterUsers();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      if (user.status !== 'active' || user.isArchived || user.role?.toLowerCase() === 'admin') {
        return false;
      }
      
      if (!this.tableSearchQuery) return true;
      
      const searchStr = this.tableSearchQuery.toLowerCase();
      return (
        user.matriculeFiscale.toLowerCase().includes(searchStr) ||
        user.nom.toLowerCase().includes(searchStr) ||
        user.prenom.toLowerCase().includes(searchStr) ||
        user.email.toLowerCase().includes(searchStr)
      );
    });

    this.totalItems = this.filteredUsers.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.isModalOpen = true;
  }

  editUser(user: User) {
    this.modalTitle = "Modifier l'utilisateur";
    this.currentUser = { ...user, password: undefined, confirmPassword: undefined };
    this.isModalOpen = true;
  }

  saveUser() {
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

    if (!this.currentUser.dateCreation) {
      this.currentUser.dateCreation = new Date().toISOString().split('T')[0];
    }

    if (this.modalTitle === 'Ajouter un utilisateur') {
      this.currentUser.status = 'active';
    }

    if (this.modalTitle === 'Ajouter un utilisateur') {
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
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
  
    // Gestion du menu profil
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  
    // Vérifie si on clique à l'extérieur des modals **mais pas sur les boutons d'action**
    if (
      this.isModalOpen &&
      !target.closest('.max-w-2xl') &&
      !target.closest('#addUserBtn') &&
      !target.closest('.ri-edit-line') &&
      !target.closest('.px-4') // Exclut les boutons OK/Enregistrer/Annuler dans le modal
    ) {
      this.closeModal();
    }
  
    if (
      this.isPasswordModalOpen &&
      !target.closest('.max-w-md') &&
      !target.closest('#profileMenu') &&
      !target.closest('.px-4') // Exclut les boutons OK/Enregistrer/Annuler dans le modal
    ) {
      this.closePasswordModal();
    }
  
    if (
      this.showMessageModal &&
      !target.closest('.max-w-sm') &&
      !target.closest('.px-4') // Exclut le bouton OK du modal de message
    ) {
      this.closeMessageModal();
    }
  
    if (
      this.showArchiveConfirmation &&
      !target.closest('.max-w-md') &&
      !target.closest('.ri-archive-line') &&
      !target.closest('.px-4') // Exclut les boutons du modal Archive
    ) {
      this.cancelArchive();
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.router.navigate(['/connexion']);
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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