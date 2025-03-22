import { Component, OnInit, HostListener } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.component.html',
  styleUrls: ['./tableau-de-bord.component.css']
})
export class TableauDeBordComponent implements OnInit {
  searchQuery: string = '';
  tableSearchQuery: string = '';
  statusFilter: string = '';
  isModalOpen: boolean = false;
  modalTitle: string = "Modifier l'utilisateur";
  currentUser: any = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
  isProfileMenuOpen: boolean = false;
  isPasswordModalOpen: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  strengthLevel: string = '';
  passwordsMatch: boolean = false;
  passwordMatchMessage: string = '';

  stats = {
    users: 1234,
    usersTrend: 12,
    active: 956,
    activeTrend: 8,
    pending: 145,
    pendingTrend: -3,
    inactive: 133,
    inactiveTrend: 2
  };

  recentActivities = [
    { icon: 'ri-user-add-line', description: 'Nouveau utilisateur inscrit: Wassim Affes', time: 'Il y a 2 heures' },
    { icon: 'ri-check-line', description: 'Compte activé: Racem Ben Jdidia', time: 'Il y a 3 heures' },
    { icon: 'ri-edit-line', description: 'Profil mis à jour: Mohamed Kallel', time: 'Il y a 5 heures' }
  ];

  users = [
    { id: 1, nom: 'Mezghani', prenom: 'Ahmed', email: 'ahmed.mezghani@gmail.com', statut: 'Actif', dateCreation: '15/03/2025' },
    { id: 2, nom: 'Sahnoun', prenom: 'Mariem', email: 'mariem.sahnoun@gmail.com', statut: 'Actif', dateCreation: '14/03/2025' },
    { id: 3, nom: 'Ben Ali', prenom: 'Sami', email: 'sami.benali@gmail.com', statut: 'Inactif', dateCreation: '13/03/2025' },
    { id: 4, nom: 'Affes', prenom: 'Wassim', email: 'wassim.affes@gmail.com', statut: 'Actif', dateCreation: '12/03/2025' },
    { id: 5, nom: 'Mzid', prenom: 'Racem', email: 'racem.mzid@gmail.com', statut: 'Actif', dateCreation: '11/03/2025' },
    { id: 6, nom: 'Tahri', prenom: 'Amir', email: 'amir.tahri@gmail.com', statut: 'Actif', dateCreation: '10/03/2025' },
    { id: 7, nom: 'Masmoudi', prenom: 'Bilel', email: 'bilel.masmoudi@gmail.com', statut: 'Inactif', dateCreation: '09/03/2025' },
    { id: 8, nom: 'Laswad', prenom: 'Oumayma', email: 'oumayma.laswad@gmail.com', statut: 'Actif', dateCreation: '08/03/2025' },
  ];

  filteredUsers = [...this.users];

  userActivityChartOptions: EChartsOption = {
    animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255, 255, 255, 0.9)', textStyle: { color: '#1f2937' } },
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
    grid: { top: '10%', right: '3%', bottom: '10%', left: '3%', containLabel: true },
    series: [{
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
    }]
  };

  userRolesChartOptions: EChartsOption = {
    animation: false,
    tooltip: { trigger: 'item', backgroundColor: 'rgba(255, 255, 255, 0.9)', textStyle: { color: '#1f2937' } },
    legend: { top: '5%', left: 'center', textStyle: { color: '#1f2937' } },
    series: [{
      name: 'Rôles',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 735, name: 'Utilisateurs', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
        { value: 580, name: 'Modérateurs', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
        { value: 484, name: 'Administrateurs', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
        { value: 300, name: 'Invités', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
      ]
    }]
  };

  ngOnInit() {
    this.filterUsers();
  }

  onSearch() {
    console.log('Recherche:', this.searchQuery);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (!this.tableSearchQuery || `${user.nom} ${user.prenom}`.toLowerCase().includes(this.tableSearchQuery.toLowerCase())) &&
      (!this.statusFilter || user.statut === this.statusFilter)
    );
  }

  editUser(user: any) {
    this.modalTitle = "Modifier l'utilisateur";
    this.currentUser = { ...user };
    this.isModalOpen = true;
  }

  archiveUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?')) {
      console.log('Utilisateur archivé:', id);
    }
  }

  saveUser() {
    if (this.currentUser.nom && this.currentUser.prenom && this.currentUser.email) {
      this.currentUser.dateCreation = new Date().toLocaleDateString('fr-FR');
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

  closeModal() {
    this.isModalOpen = false;
    this.currentUser = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isProfileMenuOpen = false;
    }
  }

  showPasswordModal() {
    this.isPasswordModalOpen = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.strengthLevel = '';
    this.passwordsMatch = false;
    this.passwordMatchMessage = '';
    this.isProfileMenuOpen = false; // Ferme le menu de profil
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.strengthLevel = '';
    this.passwordsMatch = false;
    this.passwordMatchMessage = '';
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
      this.strengthLevel = 'weak';
    } else if (strength <= 4) {
      this.strengthLevel = 'medium';
    } else {
      this.strengthLevel = 'strong';
    }
  }

  checkPasswordMatch() {
    this.passwordsMatch = this.newPassword === this.confirmPassword;
    this.passwordMatchMessage = this.confirmPassword ? (this.newPassword === this.confirmPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas') : '';
  }

  isPasswordValid(): boolean {
    const hasLower = /[a-z]/.test(this.newPassword);
    const hasUpper = /[A-Z]/.test(this.newPassword);
    const hasNumber = /\d/.test(this.newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
    const length = this.newPassword.length >= 8;
    return hasLower && hasUpper && hasNumber && hasSpecial && length && this.passwordsMatch && !!this.newPassword && !!this.confirmPassword;
  }

  handlePasswordSubmit() {
    if (!this.isPasswordValid()) {
      this.showErrorModal('Le nouveau mot de passe ne respecte pas les critères de sécurité requis.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showErrorModal('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    this.showSuccessModal('Votre mot de passe a été modifié avec succès.');
    this.closePasswordModal();
  }

  showErrorModal(message: string) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'fixed inset-0 flex items-center justify-center z-50';
    modalDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div class="text-red-600 flex items-center mb-4">
          <i class="ri-error-warning-line text-2xl mr-2"></i>
          <h3 class="text-lg font-semibold">Erreur de validation</h3>
        </div>
        <p class="text-gray-700 mb-6">${message}</p>
        <div class="flex justify-end">
          <button class="px-4 py-2 bg-primary text-white rounded-button" onclick="this.closest('.fixed').remove()">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  showSuccessModal(message: string) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'fixed inset-0 flex items-center justify-center z-50';
    modalDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div class="text-green-600 flex items-center mb-4">
          <i class="ri-checkbox-circle-line text-2xl mr-2"></i>
          <h3 class="text-lg font-semibold">Succès</h3>
        </div>
        <p class="text-gray-700 mb-6">${message}</p>
        <div class="flex justify-end">
          <button class="px-4 py-2 bg-primary text-white rounded-button" onclick="this.closest('.fixed').remove()">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }
}