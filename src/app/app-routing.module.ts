import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableauDeBordComponent } from './admin/dashbord/tableau-de-bord/tableau-de-bord.component'; // Correction de "dashbord" en "dashboard"
import { GestionDesUtilisateursComponent } from './admin/gestion-des-utilisateurs/gestion-des-utilisateurs.component';
import { NotificationComponent } from './admin/notification/notification.component';
import { ConnexionComponent } from './component/connexion/connexion.component';
import { InscriptionComponent } from './component/inscription/inscription.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirection par défaut vers /dashboard
  { path: 'dashboard', component: TableauDeBordComponent },
  { path: 'users', component: GestionDesUtilisateursComponent },
  { path: 'notifications', component: NotificationComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }