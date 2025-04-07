import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Ajouter le token dans l'en-tête
    });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  acceptTerms(): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept-terms`, {}, { headers: this.getHeaders() });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  createUsers(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, body);
  }

  updateUser(matricule: string, body: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/matricule/${matricule}`, body);
  }

  archiveUser(matricule: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/matricule/${matricule}`, {});
  }
}