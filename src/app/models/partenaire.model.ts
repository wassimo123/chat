export interface Establishment {
  id?: string;
  name: string;
  category: string;
  statut: string;
  visibility: string;
  address: string;
  postalCode?: string;
  city?: string;
  country?: string;
  showMap?: boolean;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  services?: string[];
  horaires?: {
    is24_7?: boolean;
    specialHours?: string;
    lundi?: { open: string; close: string; closed: boolean };
    mardi?: { open: string; close: string; closed: boolean };
    mercredi?: { open: string; close: string; closed: boolean };
    jeudi?: { open: string; close: string; closed: boolean };
    vendredi?: { open: string; close: string; closed: boolean };
    samedi?: { open: string; close: string; closed: boolean };
    dimanche?: { open: string; close: string; closed: boolean };
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  photos?: File[];
  clientName?: string;
  clientEmail?: string;
}

export interface Promotion {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  reduction: number;
  conditions?: string;
  image?: File | null;
}

export interface Event {
  id?: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  ville: string;
  capacite: number;
  categorie: string;
  organisateur?: string;
  description?: string;
  estPublic: boolean;
  statut: string;
  typeEtablissement: string;
  establishmentId: string;
  photo?: string;
  prix: {
    estGratuit: boolean;
    montant: number;
  };
  visibility?: string;
}

export interface Payment {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  pack: string;
  amount: number;
}