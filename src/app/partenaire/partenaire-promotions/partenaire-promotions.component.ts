import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partenaire-promotions',
  templateUrl: './partenaire-promotions.component.html',
  styleUrls: ['./partenaire-promotions.component.css']
})
export class PartenairePromotionsComponent implements OnInit {
  promotionForm: FormGroup;
  showDialog: boolean = false; // Flag to control success dialog visibility
  showValidationDialog: boolean = false; // Flag to control validation error dialog visibility
  user: any = null;
  isProfileMenuOpen: boolean = false;

  // Data for dropdowns
  establishmentTypes = [
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Hôtel', value: 'hotel' },
    { label: 'Café', value: 'cafe' }
  ];

  establishments = [
    { label: 'Restaurant Le Bon Goût', value: 'restaurant-le-bon-gout' },
    { label: 'Hôtel Sfax', value: 'hotel-sfax' },
    { label: 'Café Central', value: 'cafe-central' }
  ];

  promotionTypes = [
    { label: 'Pourcentage de réduction', value: 'percentage' },
    { label: 'Montant fixe', value: 'fixed' },
    { label: 'Offre spéciale', value: 'special' }
  ];

  statuses = [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' },
    { label: 'En attente', value: 'pending' }
  ];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {
    this.promotionForm = this.fb.group({
      promotionName: ['', Validators.required],
      establishmentType: ['', Validators.required],
      establishmentName: ['', Validators.required],
      promotionType: ['', Validators.required],
      promotionValue: ['', Validators.required],
      promoCode: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      usageLimit: [''],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/connexion']);
  }

  onSubmitPromotionForm(event: Event): void {
    event.preventDefault();
    if (this.promotionForm.valid) {
      console.log('Promotion Form Submitted:', this.promotionForm.value);
      this.showDialog = true; // Show the success dialog
      this.promotionForm.reset();
    } else {
      console.log('Form invalid, showing validation dialog');
      this.promotionForm.markAllAsTouched();
      this.showValidationDialog = true;
      this.cdr.detectChanges();
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.cdr.detectChanges();
  }

  closeValidationDialog(): void {
    this.showValidationDialog = false;
    this.cdr.detectChanges();
  }
}