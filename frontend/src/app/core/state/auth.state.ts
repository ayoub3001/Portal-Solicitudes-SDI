import { Injectable, computed, inject, signal } from '@angular/core';
import { User, UserRole } from '../models';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly storage = inject(StorageService);

  private readonly _currentUser = signal<User | null>(this.storage.getUser());
  private readonly _token = signal<string | null>(this.storage.getToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());
  readonly role = computed<UserRole | null>(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');

  setSession(token: string, user: User): void {
    this.storage.setToken(token);
    this.storage.setUser(user);
    this._token.set(token);
    this._currentUser.set(user);
  }

  setUser(user: User): void {
    this.storage.setUser(user);
    this._currentUser.set(user);
  }

  clearSession(): void {
    this.storage.clearAuth();
    this._token.set(null);
    this._currentUser.set(null);
  }
}
