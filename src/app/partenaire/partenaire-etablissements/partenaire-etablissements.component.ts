import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EtablissementService } from '../../services/etablissement.service'; // Import the service
import { Etablissement } from 'src/app/models/etablissement.model';


interface PricingPlan {
  name: string;
  duration: string;
  price: number;
  impressions: string;
  adsPerWeek: string;
  support: string;
}

interface PendingRequest {
  establishment: any;
  plan: PricingPlan;
  timestamp: Date;
}
@Component({
  selector: 'app-partenaire-etablissements',
  templateUrl: './partenaire-etablissements.component.html',
  styleUrls: ['./partenaire-etablissements.component.css']
})
export class PartenaireEtablissementsComponent implements OnInit {
  establishmentForm: FormGroup;
  selectedPlan: any;
  paymentForm: FormGroup;
  showPricingModal: boolean = false;
  showValidationDialog: boolean = false;
  showConfirmationDialog: boolean = false;
  pendingConfirmation: boolean = false;
  pendingRequests: PendingRequest[] = [];
  userId: string | null = null;

  pricingPlans: PricingPlan[] = [
    { name: 'Basique', duration: '1 Mois', price: 50, impressions: '1000 impressions', adsPerWeek: '1 annonce/semaine', support: 'Support par email' },
    { name: 'Standard', duration: '3 Mois', price: 120, impressions: '3000 impressions', adsPerWeek: '3 annonces/semaine', support: 'Support par email + chat' },
    { name: 'Premium', duration: '6 Mois', price: 200, impressions: '6000 impressions', adsPerWeek: '5 annonces/semaine', support: 'Support prioritaire 24/7' }
  ];
  servicesOptions: string[] = [
    'WiFi gratuit', 'Parking', 'Terrasse', 'Livraison', 'À emporter', 'Réservation',
    'Accessibilité PMR', 'Climatisation', 'Piscine', 'Petit-déjeuner inclus',
    'Paiement par carte', 'Service de chambre'
  ];
  photosPreview: string[] = [];
  partenaireId: any;
  user: any = null;
  isProfileMenuOpen: boolean = false;
  jours: string[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  currentEtablissement: any;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private etablissementService: EtablissementService // Inject the service
  ) {
    // Establishment Form with updated validators
    this.establishmentForm = this.fb.group({
      establishmentName: ['', Validators.required],
      establishmentType: ['', Validators.required],
      statut: ['En attente'], // Default to "En attente"
      visibility: ['public'], // Default to "public"
      address: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      city: ['', Validators.required],
      country: ['Tunisie'],
      showMap: [false],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', Validators.pattern(/^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/)],
      description: [''],
      services: this.fb.array(this.servicesOptions.map(() => this.fb.control(false))),
      socialMedia: this.fb.group({
        facebook: ['', Validators.pattern(/^https:\/\/(www\.)?facebook\.com\/.*/)],
        instagram: ['', Validators.pattern(/^https:\/\/(www\.)?instagram\.com\/.*/)],
        twitter: ['', Validators.pattern(/^https:\/\/(www\.)?twitter\.com\/.*/)],
        linkedin: ['', Validators.pattern(/^https:\/\/(www\.)?linkedin\.com\/.*/)]
      }),
      photos: this.fb.array([])
    });

    // Payment Form
    this.paymentForm = this.fb.group({
      paymentMethod: ['card'],
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardExpiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    // Initialize currentEtablissement
    this.currentEtablissement = {
      horaires: {
        is24_7: false,
        specialHours: '',
        lundi: { open: '', close: '', closed: false },
        mardi: { open: '', close: '', closed: false },
        mercredi: { open: '', close: '', closed: false },
        jeudi: { open: '', close: '', closed: false },
        vendredi: { open: '', close: '', closed: false },
        samedi: { open: '', close: '', closed: false },
        dimanche: { open: '', close: '', closed: false }
      },
        };
  }

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    const storedId = localStorage.getItem('userid');
    if (storedId) {
      console.log('ID partenaire trouvé:', storedId);
      this.partenaireId = storedId;
    } else {
      console.warn('Aucun ID partenaire trouvé.');
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

  // Getter for services controls
  get servicesControls(): FormControl[] {
    return (this.establishmentForm.get('services') as FormArray).controls as FormControl[];
  }

  // Getter for photos
  get photos(): FormArray {
    return this.establishmentForm.get('photos') as FormArray;
  }

  resetForm(): void {
    this.establishmentForm.reset();
    this.photosPreview = []; // Clear photo previews
    this.currentEtablissement.photos = []; // Clear photos array
    this.establishmentForm.reset({
      establishmentName: '',
      establishmentType: '',
      statut: 'En attente',
      visibility: 'public',
      address: '',
      postalCode: '',
      city: '',
      country: 'Tunisie',
      showMap: false,
      phone: '',
      email: '',
      website: '',
      description: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    });
    this.servicesControls.forEach(control => control.setValue(false));
    while (this.photos.length) {
      this.photos.removeAt(0);
    }
    this.photosPreview = [];
    this.currentEtablissement.horaires = {
      is24_7: false,
      specialHours: '',
      lundi: { open: '', close: '', closed: false },
      mardi: { open: '', close: '', closed: false },
      mercredi: { open: '', close: '', closed: false },
      jeudi: { open: '', close: '', closed: false },
      vendredi: { open: '', close: '', closed: false },
      samedi: { open: '', close: '', closed: false },
      dimanche: { open: '', close: '', closed: false }
    };
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
  
      // Ensure photosPreview array exists
      if (!this.photosPreview) {
        this.photosPreview = [];
      }
  
      // Read the file and convert it to base64
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            // Push the base64 string into the photosPreview array
            this.photosPreview.push(e.target.result as string); // Ensure it's a base64 string
          }
        };
        reader.readAsDataURL(file); // Converts the file to a base64 string
      });
    }
  }
  
  
  
  
  removePhoto(photo: string): void {
    const photoIndex = this.photosPreview.indexOf(photo);
    if (photoIndex !== -1) {
      this.photosPreview.splice(photoIndex, 1); // Remove from photosPreview array
    }
  
    // Also remove it from the FormArray if necessary
    const formPhotoIndex = this.currentEtablissement.photos.indexOf(photo);
    if (formPhotoIndex !== -1) {
      this.currentEtablissement.photos.splice(formPhotoIndex, 1); // Remove from form photos array
    }
  }
  
  
  onSubmitEstablishmentForm(event: Event): void {
    event.preventDefault();
    if (this.establishmentForm.valid) {
      this.showPricingModal = true;
    } else {
      this.establishmentForm.markAllAsTouched();
      this.showValidationDialog = true;
      this.cdr.detectChanges();
    }
  }

  closeValidationDialog(): void {
    this.showValidationDialog = false;
    this.cdr.detectChanges();
  }

  closePricingModal(): void {
    this.showPricingModal = false;
    // Do not reset selectedPlan here to preserve it until submission is complete
  }

  closeConfirmationDialog(): void {
    this.showConfirmationDialog = false;
    this.resetForm();
    this.selectedPlan = null; // Reset selectedPlan only after submission
    this.cdr.detectChanges();
  }

  selectPlan(plan: PricingPlan): void {
    this.selectedPlan = plan;
    this.cdr.detectChanges(); // Ensure UI updates
  }

  confirmSelection(): void {
    if (!this.selectedPlan) {
      this.selectedPlan = this.pricingPlans[0]; // Default to 'Basique' if not selected
    }

    Swal.fire({
      title: 'Confirmer la sélection',
      text: `Vous avez sélectionné le pack ${this.selectedPlan.name} pour ${this.selectedPlan.price} TND. Voulez-vous confirmer ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Non, annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showConfirmationDialog = false;
        this.closePricingModal();
        this.submitFinal();
      }
    });
  }

  submitFinal(): void {
    if (!this.selectedPlan) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un pack avant de continuer.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
  
    const infos = {
      description: this.establishmentForm.value.description || '',
      services: this.servicesOptions.filter((_, i) => this.establishmentForm.value.services[i]),
      socialMedia: {
        facebook: this.establishmentForm.value.socialMedia.facebook || '',
        instagram: this.establishmentForm.value.socialMedia.instagram || '',
        twitter: this.establishmentForm.value.socialMedia.twitter || '',
        linkedin: this.establishmentForm.value.socialMedia.linkedin || ''
      },
      horaires: this.currentEtablissement.horaires,
      telephone: this.establishmentForm.value.phone || '',
      email: this.establishmentForm.value.email || '',
      siteWeb: this.establishmentForm.value.website || '',
      ville: this.establishmentForm.value.city || '',
      pays: this.establishmentForm.value.country || 'Tunisie',
      codePostal: this.establishmentForm.value.postalCode || '',
      showMap: this.establishmentForm.value.showMap || false,
      photos: this.photosPreview // Ensure base64 photos are included here
    };
  
    const data = {
      partenaireId:this.partenaireId, // Hardcoded partenaireId
      nom: this.establishmentForm.value.establishmentName,
      adresse: this.establishmentForm.value.address,
      type: this.establishmentForm.value.establishmentType,
      statut: this.establishmentForm.value.statut || 'En attente',
      visibility: this.establishmentForm.value.visibility || 'public',
      pack: this.selectedPlan.name,
      informations: infos,
      reseauxSociaux: {
        facebook: this.establishmentForm.value.socialMedia.facebook || '',
        instagram: this.establishmentForm.value.socialMedia.instagram || '',
        twitter: this.establishmentForm.value.socialMedia.twitter || '',
        linkedin: this.establishmentForm.value.socialMedia.linkedin || ''
      },
      description: this.establishmentForm.value.description || '',
      services: this.servicesOptions.filter((_, i) => this.establishmentForm.value.services[i]),
      horaires: this.currentEtablissement.horaires,
      photos: this.photosPreview, // Ensure photos are correctly passed
      showMap: this.establishmentForm.value.showMap,
      telephone: this.establishmentForm.value.phone,
      email: this.establishmentForm.value.email,
      siteWeb: this.establishmentForm.value.website,
      ville: this.establishmentForm.value.city,
      pays: this.establishmentForm.value.country,
      codePostal: this.establishmentForm.value.postalCode
    };
  
    // First, call the Etablissement API to add the establishment
    this.etablissementService.addEtablissement(data).subscribe({
      next: (response) => {
        console.log("data",data);
        // Show success for establishment creation
        Swal.fire({
          icon: 'success',
          title: 'Établissement ajouté',
          text: 'Votre établissement a été ajouté avec succès.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.resetForm();
        });
  
        // Now call the Publicite API to add the advertisement
        const publicitéData = {
          etablissementId: response.id, // The new establishment's ID from the response
          utilisateurId: this.partenaireId, // The partenaire's ID
          description: this.establishmentForm.value.description || 'Publicité pour l\'établissement',
          pack: this.selectedPlan.name // The selected pack for the establishment
        };
  
        this.etablissementService.addPublicite(publicitéData).subscribe({
          next: (pubResponse) => {
            Swal.fire({
              icon: 'success',
              title: 'Publicité ajoutée',
              text: 'La publicité pour votre établissement a été ajoutée avec succès.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#3085d6'
            });
          },
          error: (pubError) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur est survenue lors de l\'ajout de la publicité.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#d33'
            });
          }
        });
  
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'ajout de l\'établissement.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  
  
  
  onSubmitPaymentForm(event: Event): void {
    event.preventDefault();
    if (this.paymentForm.valid || this.paymentForm.get('paymentMethod')?.value !== 'card') {
      this.submitFinal();
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
  
      if (!this.currentEtablissement.photos) {
        this.currentEtablissement.photos = [];
      }
  
      files.forEach(file => {
        this.currentEtablissement.photos.push(file); // Garde le fichier brut
      });
    }
  }
  
    resolvePhotoUrl(photo: string | File): string {
      if (photo instanceof File) {
        return URL.createObjectURL(photo);
      }
      return photo;
    }

    deletePhoto(photo: string | File): void {
      const index = this.currentEtablissement.photos.indexOf(photo);
      if (index !== -1) {
        this.currentEtablissement.photos.splice(index, 1);
      }
    }
}