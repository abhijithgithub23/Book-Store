import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const injector = inject(Injector);

  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  const authService = injector.get(AuthService);

  return authService.isInitialized$.pipe(
    filter(isInit => isInit === true), 
    take(1),                           
    switchMap(() => {
      
      const token = authService.getAccessToken();
      let authReq = req;
      if (token) {
        authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
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