/* =============================================
   SKETCH GRIDS — Root App Component
   ============================================= */

import {
  Component, OnInit, signal, ViewChild, inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent }        from './components/header/header.component';
import { SidebarComponent }       from './components/sidebar/sidebar.component';
import { CanvasPreviewComponent } from './components/canvas-preview/canvas-preview.component';
import { GridService }            from './services/grid.service';

@Component({
  selector: 'sg-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    CanvasPreviewComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl:    './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @ViewChild('header')  headerRef!:  HeaderComponent;
  @ViewChild('sidebar') sidebarRef!: SidebarComponent;
  @ViewChild('preview') previewRef!: CanvasPreviewComponent;

  private gridSvc = inject(GridService);

  /* ── State ── */
  loaded     = signal(false);
  splashCells = Array(16).fill(0); // 4×4 grid animation

  ngOnInit(): void {
    // Simulate boot sequence
    setTimeout(() => this.loaded.set(true), 1400);
  }

  /* ── Export ── */
  async onExport(): Promise<void> {
    if (!this.previewRef) return;

    this.headerRef?.setExporting(true);
    this.sidebarRef?.setExporting(true);

    try {
      await this.previewRef.exportGrid();
      this.headerRef?.setExporting(false);
      this.headerRef?.setExported(true);
      this.sidebarRef?.setExporting(false);
      this.sidebarRef?.setExported(true);

      // Reset after 2.5s
      setTimeout(() => {
        this.headerRef?.setExported(false);
        this.sidebarRef?.setExported(false);
      }, 2500);
    } catch (err) {
      console.error('Export failed:', err);
      this.headerRef?.setExporting(false);
      this.sidebarRef?.setExporting(false);
    }
  }

  /* ── Reset ── */
  onReset(): void {
    this.gridSvc.reset();
  }
}
