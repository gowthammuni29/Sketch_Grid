/* =============================================
   SKETCH GRIDS — Domain Models
   ============================================= */

export type ExportFormat = 'png' | 'jpg' | 'webp';
export type FitMode      = 'fill' | 'fit' | 'cover';
export type LineDash     = 'solid' | 'dashed' | 'dotted';
export type PageSize     = 'a4' | 'letter' | 'a3' | 'a5' | 'square' | 'custom';
export type Orientation  = 'portrait' | 'landscape';
export type ActiveTab    = 'grid' | 'lines' | 'image' | 'export';

export interface PageDimensions {
  widthIn: number;
  heightIn: number;
  label: string;
}

export const PAGE_SIZES: Record<PageSize, PageDimensions> = {
  a4:     { widthIn: 8.27,  heightIn: 11.69, label: 'A4' },
  letter: { widthIn: 8.5,   heightIn: 11,    label: 'Letter' },
  a3:     { widthIn: 11.69, heightIn: 16.54, label: 'A3' },
  a5:     { widthIn: 5.83,  heightIn: 8.27,  label: 'A5' },
  square: { widthIn: 8,     heightIn: 8,     label: 'Square' },
  custom: { widthIn: 8.27,  heightIn: 11.69, label: 'Custom' },
};

export interface GridConfig {
  /* Page */
  pageSize: PageSize;
  orientation: Orientation;
  customWidthIn: number;
  customHeightIn: number;

  /* Grid */
  cols: number;
  rows: number;
  cellIn: number;
  marginSideIn: number;
  marginTopIn: number;
  showGuides: boolean;
  centerGrid: boolean;

  /* Lines */
  lineColor: string;
  lineWidth: number;
  lineOpacity: number;
  lineDash: LineDash;
  showRowNumbers: boolean;
  showColNumbers: boolean;

  /* Background */
  bgColor: string;
  showBg: boolean;

  /* Image overlay */
  image: string | null;
  fitMode: FitMode;
  imgOpacity: number;

  /* Export */
  exportFormat: ExportFormat;
  exportDpi: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  pageSize: 'a4',
  orientation: 'portrait',
  customWidthIn: 8.27,
  customHeightIn: 11.69,

  cols: 8,
  rows: 9,
  cellIn: 1.0,
  marginSideIn: 0.5,
  marginTopIn: 0.5,
  showGuides: true,
  centerGrid: true,

  lineColor: '#00e5ff',
  lineWidth: 1.5,
  lineOpacity: 0.7,
  lineDash: 'solid',
  showRowNumbers: false,
  showColNumbers: false,

  bgColor: '#ffffff',
  showBg: true,

  image: null,
  fitMode: 'fit',
  imgOpacity: 1,

  exportFormat: 'png',
  exportDpi: 150,
};

export interface ColorPreset {
  label: string;
  color: string;
  width: number;
  opacity: number;
  dash: LineDash;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { label: 'Cyan',   color: '#00e5ff', width: 1.5, opacity: 0.75, dash: 'solid'  },
  { label: 'Violet', color: '#a855f7', width: 1.5, opacity: 0.75, dash: 'solid'  },
  { label: 'Black',  color: '#1a1a1a', width: 1.0, opacity: 1.0,  dash: 'solid'  },
  { label: 'Blue',   color: '#3b82f6', width: 1.5, opacity: 0.8,  dash: 'solid'  },
  { label: 'White',  color: '#ffffff', width: 1.0, opacity: 0.7,  dash: 'solid'  },
  { label: 'Gray',   color: '#888888', width: 1.0, opacity: 0.6,  dash: 'solid'  },
  { label: 'Red',    color: '#ef4444', width: 1.5, opacity: 0.85, dash: 'solid'  },
  { label: 'Dotted', color: '#00e5ff', width: 1.5, opacity: 0.75, dash: 'dotted' },
];

export interface ExportDpiOption {
  value: number;
  label: string;
  hint: string;
}

export const DPI_OPTIONS: ExportDpiOption[] = [
  { value: 72,  label: '72',  hint: 'Screen only' },
  { value: 96,  label: '96',  hint: 'Web/Digital' },
  { value: 150, label: '150', hint: 'Print ready' },
  { value: 200, label: '200', hint: 'High quality' },
  { value: 300, label: '300', hint: 'Professional' },
];
