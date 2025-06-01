import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EtablissementService } from '../../services/etablissement.service';
import * as L from 'leaflet';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css'],
    animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HotelDetailComponent implements OnInit {
  hotel: any = null;
  showConfirmationModal: boolean = false;
  showMapModal: boolean = false;
  reservationDate: string = '';
  reservationTime: string = '12:00';
  numberOfPeople: string = '1';
  map: any;
  currentPhotoIndex: number = 0;
 


  constructor(
    private route: ActivatedRoute,
    private etablissementService: EtablissementService,
    private sanitizer: DomSanitizer,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.etablissementService.getEtablissementById(id).subscribe({
          next: (hotel) => {
            this.hotel = hotel;
            console.log("hotel: ",this.hotel.coordinates);
          },
          
          error: (err) => {
            console.log("ID reçu dans l'URL :", id);

            console.error("Erreur lors du chargement de l'hôtel :", err);
          }
        });
      }
    });
  }

  openMapModal() {
    this.showMapModal = true;
    setTimeout(() => this.loadMap(), 100); // attendre que le DOM soit prêt
  }

  closeMapModal() {
    this.showMapModal = false;
  }

  loadMap() {
    if (this.map) {
      this.map.remove();
    }
  
    if (this.hotel && this.hotel.coordinates && this.hotel.nom && this.hotel.adresse) {
      const lat = this.hotel.coordinates[0]; // Latitude
      const lng = this.hotel.coordinates[1]; // Longitude
  
      this.map = L.map('map').setView([lat, lng], 16);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
  
      const popupContent = `<b>${this.hotel.nom}</b><br>${this.hotel.adresse} , ${this.hotel.ville}, ${this.hotel.pays}`;
      L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(popupContent)
        .openPopup();
    } else {
      console.error('Données manquantes (nom, adresse ou coordonnées)');
    }
  }
  

  jours: string[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];


  // getNavRoute(): string {
  //   switch(this.hotel.type) { 
  //     case 'Restaurant': { 
  //        return 'restaurants';
  //     } 
  //     case 'Café': { 
  //       return 'cafes';

  //    }   
  //     case 'Hôtel': { 
  //       return 'hotels';

  //  } 
  //     default: { 
  //        return 'hotels';
  //     } 
  //  } 
   
  // }
  getNavRoute(): string {
    if (!this.hotel || !this.hotel.type) {
      return 'hotels'; // valeur par défaut
    }
  
    switch (this.hotel.type) {
      case 'Restaurant':
        return 'restaurants';
      case 'Café':
        return 'cafes';
      case 'Hôtel':
        return 'hotels';
      default:
        return 'hotels';
    }
  }
  
  
  getGoogleMapsUrl(address: string): string {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  }
  getLongitude():number {
    return this.hotel.coordinates[1];
  }
  getLatitude():number {
    return this.hotel.coordinates[0];
  }


  // getMapUrl(): SafeResourceUrl {
  //   const lat = this.getLatitude();
  //   const lng = this.getLongitude();  
  //   const unsafeUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=18&t=k&output=embed`;
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  // }

// getMapUrl(): SafeResourceUrl {
//   if (!this.hotel || !this.hotel.coordinates) {
//     return this.sanitizer.bypassSecurityTrustResourceUrl('');
//   }

//   const lat = this.hotel.coordinates[0]; // Latitude
//   const lng = this.hotel.coordinates[1]; // Longitude
//   const label = encodeURIComponent(this.hotel.nom); // Nom de l'établissement

//   const mapUrl = `https://maps.google.com/maps?q=${lat},${lng} (${label})&z=18&output=embed`;

//   return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
// }
getMapUrl(): SafeResourceUrl {
  if (!this.hotel || !this.hotel.coordinates || !this.hotel.nom || !this.hotel.adresse) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  const lat = this.hotel.coordinates[0];
  const lng = this.hotel.coordinates[1];
  const fullName = encodeURIComponent(`${this.hotel.nom}, ${this.hotel.adresse}, ${this.hotel.ville}, ${this.hotel.pays}`);

  const apiKey = 'AIzaSyBaacRlPP7Nv7b3F46CpTYeIHIN9HUFXKk';

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${fullName}&center=${lat},${lng}&zoom=18`;

  return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
}



extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
}




  goToWebsite(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  /*getSafeMapUrl(fullAddress: string): SafeResourceUrl {
    const url = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBaacRlPP7Nv7b3F46CpTYeIHIN9HUFXKk&q=${encodeURIComponent(fullAddress)}&maptype=satellite`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }*/
  getSafeMapUrl(): SafeResourceUrl {
    const coords = '34.80808227434395,10.7159930444201';
    const url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBaacRlPP7Nv7b3F46CpTYeIHIN9HUFXKk&center=${coords}&zoom=18`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  openInGoogleMaps(address: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }
  onSubmitReservation() {
    this.showConfirmationModal = true;
  }

  closeModal() {
    this.showConfirmationModal = false;
  }
  get currentPhotoUrl(): string {
    if (!this.hotel?.photos || this.hotel.photos.length === 0) {
      return 'assets/images/default-hotel.jpg';
    }
    return `http://localhost:5000/${this.hotel.photos[this.currentPhotoIndex]}`;
  }
  showNextPhoto(): void {
    if (this.hotel && this.hotel.photos.length > 0) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.hotel.photos.length;
    }
  }
  
  showPreviousPhoto(): void {
    if (this.hotel && this.hotel.photos.length > 0) {
      this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.hotel.photos.length) % this.hotel.photos.length;
    }
  }
  selectedPhotoIndex: number | null = null;

  openPhotoModal(index: number): void {
    this.selectedPhotoIndex = index;
  }
  
  closePhotoModal(): void {
    this.selectedPhotoIndex = null;
  }
  
  showNextPhotoModal(): void {
    if (this.selectedPhotoIndex !== null && this.hotel.photos.length > 0) {
      this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % this.hotel.photos.length;
    }
  }
  
  showPreviousPhotoModal(): void {
    if (this.selectedPhotoIndex !== null && this.hotel.photos.length > 0) {
      this.selectedPhotoIndex =
        (this.selectedPhotoIndex - 1 + this.hotel.photos.length) % this.hotel.photos.length;
    }
  }
  
  
}



