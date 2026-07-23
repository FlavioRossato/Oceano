/** Validação leve de formato de e-mail (não substitui verificação por token no back-end). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
