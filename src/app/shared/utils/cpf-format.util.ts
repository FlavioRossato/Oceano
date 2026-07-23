/** Extrai somente os dígitos de um CPF (ou qualquer texto). */
export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}
