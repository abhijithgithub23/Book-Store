import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of, switchMap, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User, TokenResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Make sure this matches your backend URL. NO PROXIES.
  private apiUrl = 'http://localhost:8000'; 

  private accessToken: string | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // THE FIX: This tracks if the initial page load refresh check is done
  private isInitialized = new BehaviorSubject<boolean>(false);
  isInitialized$ = this.isInitialized.asObservable();

  constructor() {
    this.bootUpSession();
  }

  // YOUR LOGIC: On refresh, send cookie to backend to get a new access token
  private bootUpSession() {
    this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      switchMap((res) => {
        this.accessToken = res.access_token;
        // Fetch profile manually here using the new token directly
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
        return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
      }),
      catchError(() => {
        // If it fails (no cookie), just clear and finish booting
        this.clearState();
        return of(null);
      })
    ).subscribe((user) => {
      if (user) {
        this.currentUserSubject.next(user);
      }
      // Signal to the rest of the app that boot sequence is complete
      this.isInitialized.next(true); 
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
        return this.http.get<User>(`${this.apiUrl}/profile`, {
          headers: new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`)
        });
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