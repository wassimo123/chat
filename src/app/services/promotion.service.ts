import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Promotion } from '../models/promotion.model';

// Define Etablissement interface for type safety
export interface Etablissement {
  _id: string;
  nom: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private apiUrl = 'http://localhost:5000/api/promotions';
  private etabUrl = 'http://localhost:5000/api/etablissements';

  constructor(private http: HttpClient) {}

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
    return this.http.get<Promotion[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  addPromotion(promotion: Promotion, photo?: File): Observable<Promotion> {
    const formData = new FormData();
    formData.append('name', promotion.name);
    formData.append('etablissementId', promotion.etablissementId._id);
    formData.append('discount', promotion.discount);
    formData.append('startDate', new Date(promotion.startDate).toISOString());
    formData.append('endDate', new Date(promotion.endDate).toISOString());
    formData.append('status', promotion.status || ''); // Handle empty string
    formData.append('type', promotion.type || ''); // Handle empty string
    formData.append('code', promotion.code || '');
    formData.append('limit', promotion.limit?.toString() || '');
    formData.append('description', promotion.description || '');
    formData.append('prixAvant', promotion.prixAvant?.toString() || '');
    formData.append('prixApres', promotion.prixApres?.toString() || '');
    formData.append('conditions', JSON.stringify(promotion.conditions));

    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<Promotion>(this.apiUrl, formData).pipe(catchError(this.handleError));
  }

updatePromotion(id: string, promotion: Promotion, photos?: File[]): Observable<Promotion> {
  const formData = new FormData();
  formData.append('name', promotion.name);
  formData.append('etablissementId', promotion.etablissementId._id);
  formData.append('discount', promotion.discount);
  formData.append('startDate', new Date(promotion.startDate).toISOString());
  formData.append('endDate', new Date(promotion.endDate).toISOString());
  formData.append('status', promotion.status || '');
  formData.append('type', promotion.type || '');
  formData.append('code', promotion.code || '');
  formData.append('limit', promotion.limit?.toString() || '');
  formData.append('description', promotion.description || '');
  formData.append('prixAvant', promotion.prixAvant?.toString() || '');
  formData.append('prixApres', promotion.prixApres?.toString() || '');
  formData.append('conditions', JSON.stringify(promotion.conditions));
//saghari
if (photos && photos.length > 0) {
  formData.append('photo', photos[0]); // ✅ NOM EXACTEMENT: 'photo'
}


  return this.http.put<Promotion>(`${this.apiUrl}/${id}`, formData).pipe(catchError(this.handleError));
}
  archivePromotion(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/archive`, {}).pipe(catchError(this.handleError));
  }

  getEtablissements(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.etabUrl).pipe(catchError(this.handleError));
  }

  getEtablissementsByType(type: string): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(`${this.etabUrl}?type=${encodeURIComponent(type)}`).pipe(
      map((etabs) => etabs.filter((e) => e.type.toLowerCase() === type.toLowerCase())),
      catchError(this.handleError)
    );
  }
}