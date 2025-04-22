import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Promotion {
  _id?: string;
  id?: string;
  name: string;
  establishmentId: number;
  discount: string;
  startDate: string;
  endDate: string;
  status: string;
  type?: string;
  code?: string;
  limit?: number;
  description?: string;
  photos?: string[];
  conditions: {
    minPurchase: boolean;
    minPurchaseAmount?: number;
    newCustomers: boolean;
    specificItems: boolean;
    specificDays: boolean;
    days: { [key: string]: boolean };
  };
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = 'http://localhost:5000/api/promotions';
  private typeEtabUrl = 'http://localhost:5000/api/etablissements';

  constructor(private http: HttpClient) { }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la requête.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erreur réseau : impossible de se connecter au serveur.';
    }
    return throwError(() => new Error(errorMessage));
  }

  // Obtenir toutes les promotions
  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Obtenir une promotion par ID
  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Ajouter une nouvelle promotion
  addPromotion(promotion: Promotion, photos: File[]): Observable<Promotion> {
    const formData = new FormData();
    console.log('promo: ',promotion);
    formData.append('name', promotion.name);
    formData.append('establishmentId', promotion.establishmentId.toString());
    formData.append('discount', promotion.discount);
    formData.append('startDate', promotion.startDate);
    formData.append('endDate', promotion.endDate);
    formData.append('status', promotion.status);
    formData.append('type', promotion.type || '');
    formData.append('code', promotion.code || '');
    formData.append('limit', promotion.limit?.toString() || '');
    formData.append('description', promotion.description || '');
    formData.append('conditions', JSON.stringify(promotion.conditions));

    // Ajouter les photos
    for (let photo of photos) {
      formData.append('photos', photo);
    }

    return this.http.post<Promotion>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour une promotion
  updatePromotion(id: string, promotion: Promotion, photos: File[]): Observable<Promotion> {
    const formData = new FormData();
    formData.append('name', promotion.name);
    formData.append('establishmentId', promotion.establishmentId.toString());
    formData.append('discount', promotion.discount);
    formData.append('startDate', promotion.startDate);
    formData.append('endDate', promotion.endDate);
    formData.append('status', promotion.status);
    formData.append('type', promotion.type || '');
    formData.append('code', promotion.code || '');
    formData.append('limit', promotion.limit?.toString() || '');
    formData.append('description', promotion.description || '');
    formData.append('conditions', JSON.stringify(promotion.conditions));
    formData.append('existingPhotos', JSON.stringify(promotion.photos || []));

    // Ajouter les nouvelles photos
    for (let photo of photos) {
      formData.append('photos', photo);
    }

    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Archiver une promotion (changer le statut à "expired")
  archivePromotion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/archive`, {}).pipe(
      catchError(this.handleError)
    );
  }


  getEtablissementsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeEtabUrl}/type/${type}`);
  }
  
}