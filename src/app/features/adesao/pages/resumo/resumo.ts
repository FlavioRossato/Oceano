import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

interface ResumoLinha {
  label: string;
  value: string;
}

interface ResumoCard {
  title: string;
  icon: string;
  editLabel: string;
  lines: ResumoLinha[];
}

@Component({
  selector: 'app-resumo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumo.html',
  styleUrl: './resumo.scss',
})
export class Resumo {
  protected readonly adesaoDados = inject(AdesaoDadosService);
  private readonly expandedIndexes = signal<ReadonlySet<number>>(new Set([0]));
  private readonly documentosBase = [
    'Documento de identidade',
    'CPF',
    'Certidão de casamento',
    'CNPJ do solicitante',
    'RG dos beneficiários',
    'Título de eleitor',
  ];

  readonly resumoCards = computed<ResumoCard[]>(() => {
    const vinculo = this.adesaoDados.vinculo();
    const dadosPessoais = this.adesaoDados.dadosPessoais();
    const endereco = this.adesaoDados.endereco();
    const contato = this.adesaoDados.contato();
    const pep = this.adesaoDados.pep();
    const perfil = this.adesaoDados.perfilInvestimento();
    const regime = this.adesaoDados.regimeTributacao();
    const contribuicao = this.adesaoDados.contribuicao();
    const dadosBancarios = this.adesaoDados.dadosBancarios();
    const documentos = this.adesaoDados.documentos();

    return [
      {
        title: 'Vínculo',
        icon: 'apartment',
        editLabel: 'Editar',
        lines: [
          { label: 'Empresa', value: vinculo.empresa },
          { label: 'Matrícula', value: vinculo.matricula },
          { label: 'Cargo', value: vinculo.cargo },
          { label: 'Salário mensal', value: vinculo.salarioMensal },
          { label: 'Data de admissão', value: vinculo.dataAdmissao },
          { label: 'Regime de contratação', value: vinculo.regimeContratacao },
        ],
      },
      {
        title: 'Dados pessoais',
        icon: 'person',
        editLabel: 'Editar',
        lines: [
          { label: 'Nome completo', value: dadosPessoais.nomeCompleto },
          { label: 'CPF', value: dadosPessoais.cpf },
          { label: 'Sexo', value: dadosPessoais.sexo },
          { label: 'Nascimento', value: dadosPessoais.dataNascimento },
          { label: 'Estado civil', value: dadosPessoais.estadoCivil },
          { label: 'Escolaridade', value: dadosPessoais.escolaridade },
          { label: 'Documento', value: `${dadosPessoais.tipoDocumento.toUpperCase()} ${dadosPessoais.numeroDocumento}` },
          { label: 'Emissão', value: dadosPessoais.dataEmissao },
          { label: 'Nome da mãe', value: dadosPessoais.nomeMae },
          { label: 'Nome do pai', value: dadosPessoais.nomePai || 'Não informado' },
        ],
      },
      {
        title: 'Contato & endereço',
        icon: 'contact_mail',
        editLabel: 'Editar',
        lines: [
          { label: 'Telefone', value: contato.telefone },
          { label: 'E-mail', value: contato.email },
          { label: 'Residência', value: endereco.resideExterior ? 'Exterior' : 'Brasil' },
          {
            label: 'Endereço',
            value: endereco.resideExterior
              ? [endereco.endereco, endereco.numero, endereco.complemento].filter(Boolean).join(' · ')
              : [endereco.endereco, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.estado.toUpperCase()]
                  .filter(Boolean)
                  .join(' · '),
          },
          ...(endereco.resideExterior
            ? [
                { label: 'País', value: endereco.pais || 'Não informado' },
                { label: 'NIF', value: endereco.nif || 'Não informado' },
              ]
            : []),
        ],
      },
      {
        title: 'PEP',
        icon: 'work',
        editLabel: 'Editar',
        lines: [
          { label: 'É PEP', value: pep.isPep ? 'Sim' : 'Não' },
          { label: 'Relação', value: pep.relacao || 'Não informado' },
          { label: 'Cargo', value: pep.cargo || 'Não informado' },
        ],
      },
      {
        title: 'Perfil de investimento',
        icon: 'query_stats',
        editLabel: 'Alterar',
        lines: [
          { label: 'Perfil escolhido', value: perfil.perfilEscolhido || 'Não informado' },
        ],
      },
      {
        title: 'Regime de tributação',
        icon: 'percent',
        editLabel: 'Editar',
        lines: [{ label: 'Regime', value: regime.regime === 'progressivo' ? 'Progressivo' : 'Regressivo' }],
      },
      {
        title: 'Contribuição',
        icon: 'savings',
        editLabel: 'Editar',
        lines: [
          { label: 'Contribuição básica', value: contribuicao.percentualBasico || '0%' },
          { label: 'Contribuição adicional', value: contribuicao.percentualAdicional || '0%' },
          { label: 'Contribuição suplementar', value: contribuicao.percentualSuplementar || '0%' },
        ],
      },
      {
        title: 'Dados bancários',
        icon: 'account_balance',
        editLabel: 'Editar',
        lines: [
          { label: 'Finalidade', value: dadosBancarios.finalidade },
          { label: 'Banco', value: dadosBancarios.banco },
          { label: 'Tipo de conta', value: dadosBancarios.tipoConta },
          { label: 'Agência', value: dadosBancarios.agencia },
          { label: 'Conta', value: `${dadosBancarios.numeroConta}-${dadosBancarios.digito}` },
          { label: 'PIX', value: dadosBancarios.aceitaPix ? `${dadosBancarios.tipoChavePix}: ${dadosBancarios.chavePix}` : 'Não informado' },
        ],
      },
      {
        title: 'Documentos',
        icon: 'description',
        editLabel: 'Editar',
        lines: this.documentosBase.map(label => ({
          label,
          value: documentos[label] || 'Não enviado',
        })),
      },
    ];
  });

  isExpanded(index: number): boolean {
    return this.expandedIndexes().has(index);
  }

  toggle(index: number): void {
    const current = new Set(this.expandedIndexes());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.expandedIndexes.set(current);
  }
}
