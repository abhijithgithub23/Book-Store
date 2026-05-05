import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor'; 
import { AuthService } from './services/auth.service';
import { filter, firstValueFrom } from 'rxjs';

export function initializeApp(authService: AuthService) {
  return () => firstValueFrom(authService.isInitialized$.pipe(filter(isInit => isInit === true)));
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(withInterceptors([authInterceptor])),
    
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ]
};