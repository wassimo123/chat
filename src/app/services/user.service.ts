import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service'; //  

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient,
    private notificationService: NotificationService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token envoyé dans la requête :', token);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
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

  // createUsers(body: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/users`, body);
  // }
//   createUsers(body: any): Observable<any> {
//   const headers = this.getHeaders();
//   console.log('Payload envoyé (FULL PAYLOAD):', JSON.stringify(body, null, 2));
//   return this.http.post<any>(`${this.apiUrl}/users`, body, { headers }).pipe(
//     catchError((error: HttpErrorResponse) => {
//       console.error('Erreur HTTP:', JSON.stringify(error, null, 2));
//       let errorMessage = error.error?.message || 'Erreur lors de la création de l\'utilisateur.';
//       return throwError(() => new Error(errorMessage));
//     })
//   );
// }
createUsers(body: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('Payload envoyé (FULL PAYLOAD):', JSON.stringify(body, null, 2));
    return this.http.post<any>(`${this.apiUrl}/users`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur HTTP:', JSON.stringify(error, null, 2));
        return throwError(() => error); // Rethrow the original HttpErrorResponse
      })
    );
  }
  checkMatriculeExists(matricule: string): Observable<{ exists: boolean; status?: string } | null> {
  const headers = this.getHeaders();
  return this.http.get<{ exists: boolean; status?: string } | null>(
    `${this.apiUrl}/check-matricule?matricule=${encodeURIComponent(matricule.trim())}`,
    { headers }
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur lors de la vérification du matricule:', JSON.stringify(error, null, 2));
      return throwError(() => error);
    })
  );
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

  // checkUserExists(email: string): Observable<{ exists: boolean, status?: string }> {
  //   return this.http.get<{ exists: boolean, status?: string }>(`${this.apiUrl}/users/check-email/${email}`, { headers: this.getHeaders() });
  // }
  checkUserExists(email: string): Observable<{ exists: boolean; status?: string } | null> {
    return this.http
      .get<{ exists: boolean; status?: string }>(`${this.apiUrl}/users/check-email/${email}`, { headers: this.getHeaders() })
      .pipe(
        map((response) => response), // Success case
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404 && error.error && error.error.exists === false) {
            return [error.error]; // Return { exists: false } as a valid response
          }
          if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/connexion?error=session-expired';
            return throwError(() => new Error('Session expirée, veuillez vous reconnecter.'));
          }
          return throwError(() => new Error(error.message || 'Erreur lors de la vérification de l\'email.'));
        })
      );
  }
  
  updateUserStatus(email: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/status/${email}`, { status }, { headers: this.getHeaders() });
  }

// Nouvelle méthode pour supprimer un utilisateur
// deleteUser(email: string): Observable<any> {
//   return this.http.delete(`${this.apiUrl}/users/${email}`, { headers: this.getHeaders() });
// }
deleteUser(email: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/users/${email}`, { headers: this.getHeaders() }).pipe(
    tap(() => {
      // Notify the NotificationService to remove notifications for this email
      (UserService as any).notificationService.removeNotificationsByEmail(email);

    })
  );
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