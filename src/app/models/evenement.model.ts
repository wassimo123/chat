export interface Evenement {
  id: string;
  nom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  ville: string;
  capacite: number;
  participants: number;
  categorie: string;
  organisateur: string;
  description: string;
  estPublic: boolean;
  statut: 'À venir' | 'En cours' | 'Terminé';
  typeEtablissement: 'Restaurant' | 'Hôtel' | 'Café'| 'Sfax'; // Updated property
  selected?: boolean;
}

export interface Stats {
  total: number;
  upcoming: number;
  participants: number;
  participationRate: number;
}
