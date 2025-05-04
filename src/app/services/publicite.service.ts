// services/publicite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Publicite {
  _id: string;
  nom: string;
  adresse: string;
  type: string;
  pack: string;
  statut: string;
  partenaireId: { email: string; nom?: string };
  informations: any;
}

@Injectable({ providedIn: 'root' })
export class PubliciteService {
  private apiUrl = 'http://localhost:5000/api/publicites';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les publicités
   */
  getPublicites(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(this.apiUrl);
  }

  /**
   * Récupère uniquement les publicités en attente de validation (côté admin)
   */
  getPublicitesEnAttente(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(`${this.apiUrl}?statut=En attente`);
  }

  /**
   * Envoie une nouvelle demande de publicité (côté partenaire)
   */
  submitPublicite(data: any): Observable<any> {
    console.log("data: ",data);
    return this.http.post(`${this.apiUrl}`, data);
  }

  /**
   * Valide une publicité (admin)
   */
  valider(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/valider/${id}`, {});
  }

  /**
   * Refuse une publicité (admin)
   */
  refuser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/refuser/${id}`, {});
  }
}