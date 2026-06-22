import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  user: User;
  token_type: 'bearer';
  expires_in: number | string;
}

export interface LogoutResponse {
  message: 'Logged out successfully';
}

export interface MeResponse {
  data: User;
}

export interface AuthErrorResponse {
  error: string;
}
