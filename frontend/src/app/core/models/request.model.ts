import { User } from './user.model';

export type RequestStatus = 'pending' | 'signed' | 'approved' | 'rejected';

export interface RequestResource {
  id: string;
  title: string;
  description: string;
  date: string;
  status: RequestStatus;
  document_path: string;
  document_url: string | null;
  signature_path: string;
  signature_url: string | null;
  signed_at: string;
  created_at: string;
  user?: User;
}

export interface SolicitudRequest {
  title: string;
  description: string;
  date: string;
  document?: File | null;
}

export interface SignatureRequest {
  signature: string | File;
}
