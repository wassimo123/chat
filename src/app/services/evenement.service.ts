import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Evenement } from '../models/evenement.model';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private evenements: Evenement[] = [
    {
      id: '1',
      nom: 'Soirée Dégustation de Vins',
      date: '2025-04-15',
      heureDebut: '19:00',
      heureFin: '22:00',
      lieu: 'Cave Saint-Michel',
      ville: 'Paris, France',
      capacite: 100,
      participants: 86,
      categorie: 'Gastronomie',
      organisateur: 'Restaurant Le Gourmet',
      description: '',
      estPublic: true,
      statut: 'À venir'
    },
    {
      id: '2',
      nom: 'Festival de Jazz',
      date: '2025-05-20',
      heureDebut: '00:00',
      heureFin: '23:59',
      lieu: 'Parc des Expositions',
      ville: 'Lyon, France',
      capacite: 500,
      participants: 245,
      categorie: 'Musique',
      organisateur: 'Association Musicale',
      description: '',
      estPublic: true,
      statut: 'À venir'
    },
    {
      id: '3',
      nom: 'Salon du Livre',
      date: '2025-04-06',
      heureDebut: '10:00',
      heureFin: '18:00',
      lieu: 'Centre des Congrès',
      ville: 'Marseille, France',
      capacite: 200,
      participants: 112,
      categorie: 'Littérature',
      organisateur: 'Bibliothèque Nationale',
      description: '',
      estPublic: true,
      statut: 'En cours'
    },
    {
      id: '4',
      nom: 'Fête de la Gastronomie',
      date: '2025-03-12',
      heureDebut: '11:00',
      heureFin: '23:00',
      lieu: 'Place des Quinconces',
      ville: 'Bordeaux, France',
      capacite: 400,
      participants: 325,
      categorie: 'Gastronomie',
      organisateur: 'Mairie de Bordeaux',
      description: '',
      estPublic: true,
      statut: 'Terminé'
    },
    {
      id: '5',
      nom: 'Festival du Film',
      date: '2025-02-02',
      heureDebut: '14:00',
      heureFin: '23:00',
      lieu: 'Cinéma Lumière',
      ville: 'Nice, France',
      capacite: 200,
      participants: 178,
      categorie: 'Cinéma',
      organisateur: 'Cinéma Lumière',
      description: '',
      estPublic: true,
      statut: 'Terminé'
    }
  ];

  getEvenements(): Observable<Evenement[]> {
    return of(this.evenements);
  }

  addEvenement(evenement: Evenement): Observable<Evenement> {
    const newEvenement = { ...evenement, id: Math.random().toString(36).substr(2, 9) };
    this.evenements.push(newEvenement);
    return of(newEvenement);
  }

  updateEvenement(id: string, evenement: Evenement): Observable<Evenement> {
    const index = this.evenements.findIndex(e => e.id === id);
    if (index !== -1) {
      this.evenements[index] = { ...evenement, id };
      return of(this.evenements[index]);
    }
    throw new Error('Événement non trouvé');
  }

  deleteEvenement(id: string): Observable<void> {
    this.evenements = this.evenements.filter(e => e.id !== id);
    return of();
  }
}