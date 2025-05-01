import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PubliciteService } from 'src/app/services/publicite.service';
import jsPDF from 'jspdf';

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
  paymentForm: FormGroup;
  showPricingModal: boolean = false;
  showValidationDialog: boolean = false;
  pendingConfirmation: boolean = false;
  pendingRequests: PendingRequest[] = [];
  pricingPlans: PricingPlan[] = [
    { name: 'Basique', duration: '1 Mois', price: 50, impressions: '1000 impressions', adsPerWeek: '1 annonce/semaine', support: 'Support par email' },
    { name: 'Standard', duration: '3 Mois', price: 120, impressions: '3000 impressions', adsPerWeek: '3 annonces/semaine', support: 'Support par email + chat' },
    { name: 'Premium', duration: '6 Mois', price: 200, impressions: '6000 impressions', adsPerWeek: '5 annonces/semaine', support: 'Support prioritaire 24/7' }
  ];
  selectedPlan: PricingPlan | null = null;
  servicesOptions: string[] = ['Wi-Fi', 'Parking', 'Piscine', 'Petit-déjeuner inclus', 'Climatisation', 'Accès handicapés'];
  partenaireId: any;
  user: any = null;
  isProfileMenuOpen: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef, 
    private publiciteService: PubliciteService, 
    private router: Router
  ) {
    // Establishment Form
    this.establishmentForm = this.fb.group({
      establishmentName: ['', Validators.required],
      establishmentType: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4,5}$/)]],
      city: ['', Validators.required],
      country: ['', Validators.required],
      mapsUrl: ['', [Validators.required, Validators.pattern(/^https:\/\/(www\.)?google\.com\/maps\/.*/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', Validators.pattern(/^https:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i)],
      description: [''],
      services: this.fb.array(this.servicesOptions.map(() => this.fb.control(false))),
      openingHours: this.fb.array([
        this.fb.group({ day: ['Lundi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Mardi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Mercredi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Jeudi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Vendredi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Samedi'], openTime: [''], closeTime: [''] }),
        this.fb.group({ day: ['Dimanche'], openTime: [''], closeTime: [''] })
      ]),
      specialHours: this.fb.array([]),
      socialMedia: this.fb.group({
        facebook: ['', Validators.pattern(/^https:\/\/(www\.)?facebook\.com\/.*/)],
        instagram: ['', Validators.pattern(/^https:\/\/(www\.)?instagram\.com\/.*/)],
        twitter: ['', Validators.pattern(/^https:\/\/(www\.)?twitter\.com\/.*/)],
        linkedin: ['', Validators.pattern(/^https:\/\/(www\.)?linkedin\.com\/.*/)]
      }),
      photos: [null, Validators.required]
    });

    // Payment Form
    this.paymentForm = this.fb.group({
      paymentMethod: ['card'],
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardExpiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    const storedId = localStorage.getItem('userId');
    if (storedId) {
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

  // Getter for opening hours
  get openingHours(): FormArray {
    return this.establishmentForm.get('openingHours') as FormArray;
  }

  // Getter for special hours
  get specialHours(): FormArray {
    return this.establishmentForm.get('specialHours') as FormArray;
  }

  addSpecialHour(): void {
    this.specialHours.push(this.fb.group({
      date: ['', Validators.required],
      openTime: [''],
      closeTime: ['']
    }));
  }

  removeSpecialHour(index: number): void {
    this.specialHours.removeAt(index);
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.establishmentForm.patchValue({ photos: input.files[0] });
    }
  }

  onSubmitEstablishmentForm(event: Event): void {
    event.preventDefault();
    console.log('Form validity:', this.establishmentForm.valid);
    console.log('Form errors:', this.establishmentForm.errors);
    if (this.establishmentForm.valid) {
      console.log('Establishment Form Submitted:', this.establishmentForm.value);
      this.showPricingModal = true;
    } else {
      console.log('Form invalid, showing validation dialog');
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
    this.selectedPlan = null;
  }

  selectPlan(plan: PricingPlan): void {
    this.selectedPlan = plan;
    this.generateInvoicePDF(plan);
  }

  submitFinal(): void {
    if (!this.selectedPlan) {
      alert("Veuillez sélectionner un pack avant de continuer.");
      return;
    }

    const infos = {
      description: this.establishmentForm.value.description,
      services: this.servicesOptions.filter((_, i) => this.establishmentForm.value.services[i]),
      socialMedia: this.establishmentForm.value.socialMedia,
      horaires: {
        opening: this.establishmentForm.value.openingHours,
        special: this.establishmentForm.value.specialHours,
      },
      telephone: this.establishmentForm.value.phone,
      email: this.establishmentForm.value.email,
      siteWeb: this.establishmentForm.value.website,
      ville: this.establishmentForm.value.city,
      pays: this.establishmentForm.value.country,
      codePostal: this.establishmentForm.value.postalCode,
      showMap: true
    };

    const data = {
      partenaireId: this.partenaireId,
      nom: this.establishmentForm.value.establishmentName,
      adresse: this.establishmentForm.value.address,
      type: this.establishmentForm.value.establishmentType,
      pack: this.selectedPlan.name,
      informations: infos
    };

    this.publiciteService.submitPublicite(data).subscribe({
      next: () => {
        this.pendingConfirmation = true;
        this.pendingRequests.push({
          establishment: this.establishmentForm.value,
          plan: this.selectedPlan!,
          timestamp: new Date()
        });
        this.closePricingModal();
        this.establishmentForm.reset();
      },
      error: err => {
        console.error('Erreur d\'envoi:', err);
        alert("Erreur lors de la soumission.");
      }
    });
  }

  onSubmitPaymentForm(event: Event): void {
    event.preventDefault();
    if (this.paymentForm.valid || this.paymentForm.get('paymentMethod')?.value !== 'card') {
      console.log('Payment Form Submitted:', this.paymentForm.value, 'Selected Plan:', this.selectedPlan);
      this.pendingConfirmation = true;
      this.pendingRequests.push({
        establishment: this.establishmentForm.value,
        plan: this.selectedPlan!,
        timestamp: new Date()
      });
      this.closePricingModal();
      this.establishmentForm.reset();
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  generateInvoicePDF(plan: PricingPlan): void {
    const doc = new jsPDF();
    const data = this.establishmentForm.value;

    // Couleurs
    const primaryColor = '#1e1b4b';
    const secondaryColor = '#f43f5e';

    // Header: logo fictif + titre
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Sfax - Facture Publicitaire', 105, 18, { align: 'center' });

    // Cadre client
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setDrawColor(200);
    doc.rect(10, 40, 190, 40);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, 15, 48);
    doc.text(`Établissement : ${data.establishmentName}`, 15, 56);
    doc.text(`Adresse : ${data.address}, ${data.postalCode}, ${data.city}, ${data.country}`, 15, 64);
    doc.text(`Téléphone : ${data.phone}`, 15, 72);
    doc.text(`Email : ${data.email}`, 115, 72);

    // Ligne de séparation
    doc.setDrawColor(100);
    doc.line(10, 90, 200, 90);

    // Détails du pack
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Détails du Pack Choisi', 15, 100);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pack : ${plan.name}`, 15, 110);
    doc.text(`Durée : ${plan.duration}`, 15, 118);
    doc.text(`Prix : ${plan.price} TND`, 15, 126);
    doc.text(`Impressions : ${plan.impressions}`, 15, 134);
    doc.text(`Annonces : ${plan.adsPerWeek}`, 15, 142);
    doc.text(`Support : ${plan.support}`, 15, 150);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100); // Correction ici : dociteralColor -> setTextColor
    doc.text('Merci pour votre confiance !', 105, 280, { align: 'center' });

    const safeName = data.establishmentName.replace(/\s+/g, '_');
    const filename = `facture_${safeName}_${plan.name}.pdf`;
    doc.save(filename);
  }
}