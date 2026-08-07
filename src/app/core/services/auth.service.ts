import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Charger l'utilisateur depuis localStorage au démarrage
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Erreur parsing user:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(telephone: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      telephone,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const hasToken = !!token;
    return hasToken;
  }

  isVendeur(): boolean {
    const user = this.currentUserSubject.value;
    const isVendeur = user?.role === 'VENDEUR';
    return isVendeur;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    const isAdmin = user?.role === 'ADMIN';
    return isAdmin;
  }

  isCloseur(): boolean {
    return this.currentUserSubject.value?.role === 'CLOSEUR';
  }

  isLivreur(): boolean {
    return this.currentUserSubject.value?.role === 'LIVREUR';
  }

  isDispatcheur(): boolean {
    return this.currentUserSubject.value?.role === 'DISPATCHEUR';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  get currentUserValue(): User | null {
  return this.currentUserSubject.value;
}

  /**
   * Route d'accueil de l'utilisateur selon son rôle.
   * Source unique de vérité utilisée par le guestGuard et le lien "Dashboard"
   * pour éviter d'envoyer un non-vendeur vers /vendeur/dashboard (boucle de redirection).
   */
  getHomeRoute(): string {
    const role = this.currentUserSubject.value?.role;
    switch (role) {
      case 'ADMIN': return '/admin/stats';
      case 'CLOSEUR': return '/closeur/commandes';
      case 'LIVREUR': return '/livreur/mes-livraisons';
      case 'DISPATCHEUR': return '/dispatcheur/dispatch';
      case 'VENDEUR': return '/vendeur/dashboard';
      default: return '/login';
    }
  }
}