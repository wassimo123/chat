import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Promotion {
  _id?: string;
  id?: string;
  name: string;
  establishmentId: string; // Changed to string to match backend
  establishmentName: string; // Changed to string to match backend
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la requête.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erreur réseau : impossible de se connecter au serveur.';
    }
    return throwError(() => new Error(errorMessage));
  }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addPromotion(promotion: Promotion, photos: File[]): Observable<Promotion> {
    const formData = new FormData();
    formData.append('name', promotion.name);
    formData.append('establishmentId', promotion.establishmentId);
    formData.append('discount', promotion.discount);
    formData.append('startDate', promotion.startDate);
    formData.append('endDate', promotion.endDate);
    formData.append('status', promotion.status);
    formData.append('type', promotion.type || '');
    formData.append('code', promotion.code || '');
    formData.append('limit', promotion.limit?.toString() || '');
    formData.append('description', promotion.description || '');
    formData.append('conditions', JSON.stringify(promotion.conditions));

    for (let photo of photos) {
      formData.append('photos', photo);
    }

    return this.http.post<Promotion>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  updatePromotion(id: string, promotion: Promotion, photos: File[]): Observable<Promotion> {
    const formData = new FormData();
    formData.append('name', promotion.name);
    formData.append('establishmentId', promotion.establishmentId);
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

    for (let photo of photos) {
      formData.append('photos', photo);
    }

    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  archivePromotion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/archive`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getEtablissementsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.typeEtabUrl}/type/${type}`).pipe(
      catchError(this.handleError)
    );
  }
}