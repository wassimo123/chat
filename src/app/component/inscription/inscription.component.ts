import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  user = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    matriculefiscale: '',
    terms: false,
    dateCreation: this.formatDate(new Date())
  };

  constructor(private router: Router, private userService: UserService) {}

  onSubmit() {
    if (!this.user.terms) {
      alert("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    this.userService.register({
      matriculeFiscale: this.user.matriculefiscale,
      nom: this.user.nom,
      prenom: this.user.prenom,
      email: this.user.email,
      password: this.user.password,
      confirmPassword: this.user.confirmPassword,
      telephone: this.user.phone,
      adresse: this.user.address,
      dateCreation: this.user.dateCreation,
      terms: this.user.terms
    }).subscribe(
      (response) => {
        console.log('Inscription réussie:', response);
        // Stocker le token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        alert('Inscription réussie ! Vous allez être redirigé vers la page de connexion.');
        this.router.navigate(['/connexion']);
      },
      (error) => {
        console.error('Erreur lors de l\'inscription:', error);
        alert(error.error.message || 'Erreur lors de l\'inscription.');
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}