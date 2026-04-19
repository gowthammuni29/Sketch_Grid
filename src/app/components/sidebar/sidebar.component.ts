/* =============================================
   SKETCH GRIDS — Sidebar Component
   ============================================= */

import {
  Component, inject, signal, computed, output,
  ChangeDetectionStrategy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridService } from '../../services/grid.service';
import {
  GridConfig, ActiveTab, FitMode, ExportFormat, LineDash,
  COLOR_PRESETS, ColorPreset, DPI_OPTIONS, ExportDpiOption, PageSize
} from '../../models/grid.model';

interface Tab { id: ActiveTab; label: string; icon: string; }

@Component({
  selector: 'sg-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private gridSvc = inject(GridService);

  /* ── Outputs ── */
  exportRequested = output<void>();

  /* ── State ── */
  activeTab  = signal<ActiveTab>('grid');
  isDragging = signal(false);
  exporting  = signal(false);
  exported   = signal(false);
  imageMeta: { name: string; w: number; h: number; size: number } | null = null;

  /* ── From service ── */
  config      = this.gridSvc.config;
  geom        = this.gridSvc.gridGeometry;
  pageDims    = this.gridSvc.pageDims;
  exportSizes = this.gridSvc.exportSizes;

  /* ── Static data ── */
  tabs: Tab[] = [
    { id: 'grid',   label: 'Grid',   icon: this._gridIcon() },
    { id: 'lines',  label: 'Lines',  icon: this._linesIcon() },
    { id: 'image',  label: 'Image',  icon: this._imageIcon() },
    { id: 'export', label: 'Export', icon: this._exportIcon() },
  ];

  colorPresets: ColorPreset[] = COLOR_PRESETS;
  dpiOptions: ExportDpiOption[] = DPI_OPTIONS;

  cellTicks = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  dashOptions: { id: LineDash; label: string }[] = [
    { id: 'solid',  label: 'Solid'  },
    { id: 'dashed', label: 'Dashed' },
    { id: 'dotted', label: 'Dotted' },
  ];

  formats: { id: ExportFormat; desc: string }[] = [
    { id: 'png',  desc: 'Lossless · Best for print'      },
    { id: 'jpg',  desc: 'Smaller · Web sharing'          },
    { id: 'webp', desc: 'Modern · Smallest size'         },
  ];

  fitModes: { id: FitMode; label: string }[] = [
    { id: 'fill',  label: 'Stretch' },
    { id: 'fit',   label: 'Fit'     },
    { id: 'cover', label: 'Cover'   },
  ];

  /* ── Computed hints ── */
  get fitHint(): string {
    const m = this.config().fitMode;
    if (m === 'fill')  return 'Stretches image to fill the entire grid exactly.';
    if (m === 'fit')   return 'Preserves aspect ratio — white space may appear.';
    return 'Fills full grid keeping ratio — edges may be cropped.';
  }

  get formatHint(): string {
    const f = this.config().exportFormat;
    if (f === 'png')  return 'Lossless · Best for printing · Larger file';
    if (f === 'jpg')  return 'Great for sharing · 92% quality · Smaller';
    return 'Modern format · Very small · Excellent quality';
  }

  /* ── Helpers ── */
  setTab(id: ActiveTab): void { this.activeTab.set(id); }

  patch(partial: Partial<GridConfig>): void { this.gridSvc.patch(partial); }

  numVal(e: Event): number { return parseFloat((e.target as HTMLInputElement).value) || 0; }
  strVal(e: Event): string { return (e.target as HTMLInputElement).value; }
  selectVal(e: Event): PageSize { return (e.target as HTMLSelectElement).value as PageSize; }
  clamp(v: number, min: number, max: number): number { return Math.min(max, Math.max(min, v)); }

  applyPreset(p: ColorPreset): void {
    this.gridSvc.patch({
      lineColor:   p.color,
      lineWidth:   p.width,
      lineOpacity: p.opacity,
      lineDash:    p.dash,
    });
  }

  /* ── Image handling ── */
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void { this.isDragging.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.loadImage(file);
  }

  onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.loadImage(file);
  }

  loadImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        this.imageMeta = {
          name: file.name,
          w:    img.naturalWidth,
          h:    img.naturalHeight,
          size: Math.round(file.size / 1024),
        };
        this.gridSvc.patch({ image: dataUrl });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageMeta = null;
    this.gridSvc.patch({ image: null });
  }

  /* ── Export ── */
  onExport(): void { this.exportRequested.emit(); }

  setExporting(v: boolean): void { this.exporting.set(v); }
  setExported(v: boolean):  void { this.exported.set(v);  }

  /* ── SVG icons (inline, tree-shakeable) ── */
  private _gridIcon(): string {
    return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="0.5" y="0.5" width="5" height="5" stroke="currentColor" stroke-width="1.2"/>
      <rect x="7.5" y="0.5" width="5" height="5" stroke="currentColor" stroke-width="1.2"/>
      <rect x="0.5" y="7.5" width="5" height="5" stroke="currentColor" stroke-width="1.2"/>
      <rect x="7.5" y="7.5" width="5" height="5" stroke="currentColor" stroke-width="1.2"/>
    </svg>`;
  }
  private _linesIcon(): string {
    return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <line x1="0" y1="3.5" x2="13" y2="3.5" stroke="currentColor" stroke-width="1.2"/>
      <line x1="0" y1="6.5" x2="13" y2="6.5" stroke="currentColor" stroke-width="1.2"/>
      <line x1="0" y1="9.5" x2="13" y2="9.5" stroke="currentColor" stroke-width="1.2"/>
    </svg>`;
  }
  private _imageIcon(): string {
    return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="0.5" y="0.5" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="4" cy="4" r="1.2" fill="currentColor"/>
      <path d="M0.5 9l3-3 2.5 2.5L8 6.5l4.5 6" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  }
  private _exportIcon(): string {
    return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5M1 10.5h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
}
