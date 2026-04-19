import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasPreviewComponent } from './canvas-preview.component';
import { GridService } from '../../services/grid.service';

describe('CanvasPreviewComponent', () => {
  let component: CanvasPreviewComponent;
  let fixture: ComponentFixture<CanvasPreviewComponent>;
  let gridService: GridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasPreviewComponent],
      providers: [GridService],
    }).compileComponents();

    fixture     = TestBed.createComponent(CanvasPreviewComponent);
    component   = fixture.componentInstance;
    gridService = TestBed.inject(GridService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should default zoom to 1', () => {
    expect(component.zoom()).toBe(1);
  });

  it('should zoom in by ZOOM_STEP', () => {
    const before = component.zoom();
    component.zoomIn();
    expect(component.zoom()).toBeCloseTo(before + 0.15, 2);
  });

  it('should zoom out by ZOOM_STEP', () => {
    component.zoom.set(1);
    component.zoomOut();
    expect(component.zoom()).toBeCloseTo(0.85, 2);
  });

  it('should not zoom below minimum', () => {
    component.zoom.set(0.2);
    component.zoomOut();
    expect(component.zoom()).toBe(0.2);
  });

  it('should not zoom above maximum', () => {
    component.zoom.set(4);
    component.zoomIn();
    expect(component.zoom()).toBe(4);
  });

  it('should reset zoom to 1', () => {
    component.zoom.set(2.5);
    component.resetZoom();
    expect(component.zoom()).toBe(1);
  });

  it('should toggle rulers', () => {
    const initial = component.showRulers();
    component.toggleRulers();
    expect(component.showRulers()).toBe(!initial);
  });

  it('should show rulers in DOM when enabled', () => {
    component.showRulers.set(true);
    fixture.detectChanges();
    const ruler = fixture.nativeElement.querySelector('.ruler');
    expect(ruler).toBeTruthy();
  });

  it('should hide rulers in DOM when disabled', () => {
    component.showRulers.set(false);
    fixture.detectChanges();
    const ruler = fixture.nativeElement.querySelector('.ruler');
    expect(ruler).toBeFalsy();
  });

  it('should update zoom label correctly', () => {
    component.zoom.set(1.5);
    expect(component.zoomLabel()).toBe('150%');
  });

  it('should handle wheel event with ctrl key', () => {
    const before = component.zoom();
    const event  = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true });
    spyOn(event, 'preventDefault');
    component.onWheel(event);
    expect(component.zoom()).toBeGreaterThan(before);
  });

  it('should not zoom on wheel without ctrl key', () => {
    const before = component.zoom();
    const event  = new WheelEvent('wheel', { deltaY: -100, ctrlKey: false });
    component.onWheel(event);
    expect(component.zoom()).toBe(before);
  });

  it('should render canvas element', () => {
    const canvas = fixture.nativeElement.querySelector('.grid-canvas');
    expect(canvas).toBeTruthy();
  });

  it('should reflect service config in page label', () => {
    gridService.patch({ pageSize: 'a4', orientation: 'portrait' });
    fixture.detectChanges();
    expect(component.pageLabel()).toContain('A4');
  });
});
