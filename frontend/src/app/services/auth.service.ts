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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (this.getToken()) {
      this.fetchProfile().subscribe();
    }
  }

  signup(userData: any) {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: any) {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, body.toString(), { headers }).pipe(
      // FIXED: Added explicit (res: TokenResponse) type here
      tap((res: TokenResponse) => {
        localStorage.setItem('token', res.access_token);
        this.fetchProfile().subscribe();
      })
    );
  }

  fetchProfile() {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      // FIXED: Added explicit (user: User) type here
      tap((user: User) => this.currentUserSubject.next(user))
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