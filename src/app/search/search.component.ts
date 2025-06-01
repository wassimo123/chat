import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  query: string = '';
  results: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  totalResults: number = 0;
  limit: number = 9;
  filterType: string = 'all';
  sortOption: string = 'relevance';
  searchSubject = new Subject<string>();
  suggestions: string[] = [];
  showSuggestions: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.query = query;
      this.currentPage = 1;
      this.fetchSuggestions(query);
      this.performSearch();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.currentPage = parseInt(params['page']) || 1;
      this.filterType = params['type'] || 'all';
      this.sortOption = params['sort'] || 'relevance';
      if (this.query) {
        this.performSearch();
        this.fetchSuggestions(this.query);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  fetchSuggestions(query: string): void {
    if (query.length < 2) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.searchService.getSuggestions(query).subscribe({
      next: (response) => {
        this.suggestions = response.suggestions || [];
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: (err) => {
        console.error('Error fetching suggestions:', err);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  getDetailsLink(result: any): string {
    if (result.type === 'Promotion') {
      return `/promotion/${result.id}`;
    } else if (result.type === 'Événement') {
      return `/evenement/${result.id}`;
    } else if (['Hôtel', 'Café', 'Restaurant'].includes(result.type)) {
      return `/etablissements/${result.type.toLowerCase()}/${result.id}`;
    } else {
      return '/'; // Fallback si le type n'est pas reconnu
    }
  }
  

  selectSuggestion(suggestion: string): void {
    this.query = suggestion;
    this.showSuggestions = false;
    this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.results = [];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.query,
        page: this.currentPage,
        type: this.filterType,
        sort: this.sortOption
      },
      queryParamsHandling: 'merge'
    });

    this.searchService.search(this.query, this.currentPage, this.limit, this.filterType, this.sortOption).subscribe({
      next: (response) => {
        this.results = response.results || [];
        this.totalResults = response.totalResults || 0;
        this.currentPage = response.currentPage || 1;
        this.totalPages = response.totalPages || 1;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors de la recherche.';
        this.isLoading = false;
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.performSearch();
    }
  }

  setFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.filterType = target.value;
      this.currentPage = 1;
      this.performSearch();
    }
  }

  setSort(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortOption = target.value;
      this.currentPage = 1;
      this.performSearch();
    }
  }
}