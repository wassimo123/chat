import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
})
export class ConnexionComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'unauthorized') {
        Swal.fire({
          icon: 'error',
          title: 'Accès non autorisé',
          text: 'Veuillez vous connecter pour accéder à cette page.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.userService.login({ email: this.email, password: this.password }).subscribe(
      (response) => {
        console.log('Réponse de /api/login:', response);

        localStorage.setItem('token', response.token);

        this.userService.getUserByEmail(this.email).subscribe(
          (userResponse) => {
            console.log('Réponse de /api/users/email:', userResponse);

            if (!userResponse || !userResponse.role) {
              localStorage.removeItem('token');
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Rôle de l\'utilisateur non défini. Contactez l\'administrateur.',
              });
              return;
            }

            localStorage.setItem('user', JSON.stringify(userResponse));

            Swal.fire({
              icon: 'success',
              title: 'Connexion réussie !',
              text: 'Redirection en cours...',
              timer: 2000,
              showConfirmButton: false,
            });

            setTimeout(() => {
              const role = userResponse.role.trim().toLowerCase();
              console.log('Rôle normalisé:', role);
              if (role === 'admin') {
                console.log('Redirection vers /dashboard pour Admin');
                this.router.navigate(['/dashboard']);
              } else if (role === 'partenaire') {
                console.log('Redirection vers /partenaire pour Partenaire');
                this.router.navigate(['/partenaire']);
              } else {
                console.log('Rôle non autorisé:', role);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                Swal.fire({
                  icon: 'error',
                  title: 'Accès non autorisé',
                  text: 'Seuls les rôles Admin et Partenaire sont autorisés à se connecter.',
                });
              }
            }, 2000);
          },
          (error) => {
            console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
            localStorage.removeItem('token');
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de vérifier le rôle de l\'utilisateur. Veuillez réessayer.',
            });
          }
        );
      },
      (error) => {
        console.error('Erreur lors de la connexion:', error);
        if (error.status === 403 && error.error.message === 'Nouvelles conditions d\'utilisation à accepter.') {
          const token = error.error.token;
          console.log('Token stocké dans localStorage :', token);
          localStorage.setItem('token', token);
          this.router.navigate(['/accept-terms'], {
            state: { user: error.error.user, latestTerms: error.error.latestTerms },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error.message || 'Erreur lors de la connexion.',
          });
        }
      }
    );
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  createAccount() {
    Swal.fire({
      icon: 'info',
      title: 'Créer un compte',
      text: 'Redirection vers la page d\'inscription...',
      timer: 1500,
      showConfirmButton: false,
    });
    this.router.navigate(['/inscription']);
  }
}