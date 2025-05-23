import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  terms: any;
  

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get('http://localhost:5000/api/terms').subscribe(
      (response) => {
        this.terms = response;
      },
      (error) => {
        console.error('Erreur lors du chargement des conditions:', error);
      }
    );
  }

  goToSignup(): void {
    this.router.navigate(['/inscription']);
  }
}
