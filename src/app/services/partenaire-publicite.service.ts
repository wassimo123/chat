import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PubliciteService {
  private apiUrl = 'http://localhost:3000/api/publicites'; // à adapter selon ton backend

  constructor(private http: HttpClient) {}

  createPublicite(formData: FormData) {
    return this.http.post(this.apiUrl, formData);
  }
}
