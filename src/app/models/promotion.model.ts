export interface Promotion {
    id?: string; // Optionnel car non défini lors de la création
    name: string;
    discount: string;
    startDate: string; // Format YYYY-MM-DD pour le formulaire
    endDate: string; // Format YYYY-MM-DD pour le formulaire
    status?: 'active' | 'expired' | 'pending' | '';
    type?: 'percentage' | 'fixed' | 'freeitem' | 'bundle' | 'special' | '';
    code?: string; // Optionnel
    limit?: number | null; // Optionnel
    description?: string; // Optionnel
    photo: string | string[] | null;
    prixAvant?: number | null; // Ajouté
    prixApres?: number | null; // Ajouté
    conditions: {
      minPurchase: boolean;
      minPurchaseAmount?: number | null;
      newCustomers: boolean;
      specificItems: boolean;
      specificDays: boolean;
      days: { [key: string]: boolean };
    };
    etablissementId: {
      _id: string;
      nom: string;
      type: string;
    };
    establishmentName?: string; // Pour stocker le nom dans la liste (retour API)
    selected?: boolean; // Pour la sélection dans le tableau
  }
  
  export interface Stats {
    total: number;
    active: number;
    expired: number;
    pending: number;
  }