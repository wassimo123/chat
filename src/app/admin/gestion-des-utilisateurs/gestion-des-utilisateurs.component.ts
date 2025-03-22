import { Component, OnInit, HostListener } from '@angular/core';
import { EChartsOption } from 'echarts';
@Component({
  selector: 'app-gestion-des-utilisateurs',
  templateUrl: './gestion-des-utilisateurs.component.html',
  styleUrls: ['./gestion-des-utilisateurs.component.css']
})
export class GestionDesUtilisateursComponent implements OnInit {
  searchQuery: string = '';
  tableSearchQuery: string = '';
  statusFilter: string = '';
  isModalOpen: boolean = false;
  modalTitle: string = 'Modifier l\'utilisateur'; // Changé car plus utilisé pour "Ajouter"
  currentUser: any = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
  isProfileMenuOpen: boolean = false;




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
  openAddUserModal() {
    this.modalTitle = "Ajouter un utilisateur";
    this.currentUser = { nom: '', prenom: '', email: '', statut: 'Actif', dateCreation: '' };
    this.isModalOpen = true;
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
}