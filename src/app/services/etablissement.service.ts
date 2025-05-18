import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Etablissement, Horaires, ReseauxSociaux } from '../models/etablissement.model';

// Interface pour les données brutes renvoyées par le backend
interface EtablissementRaw {
  _id: string;
  nom: string;
  adresse: string;
  type: string;
  statut: string;
  visibility: "public" ;
  codePostal?: string;
  ville?: string;
  pays?: string;
  showMap: boolean;
  telephone: string;
  email: string;
  siteWeb: string;
  reseauxSociaux: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  description: string;
  services: string[];
  horaires: {
    lundi: { open: string; close: string; closed: boolean };
    mardi: { open: string; close: string; closed: boolean };
    mercredi: { open: string; close: string; closed: boolean };
    jeudi: { open: string; close: string; closed: boolean };
    vendredi: { open: string; close: string; closed: boolean };
    samedi: { open: string; close: string; closed: boolean };
    dimanche: { open: string; close: string; closed: boolean };
    is24_7: boolean;
    specialHours?: string;
  };
  photos: string[];
}


@Injectable({
  providedIn: 'root'
})
export class EtablissementService {
  private apiUrl = 'http://localhost:5000/api/etablissements';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Fonction pour transformer EtablissementRaw en Etablissement
  private mapToEtablissement(raw: EtablissementRaw): Etablissement {
    return {
      ...raw,
      id: raw._id,
    };
  }
 
  getEtablissementByvaliderId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/valider/${id}`);
  }
  getHotels(): Observable<Etablissement[]> {
    return this.http.get<EtablissementRaw[]>(`${this.apiUrl}/type/Hôtel`, { headers: this.getHeaders() }).pipe(
      map(rawEtablissements => rawEtablissements.map(raw => this.mapToEtablissement(raw))),
      catchError(this.handleError)
    );
    //return this.http.get<any[]>(`${this.apiUrl}/type/Hôtel`);

  }
  // getCafes(): Observable<Etablissement[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/type/Café`);
  // }

  getCafe(): Observable<Etablissement[]> {
    return this.http.get<EtablissementRaw[]>(`${this.apiUrl}/type/Café`, { headers: this.getHeaders() }).pipe(
      map(rawEtablissements => rawEtablissements.map(raw => this.mapToEtablissement(raw))),
      catchError(this.handleError)
    );
  }


  // getRestaurants(): Observable<Etablissement[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/type/Restaurant`);
  // }
  getRestaurant(): Observable<Etablissement[]> {
    return this.http.get<EtablissementRaw[]>(`${this.apiUrl}/type/Restaurant`, { headers: this.getHeaders() }).pipe(
      map(rawEtablissements => rawEtablissements.map(raw => this.mapToEtablissement(raw))),
      catchError(this.handleError)
    );
  

  }



  // Récupérer tous les établissements
  getEtablissements(): Observable<Etablissement[]> {
    return this.http.get<EtablissementRaw[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(rawEtablissements => rawEtablissements.map(raw => this.mapToEtablissement(raw))),
      catchError(this.handleError)
    );
  }
  addPublicite(data: any): Observable<any> {
    return this.http.post(`http://localhost:5000/api/publicites`, data); // Adjust the endpoint if needed
  }
  // Récupérer un établissement par ID
  getEtablissementById(id: string): Observable<Etablissement> {
    return this.http.get<EtablissementRaw>(`${this.apiUrl}/id/${id}`, { headers: this.getHeaders() }).pipe(
      map(raw => this.mapToEtablissement(raw)),
      catchError(this.handleError)
    );
  }

  addEtablissement(etablissement: Etablissement): Observable<Etablissement> {
    const formData = new FormData();
    //console.log("photos: ", etablissement.photos);
    // Add basic fields
    formData.append('nom', etablissement.nom);
    formData.append('adresse', etablissement.adresse);
    formData.append('type', etablissement.type);
    formData.append('statut', etablissement.statut);
    formData.append('visibility', etablissement.visibility || 'public');
    formData.append('codePostal', etablissement.codePostal || '');
    formData.append('ville', etablissement.ville || '');
    formData.append('pays', etablissement.pays || '');
    formData.append('showMap', (etablissement.showMap ?? true).toString());
    formData.append('telephone', etablissement.telephone);
    formData.append('email', etablissement.email);
    formData.append('siteWeb', etablissement.siteWeb);
    formData.append('description', etablissement.description);
  
    // Add services (array)
    if (etablissement.services?.length) {
      etablissement.services.forEach(service => {
        formData.append('services', service);
      });
    }
  
    // Add social media (reseauxSociaux)
    if (etablissement.reseauxSociaux) {
      (Object.keys(etablissement.reseauxSociaux) as (keyof ReseauxSociaux)[]).forEach(key => {
        const value = etablissement.reseauxSociaux[key];
        if (value) {
          formData.append(`reseauxSociaux[${key}]`, value);
        }
      });
    }
  
    // Add horaires
    if (etablissement.horaires) {
      const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      days.forEach(day => {
        const dayHoraire = etablissement.horaires[day as keyof Horaires];
        if (  typeof dayHoraire === 'object' &&
          dayHoraire !== null &&
          'open' in dayHoraire &&
          'close' in dayHoraire &&
          'closed' in dayHoraire) {
          formData.append(`horaires[${day}][open]`, dayHoraire.open);
          formData.append(`horaires[${day}][close]`, dayHoraire.close);
          formData.append(`horaires[${day}][closed]`, dayHoraire.closed.toString());
        }
      });
  
      // Add 24/7 and specialHours
      if (etablissement.horaires.is24_7 !== undefined) {
        formData.append('horaires[is24_7]', etablissement.horaires.is24_7.toString());
      }
      if (etablissement.horaires.specialHours) {
        formData.append('horaires[specialHours]', etablissement.horaires.specialHours);
      }
    }
  
    // Add photos
    if (etablissement.photos?.length) {
      etablissement.photos.forEach(photo => {
        if (typeof photo !== 'string') {
          formData.append('photos', photo);
        } else {
          formData.append('photoUrls', photo);
        }
        
      });
    }
  
    

    console.log('Sending form data to backend');
    
  
    // Send the POST request with FormData
    return this.http.post<EtablissementRaw>(this.apiUrl, formData).pipe(
      map(raw => this.mapToEtablissement(raw)),
      catchError(this.handleError)
    );
  }
  

  updateEtablissement(id: string, etablissement: Etablissement): Observable<Etablissement> {
    const formData = new FormData();
  
    formData.append('nom', etablissement.nom);
    formData.append('adresse', etablissement.adresse);
    formData.append('type', etablissement.type);
    formData.append('statut', etablissement.statut);
    formData.append('visibility', etablissement.visibility || 'public');
    formData.append('codePostal', etablissement.codePostal || '');
    formData.append('ville', etablissement.ville || '');
    formData.append('pays', etablissement.pays || '');
    formData.append('showMap', (etablissement.showMap ?? true).toString());
    formData.append('telephone', etablissement.telephone);
    formData.append('email', etablissement.email);
    formData.append('siteWeb', etablissement.siteWeb);
    formData.append('description', etablissement.description);
  
    if (etablissement.services?.length) {
      etablissement.services.forEach(service => formData.append('services', service));
    }
  
    if (etablissement.reseauxSociaux) {
      (Object.keys(etablissement.reseauxSociaux) as (keyof ReseauxSociaux)[]).forEach(key => {
        const value = etablissement.reseauxSociaux[key];
        if (value) {
          formData.append(`reseauxSociaux[${key}]`, value);
        }
      });
    }
  
    if (etablissement.horaires) {
      const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      days.forEach(day => {
        const dayHoraire = etablissement.horaires[day as keyof Horaires] as {
          open: string;
          close: string;
          closed: boolean;
        };
      
        formData.append(`horaires[${day}][open]`, dayHoraire.open);
        formData.append(`horaires[${day}][close]`, dayHoraire.close);
        formData.append(`horaires[${day}][closed]`, dayHoraire.closed.toString());
      });
  
      formData.append('horaires[is24_7]', etablissement.horaires.is24_7.toString());
      if (etablissement.horaires.specialHours) {
        formData.append('horaires[specialHours]', etablissement.horaires.specialHours);
      }
    }
  
    if (etablissement.photos?.length) {
      etablissement.photos.forEach(photo => {
        if (typeof photo === 'string') {
          formData.append('existingPhotos', photo); // chemin déjà enregistré
        } else {
          formData.append('photos', photo); // fichier à uploader
        }
      });
    }
    console.log('FormData final envoyé :');
    formData.forEach((value, key) => {
      console.log(key, value);
    });//wassimmm
  
    return this.http.put<EtablissementRaw>(`${this.apiUrl}/${id}`, formData).pipe(
      map(raw => this.mapToEtablissement(raw)),
      catchError(this.handleError)
    );
  }
  

  // Archiver un établissement (mise à jour partielle)
  archiverEtablissement(id: string): Observable<Etablissement> {
    return this.http.patch<EtablissementRaw>(
      `${this.apiUrl}/${id}`,
      { statut: 'Inactif' }, // Changement de "Archivé" à "Inactif"
      { headers: this.getHeaders() }
    ).pipe(
      map(raw => this.mapToEtablissement(raw)),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || error.message || errorMessage;
      if (error.status === 400 && error.error?.errors) {
        errorMessage += ' Détails: ' + error.error.errors.join(', ');
      }
    }
    console.error('Erreur:', error);
    return throwError(() => new Error(errorMessage));
  }
}