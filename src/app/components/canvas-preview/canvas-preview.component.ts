/* =============================================
   SKETCH GRIDS — Canvas Preview Component
   Renders live grid preview with zoom/pan
   ============================================= */

import {
  Component, inject, signal, computed, effect,
  ElementRef, ViewChild, AfterViewInit, OnDestroy,
  ChangeDetectionStrategy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridService } from '../../services/grid.service';

interface RulerTick { pos: number; label: string; }

@Component({
  selector: 'sg-canvas-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas-preview.component.html',
  styleUrl: './canvas-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasPreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gridCanvas')  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewArea') areaRef!: ElementRef<HTMLElement>;

  private gridSvc = inject(GridService);
  private zone    = inject(NgZone);

  /* ── From service ── */
  config   = this.gridSvc.config;
  geom     = this.gridSvc.gridGeometry;
  pageDims = this.gridSvc.pageDims;

  /* ── Zoom ── */
  zoom      = signal(1);
  showRulers = signal(true);

  private readonly ZOOM_STEP = 0.15;
  private readonly ZOOM_MIN  = 0.2;
  private readonly ZOOM_MAX  = 4;

  /* ── Preview DPI (screen render) ── */
  private readonly PREVIEW_DPI = 96;

  /* ── Image element for overlay ── */
  private imageEl: HTMLImageElement | null = null;

  /* ── Computed labels ── */
  zoomLabel = computed(() => `${Math.round(this.zoom() * 100)}%`);

  pageLabel = computed(() => {
    const pg = this.pageDims();
    const c  = this.config();
    return `${pg.widthIn}" × ${pg.heightIn}"  ·  ${c.pageSize.toUpperCase()}`;
  });

  canvasTransform = computed(() => `scale(${this.zoom()})`);

  /* ── Ruler ticks ── */
  hTicks = computed<RulerTick[]>(() => this._buildTicks('h'));
  vTicks = computed<RulerTick[]>(() => this._buildTicks('v'));

  /* ── Effects ── */
  private renderEffect = effect(() => {
    // Track all reactive signals
    const cfg = this.config();
    void cfg; // subscibe

    if (this.canvasRef?.nativeElement) {
      this._loadImageAndRender();
    }
  });

  ngAfterViewInit(): void {
    this._loadImageAndRender();
    this.fitToScreen();
  }

  ngOnDestroy(): void {
    this.renderEffect.destroy();
  }

  /* ── Render pipeline ── */
  private _loadImageAndRender(): void {
    const cfg = this.config();
    if (cfg.image && (!this.imageEl || this.imageEl.src !== cfg.image)) {
      const img = new Image();
      img.onload = () => {
        this.imageEl = img;
        this._render();
      };
      img.src = cfg.image;
    } else {
      if (!cfg.image) this.imageEl = null;
      this._render();
    }
  }

  private _render(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.zone.runOutsideAngular(() => {
      /* Render grid */
      this.gridSvc.renderGrid(canvas, this.PREVIEW_DPI);

      /* Draw image overlay on top if present */
      if (this.imageEl) {
        const cfg    = this.config();
        const pg     = this.pageDims();
        const dpi    = this.PREVIEW_DPI;
        const pageWpx = Math.round(pg.widthIn  * dpi);
        const pageHpx = Math.round(pg.heightIn * dpi);
        const cellPx  = cfg.cellIn * dpi;
        const gridWpx = cfg.cols * cellPx;
        const gridHpx = cfg.rows * cellPx;
        let gx = (pageWpx - gridWpx) / 2;
        let gy = (pageHpx - gridHpx) / 2;
        if (!cfg.centerGrid) { gx = cfg.marginSideIn * dpi; gy = cfg.marginTopIn * dpi; }

        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.globalAlpha = cfg.imgOpacity;
        this._drawImageMode(ctx, this.imageEl, gx, gy, gridWpx, gridHpx, cfg.fitMode as any);
        ctx.restore();

        /* Re-draw grid lines on top */
        this.gridSvc.renderGrid(canvas, this.PREVIEW_DPI);
      }
    });
  }

  private _drawImageMode(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number,
    mode: 'fill' | 'fit' | 'cover'
  ): void {
    if (mode === 'fill') {
      ctx.drawImage(img, x, y, w, h);
    } else if (mode === 'fit') {
      const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth  * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth  * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      ctx.restore();
    }
  }

  /* ── Zoom ── */
  zoomIn():    void { this.zoom.update(z => Math.min(this.ZOOM_MAX, +(z + this.ZOOM_STEP).toFixed(2))); }
  zoomOut():   void { this.zoom.update(z => Math.max(this.ZOOM_MIN, +(z - this.ZOOM_STEP).toFixed(2))); }
  resetZoom(): void { this.zoom.set(1); }

  fitToScreen(): void {
    const area = this.areaRef?.nativeElement;
    if (!area) return;

    const pg  = this.pageDims();
    const aW  = area.clientWidth  - 80;
    const aH  = area.clientHeight - 80;
    const cW  = pg.widthIn  * this.PREVIEW_DPI;
    const cH  = pg.heightIn * this.PREVIEW_DPI;
    const fit = Math.min(aW / cW, aH / cH, 1);
    this.zoom.set(+fit.toFixed(2));
  }

  onWheel(e: WheelEvent): void {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (e.deltaY < 0) this.zoomIn();
    else              this.zoomOut();
  }

  toggleRulers(): void { this.showRulers.update(v => !v); }

  /* ── Rulers ── */
  private _buildTicks(axis: 'h' | 'v'): RulerTick[] {
    const pg    = this.pageDims();
    const total = axis === 'h' ? pg.widthIn : pg.heightIn;
    const ticks: RulerTick[] = [];
    for (let i = 0; i <= total; i += 0.5) {
      ticks.push({
        pos:   i * this.PREVIEW_DPI * this.zoom(),
        label: i % 1 === 0 ? `${i}"` : '',
      });
    }
    return ticks;
  }

  /* ── Export (called from parent) ── */
  async exportGrid(): Promise<void> {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const dataUrl = await this.gridSvc.exportImage(canvas, this.imageEl);
    this.gridSvc.triggerDownload(dataUrl, this.config().exportFormat);
  }
}
