import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';

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
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Vous devez accepter les conditions pour continuer.',
      });
      return;
    }

    this.userService.acceptTerms().subscribe(
      (response) => {
        console.log('Conditions acceptées:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Récupérer les informations de l'utilisateur depuis la base de données pour vérifier le rôle
        this.userService.getUserByEmail(this.user.email).subscribe(
          (userResponse) => {
            console.log('Réponse de /api/users/email:', userResponse);

            // Vérifier que l'utilisateur a un rôle défini
            if (!userResponse || !userResponse.role) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Rôle de l\'utilisateur non défini. Contactez l\'administrateur.',
              });
              return;
            }

            Swal.fire({
              icon: 'success',
              title: 'Conditions acceptées !',
              text: 'Redirection en cours...',
              timer: 2000,
              showConfirmButton: false,
            });

            setTimeout(() => {
              // Redirection basée sur le rôle de l'utilisateur
              const role = userResponse.role.trim().toLowerCase();
              console.log('Rôle normalisé:', role);
              if (role === 'admin') {
                console.log('Redirection vers /dashboard pour Admin');
                this.router.navigate(['/dashboard']);
              } else if (role === 'partenaire') {
                console.log('Redirection vers /partenaire pour Partenaire');
                this.router.navigate(['/partenaire']);
              } else {
                // Si le rôle n'est ni Admin ni Partenaire, déconnecter
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
            localStorage.removeItem('user');
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de vérifier le rôle de l\'utilisateur. Veuillez réessayer.',
            });
          }
        );
      },
      (error) => {
        console.error('Erreur lors de l\'acceptation des conditions:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de l\'acceptation des conditions.',
        });
      }
    );
  }
}