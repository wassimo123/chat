import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import { registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

interface ReseauxSociaux {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

interface JourHoraire {
    open: string;
    close: string;
    closed: boolean;
  }

  interface Horaires {
    lundi: JourHoraire;
    mardi: JourHoraire;
    mercredi: JourHoraire;
    jeudi: JourHoraire;
    vendredi: JourHoraire;
    samedi: JourHoraire;
    dimanche: JourHoraire;
    is24_7: boolean;
    specialHours?: string;
  }

  interface Etablissement {
    id?: string;
    nom: string;
    adresse: string;
    type: string;
    statut: string;
    visibility: "public" | "private";
    codePostal?: string;
    ville?: string;
    pays?: string;
    showMap: boolean;
    telephone: string;
    email: string;
    siteWeb: string;
    reseauxSociaux: ReseauxSociaux;
    description: string;
    services: string[];
    horaires: Horaires;
    photos: string[];
    selected?: boolean;
  }

interface Stats {
  total: number;
  restaurants: number;
  hotels: number;
  commerces: number;
}

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

  // Tableau des jours typé correctement
  jours: (keyof Omit<Horaires, 'is24_7' | 'specialHours'>)[] = [
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
  ];

  etablissements: Etablissement[] = [
    {
      id: "#EST-001",
      nom: "Le Gourmet Parisien",
      adresse: "24 Rue de la Paix, 75002 Paris",
      type: "Restaurant",
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
      selected: false,
    },
    {
      id: "#EST-002",
      nom: "Hôtel Riviera",
      adresse: "15 Avenue de la Méditerranée, 06000 Nice",
      type: "Hôtel",
      statut: "Actif",
      visibility: "public",
      showMap: false,
      telephone: "",
      email: "",
      siteWeb: "",
      reseauxSociaux: { facebook: "", instagram: "", twitter: "", linkedin: "" },
      description: "",
      services: [],
      horaires: this.getDefaultHoraires(), // Correction de "horarios" en "horaires"
      photos: [],
      selected: false,
    },
    {
      id: "#EST-003",
      nom: "Boutique Élégance",
      adresse: "45 Rue du Commerce, 69002 Lyon",
      type: "Commerce",
      statut: "En attente",
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
      selected: false,
    },
    {
      id: "#EST-004",
      nom: "Bistro Marseillais",
      adresse: "12 Quai du Port, 13002 Marseille",
      type: "Restaurant",
      statut: "Suspendu",
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
      selected: false,
    },
    {
      id: "#EST-005",
      nom: "Château Bordeaux",
      adresse: "8 Route des Vignes, 33000 Bordeaux",
      type: "Hôtel",
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
      selected: false,
    },
  ];

  filteredEtablissements: Etablissement[] = [];
  paginatedEtablissements: Etablissement[] = [];
  stats: Stats = { total: 0, restaurants: 0, hotels: 0, commerces: 0 };

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

  isDeleteModalOpen = false;
  etablissementToDelete: Etablissement | null = null;

  selectAll = false;
  isProfileMenuOpen = false;
  notificationCount = 3;
  searchQuery = "";

  constructor() {}

  ngOnInit(): void {
    this.filteredEtablissements = [...this.etablissements];
    this.updateStats();
    this.updatePagination();
  }

  ngAfterViewInit(): void {
    this.initCharts();
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
          this.etablissements.filter((e) => e.statut === "Suspendu").length,
        ];

        this.statusChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Actif", "En attente", "Suspendu"],
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
    this.stats.commerces = this.etablissements.filter((e) => e.type === "Commerce").length;
  }

  filterEtablissements(): void {
    this.filteredEtablissements = this.etablissements.filter((e) => {
      const matchesSearch =
        e.nom.toLowerCase().includes(this.tableSearchQuery.toLowerCase()) ||
        e.adresse.toLowerCase().includes(this.tableSearchQuery.toLowerCase());
      const matchesType = !this.selectedType || e.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || e.statut === this.selectedStatus;
      const matchesLocation = !this.selectedLocation || e.adresse.includes(this.selectedLocation);
      return matchesSearch && matchesType && matchesStatus && matchesLocation;
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
        this.etablissements.filter((e) => e.statut === "Suspendu").length,
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

  resetFilters(): void {
    this.tableSearchQuery = "";
    this.selectedType = "";
    this.selectedStatus = "";
    this.selectedLocation = "";
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
      statut: "",
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
    };
  }

  openAddEtablissementModal(): void {
    this.modalTitle = "Ajouter un établissement";
    this.currentEtablissement = {
      ...this.getDefaultEtablissement(),
      id: `#EST-${this.etablissements.length + 1}`,
    };
    this.isModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
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
    if (this.modalTitle === "Ajouter un établissement") {
      this.etablissements.push({ ...this.currentEtablissement });
    } else {
      const index = this.etablissements.findIndex((e) => e.id === this.currentEtablissement.id);
      if (index !== -1) {
        this.etablissements[index] = { ...this.currentEtablissement };
      }
    }
    this.closeModal();
    this.updateStats();
    this.filterEtablissements();
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openDeleteModal(etablissement: Etablissement): void {
    this.etablissementToDelete = etablissement;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.etablissementToDelete = null;
  }

  deleteEtablissement(): void {
    if (this.etablissementToDelete) {
      this.etablissements = this.etablissements.filter((e) => e.id !== this.etablissementToDelete!.id);
      this.closeDeleteModal();
      this.updateStats();
      this.filterEtablissements();
    }
  }

  viewEtablissement(etablissement: Etablissement): void {
    console.log("Voir établissement:", etablissement);
  }

  downloadList(): void {
    console.log("Télécharger la liste");
  }

  printList(): void {
    window.print();
  }

  toggleProfile(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onSearch(): void {
    console.log("Recherche:", this.searchQuery);
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
      case "Suspendu":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
}