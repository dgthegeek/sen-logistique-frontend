import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer/public-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  services = [
    {
      icon: '🚚',
      title: 'Livraison Rapide',
      description: 'Livraison en 24-48h à Dakar. Service express disponible pour livraison le jour même.'
    },
    {
      icon: '📱',
      title: 'Suivi en Temps Réel',
      description: 'Suivez vos colis en temps réel avec notre système de tracking avancé.'
    },
    {
      icon: '💰',
      title: 'Paiement COD',
      description: 'Collectez le paiement à la livraison. Recevez votre argent rapidement et en toute sécurité.'
    },
    {
      icon: '📍',
      title: 'Zones Couvertes',
      description: 'Nous couvrons toute la région de Dakar : Plateau, Mermoz, Pikine, Guédiawaye et plus.'
    }
  ];

  advantages = [
    {
      icon: '✓',
      title: 'Fiable',
      description: 'Plus de 95% de livraisons réussies'
    },
    {
      icon: '⚡',
      title: 'Rapide',
      description: 'Livraison express a Dakar'
    },
    {
      icon: '💎',
      title: 'Transparent',
      description: 'Tarifs clairs et sans frais cachés'
    },
    {
      icon: '🛟',
      title: 'Support 24/7',
      description: 'Équipe disponible pour vous aider'
    }
  ];

  steps = [
    {
      number: '1',
      title: 'Inscrivez-vous',
      description: 'Créez votre compte vendeur gratuitement en quelques minutes.'
    },
    {
      number: '2',
      title: 'Créez une livraison',
      description: 'Ajoutez les informations de votre client et du colis à livrer.'
    },
    {
      number: '3',
      title: 'Ramassage',
      description: 'Notre équipe récupère le colis directement chez vous.'
    },
    {
      number: '4',
      title: 'Livraison',
      description: 'Votre colis est livré et vous recevez votre paiement.'
    }
  ];

  testimonials = [
    {
      name: 'Fatou Diop',
      role: 'Vendeuse de cosmétiques',
      image: '👩🏾',
      text: 'Dioks a transformé mon business ! Mes clients reçoivent leurs commandes rapidement et je peux me concentrer sur mes ventes.',
      rating: 5
    },
    {
      name: 'Moussa Sall',
      role: 'Vendeur de vêtements',
      image: '👨🏾',
      text: 'Service professionnel et fiable. Le suivi en temps réel me permet de rassurer mes clients. Je recommande à 100%!',
      rating: 5
    },
    {
      name: 'Aminata Ba',
      role: 'Vendeuse d\'accessoires',
      image: '👩🏾‍🦱',
      text: 'Enfin une solution adaptée aux vendeurs sur les réseaux ! Les tarifs sont corrects et le service est excellent.',
      rating: 5
    }
  ];

  stats = [
    { value: '5000+', label: 'Livraisons effectuées' },
    { value: '200+', label: 'Vendeurs actifs' },
    { value: '95%', label: 'Taux de satisfaction' },
    { value: '24h', label: 'Délai max' }
  ];
}