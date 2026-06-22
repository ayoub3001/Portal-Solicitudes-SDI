import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError, ApiErrorBody } from '../models';
import { AuthState } from '../state/auth.state';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authState = inject(AuthState);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = (error.error ?? { message: error.message }) as ApiErrorBody;
      const apiError = new ApiError(error.status, body);

      switch (error.status) {
        case 401:
          if (!req.url.includes('/auth/login')) {
            authState.clearSession();
            void router.navigate(['/login'], {
              queryParams: { reason: 'session_expired' },
            });
          }
          break;

        case 403:
          console.warn('[API 403]', apiError.message);
          break;

        case 422:
          console.warn('[API 422] Validación:', apiError.validationErrors);
          break;

        case 500:
          console.error('[API 500]', apiError.message);
          break;
      }

      return throwError(() => apiError);
    }),
  );
};
