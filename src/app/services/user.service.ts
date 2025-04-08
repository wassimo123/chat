// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token envoyé dans la requête /accept-terms :', token);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
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
    const { confirmPassword, ...userData } = body;
    return this.http.post<any>(`${this.apiUrl}/users`, userData);
  }

  updateUser(matricule: string, body: any): Observable<any> {
    const { confirmPassword, ...userData } = body;
    return this.http.put<any>(`${this.apiUrl}/users/matricule/${matricule}`, userData, {
      headers: this.getHeaders(),
    });
  }

  archiveUser(matricule: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/matricule/${matricule}`, {});
  }

  // Nouvelle méthode pour demander un lien de réinitialisation
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // Nouvelle méthode pour réinitialiser le mot de passe
  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword, confirmPassword });
  }
}