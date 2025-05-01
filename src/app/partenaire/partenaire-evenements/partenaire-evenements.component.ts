import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partenaire-evenements',
  templateUrl: './partenaire-evenements.component.html',
  styleUrls: ['./partenaire-evenements.component.css']
})
export class PartenaireEvenementsComponent implements OnInit {
  eventForm: FormGroup;
  showDialog: boolean = false; // Flag to control success dialog visibility
  showValidationDialog: boolean = false; // Flag to control validation error dialog visibility
  user: any = null;
  isProfileMenuOpen: boolean = false;

  // Categories for the dropdown
  categories = [
    { label: 'Concert', value: 'concert' },
    { label: 'Exposition', value: 'exposition' },
    { label: 'Atelier', value: 'atelier' },
    { label: 'Conférence', value: 'conference' }
  ];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: [''],
      location: ['', Validators.required],
      city: ['', Validators.required],
      maxCapacity: ['', [Validators.required, Validators.min(1)]],
      category: ['', Validators.required]
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

  onSubmitEventForm(event: Event): void {
    event.preventDefault();
    if (this.eventForm.valid) {
      console.log('Event Form Submitted:', this.eventForm.value);
      this.showDialog = true; // Show the success dialog
      this.eventForm.reset();
    } else {
      console.log('Form invalid, showing validation dialog');
      this.eventForm.markAllAsTouched();
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