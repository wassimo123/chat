import { Component } from '@angular/core';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Mot de passe:', this.password);
    console.log('Se souvenir de moi:', this.rememberMe);

    alert('Connexion réussie ! Redirection en cours...');
    setTimeout(() => {
      window.location.href = '/dashboard'; // Change vers la page souhaitée
    }, 2000);
  }

  forgotPassword() {
    alert('Redirection vers la page de récupération du mot de passe.');
    window.location.href = '/mot-de-passe-oublie'; // Change l'URL si besoin
  }

  createAccount() {
    alert('Redirection vers la page d\'inscription.');
    window.location.href = '/inscription'; // Change l'URL si besoin
  }
}
