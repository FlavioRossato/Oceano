import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() fileName = '';
  @Output() fileSelected = new EventEmitter<File>();

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
