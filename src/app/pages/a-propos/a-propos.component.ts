import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicHeaderComponent } from "../../shared/components/public-header/public-header.component";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
}

interface Valeur {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  number: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-a-propos',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicHeaderComponent],
  templateUrl: './a-propos.component.html',
  styleUrls: ['./a-propos.component.css']
})
export class AProposComponent {
  
  // Stats
  stats: Stat[] = [
    {
      number: '500+',
      label: 'Livraisons effectuées',
      icon: 'fa-solid fa-box-open'
    },
    {
      number: '50+',
      label: 'Vendeurs partenaires',
      icon: 'fa-solid fa-handshake'
    },
    {
      number: '98%',
      label: 'Taux de satisfaction',
      icon: 'fa-solid fa-heart'
    },
    {
      number: '24h',
      label: 'Livraison moyenne',
      icon: 'fa-solid fa-clock'
    }
  ];

  // Valeurs
  valeurs: Valeur[] = [
    {
      icon: 'fa-solid fa-shield-heart',
      title: 'Confiance',
      description: 'Nous traitons chaque colis comme s\'il nous appartenait. La confiance de nos clients et vendeurs est notre plus grande richesse.'
    },
    {
      icon: 'fa-solid fa-bolt',
      title: 'Rapidité',
      description: 'Dans le e-commerce local, chaque heure compte. Nous optimisons chaque étape pour des livraisons ultra-rapides.'
    },
    {
      icon: 'fa-solid fa-hands-helping',
      title: 'Proximité',
      description: 'Nous comprenons les réalités du terrain. Service personnalisé, communication directe, solutions adaptées.'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Innovation',
      description: 'Technologie moderne au service d\'un besoin local. Suivi en temps réel, paiements sécurisés, transparence totale.'
    }
  ];

  // Timeline
  timeline = [
    {
      year: '2024',
      title: 'Lancement de Dioks',
      description: 'Naissance de la plateforme pour répondre aux besoins des micro-vendeurs sur les réseaux sociaux.'
    },
    {
      year: 'T1 2024',
      title: 'Premières livraisons',
      description: '50 vendeurs font confiance à Dioks pour gérer leurs livraisons avec paiement à la livraison.'
    },
    {
      year: 'T2 2024',
      title: 'Expansion zones',
      description: 'Extension à toute la région de Dakar avec des tarifs adaptés par zone.'
    },
    {
      year: '2025',
      title: 'Aujourd\'hui',
      description: 'Une communauté grandissante de vendeurs et des milliers de livraisons réussies.'
    }
  ];

  // Team
  team: TeamMember[] = [
    {
      name: 'Dame',
      role: 'CEO & Fondateur',
      description: 'Full Stack Engineer chez Al Barid Bank, passionné par la résolution de problèmes concrets avec la technologie.'
    }
  ];

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}