import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
import { GestionDesEvenementsComponent } from './admin/gestion-des-evenements/gestion-des-evenements.component';
import { GestionDesPromotionsComponent } from './admin/gestion-des-promotions/gestion-des-promotions.component';
import { GestionDesEtablissementsComponent } from './admin/gestion-des-etablissements/gestion-des-etablissements.component';




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
    GestionDesEvenementsComponent,
    GestionDesPromotionsComponent,
    GestionDesEtablissementsComponent,

   
  
    
    
    
   
  
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
    PromotionsComponent,
    HomeComponent,
    
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }