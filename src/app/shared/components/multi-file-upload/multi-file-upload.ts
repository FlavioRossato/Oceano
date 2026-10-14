import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LemeTagComponent } from 'leme';

export interface UploadedFile {
  name: string;
  size: number;
}

const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/** Assinatura (primeiros bytes) de cada tipo aceito — confere o conteúdo real, não só a extensão. */
const ASSINATURAS: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
};

/**
 * Upload de até N arquivos sob um único rótulo (ex.: documento comprobatório
 * de um representante) — diferente de app-document-upload-row, que é 1
 * arquivo por rótulo fixo. Valida tipo, conteúdo real (assinatura dos
 * primeiros bytes), tamanho e quantidade no client; antivírus fica com o
 * backend (fora de escopo, mock de fluxo).
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
  /** Erro vindo da validação da página (ex.: documento obrigatório ausente). */
  @Input() errorMessage = '';
  @Output() filesChange = new EventEmitter<UploadedFile[]>();

  readonly erro = signal('');

  async onFileChange(event: Event): Promise<void> {
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

    if (!(await this.conteudoConfere(file))) {
      this.erro.set('O conteúdo do arquivo não corresponde ao formato informado. Envie um PDF, JPG ou PNG válido.');
      return;
    }

    this.erro.set('');
    this.filesChange.emit([...this.files, { name: file.name, size: file.size }]);
  }

  private async conteudoConfere(file: File): Promise<boolean> {
    const assinatura = ASSINATURAS[file.type];
    if (!assinatura) return true;
    const bytes = new Uint8Array(await file.slice(0, assinatura.length).arrayBuffer());
    return assinatura.every((byte, i) => bytes[i] === byte);
  }

  remover(index: number): void {
    this.erro.set('');
    this.filesChange.emit(this.files.filter((_, i) => i !== index));
  }
}
