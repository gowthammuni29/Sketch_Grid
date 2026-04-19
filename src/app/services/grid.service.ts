/* =============================================
   SKETCH GRIDS — Grid Service
   Core business logic for grid rendering
   ============================================= */

import { Injectable, signal, computed, effect } from '@angular/core';
import {
  GridConfig,
  DEFAULT_GRID_CONFIG,
  PAGE_SIZES,
  ExportFormat,
  FitMode,
  LineDash,
  PageSize,
  Orientation,
} from '../models/grid.model';

@Injectable({ providedIn: 'root' })
export class GridService {
  /* ── State ── */
  config = signal<GridConfig>({ ...DEFAULT_GRID_CONFIG });

  /* ── Derived: page actual dimensions ── */
  pageDims = computed(() => {
    const c = this.config();
    let w = PAGE_SIZES[c.pageSize].widthIn;
    let h = PAGE_SIZES[c.pageSize].heightIn;
    if (c.pageSize === 'custom') { w = c.customWidthIn; h = c.customHeightIn; }
    if (c.orientation === 'landscape') { [w, h] = [h, w]; }
    return { widthIn: w, heightIn: h };
  });

  /* ── Derived: grid geometry inches ── */
  gridGeometry = computed(() => {
    const c  = this.config();
    const pg = this.pageDims();
    const gridW = c.cols * c.cellIn;
    const gridH = c.rows * c.cellIn;
    const availW = pg.widthIn  - 2 * c.marginSideIn;
    const availH = pg.heightIn - 2 * c.marginTopIn;
    const fitsH = gridH <= availH;
    const fitsW = gridW <= availW;
    return { gridW, gridH, availW, availH, fitsW, fitsH };
  });

  /* ── Derived: export pixel sizes ── */
  exportSizes = computed(() => {
    const c   = this.config();
    const pg  = this.pageDims();
    const geo = this.gridGeometry();
    const pxPerIn = c.exportDpi;
    const pageW   = Math.round(pg.widthIn  * pxPerIn);
    const pageH   = Math.round(pg.heightIn * pxPerIn);
    const gridW   = Math.round(geo.gridW   * pxPerIn);
    const gridH   = Math.round(geo.gridH   * pxPerIn);
    const cellPx  = Math.round(c.cellIn    * pxPerIn);
    return { pageW, pageH, gridW, gridH, cellPx };
  });

  /* ── Patch helper ── */
  patch(partial: Partial<GridConfig>): void {
    this.config.update(c => ({ ...c, ...partial }));
  }

  /* ── Reset ── */
  reset(): void {
    this.config.set({ ...DEFAULT_GRID_CONFIG });
  }

  /* ── Render to canvas ── */
  renderGrid(canvas: HTMLCanvasElement, scale = 1): void {
    const c   = this.config();
    const pg  = this.pageDims();
    const dpr = scale;

    const pageWpx = Math.round(pg.widthIn  * dpr);
    const pageHpx = Math.round(pg.heightIn * dpr);
    canvas.width  = pageWpx;
    canvas.height = pageHpx;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, pageWpx, pageHpx);

    /* Page background */
    if (c.showBg) {
      ctx.fillStyle = c.bgColor;
      ctx.fillRect(0, 0, pageWpx, pageHpx);
    }

    /* Image underlay */
    // Image is handled by component after rendering

    /* Grid positioning */
    const cellPx  = c.cellIn     * dpr;
    const gridWpx = c.cols * cellPx;
    const gridHpx = c.rows * cellPx;
    let offsetX   = c.marginSideIn * dpr;
    let offsetY   = c.marginTopIn  * dpr;
    if (c.centerGrid) {
      offsetX = (pageWpx - gridWpx) / 2;
      offsetY = (pageHpx - gridHpx) / 2;
    }

    /* Line style */
    ctx.save();
    ctx.globalAlpha = c.lineOpacity;
    ctx.strokeStyle = c.lineColor;
    ctx.lineWidth   = c.lineWidth;
    if (c.lineDash === 'dashed') ctx.setLineDash([cellPx * 0.3, cellPx * 0.15]);
    else if (c.lineDash === 'dotted') ctx.setLineDash([2, cellPx * 0.18]);
    else ctx.setLineDash([]);

    /* Draw grid lines */
    ctx.beginPath();
    for (let col = 0; col <= c.cols; col++) {
      const x = offsetX + col * cellPx;
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + gridHpx);
    }
    for (let row = 0; row <= c.rows; row++) {
      const y = offsetY + row * cellPx;
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + gridWpx, y);
    }
    ctx.stroke();
    ctx.restore();

    /* Row/Col numbers */
    if (c.showColNumbers || c.showRowNumbers) {
      ctx.save();
      const fontSize = Math.max(8, cellPx * 0.18);
      ctx.font = `${fontSize}px 'Space Mono', monospace`;
      ctx.fillStyle = c.lineColor;
      ctx.globalAlpha = c.lineOpacity * 0.7;
      if (c.showColNumbers) {
        for (let col = 0; col < c.cols; col++) {
          ctx.fillText(
            String(col + 1),
            offsetX + col * cellPx + 3,
            offsetY - 3
          );
        }
      }
      if (c.showRowNumbers) {
        for (let row = 0; row < c.rows; row++) {
          ctx.fillText(
            String(row + 1),
            offsetX - fontSize - 2,
            offsetY + row * cellPx + fontSize
          );
        }
      }
      ctx.restore();
    }

    /* Guide corner marks */
    if (c.showGuides) {
      ctx.save();
      ctx.strokeStyle = c.lineColor;
      ctx.globalAlpha = c.lineOpacity * 0.4;
      ctx.lineWidth   = Math.max(0.5, c.lineWidth * 0.5);
      ctx.setLineDash([]);
      const tick = cellPx * 0.15;
      [0, c.cols].forEach(col => {
        [0, c.rows].forEach(row => {
          const x = offsetX + col * cellPx;
          const y = offsetY + row * cellPx;
          ctx.beginPath();
          ctx.moveTo(x - tick, y); ctx.lineTo(x + tick, y);
          ctx.moveTo(x, y - tick); ctx.lineTo(x, y + tick);
          ctx.stroke();
        });
      });
      ctx.restore();
    }
  }

  /* ── Export ── */
  async exportImage(canvas: HTMLCanvasElement, image: HTMLImageElement | null): Promise<string> {
    const c    = this.config();
    const pg   = this.pageDims();
    const dpi  = c.exportDpi;

    const pageWpx = Math.round(pg.widthIn  * dpi);
    const pageHpx = Math.round(pg.heightIn * dpi);

    const offscreen = document.createElement('canvas');
    offscreen.width  = pageWpx;
    offscreen.height = pageHpx;
    const ctx = offscreen.getContext('2d')!;

    /* Background */
    if (c.showBg) {
      ctx.fillStyle = c.bgColor;
      ctx.fillRect(0, 0, pageWpx, pageHpx);
    }

    /* Image */
    if (image) {
      ctx.save();
      ctx.globalAlpha = c.imgOpacity;
      const geo   = this.gridGeometry();
      const cellPx = c.cellIn * dpi;
      const gridWpx = c.cols * cellPx;
      const gridHpx = c.rows * cellPx;
      let gx = (pageWpx - gridWpx) / 2;
      let gy = (pageHpx - gridHpx) / 2;
      if (!c.centerGrid) { gx = c.marginSideIn * dpi; gy = c.marginTopIn * dpi; }

      this._drawImage(ctx, image, gx, gy, gridWpx, gridHpx, c.fitMode);
      ctx.restore();
    }

    /* Render grid on top */
    this.renderGrid(offscreen, dpi);

    const mime = c.exportFormat === 'jpg' ? 'image/jpeg' : `image/${c.exportFormat}`;
    const quality = c.exportFormat === 'jpg' ? 0.92 : 1;
    return offscreen.toDataURL(mime, quality);
  }

  private _drawImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number,
    mode: FitMode
  ): void {
    if (mode === 'fill') {
      ctx.drawImage(img, x, y, w, h);
    } else if (mode === 'fit') {
      const ratio   = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth  * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      const ratio   = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth  * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      ctx.restore();
    }
  }

  triggerDownload(dataUrl: string, fmt: ExportFormat): void {
    const ext  = fmt;
    const name = `sketch-grids-${Date.now()}.${ext}`;
    const a    = document.createElement('a');
    a.href     = dataUrl;
    a.download = name;
    a.click();
  }
}
