import { TestBed } from '@angular/core/testing';
import { GridService } from './grid.service';
import { DEFAULT_GRID_CONFIG, PAGE_SIZES } from '../models/grid.model';

describe('GridService', () => {
  let service: GridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default config on init', () => {
    const config = service.config();
    expect(config.cols).toBe(DEFAULT_GRID_CONFIG.cols);
    expect(config.rows).toBe(DEFAULT_GRID_CONFIG.rows);
    expect(config.cellIn).toBe(DEFAULT_GRID_CONFIG.cellIn);
  });

  it('should patch config correctly', () => {
    service.patch({ cols: 12, rows: 10 });
    const config = service.config();
    expect(config.cols).toBe(12);
    expect(config.rows).toBe(10);
    expect(config.cellIn).toBe(DEFAULT_GRID_CONFIG.cellIn); // unchanged
  });

  it('should reset to defaults', () => {
    service.patch({ cols: 20, rows: 20 });
    service.reset();
    expect(service.config().cols).toBe(DEFAULT_GRID_CONFIG.cols);
  });

  it('should compute correct page dimensions for A4 portrait', () => {
    service.patch({ pageSize: 'a4', orientation: 'portrait' });
    const dims = service.pageDims();
    expect(dims.widthIn).toBeCloseTo(8.27, 1);
    expect(dims.heightIn).toBeCloseTo(11.69, 1);
  });

  it('should swap dimensions for landscape orientation', () => {
    service.patch({ pageSize: 'a4', orientation: 'landscape' });
    const dims = service.pageDims();
    expect(dims.widthIn).toBeCloseTo(11.69, 1);
    expect(dims.heightIn).toBeCloseTo(8.27, 1);
  });

  it('should compute grid geometry correctly', () => {
    service.patch({ cols: 8, rows: 9, cellIn: 1.0 });
    const geo = service.gridGeometry();
    expect(geo.gridW).toBe(8);
    expect(geo.gridH).toBe(9);
  });

  it('should compute export sizes at 150 DPI', () => {
    service.patch({ exportDpi: 150, pageSize: 'a4', orientation: 'portrait' });
    const sizes = service.exportSizes();
    expect(sizes.pageW).toBe(Math.round(8.27 * 150));
    expect(sizes.pageH).toBe(Math.round(11.69 * 150));
  });

  it('should compute export sizes at 300 DPI', () => {
    service.patch({ exportDpi: 300, pageSize: 'a4', orientation: 'portrait' });
    const sizes = service.exportSizes();
    expect(sizes.pageW).toBe(Math.round(8.27 * 300));
    expect(sizes.pageH).toBe(Math.round(11.69 * 300));
  });

  it('should handle Letter page size', () => {
    service.patch({ pageSize: 'letter', orientation: 'portrait' });
    const dims = service.pageDims();
    expect(dims.widthIn).toBe(PAGE_SIZES['letter'].widthIn);
    expect(dims.heightIn).toBe(PAGE_SIZES['letter'].heightIn);
  });

  it('should handle custom page size', () => {
    service.patch({ pageSize: 'custom', customWidthIn: 10, customHeightIn: 12 });
    const dims = service.pageDims();
    expect(dims.widthIn).toBe(10);
    expect(dims.heightIn).toBe(12);
  });

  it('should correctly detect grid out of bounds', () => {
    service.patch({ cols: 20, rows: 20, cellIn: 2, marginSideIn: 0.5, marginTopIn: 0.5 });
    const geo = service.gridGeometry();
    expect(geo.fitsW).toBeFalse();
    expect(geo.fitsH).toBeFalse();
  });

  it('should render grid on canvas without errors', () => {
    const canvas  = document.createElement('canvas');
    expect(() => service.renderGrid(canvas, 72)).not.toThrow();
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });
});
