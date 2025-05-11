import { Injectable } from '@angular/core';

export interface HeritageItem {
  id: string;
  title: string;
  heroImage: string;
  heroDescription: string;
  mainDescription: string[];
  characteristics: { title: string; description: string; image: string }[];
  gallery: { src: string; alt: string }[];
  
}

@Injectable({
  providedIn: 'root'
})
export class HeritageService {
  private heritageItems: HeritageItem[] = [
    {
      id: 'medina',
      title: 'La Médina',
      heroImage: 'assets/images/medi1.jpg',
      heroDescription: 'Un joyau architectural du IXe siècle, symbole vivant de l’histoire islamique de Sfax.',
      mainDescription: [
        'Fondée en 849 sous les Aghlabides, la médina de Sfax est un exemple remarquable d’urbanisme arabo-islamique.',
        'Elle est entourée de remparts longs de 2 750 mètres formant un quadrilatère de 600 mètres sur 400 mètres, et structurée autour d’un axe reliant Bab Djebli à Bab Diwan, avec la Grande Mosquée en son centre.',
        'Contrairement à d’autres médinas plus touristiques, celle de Sfax conserve une activité commerciale et artisanale authentique, avec ses souks, ses mosquées, ses ateliers et ses maisons traditionnelles.'
      ],
      characteristics: [
        {
          title: 'Les Remparts',
          description: 'Édifiés au IXe siècle, les remparts forment un quadrilatère fortifié percé de portes historiques, assurant la protection de la médina pendant des siècles.',
          image: 'assets/images/remi1.webp'
        },
        {
          title: 'Les Souks',
          description: 'Les souks de la médina, organisés par métier, témoignent du dynamisme artisanal et commercial toujours présent aujourd’hui.',
          image: 'assets/images/souk.jpg'
        },
        {
          title: 'Souk El Hout',
          description: 'Souk El Hout est l’un des marchés les plus emblématiques de la médina de Sfax, spécialisé dans la vente de poissons frais. Il est réputé pour son ambiance animée, ses étals colorés et son importance économique locale. Situé près de Bab Diwan, il incarne parfaitement la vitalité et l’authenticité du commerce sfaxien traditionnel.',
          image: 'assets/images/soukhout.webp'
        },
        
        {
          title: 'Les Demeures',
          description: 'Les maisons traditionnelles sfaxiennes sont bâties autour de patios et dotées de portes sculptées, symboles d’identité locale.',
          image: 'assets/images/selma.jpg'
        }
      ],
      gallery: [
        { src: 'assets/images/medi1.jpg', alt: 'Vue générale de la médina' },
        { src: 'assets/images/1.jpg', alt: 'Ruelle typique de la médina' },
        { src: 'assets/images/2.webp', alt: 'Souk de Sfax' },
        { src: 'assets/images/3.avif', alt: 'Intérieur d’une maison traditionnelle' },
        { src: 'assets/images/4.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/5.jpg', alt: 'Porte de la médina' },
        { src: 'assets/images/6.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/7.webp', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/8.webp', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/9.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/10.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/11.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/12.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/13.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/14.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/15.jpg', alt: 'Minaret de la Grande Mosquée' },
        { src: 'assets/images/16.jpg', alt: 'Minaret de la Grande Mosquée' },
        
      ]
    }
    ,
    ///////////
    {
      id: 'artisanat',
      title: 'Artisanat',
      heroImage: 'assets/images/arti5.jpg', // Use a local image instead of a URL
      heroDescription: 'Un centre vibrant d’artisanat traditionnel au cœur de la Médina de Sfax.',
      mainDescription: [
        'Les artisans de Sfax sont réputés pour leur savoir-faire ancestral, notamment dans la bijouterie, la poterie, le tissage et la maroquinerie.',
        'Les souks artisanaux de la Médina offrent une immersion dans les traditions sfaxiennes, avec des ateliers où l’on peut observer les artisans à l’œuvre.',
        'Ces espaces sont non seulement des lieux de production, mais aussi des points de vente où les visiteurs peuvent acheter des produits uniques.'
      ],
      characteristics: [
        {
          title: 'Bijouterie',
          description: 'Les bijoutiers de Sfax créent des pièces en argent et en or, souvent ornées de motifs traditionnels.',
          image: 'assets/images/Bijouterie.jpg'
        },
        {
          title: 'Poterie',
          description: 'La poterie sfaxienne est connue pour ses motifs géométriques et ses couleurs vives.',
          image: 'assets/images/Poterie.jpg'
        },
        {
          title: 'Tissage',
          description: 'Les artisans tissent des tapis et des textiles avec des techniques transmises de génération en génération.',
          image: 'assets/images/Tissage.jpg'
        },
        {
          title: 'Maroquinerie',
          description: 'Sacs, chaussures et ceintures en cuir sont fabriqués avec un soin particulier pour les détails.',
          image: 'assets/images/Maroquinerie.jpg'
        }
      ],
      gallery: [
        { src: 'assets/images/arti1.jpg', alt: 'Atelier d’artisanat' },
        { src: 'assets/images/arti2.jpg', alt: 'Bijoux traditionnels' },
        { src: 'assets/images/arti3.jpg', alt: 'Poterie sfaxienne' },
        { src: 'assets/images/arti4.jpg', alt: 'Tissage artisanal' },
        { src: 'assets/images/arti6.jpg', alt: 'Produits en cuir' },
        { src: 'assets/images/arti7.webp', alt: 'Souk artisanal' }
      ]
    },
    {
      id: 'mosquee',
      title: 'Grande Mosquée',
      heroImage: 'assets/images/mos0.jpg', // Use a local image
      heroDescription: 'La Grande Mosquée de Sfax, Jemaa Sidi Lakhmi, un lieu de culte emblématique enraciné dans l’histoire spirituelle de Sfax.',
      mainDescription: [
       'Située dans le sud-est de la Médina, Jemaa Sidi Lakhmi est une mosquée historique portant le nom du saint Sidi Lakhmi.',
    'Son minaret carré reflète l’architecture islamique sobre et élégante, emblématique de la ville.',
    'La salle de prière, épurée, accueille fidèles et visiteurs dans un cadre paisible et spirituel.'
      ],
      characteristics: [
        {
          title: 'Le Minaret',
          description: 'Un minaret carré aux lignes simples, symbole de la sobriété architecturale sfaxienne.',
          image: 'assets/images/minarte.jpg'
        },
        {
          title: 'Le Patio',
          description: 'Une petite cour centrale servant de lieu de rassemblement, entourée de murs blancs traditionnels.',
          image: 'assets/images/patio.jpg'
        },
        {
          title: 'Salle de Prière',
          description: 'Un espace intérieur tranquille, marqué par la simplicité et le respect des formes traditionnelles.',
          image: 'assets/images/salle.jpg'
        },
        {
          title: 'Le Mihrab',
          description: 'Un mihrab discret mais spirituellement puissant, orienté vers La Mecque.',
          image: 'assets/images/mihrab.jpg'
        }
      ],
      gallery: [
        { src: 'assets/images/mos1.png', alt: 'Minaret de Jemaa Sidi Lakhmi' },
        { src: 'assets/images/mos2.png', alt: 'Cour intérieure' },
        { src: 'assets/images/mos3.jpg', alt: 'Salle de prière de la mosquée' },
        { src: 'assets/images/mos4.webp', alt: 'Architecture intérieure' },
        { src: 'assets/images/mos5.jpg', alt: 'Entrée de Jemaa Sidi Lakhmi' },
        { src: 'assets/images/mos6.jpeg', alt: 'Vue extérieure de la mosquée' },
        { src: 'assets/images/mos7.jpeg', alt: 'Vue extérieure de la mosquée' }
      ]
    },
  ];

  getHeritageItem(id: string): HeritageItem | undefined {
    return this.heritageItems.find(item => item.id === id);
  }
}