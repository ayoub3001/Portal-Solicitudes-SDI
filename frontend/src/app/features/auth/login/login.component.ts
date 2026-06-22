import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError, LoginRequest } from '../../../core/models';
import { DEMO_ACCOUNTS } from '../../../core/constants/demo-accounts.constants';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly showDemoAccounts = !environment.production;
  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly loading = signal(false);
  protected readonly quickLoginRole = signal<'admin' | 'user' | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isInactiveUser = signal(false);
  protected readonly sessionExpired = signal(
    this.route.snapshot.queryParamMap.get('reason') === 'session_expired',
  );

  protected readonly workflowSteps = [
    { code: '01', label: 'Solicitar', detail: 'Crea y adjunta documentación' },
    { code: '02', label: 'Firmar', detail: 'Valida con tu firma digital' },
    { code: '03', label: 'Resolver', detail: 'Seguimiento y aprobación' },
  ] as const;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.login(this.form.getRawValue());
  }

  protected quickLogin(account: (typeof DEMO_ACCOUNTS)[number]): void {
    this.form.setValue({
      email: account.email,
      password: account.password,
    });
    this.login(
      { email: account.email, password: account.password },
      account.role,
    );
  }

  private login(credentials: LoginRequest, role?: 'admin' | 'user'): void {
    this.loading.set(true);
    this.quickLoginRole.set(role ?? null);
    this.errorMessage.set(null);
    this.isInactiveUser.set(false);

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.quickLoginRole.set(null);
        void this.router.navigate(['/dashboard']);
      },
      error: (error: ApiError) => {
        this.loading.set(false);
        this.quickLoginRole.set(null);
        this.handleLoginError(error);
      },
    });
  }

  private handleLoginError(error: ApiError): void {
    if (error.status === 403) {
      this.isInactiveUser.set(true);
      this.errorMessage.set(
        error.message === 'Usuario inactivo'
          ? 'Tu cuenta está inactiva. No puedes acceder al portal hasta que un administrador reactive tu usuario.'
          : error.message,
      );
      return;
    }

    if (error.status === 401) {
      this.errorMessage.set('Correo o contraseña incorrectos.');
      return;
    }

    this.errorMessage.set(error.message);
  }
}
