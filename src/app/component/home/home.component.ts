import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { EvaluationService } from '../../services/evaluation.service';
import { Router } from '@angular/router';
import { trigger,transition,style, animate} from '@angular/animations';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
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

export class HomeComponent {

  
  images: string[] = [
    'assets/images/ville1.jpg',
    'assets/images/ville2.jpg',
    'assets/images/ville3.jpg',
    'assets/images/ville4.jpg',
   
  ];
  
  currentIndex: number = 0;
  
  ngOnInit() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 4000); // toutes les 10 secondes par exemple
  }
  
///////////////
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

  constructor(private evaluationService: EvaluationService,private router: Router) {
    this.fetchEvaluation(); // Charger les avis au démarrage
  }

 goToTemoignages() {
  this.router.navigate(['/temoignages']);
}

  // Charger l'évaluation existante (avec avis)
  fetchEvaluation() {
    this.evaluationService.getEvaluation().subscribe({
      next: (res: any) => {
        this.evaluation = res;
        this.avisList = (res.avis || []).map((avis: any) => ({
          ...avis,
          dateSoumission: new Date() // ajoute une date locale simulée
        }));
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
  
    // Ajouter la date locale temporaire avant l'envoi
    const avisAvecDate = {
      ...this.newAvis,
      dateSoumission: new Date()  // Ajoute la date locale
    };
  
    this.evaluationService.addAvis(this.newAvis).subscribe({
      next: (res: any) => {
        this.evaluation = res;
        this.avisList = (res.avis || []).map((avis: any) => ({
          ...avis,
          dateSoumission: avis.dateSoumission || new Date()  // injecte une date si absente
        }));
  
        // Réinitialiser le formulaire
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
