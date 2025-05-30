import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule , ReactiveFormsModule,} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Nécessaire pour les animations
import { TableauDeBordComponent } from './admin/dashbord/tableau-de-bord/tableau-de-bord.component';
import { GestionDesUtilisateursComponent } from './admin/gestion-des-utilisateurs/gestion-des-utilisateurs.component';
import { NotificationComponent } from './admin/notification/notification.component';
import { ConnexionComponent } from './component/connexion/connexion.component';
import { InscriptionComponent } from './component/inscription/inscription.component';
import { ProfileComponent } from './admin/profile/profile.component';
import { HomeComponent } from './component/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { HotelsComponent } from './component/hotels/hotels.component';
import { RestaurantComponent } from './component/restaurant/restaurant.component';
import { CafeComponent } from './component/cafe/cafe.component';

import { HotelDetailComponent } from './component/hotel-detail/hotel-detail.component';
import { EventComponent } from './component/event/event.component';
import { NavbarComponent } from "./component/navbar/navbar.component";
import { FooterComponent } from "./component/footer/footer.component";
import { PromotionsComponent } from './component/promotions/promotions.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AcceptTermsComponent } from './accept-terms/accept-terms.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GestionDesEtablissementsComponent } from './admin/gestion-des-etablissements/gestion-des-etablissements.component';
import { GestionDesPromotionsComponent } from './admin/gestion-des-promotions/gestion-des-promotions.component';
import { GestionDesEvenementsComponent } from './admin/gestion-des-evenements/gestion-des-evenements.component';
import { PartenaireComponent } from './partenaire/partenaire/partenaire.component';
import { MapModalComponent } from './components/map-modal/map-modal.component';
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





@NgModule({
  declarations: [
    AppComponent,
    TableauDeBordComponent,
    GestionDesUtilisateursComponent,
    NotificationComponent,
    ConnexionComponent,
    InscriptionComponent,
    ProfileComponent,
    TermsComponent,
    PrivacyComponent,
    AcceptTermsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    GestionDesEtablissementsComponent,
    GestionDesPromotionsComponent,
    GestionDesEvenementsComponent,
    PartenaireComponent,
    MapModalComponent,
   ProfilePartenaireComponent,
   PartenaireEtablissementsComponent,
  //  PartenaireEvenementsComponent,
  //  PartenairePromotionsComponent,
   GestionDesPublicitesComponent,


    

   
  
    
    
    
   
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    HotelsComponent, // Ajoutez ici car il est standalone
    HotelDetailComponent,
    EventComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    PromotionsComponent,
    RestaurantComponent,
    CafeComponent ,
    ReactiveFormsModule,
    HistoireComponent,
    HeritageDetailComponent,
    TemoignagesComponent,
    DecouvrirSfaxComponent,
    ReactiveFormsModule,
    SearchComponent,
    CulturesTraditionnelsComponent,
    
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }