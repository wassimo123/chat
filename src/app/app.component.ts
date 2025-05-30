import { Component, OnInit} from '@angular/core';
import * as AOS from 'aos';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  title = 'site_sfax';
  constructor(private router: Router) {} 
  ngOnInit(): void {
    AOS.init({
      duration: 1000, // Durée de l'animation en millisecondes
      easing: 'ease-in-out', // Type d'animation
      once: true // L'animation se déclenche une seule fois par élément
    });
     this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }
  
}
