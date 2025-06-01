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
import { RestaurantComponent } from './component/restaurant/restaurant.component';
import { CafeComponent } from './component/cafe/cafe.component';
import { EventComponent } from './component/event/event.component';
import { PromotionsComponent } from './component/promotions/promotions.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AcceptTermsComponent } from './accept-terms/accept-terms.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GestionDesEtablissementsComponent } from './admin/gestion-des-etablissements/gestion-des-etablissements.component';
import { GestionDesPromotionsComponent } from './admin/gestion-des-promotions/gestion-des-promotions.component';
import { GestionDesEvenementsComponent } from './admin/gestion-des-evenements/gestion-des-evenements.component';
import { AuthGuard } from './auth.guard'; // Changement du chemin d'importation
import { PartenaireComponent } from './partenaire/partenaire/partenaire.component';
import { ProfilePartenaireComponent } from './partenaire/profile-partenaire/profile-partenaire.component';
import { PartenaireEtablissementsComponent } from './partenaire/partenaire-etablissements/partenaire-etablissements.component';
// import { PartenaireEvenementsComponent } from './partenaire/partenaire-evenements/partenaire-evenements.component';
// import { PartenairePromotionsComponent } from './partenaire/partenaire-promotions/partenaire-promotions.component';
import { GestionDesPublicitesComponent } from './admin/gestion-des-publicites/gestion-des-publicites.component';
import { HistoireComponent } from './histoire/histoire.component';
import { HeritageDetailComponent } from './heritage-detail/heritage-detail.component';
import { TemoignagesComponent } from './components/temoignages/temoignages.component';
import { DecouvrirSfaxComponent } from './decouvrir-sfax/decouvrir-sfax.component';
import { SearchComponent } from './search/search.component';
import { CulturesTraditionnelsComponent } from './cultures-traditionnels/cultures-traditionnels.component';


const routes: Routes = [
  { path: 'dashboard', component: TableauDeBordComponent, canActivate: [AuthGuard] }, 
  { path: 'hotels', component: HotelsComponent },
  { path: 'cafes', component: CafeComponent },
  { path: 'restaurants', component: RestaurantComponent },
  { path: 'etablissements/:id', component: HotelDetailComponent },
  { path: 'evenements/:id', component: EventComponent },  // Correction ici
  { path: 'promotion/:id', component: PromotionsComponent },
  
  { path: 'evenement', component: EventComponent },
  { path: 'promotion', component: PromotionsComponent },
  { path: 'users', component: GestionDesUtilisateursComponent, canActivate: [AuthGuard] }, 
  { path: 'notifications', component: NotificationComponent , canActivate: [AuthGuard]}, 
  { path: 'profile', component: ProfileComponent , canActivate: [AuthGuard] }, 
  { path: 'connexion', component: ConnexionComponent }, 
  { path: 'inscription', component: InscriptionComponent }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'histoire', component: HistoireComponent }, 
  { path: 'heritage/:id', component: HeritageDetailComponent },
  { path: 'temoignages', component: TemoignagesComponent }, 
  { path: 'decouvrire', component: DecouvrirSfaxComponent },
  { path: 'search', component: SearchComponent },
  { path: 'culture', component: CulturesTraditionnelsComponent },
  
  { path: 'navbar', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'accept-terms', component: AcceptTermsComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'etablissements', component: GestionDesEtablissementsComponent, canActivate: [AuthGuard] },
  { path: 'promo', component: GestionDesPromotionsComponent, canActivate: [AuthGuard] },
  { path: 'event', component: GestionDesEvenementsComponent , canActivate: [AuthGuard]},
  { path: 'partenaire', component: PartenaireComponent, canActivate: [AuthGuard] },
  { path: 'profile-partenaire', component: ProfilePartenaireComponent , canActivate: [AuthGuard]},
  { path: 'partenaire-etablissements', component: PartenaireEtablissementsComponent , canActivate: [AuthGuard]},
  // { path: 'partenaire-evenements', component: PartenaireEvenementsComponent , canActivate: [AuthGuard]},
  // { path: 'partenaire-promotions', component: PartenairePromotionsComponent , canActivate: [AuthGuard]},
  { path: 'publicites', component: GestionDesPublicitesComponent , canActivate: [AuthGuard]},

  
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }