import {
  Component,
  OnInit
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  EvaluationService
} from '../../services/evaluation.service';
import {
  NavbarComponent
} from 'src/app/component/navbar/navbar.component';
import {
  FooterComponent
} from 'src/app/component/footer/footer.component';
import {
  Router
} from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-temoignages',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './temoignages.component.html',
  styleUrls: ['./temoignages.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TemoignagesComponent implements OnInit {
  avisList: any[] = [];
  filteredAvisList: any[] = [];
  currentPage: number = 1;
  avisParPage: number = 9;
  selectedNoteFilter: string = 'all';

  constructor(private evaluationService: EvaluationService, private router: Router) {}

  ngOnInit(): void {
    this.evaluationService.getEvaluation().subscribe({
      next: (res) => {
        this.avisList = (res.avis || []).map((avis: any) => ({
          ...avis,
          dateSoumission: avis.dateSoumission ? new Date(avis.dateSoumission) : new Date()
        }))
        .reverse();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur chargement avis:', err);
      }
    });
  }

  applyFilters(): void {
    let filteredList = [...this.avisList];

    // Filter by rating
    if (this.selectedNoteFilter !== 'all') {
      filteredList = filteredList.filter(avis => 
        avis.note === parseInt(this.selectedNoteFilter)
      );
    }

    this.filteredAvisList = filteredList;
    this.currentPage = 1; // Reset to first page after filtering
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAvisList.length / this.avisParPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  paginatedAvis(): any[] {
    const start = (this.currentPage - 1) * this.avisParPage;
    return this.filteredAvisList.slice(start, start + this.avisParPage);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}