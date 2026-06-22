import { environment } from '../../../environments/environment';

export type DocumentKind = 'pdf' | 'image' | 'office' | 'unknown';

export function resolveBackendAsset(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return `${environment.backendUrl}${path}`;
}

export function resolveDocumentUrl(
  documentUrl: string | null | undefined,
  documentPath: string | null | undefined,
): string | null {
  const fromApi = resolveBackendAsset(documentUrl);
  if (fromApi) {
    return fromApi;
  }

  if (!documentPath) {
    return null;
  }

  const normalizedPath = documentPath.startsWith('storage/')
    ? `/${documentPath}`
    : `/storage/${documentPath}`;

  return resolveBackendAsset(normalizedPath);
}

export function getDocumentKind(pathOrUrl: string | null | undefined): DocumentKind {
  if (!pathOrUrl) {
    return 'unknown';
  }

  const ext = pathOrUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf') {
    return 'pdf';
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return 'image';
  }

  if (['doc', 'docx'].includes(ext)) {
    return 'office';
  }

  return 'unknown';
}

export function getFileName(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  return path.split('/').pop() ?? path;
}
