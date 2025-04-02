import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
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


@NgModule({
  declarations: [
    AppComponent,
    TableauDeBordComponent,
    GestionDesUtilisateursComponent,
    NotificationComponent,
    ConnexionComponent,
    InscriptionComponent,
    ProfileComponent,
    
    
    
   
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
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