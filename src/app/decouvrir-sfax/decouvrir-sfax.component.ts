import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../component/navbar/navbar.component';
import { FooterComponent } from '../component/footer/footer.component';
import * as AOS from 'aos'; // Import AOS
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-decouvrir-sfax',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './decouvrir-sfax.component.html',
  styleUrls: ['./decouvrir-sfax.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class DecouvrirSfaxComponent implements OnInit {
  isVideoModalOpen = false;
  videoUrl: SafeResourceUrl;
  isHeaderShadow = false;
  modalVisible = false;
  modalPhotos: string[] = [];
  modalTitle = '';
  currentIndex = 0;

  constructor(private sanitizer: DomSanitizer) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/ny9TYVKsI2g');
  }

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isHeaderShadow = window.scrollY > 50;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.isVideoModalOpen) {
        this.closeVideoModal();
      }
      if (this.modalVisible) {
        this.fermerModal();
      }
    }
  }

  openVideoModal() {
    this.isVideoModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeVideoModal() {
    this.isVideoModalOpen = false;
    document.body.style.overflow = '';
  }

  galleries = {
    kerkennah: {
      title: 'Les Îles Kerkennah',
      images: [
        'https://guide-voyage-tunisie.com/wp-content/uploads/2022/12/kerkennah11-1024x768.webp',
        'https://zaherkammoun.com/wp-content/uploads/2015/05/Kerkennah-1-3.jpg',
        'https://i0.wp.com/wildly.tn/wp-content/uploads/2020/08/Untitled-design.png?resize=750%2C532&ssl=1',
        'https://image.resabooking.com/images/hotel/le_Grand_Hotel_Kerkennah_7.jpg',
        'https://image.resabooking.com/images/hotel/Grand_Hotel_6.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/0/03/Port_Sidi_Youssef.JPG',
        'https://tunisie.co/uploads/images/content/kerkennah-160416-3.jpg',
        'https://www.webdo.tn/uploads/2021/08/kerk.jpg',
      ]
    },
    darjellouli: {
      title: 'Musée Dar Jellouli',
      images: [
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npbcb9A68v9CbBHeiWWFII5uLBE5TjHLcicdckimnHFShawFcdxvq7l45EhUG51MpPfXs4qxsQ4ss6NCu_qnsr_wQLuqBNq69eA5bhJU23Udr3g6KPZkMZNnzSvNLbA8gcrAJMu=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrtm4r467xaVOSu-pem4JRfUU8o0hZ9izmJ4iZL-Mntx-nfG4JiNRV4u_M9A_1z8eI5L42pF1w7HvUZukmZpmgPR4ihlPbX1Rn7rSSZ1t99CJVANIBbBqSXYRM777GuQCUcB_4cjg=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrDwp9cqus8jInLqYrY4v-yd4xd__VSo4otS7xM2-G1uEg1sY0Ri3gUO0JEH-4mJb4Z3z_kyZgA2k3BzJItzt8rQVg8zq6RJ-sEYM1IdzLezWuu5PweQ5BqD7aMTLo0TwOGMtJQvA=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrDwp9cqus8jInLqYrY4v-yd4xd__VSo4otS7xM2-G1uEg1sY0Ri3gUO0JEH-4mJb4Z3z_kyZgA2k3BzJItzt8rQVg8zq6RJ-sEYM1IdzLezWuu5PweQ5BqD7aMTLo0TwOGMtJQvA=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nozfZ7Im7gBzjSk4HYJXSQN7bW6qfz3_KpEfN54-scs5Hlq96-GwfBVKe9OWVg8-IB-wlbKNcYQfOeZSIqDD4Eide2KajJckOxo4p4fN9QV49BfWEBRaLIhnKWNcwepac0IKxE=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nreGGHRcqOE8vIAaOWgO47MmQgZZE1KikOxULRiWVzHRk8UDMWIM8NZgm7ehg_ZBs0s7XMcDni_SDfKP_gUHKPtLfUYvXCDKKnKTvOiCfEsPC5OYmgvG1bkUIhKVI9FzoeUGOVY=s1360-w1360-h1020-rw',
        'https://voyage-tunisie.info/wp-content/uploads/2017/12/Mus%C3%A9e-Dar-Jellouli-Sfax4.jpg',
        'https://www.kharjet.tn/wp-content/uploads/2019/04/Mus%C3%A9e-Dar-Jellouli-Sfax-8.jpg',
      ]
    },
    bebbhar: {
      title: 'Sfax Beb Bhar',
      images: [
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npRoNLomA7Nj5lMpQabrHs8hseeEYE4AfbLwuNgNSwZMZHN5BDPiNkBan1ZCZNtwZW2tIBmLzLX0Fd-Cdwu4GDeobQHkM-aITMu793A6Mlketv67C9TtmRycRyujugK2GAwB92zOg=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrtr7GjrFx957zcFA8aftbybaCoyRl7ItXwi9Z8npM3IcvqC-YAzC7vaRqdjldXu31uq_HX1dk8o2wbNWE_tDwmUH9764E4hO_LjhrMcfJaOtQKeNoJWWU-FXFOKZ3Z3Z7an64=s1360-w1360-h1020-rw',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/65/ee/5b/caption.jpg?w=300&h=-1&s=1',
        'https://content.r9cdn.net/rimg/dimg/ee/8d/c31ed287-city-48573-17409dbe1f2.jpg?width=1366&height=768&xhint=2699&yhint=2202&crop=true&watermarkposition=lowerright',
        'https://images.locationscout.net/2022/05/sfax-beb-bhar-by-night-tunisia-n5w1.webp?h=1400&q=80',
        'https://mapio.net/images-p/83563.jpg'
      ]
    },
    stade: {
      title: 'Stade Taïeb Mhiri',
      images: [
        'https://www.infosfoot.net/wp-content/uploads/2025/01/FB_IMG_1736603411098.jpg',
        'https://stade.hypotheses.org/files/2018/01/R%C3%A9cit-stade-figure-6-1038x576.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Stade_taieb_mehiri.JPG/1280px-Stade_taieb_mehiri.JPG',
        'https://content.mosaiquefm.net/uploads/content/large/1725109453.png',
        'https://stade.hypotheses.org/files/2020/03/IMG_1102-500x375.jpg',
        'https://stade.hypotheses.org/files/2017/12/DSCN0049-1038x576.jpg',
        'https://stade.hypotheses.org/files/2020/03/IMG_1115-500x375.jpg',
      ]
    },
    bebdiwen: {
      title: 'Beb El Diwén',
      images: [
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr6Cp0QjC1RO5nNk-kE7WmHZw09tQoUQxnj_CuJx7MB6XoAjKNXYcXhxBnn9Izaz7sZw7OahFkZlRIYzBDIdwzTJID9zBky_pDP-KQpsE9f5hO1iNCBkl0e_zgi5S9I-oD2PX-7=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqDdY3DAU_-ueWtrYZxBYEAHK6D638KJtwNDqTClDcELHNCpBvLH7Q2Bd2F4upKK5T1cVKjUuEIqVScd8r_l1hqpJhSleeYaR22rP9JYLX5h-UZIzaTkeczc1edpx6SiLOOGsU=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqpXq4tV7e33iVj_5XW0XOgy8UHQG0Fw9Vdb8jY3WY6R9cX5qKO859fIvoiXOdYvUM3ANoyTFaNl5LRT7gUoioJtvO0IOPnM7rZF46W51_fUfBdMM_MnMr0QOJs6kxhcpsZ6xGU=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqRlJGEre2bh5pcjcJq2nKI_qITv8nFFTmBeMhOwRFI_13EYkAnyGfZChy5nY5SAzQon9beHTa0CJLiaNYGFwTRUwC8woyfPirhxZUWX0rUwJiS77Ar3v97EU1AkekUcgOekNaQBA=s1360-w1360-h1020-rw',
        'https://previews.123rf.com/images/efesenko84/efesenko841512/efesenko84151200181/49316662-sfax-tunesien-3-september-2015-der-traditionelle-markt-besetztes-gebiet-gerade-innerhalb-der.jpg',
        'https://c8.alamy.com/compfr/h3mdhp/les-habitants-ont-choisi-la-fraicheur-du-pain-dans-une-echoppe-de-marche-a-sfax-h3mdhp.jpg',
        'https://c8.alamy.com/compfr/2axmny7/sfax-tunisie-24-decembre-2019-etals-colores-d-epices-et-de-legumineuses-dans-le-souk-a-l-interieur-de-la-medina-de-sfax-2axmny7.jpg',
      ]
    },
    plagecasino: {
      title: 'Plage Casino Sfax',
      images: [
        'https://www.businessnews.com.tn/images/album/BN23097sfax-casino2.jpg',
        'https://www.leaders.com.tn/uploads/FCK_files/zarka.jpg',
        'https://lh3.googleusercontent.com/p/AF1QipO5DMRl8acqpgn-ITyyP6Hg9UahPOU20lGGOEAM=s1600-w2436',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrE7ydQl2MQmItVHJ7p7YJ52-w-1OSyG2JHYlDtjfLCMmBY5nU1LnDIUnr-JX_OzuxoQjy6VYjhLvikLAKuFf2On9LUc3QI8Ny0a4EJbAaX3Gn1pWkyrUKDS9n-8_UhpJO-dEsW=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq-SZV4ExvoDBU1T5TEDAx7hA-DVhUsIai7bMF_tF-TElOO-bM3NIUe9ajMVoX6r8Vv7xEBh167w0OtjyVzccYyv4Xcl51tFOnEGFr8U0C_HaeMsM2ExrnN2PiZ29aEDLtDmZyD=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqKR6l5TJHgCLh0jibOVx4_nmiAeUgqevgBK1vkesi6o8e4rnoIv57Er6daj3UxHkk5vUUnX9L3iqHKeMDQdCXuzcYV-esTq1xxj1we-E_VY77uuqEUu4rjJda8Kqsi_0ugqh-9zQ=s1360-w1360-h1020-rw',
      ]
    }
  };

  ouvrirModal(destination: string) {
    const galerie = this.galleries[destination as keyof typeof this.galleries];
    if (galerie) {
      this.modalTitle = galerie.title;
      this.modalPhotos = galerie.images;
      this.currentIndex = 0;
      this.modalVisible = true;
    }
  }

  fermerModal() {
    this.modalVisible = false;
  }

  suivante() {
    if (this.currentIndex < this.modalPhotos.length - 1) {
      this.currentIndex++;
    }
  }

  precedente() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
