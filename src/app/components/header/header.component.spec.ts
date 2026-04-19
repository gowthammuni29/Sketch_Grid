import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { GridService } from '../../services/grid.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let gridService: GridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [GridService],
    }).compileComponents();

    fixture   = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    gridService = TestBed.inject(GridService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render app title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Sketch');
    expect(el.textContent).toContain('Grids');
  });

  it('should display grid info chip', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.info-chip')).toBeTruthy();
  });

  it('should emit exportTriggered on export button click', () => {
    spyOn(component.exportTriggered, 'emit');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary');
    btn.click();
    expect(component.exportTriggered.emit).toHaveBeenCalled();
  });

  it('should emit resetTriggered on reset button click', () => {
    spyOn(component.resetTriggered, 'emit');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-icon');
    btn.click();
    expect(component.resetTriggered.emit).toHaveBeenCalled();
  });

  it('should show loading state when exporting', () => {
    component.setExporting(true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Exporting');
  });

  it('should show success state when exported', () => {
    component.setExporting(false);
    component.setExported(true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Saved');
  });

  it('should not show install button by default', () => {
    const btn = fixture.nativeElement.querySelector('.btn-install');
    expect(btn).toBeFalsy();
  });

  it('should reflect config changes from service', () => {
    gridService.patch({ cols: 12, rows: 10 });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('12×10');
  });
});
