# Portal Adesão — Protótipo (Oceano)

Protótipo front-end do fluxo de **adesão a um plano de previdência privada**, construído em Angular 21 sobre o design system proprietário **Leme**. Não há backend real: toda a "base de dados" é mockada em memória (services Angular), pensada para validar fluxo, UX e writing antes da integração com APIs de verdade.

> Para as regras arquiteturais completas do repositório (padrões de código, SCSS, path aliases, deploy etc.), leia **[Diretrizes.md](./Diretrizes.md)** — é o documento fonte e deve ser lido por completo antes de codar aqui. Este README é a porta de entrada; o Diretrizes.md é a referência viva.

---

## Sobre o protótipo

A aplicação simula o wizard de adesão de um participante a um plano de previdência: verificação de CPF, criação/validação de senha de acesso, preenchimento de dados (vínculo empregatício, dados pessoais, endereço, contato, PEP, perfil de investidor, regime de tributação, contribuição, dados bancários, documentos), revisão final, aceite de termos e acompanhamento do status da solicitação.

Como é um protótipo, **não existe chamada HTTP nenhuma** — os dados digitados vivem em signals de services Angular (`AdesaoDadosService`, `ParticipanteMockService`) e são perdidos ao recarregar a página.

---

## Como rodar

```bash
npm install
npm start        # ng serve — http://localhost:4200
```

A rota raiz (`/`) redireciona automaticamente para `/adesao`, que abre o wizard na tela de boas-vindas.

Outros scripts úteis (ver `package.json`):

| Script | O que faz |
|---|---|
| `npm start` | `ng serve` do portal (porta 4200) |
| `npm run build` | build de produção do portal |
| `npm test` | testes unitários (Vitest) |
| `npm run leme:watch` | build incremental do design system Leme, se for editá-lo em paralelo |
| `npm run leme:build` / `leme:build:prod` | build standalone do Leme para `dist/leme` (não é pré-requisito para rodar o portal — o `tsconfig.json` já resolve `leme` direto para o código-fonte em `projects/leme/src/public-api.ts`) |

---

## Fluxo do wizard de adesão

Para um participante **novo** (CPF sem cadastro prévio), as etapas seguem esta ordem sequencial (`next()`/`back()` no `AdesaoService`):

1. **Boas-vindas** (`/adesao/boas-vindas`) — tela de abertura, fora do layout com sidebar.
2. **Verificação de CPF** (`/adesao/verificacao-cpf`) — consulta o CPF na base mockada e decide o próximo destino (ver [Cenários mockados](#cenários-mockados-de-participante)).
3. **Senha de acesso** (`/adesao/senha-acesso`) — só para CPF novo; cria a senha que será usada para futuros acessos.
4. **Vínculo** — dados do vínculo empregatício com a patrocinadora.
5. **Dados pessoais**
6. **Contato & endereço**
7. **PEP** (pessoa politicamente exposta)
8. **Perfil de investimento** — mini-questionário que indica um perfil (conservador/moderado/arrojado), com opção de escolher outro.
9. **Regime de tributação**
10. **Contribuição** — percentuais de contribuição básica (obrigatória), adicional e suplementar (opcionais), com tradução em reais com base no salário informado em Vínculo.
11. **Dados bancários**
12. **Documentos**
13. **Revisão final (Resumo)** — revisão de tudo antes de enviar.
14. **Termos** — aceite obrigatório para liberar o botão "Enviar solicitação".
15. **Conclusão** — confirmação de envio, com número de protocolo.

As telas de **Retomar adesão**, **Recuperar senha** e **Acompanhamento** não fazem parte dessa sequência linear — a navegação entre elas é feita via `router.navigate()` direto, de acordo com o status do CPF consultado (ver próxima seção).

---

## Cenários mockados de participante

A "base de dados" fica em [`participantes-mock.data.ts`](./src/app/features/adesao/data/participantes-mock.data.ts), consumida pelo `ParticipanteMockService`. Use os CPFs abaixo na tela de **Verificação de CPF** para acessar cada cenário:

| CPF | Senha | Status | O que acontece |
|---|---|---|---|
| Qualquer CPF válido não listado abaixo | — | *novo* | Vai para **Senha de acesso** e segue o wizard completo desde o início. |
| `222.222.222-22` | `123456` | `em_andamento` | Pede a senha e retoma o wizard exatamente na etapa **Dados pessoais** (`etapaAtual`). |
| `333.333.333-33` | `123456` | `concluida` | Pede a senha e vai para **Acompanhamento**, com tag **"Em análise"**. |
| `444.444.444-44` | `123456` | `negada` | Pede a senha e vai para **Acompanhamento**, com tag **"Solicitação negada"** e o motivo informado pela entidade. |
| `555.555.555-55` | `123456` | `aprovada` | Pede a senha e vai para **Acompanhamento**, com tag **"Aprovada"**. |

Observações:
- Todo CPF com adesão já iniciada (qualquer status acima, exceto *novo*) passa **obrigatoriamente** pela tela de senha (`/adesao/retomar-adesao`) antes de mostrar qualquer informação — inclusive o status da solicitação. Isso é proposital, por segurança: o nome do participante e o resultado da análise nunca aparecem antes da autenticação.
- Em **Retomar adesão**, o link "Esqueci minha senha" leva a `/adesao/recuperar-senha`, onde é possível definir uma nova senha (fica salva em memória, via `ParticipanteMockService.redefinirSenha()`) e voltar a logar.
- Para adicionar um novo cenário de teste, basta incluir um novo objeto no array `PARTICIPANTES_MOCK`.

---

## Estrutura do workspace

Monorepo Angular com dois projetos:

```
projects/leme/     ← Design System proprietário (componentes + tokens SCSS)
src/app/
├── core/           ← guards, interceptors, services e models singleton
├── shared/         ← componentes/utilitários reutilizáveis entre features
├── features/
│   └── adesao/     ← o wizard descrito acima (única feature de negócio implementada)
├── layouts/        ← shell (área autenticada, ainda sem conteúdo) e auth-layout
└── app.routes.ts
```

Detalhes de convenção de arquivos, nomenclatura, SCSS e path aliases estão em [Diretrizes.md §3 e §6](./Diretrizes.md).

---

## Especificações técnicas

### Stack

| Camada | Tecnologia / versão |
|---|---|
| Framework | Angular 21.2.x, standalone-only (sem `NgModule`) |
| Linguagem | TypeScript ~5.9.x, `strict: true` |
| Estilos | SCSS, tokens do Leme DS via CSS custom properties |
| Design System | Leme (proprietário, `projects/leme/`) |
| Ícones | Material Symbols Outlined (carregado via `<link>` no `index.html`) |
| Build | `@angular/build:application` (esbuild/Vite); lib via `@angular/build:ng-packagr` |
| Estado | Signals (`signal()`/`computed()`/`effect()`) — sem NgRx/NGXS |
| Node.js | v24 |

### Regra mais importante: sem hardcode visual

Nenhum valor visual (cor, spacing, radius, shadow, font-size) pode ser escrito fixo no SCSS. Tudo vem de tokens CSS do Leme, expostos globalmente como `var(--token)`:

```scss
// PROIBIDO
color: #1aaab2;
padding: 16px;

// CORRETO
color: var(--color-primary-60);
padding: var(--spacing-sm);
```

Os tokens vivem em `projects/leme/src/styles/tokens/*.scss`. Antes de estilizar algo, confira se o valor que você precisa já existe lá.

### Componentes: Leme primeiro

1. Existe componente Leme (`<leme-button>`, `<leme-text-field>`, `<leme-select>` etc.)? Use-o.
2. Não existe? Crie em `shared/components/` usando só tokens Leme, `OnPush`, standalone.
3. Nunca crie UI com valores hardcoded.

Catálogo completo de componentes Leme em [Diretrizes.md §5](./Diretrizes.md).

### Convenções de código

- Arquivos sem sufixo `.component.`: `vinculo.ts`, `vinculo.html`, `vinculo.scss` (não `vinculo.component.ts`).
- `inject()` em vez de injeção via construtor.
- `ChangeDetectionStrategy.OnPush` em todo componente novo.
- `features` nunca importa de outra `features`; toda rota de feature é lazy (`loadChildren`/`loadComponent`).
- Títulos e textos de conteúdo usam só `--color-gray-90`/`--color-gray-70` — cores de marca (`primary`/`secondary`) ficam reservadas para elementos interativos.

### Path aliases (TypeScript)

```typescript
"leme":        ["projects/leme/src/public-api.ts"],
"@core/*":     ["src/app/core/*"],
"@shared/*":   ["src/app/shared/*"],
"@features/*": ["src/app/features/*"],
"@layouts/*":  ["src/app/layouts/*"],
"@env/*":      ["src/environments/*"]
```

### Sem backend real

`authGuard`, `authInterceptor` e `StorageService` (JWT) já existem em `core/` mas não têm fluxo de login implementado — servem de esqueleto para quando a integração real for feita. Toda a lógica de "banco de dados" do wizard de Adesão está em `AdesaoDadosService` e `ParticipanteMockService`, ambos providenciados em `root` e resetados a cada reload da página.

---

## Recursos adicionais do Angular CLI

```bash
ng generate component component-name   # scaffolding
ng generate --help                     # lista de schematics disponíveis
ng test                                 # testes unitários (Vitest)
ng e2e                                  # e2e (nenhum framework configurado por padrão)
```

Mais detalhes: [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
