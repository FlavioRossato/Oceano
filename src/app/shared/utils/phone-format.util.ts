import { onlyDigits } from './cpf-format.util';

/** Formata dígitos digitados como telefone BR (ex.: "11965878956" → "(11) 96587-8956"). */
export function formatPhoneInput(raw: string): string {
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
