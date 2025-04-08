// src/app/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis les paramètres de l'URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Token manquant. Veuillez utiliser le lien envoyé par email.';
      }
    });
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.userService.resetPassword(this.token, this.newPassword, this.confirmPassword).subscribe(
      (response) => {
        this.message = response.message;
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/connexion']);
        }, 3000);
      },
      (error) => {
        this.error = error.error.message || 'Erreur lors de la réinitialisation du mot de passe.';
        this.message = '';
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }
}