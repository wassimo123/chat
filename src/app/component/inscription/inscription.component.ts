import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  user = {
    matriculeFiscale: '',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    dateCreation: '',
    terms: false
  };

  showPassword: boolean = false; // Propriété pour gérer la visibilité du mot de passe
  showConfirmPassword: boolean = false; // Propriété pour gérer la visibilité de la confirmation du mot de passe

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Méthode pour basculer la visibilité de la confirmation du mot de passe
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // Validation simple
    if (!this.user.matriculeFiscale || !this.user.nom || !this.user.prenom || !this.user.email ||
        !this.user.password || !this.user.confirmPassword || !this.user.telephone ||
        !this.user.adresse || !this.user.dateCreation) {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs obligatoires.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!this.user.terms) {
      Swal.fire({
        title: 'Erreur',
        text: 'Vous devez accepter les conditions d\'utilisation.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      Swal.fire({
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Envoi de la requête d'inscription
    this.userService.register(this.user).subscribe({
      next: (response) => {
        // Stocker le token dans localStorage (peut être utilisé pour des actions futures)
        localStorage.setItem('token', response.token);

        // Générer une notification pour l'administrateur
        const notification = {
          id: Date.now(),
          type: 'info' as const,
          icon: 'ri-user-add-line',
          message: `Un nouveau partenaire (${this.user.nom} ${this.user.prenom}) a demandé la création d'un compte.`,
          time: new Date().toLocaleTimeString(),
          read: false,
          email: this.user.email
        };
        this.notificationService.addNotification(notification);

        Swal.fire({
          title: 'Succès',
          text: 'Inscription réussie ! En attente de validation par l\'administrateur.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/connexion']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Erreur',
          text: err.error.message || 'Erreur lors de l\'inscription.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }
}