export interface LaravelValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface LaravelMessageError {
  message: string;
}

export interface AuthErrorBody {
  error: string;
}

export type ApiErrorBody = LaravelValidationError | LaravelMessageError | AuthErrorBody;

export function getApiErrorMessage(status: number, body: ApiErrorBody): string {
  if ('error' in body && body.error) {
    return body.error;
  }

  if ('message' in body && body.message) {
    return body.message;
  }

  return `Error HTTP ${status}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(getApiErrorMessage(status, body));
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  get validationErrors(): Record<string, string[]> | null {
    return 'errors' in this.body ? this.body.errors : null;
  }
}
