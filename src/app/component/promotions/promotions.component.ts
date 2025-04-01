import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent {
  promotions = [
    {
      title: 'Séjour de luxe à l’Ibis Sfax',
      expiry: '30 Avril 2025',
      category: 'Hôtels',
      image: 'https://tse3.mm.bing.net/th?id=OIP.jRL7q8KrcRlnHuSA5K4o8gHaFj&pid=Apig',
      description: 'Profitez d’une réduction sur une chambre Sweet Bed avec petit-déjeuner inclus.',
      discount: '-30%',
      price: '180 DT',
      originalPrice: '260 DT',
      bookingUrl: 'https://all.accor.com/hotel/A094/index.fr.shtml' // URL officielle de l’Ibis Sfax
    },
    {
      title: 'Dîner Gastronomique pour Deux',
      expiry: '15 Mai 2025',
      category: 'Restaurants',
      image: 'https://public.readdy.ai/ai/img_res/7a2c4cbd8d9560c4be8c51f9ccf51a3b.jpg',
      description: 'Menu dégustation complet avec accord mets et vins dans notre restaurant étoilé.',
      discount: '-25%',
      price: '150 DT',
      originalPrice: '200 DT',
      bookingUrl: 'https://www.tripadvisor.fr/Restaurants-g297948-Midoun_Djerba_Island_Medenine_Governorate.html' // URL fictive (à remplacer si réel)
    },
    {
      title: 'Journée Spa & Détente aux Oliviers',
      expiry: '31 Mai 2025',
      category: 'Autres',
      image: 'https://public.readdy.ai/ai/img_res/5d9f2ad99a578602a25cb9e031c22448.jpg',
      description: 'Accès illimité au spa, massage d’une heure et soins du visage inclus.',
      discount: '-40%',
      price: '120 DT',
      originalPrice: '200 DT',
      bookingUrl: 'https://www.booking.com/hotel/tn/les-oliviers-palace.fr.html' // URL via Booking.com
    }
  ];

  filteredPromotions = [...this.promotions];
  selectedPromotionCategory: string = 'all';

  redirectToBookingSite(url: string) {
    window.open(url, '_blank'); // Ouvre l'URL dans un nouvel onglet
  }

  filterPromotions() {
    if (this.selectedPromotionCategory === 'all') {
      this.filteredPromotions = [...this.promotions];
    } else {
      this.filteredPromotions = this.promotions.filter(promotion => promotion.category === this.selectedPromotionCategory);
    }
    console.log('Promotions filtrées :', this.filteredPromotions);
  }
}