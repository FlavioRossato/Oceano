export interface RelacaoMenor {
  value: string;
  label: string;
  documentoAceito: string;
  /** Relações sem vínculo de guarda/tutela legalmente presumido — exigem descrição livre. */
  permiteLivre?: boolean;
}

/**
 * Lista de relações possíveis entre o representante e o titular menor de
 * idade, com o documento comprobatório aceito para cada uma (RN30/RN32).
 */
export const RELACOES_MENOR_MOCK: RelacaoMenor[] = [
  { value: 'mae', label: 'Mãe', documentoAceito: 'Certidão de nascimento' },
  { value: 'pai', label: 'Pai', documentoAceito: 'Certidão de nascimento' },
  { value: 'tutor', label: 'Tutor(a)', documentoAceito: 'Termo de tutela' },
  { value: 'curador', label: 'Curador(a)', documentoAceito: 'Termo de curatela' },
  { value: 'avo', label: 'Avô/Avó', documentoAceito: 'Termo de guarda' },
  { value: 'outro', label: 'Outro', documentoAceito: 'Descrição livre + Autorização do representante legal', permiteLivre: true },
];
