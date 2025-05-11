// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Establishment } from '../models/partenaire.model';

// export interface Publicite {
//   id: number;
//   partenaireId: number;
//   nom: string;
//   adresse: string;
//   type: string;
//   pack: string;
//   statut: string;
//   visibility: string;
//   informations: {
//     description?: string;
//     services?: string[];
//     socialMedia?: {
//       facebook?: string;
//       instagram?: string;
//       twitter?: string;
//       linkedin?: string;
//     };
//     horaires?: {
//       is24_7?: boolean;
//       specialHours?: string;
//       lundi?: { open: string; close: string; closed: boolean };
//       mardi?: { open: string; close: string; closed: boolean };
//       mercredi?: { open: string; close: string; closed: boolean };
//       jeudi?: { open: string; close: string; closed: boolean };
//       vendredi?: { open: string; close: string; closed: boolean };
//       samedi?: { open: string; close: string; closed: boolean };
//       dimanche?: { open: string; close: string; closed: boolean };
//     };
//     telephone?: string;
//     email?: string;
//     siteWeb?: string;
//     ville?: string;
//     pays?: string;
//     codePostal?: string;
//     showMap?: boolean;
//     photos?: string[];
//   };
// }

// @Injectable({ providedIn: 'root' })
// export class PubliciteService {
//   private apiUrl = 'http://localhost:5000/api/publicites';

//   constructor(private http: HttpClient) {}

//   submitPublicite(data: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}`, data);
//   }

//   getAllPublicites(): Observable<Publicite[]> {
//     return this.http.get<Publicite[]>(`${this.apiUrl}`);
//   }

//   getPubliciteById(id: number): Observable<Publicite> {
//     return this.http.get<Publicite>(`${this.apiUrl}/${id}`);
//   }

//   updateStatut(id: number, statut: string): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${id}/statut`, { statut });
//   }

//   deletePublicite(id: number): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/adminRefuser/${id}`);
//   }

//   validatePublicite(id: number): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/adminValider/${id}`);
//   }
// }
/*
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Establishment } from '../models/partenaire.model';

export interface Publicite {
  id: number;
  partenaireId: number;
  nom: string;
  adresse: string;
  type: string;
  pack: string;
  statut: string;
  visibility: string;
  informations: {
    description?: string;
    services?: string[];
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
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
    telephone?: string;
    email?: string;
    siteWeb?: string;
    ville?: string;
    pays?: string;
    codePostal?: string;
    showMap?: boolean;
    photos?: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class PubliciteService {
  private apiUrl = 'http://localhost:5000/api/publicites';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  submitPublicite(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, { headers: this.getAuthHeaders() });
  }

  getAllPublicites(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getPubliciteById(id: number): Observable<Publicite> {
    return this.http.get<Publicite>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  updateStatut(id: number, statut: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/statut`, { statut }, { headers: this.getAuthHeaders() });
  }

  deletePublicite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/adminRefuser/${id}`, { headers: this.getAuthHeaders() });
  }

  validatePublicite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/adminValider/${id}`, { headers: this.getAuthHeaders() });
  }
}*/

//////////////bedel houni
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PubliciteService {

  private apiUrl = 'http://localhost:5000/api';  // Base URL for the API

  constructor(private http: HttpClient) { }

  // Method to get all publicités
  getAllPublicites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/publicites`);
  }
  
  deletePublicite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/publicites/adminRefuser/${id}`);
  }
  validatePublicite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/publicites/adminValider/${id}`);
  }
}
