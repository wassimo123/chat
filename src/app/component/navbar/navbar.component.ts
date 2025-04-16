import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {isMobileMenuOpen: boolean = false;
  isEtablissementsOpen: boolean = false;

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
}