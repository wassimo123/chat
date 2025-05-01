import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:5000/api/email';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  sendConfirmationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirmation`, { email }, { headers: this.getHeaders() });
  }

  sendCancellationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cancellation`, { email }, { headers: this.getHeaders() });
  }
}