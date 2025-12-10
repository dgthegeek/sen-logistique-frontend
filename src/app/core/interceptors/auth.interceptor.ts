import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Ajouter le token JWT
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs 403 (vendeur non actif)
      if (error.status === 403) {
        const message = error.error?.message || '';
        
        if (message.includes('validation') || message.includes('validé')) {
          router.navigate(['/en-attente-validation']);
        } else if (message.includes('suspendu') || message.includes('bloqué')) {
          router.navigate(['/compte-suspendu']);
        }
      }
      
      // Gérer les erreurs 401 (token invalide)
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};