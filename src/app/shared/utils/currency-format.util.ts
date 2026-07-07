/** Formata dígitos digitados como moeda BRL (ex.: "750000" → "R$ 7.500,00"). */
export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const value = Number(digits) / 100;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Extrai o valor numérico (em reais) de uma string formatada como moeda BRL. */
export function parseCurrencyToNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}

/** Formata dígitos digitados como percentual inteiro (0–100), ex.: "5" → "5%". */
export function formatPercentInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 3);
  if (!digits) return '';
  const value = Math.min(100, Number(digits));
  return `${value}%`;
}

/** Extrai o valor numérico de um percentual formatado, ex.: "5%" → 5. */
export function parsePercentToNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Math.min(100, Number(digits)) : 0;
}
