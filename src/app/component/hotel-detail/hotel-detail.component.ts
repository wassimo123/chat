import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EtablissementService } from '../../services/etablissement.service';
import * as L from 'leaflet';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css']
})
export class HotelDetailComponent implements OnInit {
  hotel: any = null;
  showConfirmationModal: boolean = false;
  showMapModal: boolean = false;
  reservationDate: string = '';
  reservationTime: string = '12:00';
  numberOfPeople: string = '1';
  map: any;

  constructor(
    private route: ActivatedRoute,
    private etablissementService: EtablissementService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.etablissementService.getEtablissementById(id).subscribe({
          next: (hotel) => {
            this.hotel = hotel;
          },
          error: (err) => {
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

    const fullAddress = '${this.hotel.adresse}, ${this.hotel.ville}, ${this.hotel.pays}';

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          this.map = L.map('map').setView([lat, lon], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          L.marker([lat, lon]).addTo(this.map)
            .bindPopup(this.hotel.nom)
            .openPopup();
        }
      });
  }

  getGoogleMapsUrl(address: string): string {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  }

  goToWebsite(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  getSafeMapUrl(fullAddress: string): SafeResourceUrl {
    const url = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBaacRlPP7Nv7b3F46CpTYeIHIN9HUFXKk&q=${encodeURIComponent(fullAddress)}&maptype=satellite`;
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
}



