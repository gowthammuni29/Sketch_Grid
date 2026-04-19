import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { GridService } from '../../services/grid.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let gridService: GridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [GridService],
    }).compileComponents();

    fixture     = TestBed.createComponent(SidebarComponent);
    component   = fixture.componentInstance;
    gridService = TestBed.inject(GridService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should default to grid tab', () => {
    expect(component.activeTab()).toBe('grid');
  });

  it('should switch tabs on click', () => {
    component.setTab('lines');
    expect(component.activeTab()).toBe('lines');
    component.setTab('export');
    expect(component.activeTab()).toBe('export');
  });

  it('should render all 4 tabs', () => {
    const tabs: HTMLElement[] = fixture.nativeElement.querySelectorAll('.tab-btn');
    expect(tabs.length).toBe(4);
  });

  it('should show grid panel by default', () => {
    const panel: HTMLElement = fixture.nativeElement.querySelector('#panel-grid');
    expect(panel?.classList).toContain('panel--active');
  });

  it('should patch service on column stepper', () => {
    component.patch({ cols: 15 });
    expect(gridService.config().cols).toBe(15);
  });

  it('should clamp values correctly', () => {
    expect(component.clamp(0,  1, 50)).toBe(1);
    expect(component.clamp(55, 1, 50)).toBe(50);
    expect(component.clamp(10, 1, 50)).toBe(10);
  });

  it('should apply preset correctly', () => {
    const preset = component.colorPresets[0];
    component.applyPreset(preset);
    const cfg = gridService.config();
    expect(cfg.lineColor).toBe(preset.color);
    expect(cfg.lineWidth).toBe(preset.width);
    expect(cfg.lineOpacity).toBe(preset.opacity);
  });

  it('should start drag on dragover', () => {
    const evt = new DragEvent('dragover', { cancelable: true });
    component.onDragOver(evt);
    expect(component.isDragging()).toBeTrue();
  });

  it('should stop drag on dragleave', () => {
    component.isDragging.set(true);
    component.onDragLeave();
    expect(component.isDragging()).toBeFalse();
  });

  it('should remove image', () => {
    gridService.patch({ image: 'data:image/png;base64,test' });
    component.imageMeta = { name: 'test.png', w: 100, h: 100, size: 50 };
    component.removeImage();
    expect(gridService.config().image).toBeNull();
    expect(component.imageMeta).toBeNull();
  });

  it('should emit exportRequested on export', () => {
    spyOn(component.exportRequested, 'emit');
    component.onExport();
    expect(component.exportRequested.emit).toHaveBeenCalled();
  });

  it('should show export panel when tab switched', () => {
    component.setTab('export');
    fixture.detectChanges();
    const panel: HTMLElement = fixture.nativeElement.querySelector('#panel-export');
    expect(panel?.classList).toContain('panel--active');
  });

  it('should show custom page fields when pageSize is custom', () => {
    gridService.patch({ pageSize: 'custom' });
    fixture.detectChanges();
    const customInput: HTMLElement = fixture.nativeElement.querySelector('#customW');
    expect(customInput).toBeTruthy();
  });
});
