/**
 * Máscaras de formatação para `LemeTextFieldComponent` (`[mask]`).
 * Interno da lib — não exportar no public-api; `LemeTextFieldMask` é
 * reexportado a partir do próprio componente.
 */

export type LemeTextFieldMask = 'cpf';

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

export const LEME_TEXT_FIELD_MASKS: Record<LemeTextFieldMask, LemeTextFieldMaskConfig> = {
  cpf: { format: formatCpf, maxLength: 14 },
};
