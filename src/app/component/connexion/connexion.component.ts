import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(private router: Router, private userService: UserService) {}

  onSubmit() {
    this.userService.login({ email: this.email, password: this.password }).subscribe(
      (response) => {
        console.log('Connexion réussie:', response);
        localStorage.setItem('token', response.token);
        if (this.rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        alert('Connexion réussie ! Redirection en cours...');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      (error) => {
        console.error('Erreur lors de la connexion:', error);
        if (error.status === 403 && error.error.message === 'Nouvelles conditions d\'utilisation à accepter.') {
          // Stocker le token temporaire pour accepter les conditions
          localStorage.setItem('token', error.error.token);
          this.router.navigate(['/accept-terms'], {
            state: { user: error.error.user, latestTerms: error.error.latestTerms }
          });
        } else {
          alert(error.error.message || 'Erreur lors de la connexion.');
        }
      }
    );
  }

  forgotPassword() {
    alert('Redirection vers la page de récupération du mot de passe.');
    this.router.navigate(['/mot-de-passe-oublie']);
  }

  createAccount() {
    alert('Redirection vers la page d\'inscription.');
    this.router.navigate(['/inscription']);
  }
}