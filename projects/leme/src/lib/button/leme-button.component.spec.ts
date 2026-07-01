import { TestBed } from '@angular/core/testing';
import { LemeButtonComponent } from './leme-button.component';

describe('LemeButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LemeButtonComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LemeButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the label inside a type="button" element', async () => {
    const fixture = TestBed.createComponent(LemeButtonComponent);
    fixture.componentRef.setInput('label', 'Salvar');
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toContain('Salvar');
  });
});
