export interface Evenement {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  ville: string;
  capacite: number;
  categorie: string;
  organisateur: string;
  description: string;
  estPublic: boolean;
  statut: '' | 'À venir' | 'En cours' | 'Terminé';
  typeEtablissement: '' | 'Restaurant' | 'Hôtel' | 'Café' | 'Sfax';
  etablissementId: {
    _id: string;
    nom: string;
    type: string;
  };
  selected?: boolean;
  photo: string;
  prix: {
    estGratuit: boolean;
    montant: number;
  };
}

export interface Stats {
  total: number;
  upcoming: number;
  inProgress: number;   
  completed: number;  
}

