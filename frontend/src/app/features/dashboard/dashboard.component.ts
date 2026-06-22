import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { AuthService } from '../../core/services/auth.service';
import { RequestService } from '../../core/services/request.service';
import { AuthState } from '../../core/state/auth.state';
import { RequestResource, RequestStatus } from '../../core/models';
import { getStatusMeta, REQUEST_STATUS_META } from '../../core/utils/request-status.util';
import { RequestDetailPanelComponent } from '../requests/request-detail-panel/request-detail-panel.component';
import { CreateRequestPanelComponent } from '../requests/create-request-panel/create-request-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FullCalendarModule, RequestDetailPanelComponent, CreateRequestPanelComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly authState = inject(AuthState);
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(RequestService);
  private readonly router = inject(Router);
  private readonly createPanel = viewChild(CreateRequestPanelComponent);

  protected readonly authUser = this.authState.currentUser;
  protected readonly isAdmin = this.authState.isAdmin;
  protected readonly role = this.authState.role;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly requests = signal<RequestResource[]>([]);
  protected readonly selectedRequest = signal<RequestResource | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);

  protected readonly statusLegend = Object.entries(REQUEST_STATUS_META) as [
    RequestStatus,
    (typeof REQUEST_STATUS_META)[RequestStatus],
  ][];

  protected calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locales: [esLocale],
    locale: 'es',
    firstDay: 1,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
    },
    events: [],
    eventClick: (info) => this.onEventClick(info),
    eventDisplay: 'block',
    dayMaxEvents: 3,
    moreLinkText: (n) => `+${n} más`,
    eventContent: (arg) => this.renderEventContent(arg),
  });

  ngOnInit(): void {
    this.loadRequests();
  }

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedRequest.set(null);
  }

  protected openCreatePanel(): void {
    this.createPanel()?.show();
  }

  protected onRequestCreated(request: RequestResource): void {
    this.requests.update((items) => [request, ...items]);
    this.syncCalendarEvents();
    this.selectedRequest.set(request);
    this.detailOpen.set(true);
    this.detailLoading.set(false);
  }

  protected onRequestUpdated(updated: RequestResource): void {
    this.selectedRequest.set(updated);
    this.requests.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
    this.syncCalendarEvents();
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.requestService.index().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.syncCalendarEvents();
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  private onEventClick(info: EventClickArg): void {
    const request = info.event.extendedProps['request'] as RequestResource | undefined;
    if (!request) {
      return;
    }

    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.selectedRequest.set(request);

    this.requestService.show(Number(request.id)).subscribe({
      next: (fresh) => {
        this.selectedRequest.set(fresh);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
      },
    });
  }

  private syncCalendarEvents(): void {
    const events: EventInput[] = this.requests().map((request) => {
      const meta = getStatusMeta(request.status);

      return {
        id: String(request.id),
        title: request.title,
        start: request.date,
        allDay: true,
        backgroundColor: meta.eventColor,
        borderColor: meta.eventBorder,
        textColor: '#0f172a',
        extendedProps: { request },
      };
    });

    this.calendarOptions.update((options) => ({
      ...options,
      events,
    }));
  }

  private renderEventContent(arg: EventContentArg): { html: string } {
    const request = arg.event.extendedProps['request'] as RequestResource | undefined;
    const status = request?.status ?? 'pending';
    const meta = getStatusMeta(status);
    const title = arg.event.title;

    return {
      html: `
        <div class="fc-request-event">
          <span class="fc-request-event__status">${meta.label}</span>
          <span class="fc-request-event__title">${this.escapeHtml(title)}</span>
        </div>
      `,
    };
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
}
