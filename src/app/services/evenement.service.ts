import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Evenement } from '../models/evenement.model';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private apiUrl = 'http://localhost:5000/api/evenements';
  private typeEtabUrl = 'http://localhost:5000/api/etablissements';

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

  getEvenements(): Observable<Evenement[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(events =>
        events.map(event => ({
          ...event,
          id: event._id,
          date: event.date ? new Date(event.date).toISOString().split('T')[0] : '' // Ensure date is in YYYY-MM-DD format
        }))
      ),
      catchError(this.handleError)
    );
  }

  addEvenement(data: FormData): Observable<Evenement> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      map(response => ({
        ...response,
        id: response._id,
        date: response.date ? new Date(response.date).toISOString().split('T')[0] : ''
      })),
      catchError(this.handleError)
    );
  }

  updateEvenement(id: string, data: FormData): Observable<Evenement> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      map(response => ({
        ...response,
        id: response._id,
        date: response.date ? new Date(response.date).toISOString().split('T')[0] : ''
      })),
      catchError(this.handleError)
    );
  }

  archiveEvenement(id: string): Observable<Evenement> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/archive`, {}).pipe(
      map(response => {
        
        return {
          ...response,
          id: response._id,
          date: response.date ? new Date(response.date).toISOString().split('T')[0] : ''
        };
      }),
      catchError((error: HttpErrorResponse) => {
       
        return this.handleError(error);
      })
    );
  }

  getEtablissementsByType(type: string): Observable<{ _id: string; nom: string }[]> {
    return this.http.get<{ _id: string; nom: string }[]>(`${this.typeEtabUrl}/type/${type}`).pipe(
      catchError(this.handleError)
    );
  }
}