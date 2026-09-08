/** Converte uma data no formato "dd/mm/aaaa" para Date. Retorna null se inválida. */
function parseDataBr(dataBr: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBr.trim());
  if (!match) return null;

  const [, dia, mes, ano] = match;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const valida =
    data.getFullYear() === Number(ano) &&
    data.getMonth() === Number(mes) - 1 &&
    data.getDate() === Number(dia);

  return valida ? data : null;
}

/**
 * Calcula a idade completa (em anos) a partir de uma data de nascimento
 * "dd/mm/aaaa", na data de referência informada (padrão: hoje).
 * Retorna 0 se a data for inválida ou não puder ser interpretada.
 */
export function calcularIdade(dataNascimentoBr: string, referencia: Date = new Date()): number {
  const nascimento = parseDataBr(dataNascimentoBr);
  if (!nascimento) return 0;

  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    referencia.getMonth() < nascimento.getMonth() ||
    (referencia.getMonth() === nascimento.getMonth() && referencia.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade -= 1;
  return Math.max(idade, 0);
}
