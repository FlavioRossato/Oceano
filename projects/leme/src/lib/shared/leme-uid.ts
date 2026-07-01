/**
 * Gerador de ids únicos para associar <label for> ↔ campo (a11y).
 * Interno da lib — não exportar no public-api.
 */
let counter = 0;

export function nextLemeId(prefix: string): string {
  return `${prefix}-${++counter}`;
}
