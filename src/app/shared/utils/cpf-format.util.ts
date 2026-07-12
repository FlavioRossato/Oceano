/** Extrai somente os dígitos de um CPF (ou qualquer texto). */
export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Formata dígitos digitados como CPF (ex.: "11122233344" → "111.222.333-44"). */
export function formatCpfInput(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
