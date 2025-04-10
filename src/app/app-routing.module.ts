import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableauDeBordComponent } from './admin/dashbord/tableau-de-bord/tableau-de-bord.component'; 
import { GestionDesUtilisateursComponent } from './admin/gestion-des-utilisateurs/gestion-des-utilisateurs.component';
import { NotificationComponent } from './admin/notification/notification.component';
import { ConnexionComponent } from './component/connexion/connexion.component';
import { InscriptionComponent } from './component/inscription/inscription.component';
import { ProfileComponent } from './admin/profile/profile.component';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { FooterComponent } from './component/footer/footer.component';
import { HotelDetailComponent } from './component/hotel-detail/hotel-detail.component';
import { HotelsComponent } from './component/hotels/hotels.component';
import { EventComponent } from './component/event/event.component';
import { PromotionsComponent } from './component/promotions/promotions.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AcceptTermsComponent } from './accept-terms/accept-terms.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GestionDesEvenementsComponent } from './admin/gestion-des-evenements/gestion-des-evenements.component';
import { GestionDesPromotionsComponent } from './admin/gestion-des-promotions/gestion-des-promotions.component';
import { GestionDesEtablissementsComponent } from './admin/gestion-des-etablissements/gestion-des-etablissements.component';



const routes: Routes = [
  { path: 'dashboard', component: TableauDeBordComponent }, 
  { path: 'hotels', component: HotelsComponent },
  { path: 'hotel/:id', component: HotelDetailComponent },
  { path: 'event', component: EventComponent },
  { path: 'promotion', component: PromotionsComponent },
  { path: 'users', component: GestionDesUtilisateursComponent }, 
  { path: 'notifications', component: NotificationComponent }, 
  { path: 'profile', component: ProfileComponent }, 
  { path: 'connexion', component: ConnexionComponent }, 
  { path: 'inscription', component: InscriptionComponent }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'navbar', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },
  { path: '', redirectTo: '/connexion', pathMatch: 'full' },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'accept-terms', component: AcceptTermsComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'etablissements', component: GestionDesEtablissementsComponent },
 
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }