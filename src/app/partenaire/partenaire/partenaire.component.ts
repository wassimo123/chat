import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-partenaire',
  templateUrl: './partenaire.component.html',
  styleUrls: ['./partenaire.component.css']
})
export class PartenaireComponent implements OnInit {
  showDialog: boolean = false; // Flag to control dialog visibility
  showWelcome: boolean = true; // Flag to control welcome overlay visibility


  user: any = null;
  isProfileMenuOpen: boolean = false;


  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.showWelcome = false;
    }, 3000);

    // Récupérer les informations de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  toggleProfile() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#profileButton') && !target.closest('#profileMenu')) {
      this.isProfileMenuOpen = false;
    }
  }
  openDialog(): void {
    this.showDialog = true; // Show the dialog
  }

  closeDialog(): void {
    this.showDialog = false; // Close the dialog
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }
}