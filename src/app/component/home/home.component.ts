import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EvaluationService } from '../../services/evaluation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  hovered: number = 0;
  successMessage: string = '';
  errorMessage: string = '';
  evaluation: any = null;
  avisList = [
    {
      utilisateur: 'losand',
      note: 2,
      titre: 'T.O VISITEURS lamentable - New Orleans Guest House',
      commentaire:` Voyage à La nouvelle Orléans dans un hôtel très sale. Parking fermé avec un cadenas...`,
      dateVisite: 'septembre 2024',
      dateSoumission: new Date('2025-01-29'),
      photos: [
    
      ]
    }
  ];

  newAvis = {
    utilisateur: '',
    note: 0,
    commentaire: ''
  };

  constructor(private evaluationService: EvaluationService) {
    this.fetchEvaluation(); // Charger les avis au démarrage
  }

  // Charger l'évaluation existante (avec avis)
  fetchEvaluation() {
    this.evaluationService.getEvaluation().subscribe({
      next: (res: any) => {
        this.evaluation = res;
        this.avisList = res.avis || [];
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération de l\'évaluation:', err);
      }
    });
  }

  submitAvis() {
    if (!this.newAvis.commentaire.trim() || this.newAvis.note < 1 || this.newAvis.note > 5) {
      this.errorMessage = 'Veuillez sélectionner une note (1-5) et ajouter un commentaire.';
      this.successMessage = '';
      return;
    }

    this.evaluationService.addAvis(this.newAvis).subscribe({
      next: (res: any) => {
        this.evaluation = res;
        this.avisList = res.avis || []; // <-- Mise à jour des avis
        this.newAvis = { utilisateur: '', note: 0, commentaire: '' };
        this.successMessage = 'Votre avis a été enregistré avec succès !';
        this.errorMessage = '';
        this.hovered = 0;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Erreur lors de l\'enregistrement de l\'avis.';
        this.successMessage = '';
        console.error('Erreur:', err);
      }
    });
  }
}
