import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LemeTagComponent } from 'leme';

@Component({
  selector: 'app-document-upload-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeTagComponent],
  templateUrl: './document-upload-row.html',
  styleUrl: './document-upload-row.scss',
})
export class DocumentUploadRow {
  @Input() label = '';
  @Input() required = false;
  @Output() fileSelected = new EventEmitter<File>();

  readonly fileName = signal('');

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileName.set(file.name);
      this.fileSelected.emit(file);
    }
  }
}
