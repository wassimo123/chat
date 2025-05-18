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
  photos?: (string | File)[];
  clientName?: string;
  clientEmail?: string;
}

