import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 1. Let login and refresh requests go through immediately
  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  // 2. For ALL other requests (Cart, Profile, Books), WAIT for boot to finish!
  return authService.isInitialized$.pipe(
    filter(isInit => isInit === true), // Pause until true
    take(1),                           // Only fire once
    switchMap(() => {
      
      // 3. Now that boot is done, attach the access token if we have it
      const token = authService.getAccessToken();
      let authReq = req;
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
      }

      // 4. Send the request
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