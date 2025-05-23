import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.css']
})
export class MapModalComponent implements AfterViewInit {
  @Input() fullAddress!: string;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  map!: google.maps.Map;

  ngAfterViewInit(): void {
    const loader = new Loader({
      apiKey: 'AIzaSyBaacRlPP7Nv7b3F46CpTYeIHIN9HUFXKk',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      this.geocodeAddress(this.fullAddress);
    });
  }

  geocodeAddress(address: string) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        this.map = new google.maps.Map(this.mapContainer.nativeElement, {
          center: location,
          zoom: 15
        });

        new google.maps.Marker({
          map: this.map,
          position: location
        });
      } else {
        alert('Adresse non trouvée : ' + status);
      }
    });
  }

  closeMap(): void {
    if (this.mapContainer) {
      this.mapContainer.nativeElement.innerHTML = '';
    }
  }
}
