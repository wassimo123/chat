import { Component, OnInit, ChangeDetectorRef, HostListener,NgZone , ViewChild, ElementRef} from '@angular/core';
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
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  
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
    private etablissementService: EtablissementService,
    private ngZone: NgZone
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
      photos: [] as (string | File)[]
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
  
    // Réinitialiser les services
    this.servicesControls.forEach(control => control.setValue(false));
  
    // Révoquer et vider les URLs des photos
    this.photosPreview.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.photosPreview = [];
  
    // Vider les photos de currentEtablissement et révoquer les blobs
    if (this.currentEtablissement.photos) {
      this.currentEtablissement.photos.forEach((photo: string | File) => {
        if (photo instanceof File && this.photoBlobUrls.has(photo)) {
          URL.revokeObjectURL(this.photoBlobUrls.get(photo)!);
          this.photoBlobUrls.delete(photo);
        }
      });
      this.currentEtablissement.photos = [];
    }
  
    // Réinitialiser l'input fichier via un sélecteur DOM
    const photoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (photoInput) {
      photoInput.value = '';
      console.log('Input file value reset to:', photoInput.value);
    } else {
      console.warn('photoInput not found in DOM during resetForm');
    }
  
    // Réinitialiser les horaires
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
  
    // Forcer la détection de changement
    this.cdr.detectChanges();
  }
  
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
  
    const files = Array.from(input.files);
  
    //  On s'assure que l'objet currentEtablissement et le tableau photos existent
    if (!this.currentEtablissement) {
      this.currentEtablissement = {};
    }
  
    if (!this.currentEtablissement.photos) {
      this.currentEtablissement.photos = [];
    }
  
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          //  Sécurité assurée ici aussi
          if (!this.currentEtablissement.photos) {
            this.currentEtablissement.photos = [];
          }
          this.currentEtablissement.photos.push(file); // fichier brut, pas base64
        }
      };
      reader.readAsDataURL(file);
    });
  }
  
  
  removePhoto(photoUrl: string) {
    this.photosPreview = this.photosPreview.filter(p => p !== photoUrl);
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
      if (!this.pricingPlans || this.pricingPlans.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Aucun pack disponible. Veuillez contacter le support.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        });
        return;
      }
      this.selectedPlan = this.pricingPlans[0];
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
        this.closePricingModal();
        this.submitFinal().then(() => {
          this.selectedPlan = null;
          // Delay resetForm to ensure the view is stable
          setTimeout(() => {
            this.resetForm();
          }, 0);
        }).catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
          });
          console.error('Submission error:', error);
        });
      }
    });
  }
 
  submitFinal(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.selectedPlan) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Veuillez sélectionner un pack avant de continuer.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        });
        reject(new Error('No plan selected'));
        return;
      }
  
      const etablissementData: Etablissement = {
        nom: this.establishmentForm.value.establishmentName,
        adresse: this.establishmentForm.value.address,
        type: this.establishmentForm.value.establishmentType,
        statut: this.establishmentForm.value.statut || 'En attente',
        visibility: this.establishmentForm.value.visibility || 'public',
        codePostal: this.establishmentForm.value.postalCode,
        ville: this.establishmentForm.value.city,
        pays: this.establishmentForm.value.country,
        showMap: this.establishmentForm.value.showMap,
        telephone: this.establishmentForm.value.phone,
        email: this.establishmentForm.value.email,
        siteWeb: this.establishmentForm.value.website,
        description: this.establishmentForm.value.description || '',
        services: this.servicesOptions.filter((_, i) => this.establishmentForm.value.services[i]),
        reseauxSociaux: {
          facebook: this.establishmentForm.value.socialMedia.facebook || '',
          instagram: this.establishmentForm.value.socialMedia.instagram || '',
          twitter: this.establishmentForm.value.socialMedia.twitter || '',
          linkedin: this.establishmentForm.value.socialMedia.linkedin || ''
        },
        horaires: this.currentEtablissement.horaires,
        photos: this.currentEtablissement.photos
      };
  
      this.etablissementService.addEtablissement(etablissementData).subscribe({
        next: (response) => {
          const publicitéData = {
            etablissementId: response.id,
            utilisateurId: this.partenaireId,
            description: this.establishmentForm.value.description || 'Publicité pour l\'établissement',
            pack: this.selectedPlan.name
          };
  
          this.etablissementService.addPublicite(publicitéData).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Publicité ajoutée',
                text: 'La publicité a été créée avec succès.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
              });
  
              this.pendingRequests.push({
                establishment: {
                  establishmentName: this.establishmentForm.value.establishmentName,
                  establishmentType: this.establishmentForm.value.establishmentType
                },
                plan: this.selectedPlan,
                timestamp: new Date()
              });
              this.pendingConfirmation = true;
  
              Swal.fire({
                icon: 'success',
                title: 'Établissement ajouté',
                text: 'Votre établissement a été ajouté avec succès.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
              });
  
              resolve(); // Resolve the promise on success
            },
            error: (pubError) => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l’ajout de la publicité.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
              });
              reject(pubError);
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
          reject(err);
        }
      });
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

 
  onPhotoSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
  
    if (!files || files.length === 0) return;
  
    if (!this.currentEtablissement.photos) {
      this.currentEtablissement.photos = [];
    }
  
    const newPreviews: string[] = [];
    let filesProcessed = 0;
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.currentEtablissement.photos.push(file);
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        newPreviews.push(e.target.result);
        filesProcessed++;
  
        // Quand tous les fichiers sont lus, mettre à jour photosPreview
        if (filesProcessed === files.length) {
          this.ngZone.run(() => {
            this.photosPreview = [...this.photosPreview, ...newPreviews];
            this.cdr.detectChanges(); // Forcer la détection de changement
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  
    photoBlobUrls = new Map<File, string>();
   

    resolvePhotoUrl(photo: string | File): string {
      if (typeof photo === 'string') {
        return 'http://localhost:5000/uploads/' + photo;
      } else {
        let blobUrl = this.photoBlobUrls.get(photo);
        if (!blobUrl) {
          blobUrl = URL.createObjectURL(photo);
          this.photoBlobUrls.set(photo, blobUrl);
        }
        return blobUrl;
      }
    }
   
    deletePhoto(photo: string | File) {
      if (!this.currentEtablissement.photos) this.currentEtablissement.photos = [];
      if (!this.photosPreview) this.photosPreview = [];
    
      this.currentEtablissement.photos = this.currentEtablissement.photos.filter((p: string | File) => p !== photo);
    
      if (photo instanceof File) {
        const blobUrl = this.photoBlobUrls.get(photo);
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          this.photoBlobUrls.delete(photo);
          this.photosPreview = this.photosPreview.filter(p => p !== blobUrl);
        }
      } else {
        this.photosPreview = this.photosPreview.filter(p => p !== photo);
      }
    
      this.cdr.detectChanges();
    }
}