/**
 * Máscaras de formatação para `LemeTextFieldComponent` (`[mask]`).
 * Interno da lib — não exportar no public-api; `LemeTextFieldMask` é
 * reexportado a partir do próprio componente.
 */

export type LemeTextFieldMask = 'cpf' | 'telefone' | 'data';

interface LemeTextFieldMaskConfig {
  /** Formata o valor digitado conforme o usuário digita. */
  format: (raw: string) => string;
  /** Tamanho do valor já formatado — vira o `maxlength` do input nativo. */
  maxLength: number;
}

function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

function formatCpf(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatTelefone(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function formatData(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})$/, '$1/$2');
}

export const LEME_TEXT_FIELD_MASKS: Record<LemeTextFieldMask, LemeTextFieldMaskConfig> = {
  cpf: { format: formatCpf, maxLength: 14 },
  telefone: { format: formatTelefone, maxLength: 15 },
  data: { format: formatData, maxLength: 10 },
};
