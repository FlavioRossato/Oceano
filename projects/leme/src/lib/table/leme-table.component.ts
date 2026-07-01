import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeCheckboxComponent } from '../inputs/checkbox/leme-checkbox.component';
import { LemeSwitchComponent }   from '../inputs/switch/leme-switch.component';
import { LemeSearchComponent }   from '../inputs/search/leme-search.component';
import { LemeAvatarComponent }   from '../avatar/leme-avatar.component';
import { LemeButtonComponent }   from '../button/leme-button.component';
import { LemeTagComponent }      from '../tag/leme-tag.component';

export interface LemeTableColumn {
  key: string;
  header: string;
  /** Tipo da célula do body. Padrão: 'text' */
  type?: 'text' | 'money' | 'date' | 'hour' | 'datetime' | 'tag' | 'avatar' | 'switch';
  sortable?: boolean;
  /** Largura em px. Omitir para responsivo. */
  width?: number;
  /** Para type='avatar': chave da label exibida ao lado do avatar */
  labelKey?: string;
  /** Para type='tag': mapa valor → severity do leme-tag.
   *  Se omitido, o próprio valor é usado como severity. */
  tagSeverityMap?: Record<string, string>;
}

export interface LemeTableSortEvent {
  key: string;
  direction: 'asc' | 'desc' | null;
}

export interface LemeTableSwitchEvent<T = Record<string, unknown>> {
  row: T;
  key: string;
  value: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-table',
  standalone: true,
  imports: [
    FormsModule,
    LemeCheckboxComponent,
    LemeSwitchComponent,
    LemeSearchComponent,
    LemeAvatarComponent,
    LemeButtonComponent,
    LemeTagComponent,
  ],
  templateUrl: './leme-table.component.html',
  styleUrl: './leme-table.component.scss',
})
export class LemeTableComponent<T = Record<string, unknown>> implements OnChanges {
  // ─── Data ───────────────────────────────────────────────────────────────────

  @Input() columns: LemeTableColumn[] = [];
  @Input() data: T[] = [];
  @Input() emptyMessage: string = 'Nenhum resultado encontrado.';

  /** Chave estável de identidade da linha (ex.: 'id'). Quando informada, `track`
   *  e seleção usam `row[rowKey]` — reordenar/ordenar não corrompe a seleção.
   *  Quando omitida, mantém o fallback por índice (comportamento legado). */
  @Input() rowKey?: keyof T & string;

  /** Cópia interna — permite reordenação local sem mutar o @Input */
  rows: T[] = [];

  // ─── Features ───────────────────────────────────────────────────────────────

  @Input() selectable:   boolean = false;
  @Input() reorderable:  boolean = false;
  @Input() expandable:   boolean = false;
  @Input() showActions:  boolean = false;
  @Input() showSearch:   boolean = true;
  @Input() showFilters:  boolean = true;
  @Input() showExport:   boolean = true;
  @Input() showPagination: boolean = true;

  // ─── Pagination ─────────────────────────────────────────────────────────────

  @Input() totalItems:  number = 0;
  @Input() pageSize:    number = 10;
  @Input() currentPage: number = 1;

  // ─── Outputs ────────────────────────────────────────────────────────────────

  @Output() searchChange    = new EventEmitter<string>();
  @Output() sortChange      = new EventEmitter<LemeTableSortEvent>();
  @Output() rowClick        = new EventEmitter<T>();
  @Output() rowAction       = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() switchChange    = new EventEmitter<LemeTableSwitchEvent<T>>();
  @Output() pageChange      = new EventEmitter<number>();
  @Output() pageSizeChange  = new EventEmitter<number>();
  @Output() columnsClick    = new EventEmitter<void>();
  @Output() filterClick     = new EventEmitter<void>();
  @Output() exportClick     = new EventEmitter<void>();
  @Output() reorderChange   = new EventEmitter<T[]>();

  // ─── State interno ──────────────────────────────────────────────────────────

  sortKey: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  /** Ids selecionados — `row[rowKey]` quando rowKey informado, senão o índice. */
  selectedRows = new Set<unknown>();
  allSelected = false;

  dragFromIndex: number | null = null;
  dragOverIndex: number | null = null;

  readonly PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.rows = [...this.data];
      this.selectedRows.clear();
      this.allSelected = false;
    }
  }

  // ─── Computed ───────────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const half  = 2;
    const start = Math.max(1, Math.min(this.currentPage - half, this.totalPages - half * 2));
    const end   = Math.min(this.totalPages, start + half * 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get totalColumns(): number {
    return this.columns.length
      + (this.reorderable ? 1 : 0)
      + (this.expandable  ? 1 : 0)
      + (this.selectable  ? 1 : 0)
      + (this.showActions ? 1 : 0);
  }

  // ─── Sort ───────────────────────────────────────────────────────────────────

  onSort(col: LemeTableColumn): void {
    if (!col.sortable) return;
    if (this.sortKey !== col.key) {
      this.sortKey       = col.key;
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortKey       = null;
      this.sortDirection = null;
    }
    this.sortChange.emit({ key: col.key, direction: this.sortDirection });
  }

  sortIconFor(col: LemeTableColumn): string {
    if (!col.sortable) return '';
    if (this.sortKey !== col.key || !this.sortDirection) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  /** Valor de `aria-sort` para o `<th>` ordenável (a11y). */
  ariaSortFor(col: LemeTableColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortKey !== col.key || !this.sortDirection) return 'none';
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  // ─── Seleção ────────────────────────────────────────────────────────────────

  /** Id de identidade da linha: `row[rowKey]` quando informado, senão o índice. */
  rowId(row: T, index: number): unknown {
    return this.rowKey ? row[this.rowKey] : index;
  }

  toggleAllRows(): void {
    if (this.allSelected) {
      this.selectedRows.clear();
    } else {
      this.rows.forEach((row, i) => this.selectedRows.add(this.rowId(row, i)));
    }
    this.allSelected = !this.allSelected;
    this.selectionChange.emit(this.rows.filter((row, i) => this.selectedRows.has(this.rowId(row, i))));
  }

  toggleRow(id: unknown): void {
    if (this.selectedRows.has(id)) {
      this.selectedRows.delete(id);
    } else {
      this.selectedRows.add(id);
    }
    this.allSelected = this.selectedRows.size === this.rows.length;
    this.selectionChange.emit(this.rows.filter((row, i) => this.selectedRows.has(this.rowId(row, i))));
  }

  // ─── Drag & Drop (reordenação) ───────────────────────────────────────────────

  onDragStart(index: number, event: DragEvent): void {
    this.dragFromIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.dragOverIndex !== index) this.dragOverIndex = index;
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
      this.dragOverIndex = null;
    }
  }

  onDrop(toIndex: number, event: DragEvent): void {
    event.preventDefault();
    const from = this.dragFromIndex;
    this.dragFromIndex = null;
    this.dragOverIndex = null;
    if (from === null || from === toIndex) return;
    const updated = [...this.rows];
    const [moved] = updated.splice(from, 1);
    updated.splice(toIndex, 0, moved);
    this.rows = updated;
    this.selectedRows.clear();
    this.allSelected = false;
    this.reorderChange.emit([...this.rows]);
  }

  onDragEnd(): void {
    this.dragFromIndex = null;
    this.dragOverIndex = null;
  }

  // ─── Paginação ──────────────────────────────────────────────────────────────

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSizeChange.emit(size);
  }

  // ─── Cells ──────────────────────────────────────────────────────────────────

  // Retorno `any` por design: o valor é interpolado em bindings de tipos variados
  // (string, boolean, letter) — ver template (tag/avatar/switch/default).
  getCellValue(row: T, key: string): any {
    return key.split('.').reduce<any>((obj, k) => obj?.[k], row) ?? '';
  }

  getTagSeverity(row: T, col: LemeTableColumn): string {
    const value = this.getCellValue(row, col.key) as string;
    if (col.tagSeverityMap) {
      return col.tagSeverityMap[value] ?? 'Default';
    }
    return value;
  }

  onSwitchChange(row: T, key: string, value: boolean): void {
    this.switchChange.emit({ row, key, value });
  }
}
