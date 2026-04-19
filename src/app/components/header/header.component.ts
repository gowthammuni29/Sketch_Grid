/* =============================================
   SKETCH GRIDS — Header Component
   ============================================= */

import {
  Component, inject, signal, output, computed,
  OnInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridService } from '../../services/grid.service';
import { PAGE_SIZES } from '../../models/grid.model';

@Component({
  selector: 'sg-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private gridSvc = inject(GridService);

  /* ── Outputs ── */
  exportTriggered = output<void>();
  resetTriggered  = output<void>();

  /* ── State ── */
  exporting = signal(false);
  exported  = signal(false);
  installPrompt: BeforeInstallPromptEvent | null = null;

  /* ── From service ── */
  config  = this.gridSvc.config;
  geom    = this.gridSvc.gridGeometry;

  pageDimsLabel = computed(() => {
    const c  = this.gridSvc.config();
    const pg = this.gridSvc.pageDims();
    const label = PAGE_SIZES[c.pageSize]?.label ?? 'Custom';
    const orient = c.orientation === 'landscape' ? ' ↔' : '';
    return `${label}${orient} · ${c.exportDpi} DPI`;
  })();

  /* ── PWA install ── */
  private pwaHandler = (e: Event) => {
    e.preventDefault();
    this.installPrompt = e as BeforeInstallPromptEvent;
  };

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', this.pwaHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.pwaHandler);
  }

  async onInstall(): Promise<void> {
    if (!this.installPrompt) return;
    this.installPrompt.prompt();
    await this.installPrompt.userChoice;
    this.installPrompt = null;
  }

  onReset(): void {
    this.resetTriggered.emit();
  }

  onExport(): void {
    this.exportTriggered.emit();
  }

  setExporting(v: boolean): void { this.exporting.set(v); }
  setExported(v: boolean): void  { this.exported.set(v);  }
}

/* PWA event type */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
