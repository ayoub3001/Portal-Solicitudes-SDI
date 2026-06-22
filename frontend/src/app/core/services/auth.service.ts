import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ApiError,
  ApiErrorBody,
  AuthErrorResponse,
  AuthTokenResponse,
  LoginRequest,
  LogoutResponse,
  MeResponse,
  User,
} from '../models';
import { AuthState } from '../state/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthState);
  private readonly baseUrl = environment.apiUrl;

  login(credentials: LoginRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.login}`, credentials)
      .pipe(
        tap((response) => this.authState.setSession(response.access_token, response.user)),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<LogoutResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.logout}`, {})
      .pipe(
        tap(() => this.authState.clearSession()),
        catchError((error) => {
          this.authState.clearSession();
          return throwError(() => this.mapError(error));
        }),
      );
  }

  me(): Observable<User> {
    return this.http.get<MeResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.me}`).pipe(
      map((response) => response.data),
      tap((user) => this.authState.setUser(user)),
      catchError((error) => throwError(() => this.mapError(error))),
    );
  }

  refresh(): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${this.baseUrl}${API_ENDPOINTS.auth.refresh}`, {})
      .pipe(
        tap((response) => this.authState.setSession(response.access_token, response.user)),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  private mapError(error: { status?: number; error?: ApiErrorBody | AuthErrorResponse }): ApiError {
    const status = error.status ?? 0;
    const body = (error.error ?? { message: 'Error desconocido' }) as ApiErrorBody;
    return new ApiError(status, body);
  }
}
