import { Pipe, PipeTransform } from '@angular/core';
import { STATUT_LABELS } from '../../core/models/statut-labels';
import { StatutLivraison } from '../../core/models/closing-dispatch.model';

/**
 * Libellé français d'un statut de livraison (nouveau cycle + anciens).
 */
@Pipe({ name: 'statutLabel', standalone: true })
export class StatutLabelPipe implements PipeTransform {
  transform(statut: string | null | undefined): string {
    if (!statut) { return '—'; }
    return STATUT_LABELS[statut as StatutLivraison] || statut;
  }
}

/**
 * Classe de badge associée à un statut de livraison.
 */
@Pipe({ name: 'statutBadge', standalone: true })
export class StatutBadgePipe implements PipeTransform {
  private readonly map: Record<string, string> = {
    NOUVELLE: 'badge-pending',
    A_APPELER: 'badge-pending',
    CONFIRMEE: 'badge-picked',
    PRETE_A_LIVRER: 'badge-picked',
    ASSIGNEE: 'badge-transit',
    EN_LIVRAISON: 'badge-transit',
    LIVREE: 'badge-delivered',
    ECHEC: 'badge-failed',
    ANNULEE: 'badge-canceled',
    // Ancien cycle
    EN_ATTENTE_RAMASSAGE: 'badge-pending',
    RAMASSE: 'badge-picked',
    EN_ROUTE: 'badge-transit',
    ECHEC_ABSENT: 'badge-failed',
    ECHEC_REFUSE: 'badge-failed'
  };

  transform(statut: string | null | undefined): string {
    return `badge ${this.map[statut || ''] || 'badge-pending'}`;
  }
}
