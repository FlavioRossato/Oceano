import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LemeTagComponent } from 'leme';

export interface UploadedFile {
  name: string;
  size: number;
}

const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Upload de até N arquivos sob um único rótulo (ex.: documento comprobatório
 * de um representante) — diferente de app-document-upload-row, que é 1
 * arquivo por rótulo fixo. Valida extensão/tamanho/quantidade no client;
 * sem verificação real de MIME/antivírus (fora de escopo, mock de fluxo).
 */
@Component({
  selector: 'app-multi-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeTagComponent],
  templateUrl: './multi-file-upload.html',
  styleUrl: './multi-file-upload.scss',
})
export class MultiFileUpload {
  @Input() label = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() maxFiles = 3;
  @Input() maxSizeMb = 10;
  @Input() acceptedTypes: string[] = DEFAULT_ACCEPTED_TYPES;
  @Input() files: UploadedFile[] = [];
  @Output() filesChange = new EventEmitter<UploadedFile[]>();

  readonly erro = signal('');

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (this.files.length >= this.maxFiles) {
      this.erro.set(`Limite de ${this.maxFiles} arquivos por representante atingido.`);
      return;
    }

    if (!this.acceptedTypes.includes(file.type)) {
      this.erro.set('Formato não permitido. Envie PDF, JPG ou PNG.');
      return;
    }

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.erro.set(`Arquivo acima do limite de ${this.maxSizeMb} MB.`);
      return;
    }

    this.erro.set('');
    this.filesChange.emit([...this.files, { name: file.name, size: file.size }]);
  }

  remover(index: number): void {
    this.erro.set('');
    this.filesChange.emit(this.files.filter((_, i) => i !== index));
  }
}
