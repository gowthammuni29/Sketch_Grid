import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GridService } from './services/grid.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let gridService: GridService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [GridService],
    }).compileComponents();

    fixture     = TestBed.createComponent(AppComponent);
    component   = fixture.componentInstance;
    gridService = TestBed.inject(GridService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should start with loaded = false (splash visible)', () => {
    expect(component.loaded()).toBeFalse();
  });

  it('should set loaded = true after delay', fakeAsync(() => {
    tick(1400);
    fixture.detectChanges();
    expect(component.loaded()).toBeTrue();
  }));

  it('should show splash screen before loaded', () => {
    const splash: HTMLElement = fixture.nativeElement.querySelector('.splash');
    expect(splash).toBeTruthy();
  });

  it('should have 16 splash cells', () => {
    expect(component.splashCells.length).toBe(16);
  });

  it('should call gridService.reset on onReset()', () => {
    spyOn(gridService, 'reset');
    component.onReset();
    expect(gridService.reset).toHaveBeenCalled();
  });

  it('should show main content after loaded', fakeAsync(() => {
    tick(1400);
    fixture.detectChanges();
    const header: HTMLElement = fixture.nativeElement.querySelector('sg-header');
    expect(header).toBeTruthy();
  }));

  it('should show sidebar after loaded', fakeAsync(() => {
    tick(1400);
    fixture.detectChanges();
    const sidebar: HTMLElement = fixture.nativeElement.querySelector('sg-sidebar');
    expect(sidebar).toBeTruthy();
  }));
});
