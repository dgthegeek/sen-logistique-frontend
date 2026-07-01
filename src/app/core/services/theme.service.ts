import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Gère le thème de l'application : futuriste (dark) ou clair (light).
 * La préférence est mémorisée dans le localStorage. Défaut : futuriste (dark).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'dioks-theme';
  private darkSubject = new BehaviorSubject<boolean>(this.readInitial());
  readonly dark$ = this.darkSubject.asObservable();

  constructor() {
    this.apply(this.darkSubject.value);
  }

  get isDark(): boolean {
    return this.darkSubject.value;
  }

  toggle(): void {
    this.setDark(!this.darkSubject.value);
  }

  setDark(dark: boolean): void {
    this.darkSubject.next(dark);
    localStorage.setItem(this.key, dark ? 'dark' : 'light');
    this.apply(dark);
  }

  private readInitial(): boolean {
    const saved = localStorage.getItem(this.key);
    if (saved === 'light') { return false; }
    if (saved === 'dark') { return true; }
    return true; // défaut : mode futuriste
  }

  private apply(dark: boolean): void {
    const el = document.documentElement;
    if (dark) { el.classList.add('dark'); } else { el.classList.remove('dark'); }
  }
}
