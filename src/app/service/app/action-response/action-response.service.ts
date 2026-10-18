// src/app/service/action-response/action-response.service.ts
//
// Ce service centralise toutes les notifications de feedback
// (succès / erreur) déclenchées depuis n'importe quel composant.
// Il traduit les erreurs techniques du backend en messages
// compréhensibles par un utilisateur non technique.

import { Injectable, signal } from '@angular/core';
import { AxiosError } from 'axios';

export interface ActionResponse {
  message: string;
  isSuccess: boolean;
  visible: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

/** Durée d'affichage du toast en ms */
const TOAST_DURATION_MS = 4000;

@Injectable({
  providedIn: 'root',
})
export class ActionResponseService {

  /** Signal exposé aux composants qui veulent afficher le toast */
  readonly response = signal<ActionResponse>({
    message: '',
    isSuccess: true,
    visible: false,
  });

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  // ─────────────────────────────────────────────
  //  API PUBLIQUE
  // ─────────────────────────────────────────────

  /** Affiche un toast de succès */
  success(message: string): void {
    this.show(message, true);
  }

  /** Affiche un toast d'erreur avec un message lisible */
  error(err: unknown): void {
    if (typeof err === 'string' && err.trim()) {
      this.show(err.trim(), false);
      return;
    }

    const message = this.extractUserFriendlyMessage(err);
    this.show(message, false);
  }

  /** Masque le toast manuellement */
  dismiss(): void {
    this.response.update(r => ({ ...r, visible: false }));
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  // ─────────────────────────────────────────────
  //  LOGIQUE INTERNE
  // ─────────────────────────────────────────────

  private show(message: string, isSuccess: boolean): void {
    // Annuler l'auto-masquage précédent
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.response.set({ message, isSuccess, visible: true });

    // Masquage automatique après la durée définie
    this.hideTimer = setTimeout(() => {
      this.response.update(r => ({ ...r, visible: false }));
      this.hideTimer = null;
    }, TOAST_DURATION_MS);
  }

  /**
   * Traduit une erreur (Axios, réseau, etc.) en message
   * compréhensible par l'utilisateur final.
   */
  private extractUserFriendlyMessage(err: unknown): string {
    // Erreur Axios avec réponse du serveur
    if (this.isAxiosError(err)) {
      const data = err.response?.data as ErrorResponse | undefined;

      if (data) {
        // Erreurs de validation : lister les champs problématiques
        if (data.validationErrors && Object.keys(data.validationErrors).length > 0) {
          const fieldMessages = Object.values(data.validationErrors).join(', ');
          return `Veuillez corriger les informations suivantes : ${fieldMessages}`;
        }

        // Messages du backend — traduction par code HTTP
        const status = err.response?.status ?? data.status;

        switch (status) {
          case 400:
            return data.message
              ? `Données invalides : ${data.message}`
              : 'Les données envoyées sont incorrectes. Vérifiez vos informations.';

          case 401:
            return 'Votre session a expiré. Veuillez vous reconnecter.';

          case 403:
            return "Vous n'êtes pas autorisé à effectuer cette action.";

          case 404:
            return "L'élément demandé est introuvable.";

          case 409:
            return data.message ?? 'Un conflit a été détecté. Cet élément existe peut-être déjà.';

          case 422:
            return data.message ?? 'Les données fournies ne peuvent pas être traitées.';

          case 500:
          case 502:
          case 503:
            return 'Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.';

          default:
            // Utiliser le message du backend si disponible, sinon message générique
            return data.message
              ? this.sanitizeBackendMessage(data.message)
              : 'Une erreur inattendue est survenue. Veuillez réessayer.';
        }
      }

      // Erreur réseau sans réponse (timeout, CORS, serveur hors ligne…)
      if (!err.response) {
        return "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
      }
    }

    // Erreur JavaScript native
    if (err instanceof Error) {
      return "Une erreur technique est survenue. Veuillez réessayer.";
    }

    return 'Une erreur inattendue est survenue.';
  }

  /**
   * Nettoie les messages techniques du backend pour les rendre
   * lisibles (enlève les stack traces, noms de classes Java, etc.)
   */
  private sanitizeBackendMessage(message: string): string {
    // Trop technique ? Remplacer par un message générique
    if (
      message.includes('NullPointerException') ||
      message.includes('ConstraintViolation') ||
      message.includes('HibernateException') ||
      message.toLowerCase().includes('stack')
    ) {
      return "Une erreur technique est survenue. Veuillez réessayer.";
    }
    return message;
  }

  private isAxiosError(err: unknown): err is AxiosError {
    return (typeof err === 'object' &&
      err !== null &&
      'isAxiosError' in err && (err as AxiosError).isAxiosError);
  }
}
