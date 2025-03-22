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

@NgModule({
  declarations: [
    AppComponent,
    TableauDeBordComponent,
    GestionDesUtilisateursComponent,
    NotificationComponent,
    ConnexionComponent,
    InscriptionComponent,
    
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
