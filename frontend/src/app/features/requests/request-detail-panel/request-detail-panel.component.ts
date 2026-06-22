import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthState } from '../../../core/state/auth.state';
import { RequestService } from '../../../core/services/request.service';
import { RequestResource } from '../../../core/models';
import { resolveBackendAsset, resolveDocumentUrl, getDocumentKind, getFileName } from '../../../core/utils/asset.util';
import {
  canApproveRequest,
  canSignRequest,
  formatDateTime,
  formatRequestDate,
  getStatusMeta,
} from '../../../core/utils/request-status.util';
import { SignaturePadComponent } from '../../../shared/components/signature-pad/signature-pad.component';
import { ApiError } from '../../../core/models';

@Component({
  selector: 'app-request-detail-panel',
  standalone: true,
  imports: [SignaturePadComponent],
  templateUrl: './request-detail-panel.component.html',
})
export class RequestDetailPanelComponent {
  private readonly authState = inject(AuthState);
  private readonly requestService = inject(RequestService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly signaturePad = viewChild(SignaturePadComponent);

  readonly request = input.required<RequestResource | null>();
  readonly open = input(false);
  readonly loading = input(false);

  readonly closed = output<void>();
  readonly requestUpdated = output<RequestResource>();

  protected readonly actionError = signal<string | null>(null);
  protected readonly actionLoading = signal(false);

  protected readonly authUser = this.authState.currentUser;
  protected readonly isAdmin = this.authState.isAdmin;

  protected statusMeta(status: RequestResource['status']) {
    return getStatusMeta(status);
  }

  protected formatDate(date: string): string {
    return formatRequestDate(date);
  }

  protected formatDateTime(value: string | null | undefined): string | null {
    return formatDateTime(value);
  }

  protected assetUrl(url: string | null | undefined): string | null {
    return resolveBackendAsset(url);
  }

  protected documentUrl(item: RequestResource): string | null {
    return resolveDocumentUrl(item.document_url, item.document_path);
  }

  protected documentKind(item: RequestResource) {
    return getDocumentKind(item.document_path ?? item.document_url);
  }

  protected documentName(item: RequestResource): string | null {
    return getFileName(item.document_path);
  }

  protected safeDocumentUrl(item: RequestResource): SafeResourceUrl | null {
    const url = this.documentUrl(item);
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  protected canSign(item: RequestResource): boolean {
    const user = this.authUser();
    if (!user) {
      return false;
    }

    return canSignRequest(item, user.id, this.isAdmin());
  }

  protected canApprove(item: RequestResource): boolean {
    return canApproveRequest(item, this.isAdmin());
  }

  protected close(): void {
    this.actionError.set(null);
    this.closed.emit();
  }

  protected onSignatureSubmit(dataUrl: string): void {
    const item = this.request();
    if (!item) {
      return;
    }

    this.actionLoading.set(true);
    this.actionError.set(null);
    this.signaturePad()?.setSubmitting(true);

    this.requestService.signature(Number(item.id), { signature: dataUrl }).subscribe({
      next: (updated) => {
        this.actionLoading.set(false);
        this.signaturePad()?.setSubmitting(false);
        this.requestUpdated.emit(updated);
      },
      error: (error: ApiError) => {
        this.actionLoading.set(false);
        this.signaturePad()?.setSubmitting(false);
        this.actionError.set(error.message);
      },
    });
  }

  protected approve(): void {
    const item = this.request();
    if (!item || !this.canApprove(item)) {
      return;
    }

    this.runAdminAction(() => this.requestService.approve(Number(item.id)));
  }

  protected reject(): void {
    const item = this.request();
    if (!item || !this.canApprove(item)) {
      return;
    }

    this.runAdminAction(() => this.requestService.reject(Number(item.id)));
  }

  private runAdminAction(action: () => ReturnType<RequestService['approve']>): void {
    this.actionLoading.set(true);
    this.actionError.set(null);

    action().subscribe({
      next: (updated) => {
        this.actionLoading.set(false);
        this.requestUpdated.emit(updated);
      },
      error: (error: ApiError) => {
        this.actionLoading.set(false);
        this.actionError.set(error.message);
      },
    });
  }
}
