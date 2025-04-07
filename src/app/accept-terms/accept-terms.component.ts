import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-accept-terms',
  templateUrl: './accept-terms.component.html',
  styleUrls: ['./accept-terms.component.css']
})
export class AcceptTermsComponent implements OnInit {
  user: any;
  latestTerms: any;
  termsAccepted: boolean = false;

  constructor(private router: Router, private userService: UserService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { user: any; latestTerms: any };
    if (state) {
      this.user = state.user;
      this.latestTerms = state.latestTerms;
    }
  }

  ngOnInit() {
    if (!this.user || !this.latestTerms) {
      this.router.navigate(['/connexion']);
    }
  }

  acceptTerms() {
    if (!this.termsAccepted) {
      alert('Vous devez accepter les conditions pour continuer.');
      return;
    }
  
    this.userService.acceptTerms().subscribe(
      (response) => {
        console.log('Conditions acceptées:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        alert('Conditions acceptées avec succès ! Redirection en cours...');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      (error) => {
        console.error('Erreur lors de l\'acceptation des conditions:', error);
        alert(error.error.message || 'Erreur lors de l\'acceptation des conditions.');
      }
    );
  }
}