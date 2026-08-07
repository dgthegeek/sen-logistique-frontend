import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer/public-footer.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  private readonly contactEmail = 'dioks@gmail.com';

  contact = { nom: '', email: '', sujet: '', message: '' };

  constructor(private toast: ToastService) {}

  /** Ouvre le client mail de l'utilisateur avec le message pré-rempli. */
  envoyerContact(): void {
    if (!this.contact.nom || !this.contact.email || !this.contact.message) {
      this.toast.warning('Merci de remplir votre nom, votre email et votre message.');
      return;
    }
    const sujet = this.contact.sujet || `Contact site Dioks — ${this.contact.nom}`;
    const corps =
      `Nom: ${this.contact.nom}\n` +
      `Email: ${this.contact.email}\n\n` +
      `${this.contact.message}`;
    const mailto = `mailto:${this.contactEmail}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
    window.location.href = mailto;
    this.toast.success('Votre messagerie va s\'ouvrir pour envoyer le message. Merci !');
    this.contact = { nom: '', email: '', sujet: '', message: '' };
  }

  /** Étapes de la chaîne logistique (carte du hero). */
  chaine = [
    { icon: 'fa-solid fa-plane-departure', label: 'Import Chine', sub: 'Transit international' },
    { icon: 'fa-solid fa-warehouse', label: 'Réception & stockage', sub: 'Entrepôt sécurisé' },
    { icon: 'fa-solid fa-headset', label: 'Confirmation', sub: 'Appel & validation client' },
    { icon: 'fa-solid fa-truck-fast', label: 'Livraison', sub: 'Encaissement inclus' }
  ];

  /** Section 2 : nos services (chaque service avec ses sous-points). */
  services = [
    {
      icon: 'fa-solid fa-plane-departure',
      title: 'Transit International',
      points: [
        'Accompagnement des importations Chine → Sénégal',
        'Collaboration avec nos partenaires transitaires',
        'Suivi des expéditions'
      ]
    },
    {
      icon: 'fa-solid fa-warehouse',
      title: 'Réception & Stockage',
      points: [
        'Réception des marchandises',
        'Contrôle des quantités',
        'Enregistrement du stock',
        'Stockage sécurisé dans l\'entrepôt Dioks'
      ]
    },
    {
      icon: 'fa-solid fa-boxes-stacked',
      title: 'Gestion des Stocks',
      points: [
        'Suivi du stock en temps réel',
        'Historique des mouvements',
        'Alertes de stock faible'
      ]
    },
    {
      icon: 'fa-solid fa-headset',
      title: 'Confirmation des commandes',
      points: [
        'Appel des clients',
        'Validation des commandes',
        'Préparation avant expédition'
      ]
    },
    {
      icon: 'fa-solid fa-truck-fast',
      title: 'Livraison',
      points: [
        'Dispatch automatique',
        'Attribution des commandes aux livreurs',
        'Suivi des livraisons',
        'Encaissement des paiements'
      ]
    }
  ];

  /** Section 3 : secteurs de couverture à Dakar. */
  secteurs = [
    {
      icon: 'fa-solid fa-city',
      name: 'Dakar Centre',
      zones: ['Plateau', 'Médina', 'Point E', 'Fann', 'Mermoz', 'Sacré-Cœur',
        'Liberté', 'Grand-Dakar', 'Hann', 'Ouakam', 'Ngor', 'Yoff', 'Almadies']
    },
    {
      icon: 'fa-solid fa-motorcycle',
      name: 'Guédiawaye – Pikine',
      zones: ['Guédiawaye', 'Pikine', 'Parcelles Assainies', 'Cambérène', 'Yeumbeul', 'Malika']
    },
    {
      icon: 'fa-solid fa-truck',
      name: 'Est de Dakar',
      zones: ['Thiaroye', 'Keur Massar', 'Diamaguène', 'Mbao', 'Fass Mbao', 'Rufisque']
    }
  ];

  /** Livraison régions : les deux modes de fonctionnement. */
  modesRegion = [
    {
      icon: 'fa-solid fa-hand-holding-dollar',
      title: 'Paiement à destination',
      badge: 'Le plus courant',
      points: [
        'Dioks prépare et remet le colis au transporteur',
        'Le client règle les frais de transport au retrait ou à la livraison'
      ]
    },
    {
      icon: 'fa-solid fa-gift',
      title: 'Transport prépayé',
      badge: 'Offres & promos',
      points: [
        'Le partenaire prend en charge les frais de transport',
        'Dioks organise l\'expédition jusqu\'au transporteur',
        'Le client reçoit son colis sans frais de transport'
      ]
    }
  ];

  /** Services inclus pour l'expédition régions. */
  regionInclus = [
    'Réception de la commande',
    'Confirmation du client',
    'Préparation du colis',
    'Dépôt auprès du transporteur partenaire',
    'Suivi jusqu\'à la remise au transporteur',
    'Information du partenaire sur l\'état de l\'envoi'
  ];

  /** Ce que comprend la commission logistique. */
  commissionInclus = [
    'Confirmation de la commande',
    'Préparation du colis',
    'Gestion logistique',
    'Livraison',
    'Encaissement',
    'Mise à jour du statut de la commande'
  ];

  /** Section 5 : pourquoi choisir Dioks. */
  advantages = [
    { icon: 'fa-solid fa-link', title: 'Chaîne logistique complète', description: 'Un seul prestataire de l\'import à la livraison finale.' },
    { icon: 'fa-solid fa-plane-departure', title: 'Importation Chine → Sénégal', description: 'Transit international avec nos partenaires transitaires.' },
    { icon: 'fa-solid fa-warehouse', title: 'Entrepôt sécurisé', description: 'Vos marchandises réceptionnées et stockées en sécurité.' },
    { icon: 'fa-solid fa-boxes-stacked', title: 'Stocks en temps réel', description: 'Suivi, historique des mouvements et alertes de stock faible.' },
    { icon: 'fa-solid fa-headset', title: 'Confirmation avant livraison', description: 'Chaque commande est appelée et validée avant expédition.' },
    { icon: 'fa-solid fa-users-gear', title: 'Équipe dédiée', description: 'Assistants, coordinateur logistique et livreurs.' },
    { icon: 'fa-solid fa-chart-line', title: 'Plateforme de suivi', description: 'Suivez vos commandes et vos stocks en continu.' },
    { icon: 'fa-solid fa-gem', title: 'Commission unique & transparente', description: 'Un tarif clair, sans frais cachés.' }
  ];

  stats = [
    { value: '25+', label: 'Quartiers desservis' },
    { value: '3', label: 'Secteurs à Dakar' },
    { value: '2 000 F', label: 'Commission / commande' },
    { value: '14', label: 'Régions du Sénégal' }
  ];
}
