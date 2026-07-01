import { TestBed } from '@angular/core/testing';
import { LemeTableComponent, LemeTableColumn } from './leme-table.component';

interface Row { id: number; nome: string; }

const COLUMNS: LemeTableColumn[] = [
  { key: 'nome', header: 'Nome', sortable: true },
];

const DATA: Row[] = [
  { id: 1, nome: 'Ana' },
  { id: 2, nome: 'Beto' },
];

describe('LemeTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeTableComponent] }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent<LemeTableComponent<Row>>(LemeTableComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza uma linha por item', async () => {
    const fixture = TestBed.createComponent<LemeTableComponent<Row>>(LemeTableComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('data', DATA);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tbody .leme-table__row');
    expect(rows.length).toBe(2);
  });

  it('onSort emite sortChange com direção ascendente na primeira vez', () => {
    const fixture = TestBed.createComponent<LemeTableComponent<Row>>(LemeTableComponent);
    const comp = fixture.componentInstance;
    let event: { key: string; direction: string | null } | undefined;
    comp.sortChange.subscribe((e) => (event = e));
    comp.onSort(COLUMNS[0]);
    expect(event).toEqual({ key: 'nome', direction: 'asc' });
    expect(comp.ariaSortFor(COLUMNS[0])).toBe('ascending');
  });

  it('seleção usa rowKey como identidade estável', () => {
    const fixture = TestBed.createComponent<LemeTableComponent<Row>>(LemeTableComponent);
    const comp = fixture.componentInstance;
    comp.rowKey = 'id';
    fixture.componentRef.setInput('data', DATA);
    comp.ngOnChanges({ data: { currentValue: DATA, previousValue: undefined, firstChange: true, isFirstChange: () => true } });

    let selection: Row[] = [];
    comp.selectionChange.subscribe((s) => (selection = s));
    comp.toggleAllRows();
    expect(selection.length).toBe(2);
    expect(comp.selectedRows.has(1)).toBe(true);
    expect(comp.selectedRows.has(2)).toBe(true);
  });
});
