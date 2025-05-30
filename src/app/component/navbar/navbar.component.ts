import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() shadow: boolean = false;
  isMobileMenuOpen: boolean = false;
  isEtablissementsOpen: boolean = false;
  lastScrollTop: number = 0;
  isNavbarVisible: boolean = true;
  searchQuery: string = '';

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.isEtablissementsOpen = false;
    }
  }

  toggleEtablissementsDropdown(): void {
    this.isEtablissementsOpen = !this.isEtablissementsOpen;
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = ''; // Clear input
      this.isMobileMenuOpen = false; // Close mobile menu
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.lastScrollTop && currentScroll > 100) {
      this.isNavbarVisible = false;
    } else {
      this.isNavbarVisible = true;
    }

    this.lastScrollTop = Math.max(0, currentScroll);
  }
}