import { Component, inject, OnInit, signal } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { RequestResource } from '../../../core/models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  template: `
    <section class="requests">
      <h1>Mis solicitudes</h1>

      @if (loading()) {
        <p>Cargando solicitudes…</p>
      } @else if (error()) {
        <p class="requests__error">{{ error() }}</p>
      } @else if (requests().length === 0) {
        <p>No hay solicitudes.</p>
      } @else {
        <ul>
          @for (request of requests(); track request.id) {
            <li>
              <strong>{{ request.title }}</strong> — {{ request.status }}
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .requests {
      max-width: 48rem;
      margin: 2rem auto;
      padding: 1.5rem;
    }

    .requests__error {
      color: #b91c1c;
    }
  `,
})
export class RequestListComponent implements OnInit {
  private readonly requestService = inject(RequestService);

  protected readonly requests = signal<RequestResource[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.requestService.index().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
