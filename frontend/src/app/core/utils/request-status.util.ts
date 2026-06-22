import { RequestResource, RequestStatus } from '../models';

export interface RequestStatusMeta {
  label: string;
  dotClass: string;
  badgeClass: string;
  eventColor: string;
  eventBorder: string;
}

export const REQUEST_STATUS_META: Record<RequestStatus, RequestStatusMeta> = {
  pending: {
    label: 'Pendiente',
    dotClass: 'bg-amber-400',
    badgeClass: 'border-amber-300 bg-amber-50 text-amber-950',
    eventColor: '#fbbf24',
    eventBorder: '#d97706',
  },
  signed: {
    label: 'Firmada',
    dotClass: 'bg-cyan-400',
    badgeClass: 'border-cyan-300 bg-cyan-50 text-cyan-950',
    eventColor: '#22d3ee',
    eventBorder: '#0891b2',
  },
  approved: {
    label: 'Aprobada',
    dotClass: 'bg-emerald-400',
    badgeClass: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    eventColor: '#34d399',
    eventBorder: '#059669',
  },
  rejected: {
    label: 'Rechazada',
    dotClass: 'bg-rose-400',
    badgeClass: 'border-rose-300 bg-rose-50 text-rose-950',
    eventColor: '#fb7185',
    eventBorder: '#e11d48',
  },
};

export function getStatusMeta(status: RequestStatus): RequestStatusMeta {
  return REQUEST_STATUS_META[status];
}

export function formatRequestDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function canSignRequest(
  request: RequestResource,
  currentUserId: number,
  isAdmin: boolean,
): boolean {
  if (request.status !== 'pending') {
    return false;
  }

  if (isAdmin) {
    return request.user?.id === currentUserId;
  }

  return !request.user || request.user.id === currentUserId;
}

export function canApproveRequest(request: RequestResource, isAdmin: boolean): boolean {
  return isAdmin && request.status === 'signed';
}
