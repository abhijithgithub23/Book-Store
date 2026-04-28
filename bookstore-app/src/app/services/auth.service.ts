import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, TokenResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://127.0.0.1:8000';

  // BehaviorSubject to track if the user is logged in globally
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // On app load, check if we have a token and fetch the profile
    if (this.getToken()) {
      this.fetchProfile().subscribe();
    }
  }

  signup(userData: any) {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: any) {
    // FastAPI requires Form Data for OAuth2 login
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, body.toString(), { headers }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.fetchProfile().subscribe(); // Fetch user data immediately after login
      })
    );
  }

  fetchProfile() {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}