import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LemeModalComponent } from './leme-modal.component';

@Component({
  standalone: true,
  imports: [LemeModalComponent],
  template: `
    <leme-modal [ariaLabel]="label" (closed)="onClosed()">
      <div class="box"><button>Ok</button></div>
    </leme-modal>
  `,
})
class HostComponent {
  label = 'Diálogo de teste';
  closedCount = 0;
  onClosed(): void {
    this.closedCount++;
  }
}

describe('LemeModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza role="dialog" + aria-modal e aplica o aria-label', () => {
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Diálogo de teste');
  });

  it('emite closed ao clicar no backdrop', () => {
    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.leme-modal__backdrop');
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(host.closedCount).toBe(1);
  });

  it('emite closed ao pressionar Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.closedCount).toBe(1);
  });
});
