import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  ApiDataResponse,
  ApiError,
  ApiErrorBody,
  ApiListResponse,
  RequestResource,
  SignatureRequest,
  SolicitudRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  index(): Observable<RequestResource[]> {
    return this.http
      .get<ApiListResponse<RequestResource>>(`${this.baseUrl}${API_ENDPOINTS.requests.base}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  show(id: number): Observable<RequestResource> {
    return this.http
      .get<ApiDataResponse<RequestResource>>(`${this.baseUrl}${API_ENDPOINTS.requests.byId(id)}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  store(payload: SolicitudRequest): Observable<RequestResource> {
    return this.http
      .post<ApiDataResponse<RequestResource>>(
        `${this.baseUrl}${API_ENDPOINTS.requests.base}`,
        this.toFormData(payload),
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  update(id: number, payload: SolicitudRequest): Observable<RequestResource> {
    return this.http
      .put<ApiDataResponse<RequestResource>>(
        `${this.baseUrl}${API_ENDPOINTS.requests.byId(id)}`,
        this.toFormData(payload),
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  signature(id: number, payload: SignatureRequest): Observable<RequestResource> {
    if (payload.signature instanceof File) {
      const formData = new FormData();
      formData.append('signature', payload.signature);

      return this.http
        .post<ApiDataResponse<RequestResource>>(
          `${this.baseUrl}${API_ENDPOINTS.requests.signature(id)}`,
          formData,
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => throwError(() => this.mapError(error))),
        );
    }

    return this.http
      .post<ApiDataResponse<RequestResource>>(
        `${this.baseUrl}${API_ENDPOINTS.requests.signature(id)}`,
        { signature: payload.signature },
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  approve(id: number): Observable<RequestResource> {
    return this.http
      .post<ApiDataResponse<RequestResource>>(
        `${this.baseUrl}${API_ENDPOINTS.requests.approve(id)}`,
        {},
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  reject(id: number): Observable<RequestResource> {
    return this.http
      .post<ApiDataResponse<RequestResource>>(
        `${this.baseUrl}${API_ENDPOINTS.requests.reject(id)}`,
        {},
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => throwError(() => this.mapError(error))),
      );
  }

  private toFormData(payload: SolicitudRequest): FormData {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('date', payload.date);

    if (payload.document) {
      formData.append('document', payload.document);
    }

    return formData;
  }

  private mapError(error: { status?: number; error?: ApiErrorBody }): ApiError {
    const status = error.status ?? 0;
    const body = (error.error ?? { message: 'Error desconocido' }) as ApiErrorBody;
    return new ApiError(status, body);
  }
}
