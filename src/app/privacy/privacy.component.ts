import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
  privacy: any;
  

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit() {
    this.http.get('http://localhost:5000/api/privacy').subscribe(
      (response) => {
        this.privacy = response;
      },
      (error) => {
        console.error('Erreur lors du chargement de la politique:', error);
      }
    );
  }
  goToSignup(): void {
    this.router.navigate(['/inscription']);
  }
  
}