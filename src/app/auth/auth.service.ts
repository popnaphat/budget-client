// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { ENV_CONFIG } from '../env.config';
import { LoggedInUser } from './models/logged-in-user';
import { Tokens } from './models/tokens';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private envConfig = inject(ENV_CONFIG);
  readonly URL = `${this.envConfig.apiUrl}/auth/login`;

  httpClient = inject(HttpClient);
  router = inject(Router);

  tokens = signal<Tokens | null>(null);
  loggedInUser = computed(() => {
    const tokens = this.tokens();
    if (tokens) {
      return jwtDecode(tokens.access_token) as LoggedInUser;
    }
    return null;
  });

  constructor() {
    if (!this.tokens()) {
      const tokensInStorage = sessionStorage.getItem('TOKENS');
      if (tokensInStorage) {
        this.tokens.set(JSON.parse(tokensInStorage) as Tokens);
      }
    }
  }

  login(credential: { username: string; password: string }): Observable<Tokens> {
    return this.httpClient.post<Tokens>(this.URL, credential).pipe(
      tap((v) => {
        this.tokens.set(v);
        sessionStorage.setItem('TOKENS', JSON.stringify(v));
      })
    );
  }

  logout(): void {
    this.tokens.set(null);
    sessionStorage.removeItem('TOKENS');
    this.router.navigate(['/auth/login']);
  }

  // refreshToken(): Observable<{ access_token: string}> {
  //   console.log(AuthService.name)
  //   return this.httpClient.post<{ access_token: string}>(`${this.envConfig.apiUrl}/auth/refresh`, null)
  // }
}
