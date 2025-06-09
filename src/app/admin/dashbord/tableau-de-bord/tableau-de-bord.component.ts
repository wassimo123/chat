import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router'; // Ajout de Router
import * as echarts from 'echarts';
import { UserService } from '../../../services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
import Swal from 'sweetalert2';

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

interface Activity {
  _id: string;
  type: string;
  email: string;
  time: string;
  message?: string;
  icon?: string;
}

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.component.html',
  styleUrls: ['./tableau-de-bord.component.css']
})
export class TableauDeBordComponent implements OnInit, AfterViewInit {
  @ViewChild('userActivityChart') userActivityChartElement!: ElementRef;
  @ViewChild('userRolesChart') userRolesChartElement!: ElementRef;

  searchQuery: string = '';
  notifications: any[] = [];
  isProfileMenuOpen: boolean = false;
  isAuthenticated: boolean = false; // Ajout de la propriété isAuthenticated

  stats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    inactiveUsers: 0
  };

  userActivityData: number[] = [];
  userRolesData: { value: number, name: string, itemStyle: { color: string } }[] = [];

  recentActivities: Activity[] = [];

  users: User[] = [];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router // Ajout de Router dans le constructeur
  ) {}

  ngOnInit() {
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

    // Chargement des données si l'utilisateur est authentifié
    this.loadUsers();
    this.loadRecentActivities();

    this.notificationService.notifications$.subscribe(notifications => {
      console.log('Notifications reçues:', notifications);
      let unreadNotifications = notifications.filter((notif: any) => !notif.read);

      const updatedNotifications: any[] = [];
      let checkPromises = unreadNotifications.map((notif: any) => {
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

  ngAfterViewInit() {
    if (this.isAuthenticated) {
      this.initCharts();
      window.addEventListener('resize', () => {
        this.resizeCharts();
      });
    }
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calculateStats();
        this.prepareChartData();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  loadRecentActivities() {
    this.userService.getRecentActivities().subscribe({
      next: (activities) => {
        this.recentActivities = activities.map(activity => {
          const date = new Date(activity.time);
          const timeAgo = this.getTimeAgo(date);
          let message = '';
          let icon = '';

          switch (activity.type) {
            case 'new':
              message = `Nouvel utilisateur inscrit: ${activity.email}`;
              icon = 'ri-user-add-line';
              break;
            case 'activated':
              message = `Compte activé: ${activity.email}`;
              icon = 'ri-check-line';
              break;
            case 'updated':
              message = `Profil mis à jour: ${activity.email}`;
              icon = 'ri-edit-line';
              break;
            default:
              message = `Activité: ${activity.email}`;
              icon = 'ri-information-line';
          }

          return { ...activity, message, icon, time: timeAgo };
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des activités récentes:', error);
        this.recentActivities = [];
      }
    });
  }

  calculateStats() {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(user => user.status === 'active' && !user.isArchived).length;
    this.stats.pendingUsers = this.users.filter(user => user.status === 'pending').length;
    this.stats.inactiveUsers = this.users.filter(user => user.status === 'inactive').length;
  }

  prepareChartData() {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    this.userActivityData = last7Days.map(date => {
      return this.users.filter(user => {
        const userDate = new Date(user.dateCreation).toISOString().split('T')[0];
        return userDate === date;
      }).length;
    });

    const roleCounts: { [key: string]: number } = {};
    this.users.forEach(user => {
      const role = user.role || 'Utilisateur';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const roleColors: { [key: string]: string } = {
      Utilisateur: 'rgba(87, 181, 231, 1)',
      Modérateur: 'rgba(141, 211, 199, 1)',
      Administrateur: 'rgba(251, 191, 114, 1)',
      Invité: 'rgba(252, 141, 98, 1)',
      Admin: 'rgba(87, 181, 231, 1)',
      Partenaire: 'rgba(141, 211, 199, 1)'
    };

    this.userRolesData = Object.keys(roleCounts).map(role => ({
      value: roleCounts[role],
      name: role,
      itemStyle: { color: roleColors[role] || 'rgba(87, 181, 231, 1)' }
    }));

    this.initCharts();
  }

  initCharts() {
    //  Pour le graphique d'activité
    const chartDomActivity = this.userActivityChartElement.nativeElement;
    const existingActivityChart = echarts.getInstanceByDom(chartDomActivity);
    if (existingActivityChart) {
      echarts.dispose(chartDomActivity);
    }
    const userActivityChart = echarts.init(chartDomActivity);
  
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
          data: this.userActivityData.length ? this.userActivityData : [0, 0, 0, 0, 0, 0, 0],
          type: 'line',
          smooth: true,
          symbol: 'none',
          itemStyle: { color: 'rgba(87, 181, 231, 1)' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
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
  
    // Pour le graphique des rôles
    const chartDomRoles = this.userRolesChartElement.nativeElement;
    const existingRolesChart = echarts.getInstanceByDom(chartDomRoles);
    if (existingRolesChart) {
      echarts.dispose(chartDomRoles);
    }
    const userRolesChart = echarts.init(chartDomRoles);
  
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
          data: this.userRolesData.length ? this.userRolesData : [
            { value: 0, name: 'Utilisateurs', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
            { value: 0, name: 'Modérateurs', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
            { value: 0, name: 'Administrateurs', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
            { value: 0, name: 'Invités', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
          ]
        }
      ]
    };
    userRolesChart.setOption(userRolesOption);
  }
  
  resizeCharts() {
    const userActivityChart = echarts.getInstanceByDom(this.userActivityChartElement.nativeElement);
    const userRolesChart = echarts.getInstanceByDom(this.userRolesChartElement.nativeElement);
    if (userActivityChart) userActivityChart.resize();
    if (userRolesChart) userRolesChart.resize();
  }

  onSearch() {
    console.log('Recherche:', this.searchQuery);
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

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `Il y a ${diffInSeconds} secondes`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  deleteActivity(activity: Activity) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer cette activité ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteActivity(activity._id).subscribe({
          next: () => {
            this.recentActivities = this.recentActivities.filter(a => a._id !== activity._id);
            Swal.fire(
              'Supprimé !',
              'L\'activité a été supprimée avec succès.',
              'success'
            );
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de l\'activité:', error);
            Swal.fire(
              'Erreur !',
              'Une erreur s\'est produite lors de la suppression de l\'activité. Veuillez réessayer.',
              'error'
            );
          }
        });
      }
    });
  }

  // Ajout de la méthode logout()
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }
}