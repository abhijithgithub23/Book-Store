import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of, switchMap, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User, TokenResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 
  
  private apiUrl = '/api'; 

  private accessToken: string | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isInitialized = new BehaviorSubject<boolean>(false);
  isInitialized$ = this.isInitialized.asObservable();

  constructor() {
    console.log('[AUTH TRACER] 1. AuthService Constructor Fired!');
    
    if (isPlatformBrowser(this.platformId)) {
      console.log('[AUTH TRACER] 2. Running in Browser! Booting session...');
      this.bootUpSession();
    } else {
      console.log('[AUTH TRACER] 2. Running on Node Server (SSR). Skipping network call.');
      this.isInitialized.next(true);
    }
  }

  private bootUpSession() {
    console.log('[AUTH TRACER] 3. Sending POST request to /api/refresh...');
    
    this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('[AUTH TRACER ERROR] 4. /refresh call FAILED hard:', error);
        this.clearState();
        this.isInitialized.next(true); 
        return throwError(() => new Error('Session boot failed'));
      })
    ).subscribe({
      next: (res) => {
        console.log('[AUTH TRACER] 4. /refresh call SUCCESS! We got a token.');
        this.accessToken = res.access_token;
        this.isInitialized.next(true); 

        console.log('[AUTH TRACER] 5. Fetching user profile...');
        this.http.get<User>(`${this.apiUrl}/profile`).subscribe({
          next: (user) => {
             console.log('[AUTH TRACER] 6. Profile loaded successfully!');
            this.currentUserSubject.next(user);
          },
          error: (profileErr) => {
             console.error('[AUTH TRACER ERROR] 6. Profile fetch failed:', profileErr);
            this.clearState();
          }
        });
      },
      error: (err) => {
        console.log('[AUTH TRACER] Boot up finished with no active session');
      }
    });
  }

  signup(userData: any) {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: any) {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, body.toString(), { 
      headers, 
      withCredentials: true 
    }).pipe(
      switchMap((res: TokenResponse) => {
        this.accessToken = res.access_token; 
        return this.http.get<User>(`${this.apiUrl}/profile`);
      }),
      tap((user: User) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        this.accessToken = res.access_token;
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.clearState();
      this.router.navigate(['/login']);
    });
  }

  clearState() {
    this.accessToken = null;
    this.currentUserSubject.next(null);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}