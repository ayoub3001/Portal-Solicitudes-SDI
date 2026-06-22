export interface DemoAccount {
  label: string;
  role: 'admin' | 'user';
  email: string;
  password: string;
  hint: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    label: 'Administrador',
    role: 'admin',
    email: 'admin@portal.com',
    password: 'password',
    hint: 'Acceso completo · aprueba y rechaza solicitudes',
  },
  {
    label: 'Usuario',
    role: 'user',
    email: 'user@portal.com',
    password: 'password',
    hint: 'Empleado estándar · crea y firma sus solicitudes',
  },
] as const;
