import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.component.html',
  styleUrls: ['./tableau-de-bord.component.css']
})
export class TableauDeBordComponent implements OnInit, AfterViewInit {
  @ViewChild('userActivityChart') userActivityChartElement!: ElementRef;
  @ViewChild('userRolesChart') userRolesChartElement!: ElementRef;

  // Propriétés pour la barre de recherche
  searchQuery: string = '';
  userSearchQuery: string = '';
  statusFilter: string = '';
  roleFilter: string = '';

  // Contrôle l'affichage du menu de profil
  isProfileMenuOpen: boolean = false;

  // Statistiques pour les cartes
  stats = {
    totalUsers: 124,
    activeUsers: 80,
    pendingUsers: 25,
    inactiveUsers: 15
  };

  // Dernières activités
  recentActivities = [
    { type: 'new', icon: 'ri-user-add-line', message: 'Nouveau utilisateur inscrit:  Wassim Affes', time: 'Il y a 2 heures' },
    { type: 'activated', icon: 'ri-check-line', message: 'Compte activé: Racem Ben Jdidia', time: 'Il y a 3 heures' },
    { type: 'updated', icon: 'ri-edit-line', message: 'Profil mis à jour: Mohamed Kallel', time: 'Il y a 5 heures' }
  ];


  // Modal pour changer le mot de passe
  isPasswordModalOpen: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordStrengthClass: string = '';
  passwordMatchMessage: string = '';
  passwordMatchClass: string = '';

  // Modal pour ajouter/modifier un utilisateur
  isUserModalOpen: boolean = false;
  modalTitle: string = 'Ajouter un utilisateur';
  selectedUser: any = { nom: '', prenom: '', email: '', role: '' };

  // Modal pour les messages
  showMessageModal: boolean = false;
  messageModalType: 'error' | 'success' = 'error';
  messageModalTitle: string = '';
  messageModalMessage: string = '';
  notificationCount: number = 3;
  constructor() {}

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.initCharts();
    window.addEventListener('resize', () => {
      this.resizeCharts();
    });
  }

  // Initialisation des graphiques
  initCharts() {
    // Graphique: Activité des utilisateurs
    const userActivityChart = echarts.init(this.userActivityChartElement.nativeElement);
    const userActivityOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        textStyle: { color: '#1f2937' }
      },
      xAxis: {
        type: 'category',
        data: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#1f2937' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#1f2937' },
        splitLine: { lineStyle: { color: '#e5e7eb' } }
      },
      grid: {
        top: '10%',
        right: '3%',
        bottom: '10%',
        left: '3%',
        containLabel: true
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line',
          smooth: true,
          symbol: 'none',
          itemStyle: { color: 'rgba(87, 181, 231, 1)' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(87, 181, 231, 0.1)' },
                { offset: 1, color: 'rgba(87, 181, 231, 0)' }
              ]
            }
          }
        }
      ]
    };
    userActivityChart.setOption(userActivityOption);

    // Graphique: Distribution des rôles
    const userRolesChart = echarts.init(this.userRolesChartElement.nativeElement);
    const userRolesOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        textStyle: { color: '#1f2937' }
      },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: { color: '#1f2937' }
      },
      series: [
        {
          name: 'Rôles',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '20', fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: [
            { value: 735, name: 'Utilisateurs', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 580, name: 'Modérateurs', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
            { value: 484, name: 'Administrateurs', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
            { value: 300, name: 'Invités', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
          ]
        }
      ]
    };
    userRolesChart.setOption(userRolesOption);
  }

  // Redimensionner les graphiques lors du changement de taille de la fenêtre
  resizeCharts() {
    const userActivityChart = echarts.getInstanceByDom(this.userActivityChartElement.nativeElement);
    const userRolesChart = echarts.getInstanceByDom(this.userRolesChartElement.nativeElement);
    if (userActivityChart) userActivityChart.resize();
    if (userRolesChart) userRolesChart.resize();
  }

  // Méthode pour la recherche dans l'en-tête
  onSearch() {
    console.log('Recherche:', this.searchQuery);
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



  // Afficher le modal pour changer le mot de passe
  showPasswordModal() {
    this.isPasswordModalOpen = true;
    this.isProfileMenuOpen = false;
  }

  // Fermer le modal pour changer le mot de passe
  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrengthClass = '';
    this.passwordMatchMessage = '';
    this.passwordMatchClass = '';
  }

  // Vérifier la force du mot de passe
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

  // Vérifier si les mots de passe correspondent
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

  // Valider le mot de passe selon les critères
  validatePassword(password: string): boolean {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length >= 8;
    return hasLower && hasUpper && hasNumber && hasSpecial && length;
  }

  // Soumettre le formulaire de changement de mot de passe
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

  // Afficher le modal pour ajouter/modifier un utilisateur
  showUserModal(title: string = 'Ajouter un utilisateur') {
    this.modalTitle = title;
    this.isUserModalOpen = true;
    this.selectedUser = { nom: '', prenom: '', email: '', role: '' };
  }

  // Fermer le modal utilisateur
  closeUserModal() {
    this.isUserModalOpen = false;
    this.selectedUser = { nom: '', prenom: '', email: '', role: '' };
  }

  // Soumettre le formulaire utilisateur
  handleUserSubmit() {
    // Ici, vous feriez normalement un appel API pour ajouter/modifier l'utilisateur
    console.log('Utilisateur soumis:', this.selectedUser);
    this.closeUserModal();
  }




  // Fermer le modal de message
  closeMessageModal() {
    this.showMessageModal = false;
  }
}