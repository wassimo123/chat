import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EtablissementService } from '../../services/etablissement.service';

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

  private hotels: any[] = [
    {
      id: 2,
      nom: 'Royal Sfax',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/c331f3dc04a9a6af680b0e2947b16522.jpg',
      rating: 5,
      reviews: 256,
      description: 'Hôtel 5 étoiles offrant un confort moderne.',
      price: 320,
      services: ['Piscine', 'Spa', 'Restaurant', 'Wifi'],
      address: '456 Boulevard Royal, Sfax',
      hours: '24/7',
      phone: '+216 74 987 654'
    },
    {
      id: 4,
      nom: 'Hôtel Les Oliviers Palace',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/b1f351d8b3bbd3405fcf95c6d3a5355e.jpg',
      rating: 4.8,
      reviews: 128,
      description: 'Situé au cœur de Sfax, l\'Hôtel Les Oliviers Palace offre une expérience de luxe unique.',
      price: 320,
      services: ['Piscine', 'Restaurant', 'Wifi'],
      address: '321 Avenue des Oliviers, Sfax',
      hours: '24/7',
      phone: '+216 74 654 321'
    },
    {
      id: 5,
      nom: 'Hôtel Borj Dhiafa',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/f4c14da105f7b0748c2a51ad3034dfbb.jpg',
      rating: 4.6,
      reviews: 96,
      description: 'Un cadre élégant et raffiné combinant confort moderne et architecture traditionnelle.',
      price: 250,
      services: ['Restaurant', 'Wifi'],
      address: '654 Rue Borj Dhiafa, Sfax',
      hours: '24/7',
      phone: '+216 74 321 654'
    },
    {
      id: 6,
      nom: 'Hôtel Mercure Sfax',
      type: 'Hôtel',
      image: 'https://public.readdy.ai/ai/img_res/702d21ceeadc1c21e7a232d1f2dc6d1d.jpg',
      rating: 4.7,
      reviews: 156,
      description: 'Idéal pour les voyageurs d\'affaires et les touristes avec des chambres modernes.',
      price: 280,
      services: ['Restaurant', 'Wifi'],
      address: '987 Boulevard Mercure, Sfax',
      hours: '24/7',
      phone: '+216 74 789 123'
    }
  ];

  constructor(private route: ActivatedRoute, private etablissementService: EtablissementService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log("ID reçu:", id);
  
      if (id) {
        this.etablissementService.getEtablissementById(id).subscribe({
          next: (hotel) => {
            this.hotel = hotel;
            console.log("Hôtel récupéré :", hotel);
          },
          error: (err) => {
            console.error("Erreur lors du chargement de l'hôtel :", err);
          }
        });
      } else {
        console.error("Aucun ID fourni dans l'URL");
      }
    });
  }
  
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  onSubmitReservation() {
    console.log(`Réservation: Date=${this.reservationDate}, Heure=${this.reservationTime}, Personnes=${this.numberOfPeople}`);
    this.showConfirmationModal = true;
  }

  closeModal() {
    this.showConfirmationModal = false;
  }

  openMapModal() {
    this.showMapModal = true;
  }

  closeMapModal() {
    this.showMapModal = false;
  }

  getGoogleMapsUrl(address: string): string {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  }
  goToWebsite(url:any) {
    console.log("url: ",url);
    if (url) {
      window.open(url, '_blank'); // Opens in a new tab
    }
  }
}