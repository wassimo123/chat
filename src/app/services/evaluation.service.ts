import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces pour typer les données
interface Avis {
  utilisateur?: string;
  note: number;
  commentaire: string;
}

interface Evaluation {
  score: number;
  nombreVotes: number;
  avis: Avis[];
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private baseUrl = 'http://localhost:5000/api'; // URL de base

  constructor(private http: HttpClient) {}

  // Ajouter un nouvel avis
  addAvis(avis: Avis): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.baseUrl}/avis`, avis).pipe(
      catchError(this.handleError)
    );
  }

  // Gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.error || `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  getEvaluation(): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.baseUrl}/avis`).pipe(
      catchError(this.handleError)
    );
  }
  
}