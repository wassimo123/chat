import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../component/footer/footer.component';
import { NavbarComponent } from '../component/navbar/navbar.component';
import * as AOS from 'aos';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-histoire',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './histoire.component.html',
  styleUrls: ['./histoire.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HistoireComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      offset: 100,
      once: true,
      mirror: false
    });
  }

  navigateToHeritage(id: string): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top before navigating
    setTimeout(() => {
      this.router.navigate(['/heritage', id]);
    }, 200); // Delay navigation to allow the scroll and animation to start
  }
}