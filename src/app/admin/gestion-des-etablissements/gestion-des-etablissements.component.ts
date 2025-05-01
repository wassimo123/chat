import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import { registerables } from "chart.js";
import { EtablissementService } from "../../services/etablissement.service";
import { Etablissement, Stats, Notification, Horaires, JourHoraire, ReseauxSociaux } from "../../models/etablissement.model";
import { UserService } from '../../services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
Chart.register(...registerables);
import { Router } from '@angular/router'; // Ajout de Router

@Component({
  selector: "app-gestion-des-etablissements",
  templateUrl: "./gestion-des-etablissements.component.html",
  styleUrls: ["./gestion-des-etablissements.component.css"],
})
export class GestionDesEtablissementsComponent implements OnInit, AfterViewInit {
  @ViewChild("typeChart") typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("statusChart") statusChartRef!: ElementRef<HTMLCanvasElement>;

  typeChart: Chart | null = null;
  statusChart: Chart | null = null;

  jours: (keyof Omit<Horaires, "is24_7" | "specialHours">)[] = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];

  etablissements: Etablissement[] = [];
  filteredEtablissements: Etablissement[] = [];
  paginatedEtablissements: Etablissement[] = [];
  stats: Stats = { total: 0, restaurants: 0, hotels: 0, commerces: 0 };
  notifications: any[] = [];

  tableSearchQuery = "";
  selectedType = "";
  selectedStatus = "";
  selectedLocation = "";
  showTypeFilter = false;
  showStatusFilter = false;
  showLocationFilter = false;

  sortField = "";
  sortDirection: "asc" | "desc" = "asc";

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  isModalOpen = false;
  modalTitle = "";
  currentEtablissement: Etablissement = this.getDefaultEtablissement();

  isArchiveModalOpen = false;
  etablissementToArchive: Etablissement | null = null;

  selectAll = false;
  isProfileMenuOpen = false;
  notificationCount = 3;
  searchQuery = "";

  showMessageModal = false;
  messageModalType: "success" | "error" = "success";
  messageModalTitle = "";
  messageModalMessage = "";
  selectedAddressForMap: string | null = null;
  showMapPopup: boolean = false;
  
  isAuthenticated: boolean = false; // Ajout de la propriété isAuthenticated
  constructor(private etablissementService: EtablissementService,private userService: UserService,private notificationService: NotificationService,
    private router: Router) {}

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

    this.loadEtablissements();
    this.notificationService.notifications$.subscribe(notifications => {
      console.log('Notifications reçues:', notifications);
      
      // Filtrer les notifications non lues
      let unreadNotifications = notifications.filter(notif => !notif.read);

      // Vérifier l'existence de chaque utilisateur associé à une notification
      const updatedNotifications: any[] = [];
      let checkPromises = unreadNotifications.map(notif => {
        if (!notif.email) {
          // Si la notification n'a pas d'email, on la supprime directement
          return Promise.resolve(null);
        }
        return this.userService.checkUserExists(notif.email).toPromise().then(
          (response) => {
            // Vérifier si la réponse est définie et si l'utilisateur existe
            if (response && response.exists) {
              return notif; // Garder la notification si l'utilisateur existe
            } else {
              console.log(`Utilisateur avec email ${notif.email} n'existe plus, suppression de la notification.`);
              return null; // Ne pas garder la notification si l'utilisateur n'existe plus
            }
          },
          error => {
            console.error(`Erreur lors de la vérification de l'utilisateur ${notif.email}:`, error);
            return null; // En cas d'erreur, supprimer la notification pour éviter des problèmes
          }
        );
      });

      // Résoudre toutes les promesses et mettre à jour les notifications
      Promise.all(checkPromises).then(results => {
        const validNotifications = results.filter(notif => notif !== null);
        this.notifications = validNotifications;
        
        // Mettre à jour les notifications dans le service pour persister les changements
        // Commenté temporairement car updateNotifications n'existe pas encore
        // if (validNotifications.length !== unreadNotifications.length) {
        //   this.notificationService.updateNotifications(validNotifications);
        // }
      });
    });
  }
//ghnjk
  ngAfterViewInit(): void {
    if (this.isAuthenticated) {
      this.initCharts();
    }
  }

  loadEtablissements(): void {
    this.etablissementService.getEtablissements().subscribe({
      next: (etablissements: Etablissement[]) => {
        this.etablissements = etablissements.map((e: Etablissement) => ({
          ...e,
          selected: false,
        }));
        this.filteredEtablissements = this.etablissements.filter(e => e.statut !== "Inactif");
        this.updateStats();
        this.updatePagination();
        this.updateCharts();
      },
      error: (err: any) => {
        this.showNotification("Erreur lors du chargement des établissements: " + err.message, "error");
      },
    });
  }

  initCharts(): void {
    if (this.typeChartRef && this.typeChartRef.nativeElement) {
      const ctx = this.typeChartRef.nativeElement.getContext("2d");
      if (ctx) {
        this.typeChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["Restaurants", "Hôtels", "Commerces", "Autres"],
            datasets: [
              {
                data: [
                  this.stats.restaurants,
                  this.stats.hotels,
                  this.stats.commerces,
                  this.stats.total - this.stats.restaurants - this.stats.hotels - this.stats.commerces,
                ],
                backgroundColor: [
                  "rgba(87, 181, 231, 1)",
                  "rgba(141, 211, 199, 1)",
                  "rgba(251, 191, 114, 1)",
                  "rgba(252, 141, 98, 1)",
                ],
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { padding: 20, font: { size: 12 } },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                titleColor: "#1f2937",
                bodyColor: "#1f2937",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
              },
            },
          },
        });
      }
    }

    if (this.statusChartRef && this.statusChartRef.nativeElement) {
      const ctx = this.statusChartRef.nativeElement.getContext("2d");
      if (ctx) {
        const statusCounts = [
          this.etablissements.filter((e) => e.statut === "Actif").length,
          this.etablissements.filter((e) => e.statut === "En attente").length,
          this.etablissements.filter((e) => e.statut === "Inactif").length,
        ];

        this.statusChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Actif", "En attente", "Inactif"],
            datasets: [
              {
                data: statusCounts,
                backgroundColor: ["rgba(87, 181, 231, 1)", "rgba(251, 191, 114, 1)", "rgba(252, 141, 98, 1)"],
                borderRadius: 8,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                titleColor: "#1f2937",
                bodyColor: "#1f2937",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
              },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: "#e5e7eb" }, ticks: { color: "#1f2937" } },
              x: { grid: { display: false }, ticks: { color: "#1f2937" } },
            },
          },
        });
      }
    }
  }

  updateStats(): void {
    this.stats.total = this.etablissements.length;
    this.stats.restaurants = this.etablissements.filter((e) => e.type === "Restaurant").length;
    this.stats.hotels = this.etablissements.filter((e) => e.type === "Hôtel").length;
    this.stats.commerces = this.etablissements.filter((e) => e.type === "Café").length;
  }

  filterEtablissements(): void {
    this.filteredEtablissements = this.etablissements.filter((e) => {
      const matchesSearch =
        e.nom.toLowerCase().includes(this.tableSearchQuery.toLowerCase()) ||
        e.adresse.toLowerCase().includes(this.tableSearchQuery.toLowerCase());
      const matchesType = !this.selectedType || e.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || e.statut === this.selectedStatus;
      const matchesLocation = !this.selectedLocation || e.adresse.includes(this.selectedLocation);
      const isNotInactive = e.statut !== "Inactif";
      return matchesSearch && matchesType && matchesStatus && matchesLocation && isNotInactive;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.updateCharts();
  }

  updateCharts(): void {
    if (this.typeChart && this.statusChart) {
      this.updateStats();
      this.typeChart.data.datasets[0].data = [
        this.stats.restaurants,
        this.stats.hotels,
        this.stats.commerces,
        this.stats.total - this.stats.restaurants - this.stats.hotels - this.stats.commerces,
      ];
      this.typeChart.update();

      const statusCounts = [
        this.etablissements.filter((e) => e.statut === "Actif").length,
        this.etablissements.filter((e) => e.statut === "En attente").length,
        this.etablissements.filter((e) => e.statut === "Inactif").length,
      ];
      this.statusChart.data.datasets[0].data = statusCounts;
      this.statusChart.update();
    }
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
    }

    this.filteredEtablissements.sort((a, b) => {
      const valueA = a[field as keyof Etablissement] as string;
      const valueB = b[field as keyof Etablissement] as string;
      return this.sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEtablissements.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEtablissements = this.filteredEtablissements.slice(start, end);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredEtablissements.length);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  toggleTypeFilter(): void {
    this.showTypeFilter = !this.showTypeFilter;
    this.showStatusFilter = false;
    this.showLocationFilter = false;
  }

  toggleStatusFilter(): void {
    this.showStatusFilter = !this.showStatusFilter;
    this.showTypeFilter = false;
    this.showLocationFilter = false;
  }

  toggleLocationFilter(): void {
    this.showLocationFilter = !this.showLocationFilter;
    this.showTypeFilter = false;
    this.showStatusFilter = false;
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.showTypeFilter = false;
    this.filterEtablissements();
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.filterEtablissements();
  }

  selectLocation(location: string): void {
    this.selectedLocation = location;
    this.showLocationFilter = false;
    this.filterEtablissements();
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.paginatedEtablissements.forEach((e) => (e.selected = this.selectAll));
  }

  toggleSelection(etablissement: Etablissement): void {
    etablissement.selected = !etablissement.selected;
    this.selectAll = this.paginatedEtablissements.every((e) => e.selected);
  }

  getDefaultEtablissement(): Etablissement {
    return {
      id: "",
      nom: "",
      adresse: "",
      type: "",
      statut: "Actif",
      visibility: "public",
      showMap: false,
      telephone: "",
      email: "",
      siteWeb: "",
      reseauxSociaux: { facebook: "", instagram: "", twitter: "", linkedin: "" },
      description: "",
      services: [],
      horaires: this.getDefaultHoraires(),
      photos: [],
    };
  }

  getDefaultHoraires(): Horaires {
    return {
      lundi: { open: "", close: "", closed: false },
      mardi: { open: "", close: "", closed: false },
      mercredi: { open: "", close: "", closed: false },
      jeudi: { open: "", close: "", closed: false },
      vendredi: { open: "", close: "", closed: false },
      samedi: { open: "", close: "", closed: false },
      dimanche: { open: "", close: "", closed: false },
      is24_7: false,
      specialHours: "",
    };
  }

  openAddEtablissementModal(): void {
    this.modalTitle = "Ajouter un établissement";
    this.currentEtablissement = {
      ...this.getDefaultEtablissement(),
    };
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    });
  }

  editEtablissement(etablissement: Etablissement): void {
    this.modalTitle = "Modifier un établissement";
    this.currentEtablissement = {
      ...etablissement,
      reseauxSociaux: etablissement.reseauxSociaux || { facebook: "", instagram: "", twitter: "", linkedin: "" },
      description: etablissement.description || "",
      services: etablissement.services || [],
      horaires: etablissement.horaires || this.getDefaultHoraires(),
      photos: etablissement.photos || [],
    };
    this.isModalOpen = true;
  }

  saveEtablissement(): void {
    if (!this.currentEtablissement.nom || !this.currentEtablissement.type || !this.currentEtablissement.statut || !this.currentEtablissement.adresse) {
      this.showNotification("Veuillez remplir tous les champs obligatoires (Nom, Type, Statut, Adresse).", "error");
      return;
    }

    if (this.modalTitle === "Ajouter un établissement") {
      this.etablissementService.addEtablissement(this.currentEtablissement).subscribe({
        next: (response: Etablissement) => {
          const newEtablissement: Etablissement = { ...response, selected: false };
          console.log("newEtablissement:",newEtablissement);
          this.etablissements.push(newEtablissement);
          this.closeModal();
          this.updateStats();
          this.filterEtablissements();
          this.showNotification("Établissement ajouté avec succès !", "success");
        },
        error: (err: any) => {
          this.showNotification("Erreur lors de l’ajout: " + err.message, "error");
        },
      });
    } else if (this.currentEtablissement.id) {
      this.etablissementService.updateEtablissement(this.currentEtablissement.id, this.currentEtablissement).subscribe({
        next: (response: Etablissement) => {
          const updatedEtablissement: Etablissement = { ...response, selected: false };
          const index = this.etablissements.findIndex((e) => e.id === updatedEtablissement.id);
          if (index !== -1) this.etablissements[index] = updatedEtablissement;
          this.closeModal();
          this.updateStats();
          this.filterEtablissements();
          this.showNotification("Établissement modifié avec succès !", "success");
        },
        error: (err: any) => {
          this.showNotification("Erreur lors de la mise à jour: " + err.message, "error");
        },
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openArchiveModal(etablissement: Etablissement): void {
    this.etablissementToArchive = etablissement;
    this.isArchiveModalOpen = true;
  }

  closeArchiveModal(): void {
    this.isArchiveModalOpen = false;
    this.etablissementToArchive = null;
  }

  archiveEtablissement(): void {
    if (this.etablissementToArchive && this.etablissementToArchive.id) {
      this.etablissementService.archiverEtablissement(this.etablissementToArchive.id).subscribe({
        next: (response: Etablissement) => {
          const index = this.etablissements.findIndex(e => e.id === response.id);
          if (index !== -1) {
            this.etablissements[index].statut = "Inactif";
          }
          this.closeArchiveModal();
          this.updateStats();
          this.filterEtablissements();
          this.showNotification("Établissement archivé avec succès !", "success");
        },
        error: (err: any) => {
          this.showNotification("Erreur lors de l’archivage: " + err.message, "error");
        },
      });
    }
  }

  viewEtablissement1(etablissement: Etablissement): void {
    console.log("Voir établissement:", etablissement);
  }

  
  viewEtablissement(etablissement: Etablissement): void {
    this.selectedAddressForMap = `${etablissement.adresse}, ${etablissement.ville ?? ''}, ${etablissement.codePostal ?? ''}, ${etablissement.pays ?? ''}`;
    this.showMapPopup = true;
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onSearch(): void {
    this.tableSearchQuery = this.searchQuery;
    this.currentPage = 1;
    this.filterEtablissements();
  }
  // onSearch(): void {
  //   this.router.navigate(["/etablissements"], { queryParams: { search: this.searchQuery } });
  // }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.router.navigate(['/connexion']);
  }
  
  toggleService(service: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.currentEtablissement.services.includes(service)) {
        this.currentEtablissement.services.push(service);
      }
    } else {
      this.currentEtablissement.services = this.currentEtablissement.services.filter((s) => s !== service);
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          this.currentEtablissement.photos.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(photo: string): void {
    this.currentEtablissement.photos = this.currentEtablissement.photos.filter((p) => p !== photo);
  }

  showNotification(message: string, type: "success" | "error"): void {
    this.messageModalType = type;
    this.messageModalTitle = type === "success" ? "Succès" : "Erreur";
    this.messageModalMessage = message;
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case "Restaurant":
        return "bg-green-100";
      case "Hôtel":
        return "bg-blue-100";
      case "Commerce":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  }

  getTypeIconClass(type: string): string {
    switch (type) {
      case "Restaurant":
        return "text-green-500";
      case "Hôtel":
        return "text-blue-500";
      case "Commerce":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case "Restaurant":
        return "ri-restaurant-line";
      case "Hôtel":
        return "ri-hotel-line";
      case "Commerce":
        return "ri-store-line";
      default:
        return "ri-building-line";
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case "Restaurant":
        return "bg-green-100 text-green-800";
      case "Hôtel":
        return "bg-blue-100 text-blue-800";
      case "Commerce":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case "Actif":
        return "bg-green-100 text-green-800";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Inactif":
        return "bg-red-100 text-red-800";
      case "Archivé":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
  
      // Initialize the photos array if it's not set
      if (!this.currentEtablissement.photos) {
        this.currentEtablissement.photos = [];
      }
  
      // Append selected files to the photos array
      this.currentEtablissement.photos.push(...files);
    }
  }
  
  resolvePhotoUrl(photo: string | File): string {
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return photo;
  }
  
  deletePhoto(photo: string | File): void {
    // Only proceed if it's a File
    if (photo instanceof File) {
      const index = this.currentEtablissement.photos.indexOf(photo);
      if (index !== -1) {
        // Revoke the object URL if it's a file
        URL.revokeObjectURL(this.resolvePhotoUrl(photo));
        // Remove the photo from the array
        this.currentEtablissement.photos.splice(index, 1);
      }
    }
  }
  
  
  ngOnDestroy() {
    if (this.currentEtablissement.photos) {
      this.currentEtablissement.photos.forEach(photo => {
        if (photo instanceof File) {
          URL.revokeObjectURL(this.resolvePhotoUrl(photo));
        }
      });
    }
  }
  
  
}