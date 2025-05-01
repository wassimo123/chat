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
    console.log('Token envoyé dans la requête :', token);
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
    return this.http.post<any>(`${this.apiUrl}/users`, body);
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

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword, confirmPassword });
  }

  checkUserExists(email: string): Observable<{ exists: boolean, status?: string }> {
    return this.http.get<{ exists: boolean, status?: string }>(`${this.apiUrl}/users/check-email/${email}`, { headers: this.getHeaders() });
  }

  updateUserStatus(email: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/status/${email}`, { status }, { headers: this.getHeaders() });
  }

// Nouvelle méthode pour supprimer un utilisateur
deleteUser(email: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/users/${email}`, { headers: this.getHeaders() });
}

  // Nouvelle méthode pour récupérer les activités récentes
  getRecentActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities`, { headers: this.getHeaders() });
  }
    // Nouvelle méthode pour supprimer une activité
    deleteActivity(activityId: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/activities/${activityId}`, { headers: this.getHeaders() });
    }
      // Nouvelle méthode pour récupérer les informations de l'utilisateur par email
  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/email/${email}`, { headers: this.getHeaders() });
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData, { headers: this.getHeaders() });
  }



}