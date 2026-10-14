import { onlyDigits } from './cpf-format.util';

/** "Mariana Souza Andrade" → "Mar**** S**** A******" — primeiro termo com 3 letras, demais só com a inicial. */
export function mascararNome(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((termo, i) => {
      const visiveis = i === 0 ? Math.min(3, termo.length) : 1;
      return termo.slice(0, visiveis) + '*'.repeat(termo.length - visiveis);
    })
    .join(' ');
}

/** "123.456.789-09" → "***.456.789-**". */
export function mascararCpf(cpf: string): string {
  const digitos = onlyDigits(cpf);
  if (digitos.length !== 11) return cpf;
  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

// "14/03/1985" vira dia e mês com asteriscos — só o ano fica visível.
// (Comentário de linha: o exemplo literal fecharia um bloco de comentário.)
export function mascararData(data: string): string {
  const ano = data.split('/')[2];
  return ano ? `**/**/${ano}` : data;
}
