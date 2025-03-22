import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importez le Router

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  user = {
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    matricule: '',
    terms: false
  };

  constructor(private router: Router) {} // Injectez le Router dans le constructeur

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
    // Ici, tu peux envoyer les données à l'API backend via un service Angular
  }

  goToLogin() {
    alert("Redirection vers la page de connexion.");
    this.router.navigate(['/connexion']); // Maintenant, router est défini
  }
}