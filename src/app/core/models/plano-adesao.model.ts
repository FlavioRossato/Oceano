export interface PlanoAdesao {
  id: string;
  nome: string;
  categoria: string;
  logo: string;
  logoFundo: 'claro' | 'escuro';
  tagline: string;
  destaques: string[];
  saibaMaisUrl: string;
}
