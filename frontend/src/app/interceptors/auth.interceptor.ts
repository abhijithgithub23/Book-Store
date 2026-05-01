import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // THE FIX: We inject the core Angular 'Injector', NOT the AuthService directly!
  const injector = inject(Injector);

  // 1. Let login and refresh requests go through immediately.
  // Because we do this first, the circular dependency loop is broken!
  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  // 2. For ALL other requests, it is now safe to grab the fully constructed AuthService
  const authService = injector.get(AuthService);

  // 3. WAIT for boot to finish before sending profile/cart/book requests
  return authService.isInitialized$.pipe(
    filter(isInit => isInit === true), 
    take(1),                           
    switchMap(() => {
      
      // 4. Attach the access token if we have it
      const token = authService.getAccessToken();
      let authReq = req;
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
      }

      // 5. Send the request
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // If token expired DURING normal usage, refresh it
          if (error.status === 401) {
            return authService.refreshToken().pipe(
              switchMap((tokenResponse) => {
                const retryReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${tokenResponse.access_token}`)
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                authService.clearState();
                return throwError(() => refreshError);
              })
            );
          }
          return throwError(() => error);
        })
      );
    })
  );
};