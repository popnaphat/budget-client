// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log(authInterceptor.name, req.url)

  const authService = inject(AuthService);
  const tokens = authService.tokens();

  if (tokens) {

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${tokens.access_token}` }
    });
  }

  return next(req);
};
