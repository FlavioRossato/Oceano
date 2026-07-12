import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LemeTextFieldComponent,
  LemeSelectComponent,
  LemeSwitchComponent,
  LemeCheckboxComponent,
  LemeMessageComponent,
} from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

const UF_OPTIONS = [
  { value: 'ac', label: 'Acre' },
  { value: 'al', label: 'Alagoas' },
  { value: 'ap', label: 'Amapá' },
  { value: 'am', label: 'Amazonas' },
  { value: 'ba', label: 'Bahia' },
  { value: 'ce', label: 'Ceará' },
  { value: 'df', label: 'Distrito Federal' },
  { value: 'es', label: 'Espírito Santo' },
  { value: 'go', label: 'Goiás' },
  { value: 'ma', label: 'Maranhão' },
  { value: 'mt', label: 'Mato Grosso' },
  { value: 'ms', label: 'Mato Grosso do Sul' },
  { value: 'mg', label: 'Minas Gerais' },
  { value: 'pa', label: 'Pará' },
  { value: 'pb', label: 'Paraíba' },
  { value: 'pr', label: 'Paraná' },
  { value: 'pe', label: 'Pernambuco' },
  { value: 'pi', label: 'Piauí' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'rn', label: 'Rio Grande do Norte' },
  { value: 'rs', label: 'Rio Grande do Sul' },
  { value: 'ro', label: 'Rondônia' },
  { value: 'rr', label: 'Roraima' },
  { value: 'sc', label: 'Santa Catarina' },
  { value: 'sp', label: 'São Paulo' },
  { value: 'se', label: 'Sergipe' },
  { value: 'to', label: 'Tocantins' },
];

@Component({
  selector: 'app-contato-endereco',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    LemeTextFieldComponent,
    LemeSelectComponent,
    LemeSwitchComponent,
    LemeCheckboxComponent,
    LemeMessageComponent,
  ],
  templateUrl: './contato-endereco.html',
  styleUrl: './contato-endereco.scss',
})
export class ContatoEndereco implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);

  readonly ufOptions = UF_OPTIONS;

  readonly tipoEnderecoOptions = [
    { value: 'residencial',      label: 'Residencial' },
    { value: 'comercial',        label: 'Comercial' },
    { value: 'correspondencia',  label: 'Correspondência' },
  ];

  readonly tipoContatoOptions = [
    { value: 'pessoal',   label: 'Pessoal' },
    { value: 'comercial', label: 'Comercial' },
  ];

  // Endereço
  resideExterior = false;
  tipoEndereco = '';
  cep = '';
  endereco = '';
  numero = '';
  complemento = '';
  bairro = '';
  estado = '';
  cidade = '';
  pais = '';
  nif = '';
  enderecoPrincipal = false;

  // Contatos
  telefoneTipo = '';
  telefone = '';
  telefonePrincipal = false;
  aceitaWhatsapp = false;
  aceitaSms = false;
  emailTipo = '';
  email = '';
  emailPrincipal = false;

  ngOnInit(): void {
    const end = this.dados.endereco();
    this.resideExterior = end.resideExterior;
    this.tipoEndereco = end.tipoEndereco;
    this.cep = end.cep;
    this.endereco = end.endereco;
    this.numero = end.numero;
    this.complemento = end.complemento;
    this.bairro = end.bairro;
    this.estado = end.estado;
    this.cidade = end.cidade;
    this.pais = end.pais;
    this.nif = end.nif;
    this.enderecoPrincipal = end.principal;

    const contato = this.dados.contato();
    this.telefoneTipo = contato.telefoneTipo;
    this.telefone = contato.telefone;
    this.telefonePrincipal = contato.telefonePrincipal;
    this.aceitaWhatsapp = contato.aceitaWhatsapp;
    this.aceitaSms = contato.aceitaSms;
    this.emailTipo = contato.emailTipo;
    this.email = contato.email;
    this.emailPrincipal = contato.emailPrincipal;
  }

  ngOnDestroy(): void {
    this.dados.updateEndereco({
      resideExterior: this.resideExterior,
      tipoEndereco: this.tipoEndereco,
      cep: this.cep,
      endereco: this.endereco,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      estado: this.estado,
      cidade: this.cidade,
      pais: this.pais,
      nif: this.nif,
      principal: this.enderecoPrincipal,
    });

    this.dados.updateContato({
      telefoneTipo: this.telefoneTipo,
      telefone: this.telefone,
      telefonePrincipal: this.telefonePrincipal,
      aceitaWhatsapp: this.aceitaWhatsapp,
      aceitaSms: this.aceitaSms,
      emailTipo: this.emailTipo,
      email: this.email,
      emailPrincipal: this.emailPrincipal,
    });
  }
}
