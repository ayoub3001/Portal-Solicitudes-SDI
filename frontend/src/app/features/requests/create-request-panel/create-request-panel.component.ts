import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { ApiError, RequestResource } from '../../../core/models';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-create-request-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-request-panel.component.html',
})
export class CreateRequestPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly requestService = inject(RequestService);

  readonly open = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly selectedFileName = signal<string | null>(null);

  readonly created = output<RequestResource>();
  readonly closed = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required]],
    date: [this.todayIso(), [Validators.required]],
  });

  private selectedFile: File | null = null;

  show(): void {
    this.resetForm();
    this.open.set(true);
  }

  protected close(): void {
    if (this.submitting()) {
      return;
    }

    this.open.set(false);
    this.resetForm();
    this.closed.emit();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = null;
      this.selectedFileName.set(null);
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      this.errorMessage.set('Formato no permitido. Usa PDF, DOC, DOCX, JPG o PNG.');
      input.value = '';
      this.selectedFile = null;
      this.selectedFileName.set(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.errorMessage.set('El archivo no puede superar 10 MB.');
      input.value = '';
      this.selectedFile = null;
      this.selectedFileName.set(null);
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile = file;
    this.selectedFileName.set(file.name);
  }

  protected clearFile(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.selectedFile = null;
    this.selectedFileName.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    const payload = {
      ...this.form.getRawValue(),
      document: this.selectedFile,
    };

    this.requestService.store(payload).subscribe({
      next: (request) => {
        this.submitting.set(false);
        this.open.set(false);
        this.resetForm();
        this.created.emit(request);
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
        if (error.validationErrors) {
          this.fieldErrors.set(error.validationErrors);
        }
      },
    });
  }

  protected fieldError(field: string): string | null {
    const apiErrors = this.fieldErrors()[field];
    if (apiErrors?.length) {
      return apiErrors[0];
    }

    const control = this.form.get(field);
    if (!control?.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('maxlength')) {
      return 'Máximo 255 caracteres.';
    }

    return null;
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      description: '',
      date: this.todayIso(),
    });
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
