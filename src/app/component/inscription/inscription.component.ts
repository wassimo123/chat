import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
    dateCreation: this.formatDate(new Date()) // Date initialisée automatiquement
  };

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.user.terms) {
      alert("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    console.log("Formulaire soumis avec succès :", this.user);
    alert("Inscription réussie !");
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  }
}
