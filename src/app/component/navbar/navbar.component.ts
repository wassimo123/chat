import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() shadow: boolean = false;
  isMobileMenuOpen: boolean = false;
  isEtablissementsOpen: boolean = false;
   // ✅ Ces deux lignes étaient manquantes
   lastScrollTop: number = 0;
   isNavbarVisible: boolean = true;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Close sub-menu if mobile menu is closed
    if (!this.isMobileMenuOpen) {
      this.isEtablissementsOpen = false;
    }
  }

  toggleEtablissementsDropdown(): void {
    this.isEtablissementsOpen = !this.isEtablissementsOpen;
  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.lastScrollTop && currentScroll > 100) {
      this.isNavbarVisible = false; // scroll vers le bas
    } else {
      this.isNavbarVisible = true; // scroll vers le haut
    }

    this.lastScrollTop = Math.max(0, currentScroll);
  }
}
