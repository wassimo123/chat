// src/app/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private userService: UserService, private router: Router) {}

  onSubmit() {
    if (!this.email) {
      this.error = 'Veuillez entrer votre adresse email.';
      return;
    }

    this.userService.forgotPassword(this.email).subscribe(
      (response) => {
        this.message = response.message;
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/connexion']);
        }, 3000);
      },
      (error) => {
        this.error = error.error.message || 'Erreur lors de la demande de réinitialisation.';
        this.message = '';
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }
}