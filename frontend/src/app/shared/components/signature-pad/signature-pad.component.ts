import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  template: `
    <div class="signature-pad">
      <div class="mb-2 flex items-center justify-between gap-3">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Dibuja tu firma
        </p>
        <button
          type="button"
          class="font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-cyan-700"
          (click)="clear()"
        >
          Limpiar
        </button>
      </div>

      <div class="relative border border-slate-300 bg-white">
        <canvas
          #canvas
          class="block h-44 w-full touch-none cursor-crosshair"
          (mousedown)="startDraw($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDraw()"
          (mouseleave)="stopDraw()"
          (touchstart.prevent)="startDraw($any($event))"
          (touchmove.prevent)="draw($any($event))"
          (touchend.prevent)="stopDraw()"
        ></canvas>
        @if (!hasInk()) {
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400"
          >
            Firma aquí con el ratón o el dedo
          </span>
        }
      </div>

      @if (error()) {
        <p class="mt-2 text-xs text-red-600" role="alert">{{ error() }}</p>
      }

      <button
        type="button"
        class="mt-3 w-full border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        [disabled]="submitting()"
        (click)="submit()"
      >
        {{ submitting() ? 'Enviando firma…' : 'Confirmar y firmar solicitud' }}
      </button>
    </div>
  `,
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx?: CanvasRenderingContext2D;
  private drawing = false;
  private resizeObserver?: ResizeObserver;

  readonly hasInk = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly signatureSubmit = output<string>();

  ngAfterViewInit(): void {
    this.initCanvas();

    const canvas = this.canvasRef().nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.initCanvas(true));
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  clear(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.hasInk.set(false);
    this.error.set(null);
  }

  setSubmitting(value: boolean): void {
    this.submitting.set(value);
  }

  submit(): void {
    if (!this.hasInk()) {
      this.error.set('Debes dibujar tu firma antes de enviar.');
      return;
    }

    this.error.set(null);
    const dataUrl = this.canvasRef().nativeElement.toDataURL('image/png');
    this.signatureSubmit.emit(dataUrl);
  }

  protected startDraw(event: MouseEvent | TouchEvent): void {
    this.drawing = true;
    this.error.set(null);
    this.plot(event, true);
  }

  protected draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing) {
      return;
    }

    this.plot(event, false);
  }

  protected stopDraw(): void {
    this.drawing = false;
  }

  private initCanvas(preserve = false): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const snapshot = preserve && this.hasInk() ? canvas.toDataURL('image/png') : null;

    canvas.width = Math.max(Math.floor(rect.width), 1);
    canvas.height = Math.max(Math.floor(rect.height), 1);

    this.ctx = canvas.getContext('2d') ?? undefined;
    if (!this.ctx) {
      return;
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 2.25;
    this.ctx.strokeStyle = '#0f172a';

    if (snapshot) {
      const image = new Image();
      image.onload = () => {
        this.ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = snapshot;
    }
  }

  private plot(event: MouseEvent | TouchEvent, start: boolean): void {
    if (!this.ctx) {
      return;
    }

    const point = this.getPoint(event);
    if (!point) {
      return;
    }

    if (start) {
      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
      return;
    }

    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    this.hasInk.set(true);
  }

  private getPoint(event: MouseEvent | TouchEvent): { x: number; y: number } | null {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;

    if (clientX === undefined || clientY === undefined) {
      return null;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }
}
