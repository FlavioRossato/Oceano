import { PlanoAdesao } from '@core/models/plano-adesao.model';

/**
 * Vitrine dos planos abertos para adesão na Visão Prev. Em produção, cada campo
 * (tagline, destaques, logo, link da landing page) é customizável pela entidade
 * via ERP — os textos aqui simulam o que uma entidade preencheria nesse painel.
 */
export const PLANOS_ADESAO_MOCK: PlanoAdesao[] = [
  {
    id: 'mais-visao',
    nome: 'Mais Visão',
    categoria: 'Plano Setorial',
    logo: 'maisvisao.svg',
    logoFundo: 'claro',
    tagline: 'Contribuição flexível, com benefícios que podem começar já a partir dos 40 anos.',
    destaques: [
      'Você decide o valor da contribuição e pode ajustá-lo quando quiser',
      'Mais Visão para toda a família: indique parentes para também participar do plano',
      'Benefício Temporário: acesse parte da sua reserva antes mesmo de se aposentar',
    ],
    saibaMaisUrl: 'https://maisvisao.visaoprev.com.br/',
  },
  {
    id: 'visao-multi',
    nome: 'Visão Multi',
    categoria: 'Plano Patrocinado',
    logo: 'visaomulti.svg',
    logoFundo: 'escuro',
    tagline: 'Sua empresa contribui junto com você, com proteção extra para toda a família.',
    destaques: [
      'Contrapartida da patrocinadora: a empresa contribui junto com você',
      'Proteção em caso de invalidez ou falecimento, além da aposentadoria',
      'Você escolhe o perfil de investimento da sua reserva',
    ],
    saibaMaisUrl: 'https://visaomulti.visaoprev.com.br/',
  },
];
