import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:5000/api/search';
  private suggestionsUrl = 'http://localhost:5000/api/suggestions';

  constructor(private http: HttpClient) {}

  search(query: string, page: number = 1, limit: number = 9, type: string = 'all', sort: string = 'relevance'): Observable<any> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      type,
      sort
    });
    return this.http.get<any>(`${this.apiUrl}?${params.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  getSuggestions(query: string): Observable<any> {
    const params = new URLSearchParams({ q: query });
    return this.http.get<any>(`${this.suggestionsUrl}?${params.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la recherche.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erreur réseau : impossible de se connecter au serveur.';
    }
    console.error('Erreur dans SearchService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}