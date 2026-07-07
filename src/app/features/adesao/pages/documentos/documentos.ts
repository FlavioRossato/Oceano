import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LemeMessageComponent } from 'leme';
import { DocumentUploadRow } from '@shared/components/document-upload-row/document-upload-row';

interface DocumentoItem {
  label: string;
  required: boolean;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeMessageComponent, DocumentUploadRow],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class Documentos {
  readonly documentos: DocumentoItem[] = [
    { label: 'Documento de identidade', required: true },
    { label: 'CPF', required: false },
    { label: 'Certidão de casamento', required: false },
    { label: 'CNPJ do solicitante', required: false },
    { label: 'RG dos beneficiários', required: false },
    { label: 'Título de eleitor', required: false },
  ];
}
