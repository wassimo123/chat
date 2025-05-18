import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private apiUrl = 'http://localhost:5000/api/newsletter';

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email });
  }
}