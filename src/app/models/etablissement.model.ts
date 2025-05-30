export interface ReseauxSociaux {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  }
  
  export interface JourHoraire {
    open: string;
    close: string;
    closed: boolean;
  }
  
  export interface Horaires {
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
  
  export interface Etablissement {
    id?: string;
    nom: string;
    adresse: string;
    type: string;
    statut: string;
    visibility: "public" ;
    codePostal?: string;
    ville?: string;
    pays?: string;
    showMap: boolean;
    telephone: string;
    coordinates:string;
    email: string;
    siteWeb: string;
    reseauxSociaux: ReseauxSociaux;
    description: string;
    services: string[];
    horaires: Horaires;
    photos: (string | File)[];
    selected?: boolean;
    createdAt?: string | Date; // Ajouté pour refléter les données MongoDB
  updatedAt?: string | Date; // Champ principal pour le tri
    
    
  }
  
  export interface Stats {
    total: number;
    restaurants: number;
    hotels: number;
    commerces: number;
  }
  
  export interface Notification {
    title: string;
    message: string;
    type: "success" | "error";
    visible: boolean;
  }