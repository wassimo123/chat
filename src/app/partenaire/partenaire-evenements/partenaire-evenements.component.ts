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
  photoPreview: string | null = null;
  selectedFile: File | null = null;

  // Static list of establishments
  etablissementsType: { _id: string; nom: string }[] = [
    { _id: '1', nom: 'Restaurant Le Gourmet' },
    { _id: '2', nom: 'Hôtel Étoile' },
    { _id: '3', nom: 'Café Central' },
    { _id: '4', nom: 'Sfax Centre' }
  ];

  // Categories for the dropdown
  categories = [
    { label: 'Gastronomie', value: 'Gastronomie' },
    { label: 'Musique', value: 'Musique' },
    { label: 'Littérature', value: 'Littérature' },
    { label: 'Cinéma', value: 'Cinéma' },
    { label: 'Art', value: 'Art' },
    { label: 'Sport', value: 'Sport' },
    { label: 'Conférences', value: 'Conférences' },
    { label: 'Festivals', value: 'Festivals' },
    { label: 'Autre', value: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      nom: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: [''],
      lieu: ['', Validators.required],
      ville: ['', Validators.required],
      capacite: ['', [Validators.required, Validators.min(1)]],
      categorie: ['', Validators.required],
      typeEtablissement: ['', Validators.required],
      establishmentId: ['', Validators.required],
      estGratuit: [false],
      montant: [{ value: 0, disabled: true }, Validators.min(0)],
      organisateur: [''],
      description: [''],
      photo: ['']
    });
  }

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    // Set default values
    this.eventForm.patchValue({
      statut: 'En cours',
      estPublic: true,
      visibility: 'public'
    });

    // Disable montant field when estGratuit is true
    this.eventForm.get('estGratuit')?.valueChanges.subscribe(estGratuit => {
      const montantControl = this.eventForm.get('montant');
      if (estGratuit) {
        montantControl?.disable();
        montantControl?.setValue(0);
      } else {
        montantControl?.enable();
      }
    });
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

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const filetypes = /jpeg|jpg|png|gif/;
      const isValidType = filetypes.test(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValidType) {
        this.showValidationDialog = true;
        this.cdr.detectChanges();
        return;
      }
      if (!isValidSize) {
        this.showValidationDialog = true;
        this.cdr.detectChanges();
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result as string;
        this.eventForm.patchValue({ photo: this.photoPreview });
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        this.showValidationDialog = true;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      input.value = ''; // Reset the input
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    this.eventForm.patchValue({ photo: '' });
    this.cdr.detectChanges();
  }

  handleImageError(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    this.eventForm.patchValue({ photo: '' });
    this.cdr.detectChanges();
  }

  onSubmitEventForm(event: Event): void {
    event.preventDefault();
    if (this.eventForm.valid) {
      const eventData = this.eventForm.value;
      if (!eventData.estGratuit && (!eventData.montant || eventData.montant <= 0)) {
        this.showValidationDialog = true;
        this.cdr.detectChanges();
        return;
      }
      console.log('Event Form Submitted:', {
        ...eventData,
        prix: {
          estGratuit: eventData.estGratuit,
          montant: eventData.montant
        }
      });
      this.showDialog = true; // Show the success dialog
      this.eventForm.reset({
        nom: '',
        dateDebut: '',
        dateFin: '',
        heureDebut: '',
        heureFin: '',
        lieu: '',
        ville: '',
        capacite: '',
        categorie: '',
        typeEtablissement: '',
        establishmentId: '',
        estGratuit: false,
        montant: 0,
        organisateur: '',
        description: '',
        photo: ''
      }, { emitEvent: false });
      this.eventForm.patchValue({
        statut: 'En cours',
        estPublic: true,
        visibility: 'public'
      });
      this.photoPreview = null;
      this.selectedFile = null;
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