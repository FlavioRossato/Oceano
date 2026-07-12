# Diretrizes do Projeto — Portal Admin

> Documento vivo. Toda decisão arquitetural relevante deve ser registrada aqui.
> Ao iniciar uma nova sessão de desenvolvimento (humano ou agente), leia este arquivo inteiro antes de escrever qualquer código.

---

## 1. Visão Geral

Portal administrativo web construído em Angular 21. O projeto existe no diretório `C:\Users\FlavioRossatoPontes\Desktop\Adesão` e é um **workspace Angular monorepo** que contém:

- **portal-admin** — a aplicação (`src/`)
- **leme** — o Design System proprietário (`projects/leme/`)

O sistema de referência que inspirou o projeto roda Angular 16 (`ng-version="16.2.12"` no DOM). O portal novo usa Angular 21 por compatibilidade com o ambiente de desenvolvimento (Node.js 24).

---

## 2. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Angular | 21.2.x |
| Linguagem | TypeScript | ~5.9.x |
| Estilos | SCSS | via Angular CLI |
| HTTP | `provideHttpClient` + interceptors funcionais | Angular 21 |
| Roteamento | Angular Router com lazy loading | Angular 21 |
| Design System | Leme DS (proprietário) | 0.0.1 |
| Ícones | Material Symbols Outlined (Google Fonts) | variável |
| Build | `@angular/build:application` (esbuild/Vite) | Angular 21 |
| Build lib | `@angular/build:ng-packagr` | Angular 21 |
| Node.js | v24 | — |
| npm | 11.x | — |

---

## 3. Estrutura do Workspace

```
Adesão/                                  ← raiz do workspace Angular
├── projects/
│   └── leme/                            ← Design System (clonado do GitHub)
│       ├── src/
│       │   ├── lib/                     ← componentes Angular da lib
│       │   │   ├── avatar/
│       │   │   ├── breadcrumb/
│       │   │   ├── button/
│       │   │   ├── inputs/
│       │   │   │   ├── calendar/
│       │   │   │   ├── checkbox/
│       │   │   │   ├── radio/
│       │   │   │   ├── search/
│       │   │   │   ├── select/
│       │   │   │   ├── switch/
│       │   │   │   ├── text-area/
│       │   │   │   └── text-field/
│       │   │   ├── loading/
│       │   │   ├── message/
│       │   │   ├── modal/
│       │   │   ├── shared/              ← utilitários internos da lib
│       │   │   ├── table/
│       │   │   └── tag/
│       │   ├── styles/                  ← SCSS do sistema de design
│       │   │   ├── tokens/              ← CSS custom properties em :root
│       │   │   │   ├── _navega-tokens.scss
│       │   │   │   ├── _global-tokens.scss
│       │   │   │   ├── _chart-tokens.scss
│       │   │   │   └── _project-tokens.scss
│       │   │   ├── base/
│       │   │   │   ├── _reset.scss
│       │   │   │   ├── _typography.scss
│       │   │   │   └── _icons.scss      ← Material Symbols Outlined
│       │   │   ├── components/
│       │   │   │   ├── _card.scss       ← classe global .card
│       │   │   │   └── _loading-overlay.scss
│       │   │   └── leme.scss            ← ponto de entrada do DS
│       │   └── public-api.ts            ← superfície pública exportada
│       └── ng-package.json
├── dist/
│   └── leme/                            ← saída compilada (GITIGNORED)
├── src/                                 ← aplicação portal-admin
│   ├── app/
│   │   ├── core/                        ← singleton: guards, interceptors, services, models
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts  ← injeta Bearer token
│   │   │   │   └── error.interceptor.ts ← trata 401/403 globalmente
│   │   │   ├── services/
│   │   │   │   └── storage.service.ts   ← abstração de localStorage
│   │   │   └── models/
│   │   │       └── api-response.model.ts
│   │   ├── shared/                      ← componentes/directives/pipes reutilizáveis
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/                    ← uma pasta por feature (lazy loaded)
│   │   ├── layouts/
│   │   │   ├── shell/                   ← área autenticada (sidebar, header futuros)
│   │   │   └── auth-layout/             ← área pública (login etc.)
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── app.config.ts                ← providers globais
│   │   └── app.routes.ts                ← roteamento raiz
│   ├── environments/
│   │   ├── environment.ts               ← dev (apiUrl local)
│   │   └── environment.prod.ts          ← prod (apiUrl relativa)
│   ├── styles/                          ← SCSS do portal (variáveis, mixins)
│   │   ├── _variables.scss              ← spacing, breakpoints, z-index
│   │   ├── _mixins.scss                 ← respond-to, visually-hidden
│   │   ├── _reset.scss                  ← disponível, mas NÃO importado (Leme já inclui)
│   │   └── _typography.scss             ← disponível, mas NÃO importado (Leme já inclui)
│   ├── styles.scss                      ← ponto de entrada global de estilos
│   ├── index.html
│   └── main.ts
├── UX/                                  ← assets de design (Figma exports, referências)
├── angular.json
├── tsconfig.json
├── package.json
└── Diretrizes.md                        ← este arquivo
```

---

## 4. Regra Principal: Sem Hardcode

**Esta é a regra mais importante do projeto. Não há exceções sem aprovação explícita.**

### 4.1 O que é hardcode proibido

Hardcode é qualquer valor visual definido diretamente no código sem usar o sistema de design:

```scss
// PROIBIDO
color: #1aaab2;
font-size: 14px;
padding: 16px;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
font-family: 'Inter', sans-serif;
```

### 4.2 O que usar no lugar

Todos os valores visuais devem vir dos **CSS custom properties do Leme DS**, disponíveis globalmente via `:root`:

```scss
// CORRETO
color: var(--color-primary-60);
font-size: var(--font-size-sm);
padding: var(--spacing-4);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);
font-family: var(--font-family-base);
```

Os tokens são definidos em:
- `projects/leme/src/styles/tokens/_navega-tokens.scss` — cores de marca (primary, secondary, etc.)
- `projects/leme/src/styles/tokens/_global-tokens.scss` — neutros, espaçamento, radius, border, shadow
- `projects/leme/src/styles/tokens/_chart-tokens.scss` — tokens para gráficos
- `projects/leme/src/styles/tokens/_project-tokens.scss` — tokens de decisão do projeto

**Antes de usar qualquer valor visual, consulte esses arquivos e use o token correspondente.**

### 4.3 Componentes: Leme primeiro

Quando precisar de um elemento de UI, a decisão segue esta ordem:

```
1. Existe componente Leme? → usar o componente Leme
2. Não existe? → criar componente em shared/ usando tokens do Leme
3. Jamais → criar com valores hardcoded
```

---

## 5. Catálogo de Componentes Leme Disponíveis

Todos os componentes são **standalone** e importados individualmente.

### 5.1 Importação

```typescript
import { LemeButtonComponent } from 'leme';
import { LemeTextFieldComponent } from 'leme';
// etc.

@Component({
  imports: [LemeButtonComponent, LemeTextFieldComponent],
  // ...
})
```

### 5.2 Componentes disponíveis

| Componente | Seletor | Importação |
|---|---|---|
| Botão | `<leme-button>` | `LemeButtonComponent` |
| Breadcrumb | `<leme-breadcrumb>` | `LemeBreadcrumbComponent` |
| Avatar | `<leme-avatar>` | `LemeAvatarComponent` |
| Tabela | `<leme-table>` | `LemeTableComponent` |
| Mensagem | `<leme-message>` | `LemeMessageComponent` |
| Tag | `<leme-tag>` | `LemeTagComponent` |
| Loading spinner | `<leme-loading>` | `LemeLoadingComponent` |
| Modal | `<leme-modal>` | `LemeModalComponent` |
| Checkbox | `<leme-checkbox>` | `LemeCheckboxComponent` |
| Radio | `<leme-radio>` | `LemeRadioComponent` |
| Switch | `<leme-switch>` | `LemeSwitchComponent` |
| Campo de texto | `<leme-text-field>` | `LemeTextFieldComponent` |
| Área de texto | `<leme-text-area>` | `LemeTextAreaComponent` |
| Busca | `<leme-search>` | `LemeSearchComponent` |
| Select | `<leme-select>` | `LemeSelectComponent` |
| Select list | `<leme-select-list>` | `LemeSelectListComponent` |
| Select dropdown | `<leme-select-dropdown>` | `LemeSelectDropdownComponent` |
| Date Picker | `<leme-date-picker>` | `LemeDatePickerComponent` |
| Calendário | `<leme-calendar>` | `LemeCalendarComponent` |

### 5.3 API do LemeButton (referência de padrão)

```typescript
// Tipos disponíveis
type LemeButtonVariant   = 'Filled' | 'Outlined' | 'Transparent';
type LemeButtonHierarchy = 'Primary' | 'Negative';
type LemeButtonType      = 'Common' | 'Icon';

// Uso
<leme-button
  variant="Filled"
  hierarchy="Primary"
  type="Common"
  label="Salvar"
  [showIconLeft]="true"
  iconLeft="save"
  [loading]="isSaving"
  [disabled]="form.invalid"
/>
```

### 5.4 Ícones (Material Symbols Outlined)

O Leme usa **Material Symbols Outlined** (fonte variável Google Fonts). O nome do ícone é o identificador do Google:

```html
<!-- Uso direto em templates -->
<span class="material-symbols-outlined">home</span>
<span class="material-symbols-outlined leme-icon-sm">edit</span>
<span class="material-symbols-outlined leme-icon-lg">delete</span>
```

Classes de tamanho disponíveis: `leme-icon-2xs`, `leme-icon-xs`, `leme-icon-sm`, `leme-icon-md`, `leme-icon-lg`, `leme-icon-xl`, `leme-icon-2xl`.

### 5.5 Quando criar componente em shared/

Se o Leme não tem o componente necessário, crie em `src/app/shared/components/`. Regras:

1. Use exclusivamente tokens CSS do Leme (`var(--token-name)`)
2. Nomeie com prefixo `app-` no seletor: `<app-status-badge>`
3. Use `ChangeDetectionStrategy.OnPush`
4. O componente deve ser standalone

```typescript
// shared/components/status-badge/status-badge.ts
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge">{{ label }}</span>`,
  styles: [`
    .badge {
      background: var(--color-primary-10);
      color: var(--color-primary-70);
      border-radius: var(--radius-full);
      padding: var(--spacing-1) var(--spacing-3);
      font-size: var(--font-size-xs);
    }
  `]
})
export class StatusBadge {
  @Input() label = '';
}
```

---

## 6. Arquitetura Angular

### 6.1 Princípio de dependência

```
features → shared → core → (nada)
```

- `features` pode importar de `shared` e `core`
- `shared` pode importar de `core`
- `core` não importa de ninguém do projeto
- `features` **nunca** importa de outras `features`

### 6.2 Convenções Angular 21

**Nomes de arquivo:** Angular 21 usa nomes curtos, sem `.component.` no arquivo:
- `shell.ts` (não `shell.component.ts`)
- `shell.html` (não `shell.component.html`)
- `shell.scss` (não `shell.component.scss`)

**Nomes de classe:** manter descritivos (pode ou não ter sufixo `Component`):
```typescript
export class Shell {}           // layout
export class Dashboard {}       // feature page
export class StatusBadge {}     // shared component
```

**Standalone é o padrão:** nunca usar NgModules, a menos que haja justificativa técnica forte. Todo componente, directive e pipe deve ser `standalone: true` (em Angular 21 o decorador não exige declarar `standalone: true` explicitamente, mas a semântica é sempre standalone).

**ChangeDetection:** preferir `OnPush` em componentes de shared e features. Layouts podem usar `Default` enquanto estão em construção.

**Signals:** preferir `signal()` e `computed()` para estado local de componentes em vez de propriedades mutáveis simples. Usar `input()` para inputs reativos quando fizer sentido.

### 6.3 Estrutura de uma feature

Cada feature vive em `src/app/features/<nome-da-feature>/` e segue esta estrutura:

```
features/
└── contratos/
    ├── contratos.routes.ts          ← Routes da feature (OBRIGATÓRIO)
    ├── pages/
    │   ├── lista/
    │   │   ├── lista.ts
    │   │   ├── lista.html
    │   │   └── lista.scss
    │   └── detalhe/
    │       ├── detalhe.ts
    │       ├── detalhe.html
    │       └── detalhe.scss
    ├── components/                  ← componentes locais da feature
    └── services/                    ← services específicos da feature
        └── contratos.service.ts
```

As rotas da feature são registradas em `app.routes.ts` como lazy:

```typescript
{
  path: 'contratos',
  loadChildren: () =>
    import('./features/contratos/contratos.routes').then(m => m.CONTRATOS_ROUTES),
}
```

### 6.4 Layouts

O portal tem dois layouts:

- **`shell`** (`src/app/layouts/shell/`) — área autenticada. Conterá sidebar, header, breadcrumb, área de conteúdo. Protegido por `authGuard`.
- **`auth-layout`** (`src/app/layouts/auth-layout/`) — área pública. Login, recuperar senha, etc.

### 6.5 Roteamento

Toda rota de feature deve ser lazy. Nunca importar um componente de feature diretamente em `app.routes.ts`:

```typescript
// CORRETO
{
  path: 'dashboard',
  loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
}

// PROIBIDO
{
  path: 'dashboard',
  component: DashboardComponent,  // carrega tudo no bundle inicial
}
```

---

## 7. Estilos e SCSS

### 7.1 Hierarquia de importação global

```scss
// src/styles.scss — ordem obrigatória
@use 'leme';              // (1) tudo do DS: tokens, reset, tipografia, ícones
@use './styles/variables' as *;  // (2) SCSS vars do portal (breakpoints, z-index)
// overrides globais do portal vêm aqui (3)
```

### 7.2 includePaths configurados

O `angular.json` tem dois caminhos de resolução SCSS:
- `src/styles` — para `@use 'variables'`, `@use 'mixins'`
- `projects/leme/src/styles` — para `@use 'leme'`

Isso permite usar `@use 'variables'` em qualquer componente sem paths relativos.

### 7.3 SCSS em componentes

```scss
// Em qualquer componente .scss:
@use 'variables' as *;   // SCSS vars do portal
@use 'mixins' as *;      // mixins do portal

.meu-componente {
  padding: var(--spacing-4);              // token Leme via CSS var
  color: var(--color-secondary-60);       // token Leme via CSS var

  @include respond-to('md') {            // mixin do portal
    padding: var(--spacing-6);
  }
}
```

**Nunca use `@use 'leme'` em componentes individuais.** O Leme é importado uma única vez em `styles.scss` e seus tokens ficam disponíveis globalmente via CSS custom properties. Componentes consomem via `var(--token)`.

### 7.4 Cores de tipografia em páginas de conteúdo

Títulos e descrições de páginas seguem uma paleta neutra — **nunca usar cores de marca (primary/secondary) em texto de conteúdo**:

| Elemento | Token | Uso |
|---|---|---|
| Título principal (`h1`, `h2`) | `var(--color-gray-90)` | Cor dominante, alto contraste |
| Subtítulo / descrição de apoio | `var(--color-gray-70)` | Tom neutro, hierarquia secundária |

```scss
// CORRETO
&__title    { color: var(--color-gray-90); }
&__subtitle { color: var(--color-gray-70); }

// PROIBIDO em texto de conteúdo
&__title    { color: var(--color-secondary-80); }  // ← azul-escuro de marca
&__subtitle { color: var(--color-primary-60);   }  // ← verde/teal de marca
```

Cores de marca (`primary`, `secondary`) são reservadas para elementos interativos (botões, links, badges, ícones de destaque) e áreas de branding (sidebar, header). Nunca usá-las em texto corrido de páginas.

### 7.5 Largura e centralização do conteúdo (wizard Adesão)

O conteúdo de cada step é centralizado horizontalmente pelo wrapper `__content-inner` no layout — **as páginas individuais não devem declarar `max-width` próprio**.

| Resolução | max-width do conteúdo |
|---|---|
| < 1440px | 640px |
| ≥ 1440px | 900px |

```scss
// adesao-layout.scss — implementação de referência
&__content {
  align-items: center;  // centraliza o inner horizontalmente
}

&__content-inner {
  width: 100%;
  max-width: 640px;

  @media (min-width: 1440px) {
    max-width: 900px;
  }
}
```

Páginas dentro do wizard usam apenas `padding` interno — nunca `max-width` ou `margin: auto` — pois o layout já resolve o centramento.

#### Categoria de exceção aprovada: telas de cartão único centralizado

Páginas que não são "steps" de coleta de dados do wizard, e sim uma tela isolada de card único (ícone + título + descrição + uma ação, sem os pares de campo lado a lado do restante do wizard), podem declarar seu próprio `max-width`/`margin: 0 auto` na classe raiz. Esticar esse tipo de card pela largura cheia do `__content-inner` (640–900px) o deixaria desproporcional — o padrão visual pede uma coluna estreita e centralizada.

Páginas nesta categoria hoje:

| Página | Arquivo | Motivo |
|---|---|---|
| `senha-acesso` | `pages/senha-acesso/senha-acesso.scss` | Formulário de coluna única (criação de senha) — exceção original, aprovada 2026-07-07 |
| `verificacao-cpf` | `pages/verificacao-cpf/verificacao-cpf.scss` | Card único (campo de CPF) |
| `retomar-adesao` | `pages/retomar-adesao/retomar-adesao.scss` | Card único (login por senha) |
| `recuperar-senha` | `pages/recuperar-senha/recuperar-senha.scss` | Card único (redefinição de senha) |
| `conclusao` | `pages/conclusao/conclusao.scss` | Card único (confirmação de envio) |
| `acompanhamento` | `pages/acompanhamento/acompanhamento.scss` | Card único (status da solicitação) |

Qualquer página que colete dados em formulário largo (pares de campo lado a lado, ao estilo `vinculo`/`dados-pessoais`/`contribuicao` etc.) **continua proibida** de declarar `max-width` próprio — essas usam apenas `padding` interno, e o centramento vem do `__content-inner`. Uma nova página "card único" que precise entrar nesta categoria deve ser discutida e adicionada explicitamente a esta tabela, não apenas replicada por precedente sem registro.

### 7.6 Path aliases TypeScript

```typescript
import { StorageService } from '@core/services/storage.service';
import { SomeComponent } from '@shared/components/some/some';
import { environment } from '@env/environment';
// import { MinhaFeature } from '@features/...' — evitar; prefira importação relativa dentro da feature
```

Aliases disponíveis:
- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@features/*` → `src/app/features/*`
- `@layouts/*` → `src/app/layouts/*`
- `@env/*` → `src/environments/*`
- `leme` → `dist/leme` (biblioteca compilada)

---

## 8. HTTP e Services

### 8.1 Interceptors ativos

- **`authInterceptor`** — injeta `Authorization: Bearer <token>` em todas as requisições quando há token no `StorageService`.
- **`errorInterceptor`** — captura 401 (redireciona para `/auth/login`) e 403.

### 8.2 StorageService

Abstração sobre `localStorage`. Nunca acesse `localStorage` diretamente nos componentes:

```typescript
// CORRETO
constructor(private storage: StorageService) {}
const token = this.storage.getToken();

// PROIBIDO
const token = localStorage.getItem('auth_token');
```

### 8.3 Environments

```typescript
import { environment } from '@env/environment';
const url = `${environment.apiUrl}/contratos`;
```

Em produção, o `fileReplacements` do `angular.json` substitui automaticamente `environment.ts` por `environment.prod.ts`.

### 8.4 Padrão de service

```typescript
@Injectable({ providedIn: 'root' })
export class ContratosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contratos`;

  getAll(): Observable<ApiResponse<Contrato[]>> {
    return this.http.get<ApiResponse<Contrato[]>>(this.baseUrl);
  }
}
```

Use `inject()` em vez de injeção via construtor. Use os tipos genéricos de `api-response.model.ts`.

---

## 9. Autenticação (preparada, não implementada)

A estrutura de autenticação JWT está preparada mas **sem fluxo implementado**:

- `authGuard` — protege as rotas do shell. Atualmente redireciona para `/auth/login` se não há token.
- `authInterceptor` — já funcional, injeta token quando presente.
- `StorageService` — já funcional, gerencia `auth_token` no localStorage.

Quando implementar auth:
1. Criar `features/auth/` com página de login
2. Criar `AuthService` em `core/services/` com login/logout/refresh
3. Conectar o `AuthService` ao `StorageService` e ao `errorInterceptor`

---

## 10. Boas Práticas

### 10.1 Acessibilidade

- Todo elemento interativo deve ter `aria-label` ou texto visível
- Usar o mixin `visually-hidden` para textos acessíveis visualmente ocultos
- Imagens sempre com `alt`
- Componentes do Leme já implementam acessibilidade internamente — usar como vieram

### 10.2 Performance

- `ChangeDetectionStrategy.OnPush` em todos os componentes novos
- Lazy loading obrigatório para features
- Evitar `subscribe()` em templates; preferir `async` pipe ou signals
- Não carregar dados em construtores; usar `ngOnInit` ou `afterNextRender()`

### 10.3 Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente (arquivo) | kebab-case, sem `.component.` | `status-badge.ts` |
| Componente (classe) | PascalCase | `StatusBadge` |
| Service | `NomeService` | `ContratosService` |
| Guard | `nomeGuard` (funcional) | `authGuard` |
| Interceptor | `nomeInterceptor` (funcional) | `authInterceptor` |
| Model/Interface | PascalCase, sem sufixo | `Contrato`, `ApiResponse<T>` |
| Routes array | `NOME_ROUTES` (screaming snake) | `CONTRATOS_ROUTES` |
| Signal | camelCase descritivo | `isLoading`, `selectedItem` |

### 10.4 O que não fazer

```typescript
// Não use NgModule
@NgModule({ ... })  // ← PROIBIDO

// Não use injeção via construtor
constructor(private service: MyService) {}  // ← evitar; use inject()

// Não importe features entre si
import { X } from '../outra-feature/x';  // ← PROIBIDO

// Não acesse localStorage diretamente
localStorage.setItem(...)  // ← PROIBIDO; use StorageService

// Não hardcode valores visuais
color: #333333  // ← PROIBIDO; use var(--token)
padding: 8px    // ← PROIBIDO; use var(--spacing-2)

// Não carregue features de forma eager
{ path: 'x', component: XComponent }  // ← PROIBIDO; use loadChildren/loadComponent

// Não use @angular-devkit/build-angular builder para a lib
"builder": "@angular-devkit/build-angular:ng-packagr"  // ← NÃO EXISTE neste workspace
// Use: "@angular/build:ng-packagr"
```

---

## 11. Workflow de Desenvolvimento

### 11.1 Primeiro setup (após clonar o portal)

**Antes de rodar o projeto pela primeira vez em uma sessão de trabalho, é obrigatório verificar se a branch local está atualizada em relação ao GitHub — e, se não estiver, rodar `git pull` antes de qualquer outro comando.**

```bash
git fetch origin
git status -uno        # compara local vs. origin/<branch> — mostra "behind" se houver commits novos
git pull                # se estiver desatualizado
```

Só depois disso:

```bash
npm install
npm run leme:build   # obrigatório — dist/leme é gitignored
npm start
```

### 11.2 Dia a dia

```bash
# Terminal 1: portal
npm start

# Terminal 2: se estiver modificando o Leme simultaneamente
npm run leme:watch
```

### 11.3 Build de produção

```bash
npm run leme:build:prod   # build parcial (correto para publicação)
npm run build             # build do portal
```

### 11.4 Deploy — Vercel (dois remotes!)

**Este workspace tem dois remotes Git apontando para repositórios GitHub diferentes.** O Vercel só observa um deles — pushes no outro não geram deploy nenhum, mesmo que o build local esteja perfeito.

```bash
git remote -v
# origin  → https://github.com/FlavioRossato/Oceano.git           (branch: master)
# vercel  → https://github.com/FlavioRossato/prototipooceanov2.git (branch: main)
```

- `origin` / `master` — repositório principal de trabalho (histórico "oficial" do projeto).
- `vercel` / `main` — repositório conectado ao projeto Vercel `prototipooceanov2` (domínio `prototipooceanov2.vercel.app`). **É esse que precisa receber o push para o site atualizar.**

**Sempre que uma mudança precisar aparecer no Vercel, faça os dois pushes:**

```bash
git push origin master        # histórico principal
git push vercel master:main   # dispara o deploy no Vercel
```

Antes do segundo push, se houver dúvida sobre divergência de histórico, confirme que é fast-forward:

```bash
git fetch vercel
git merge-base --is-ancestor vercel/main master && echo "fast-forward OK"
```

Se não for fast-forward (alguém commitou direto em `prototipooceanov2` fora deste fluxo), pare e resolva a divergência manualmente — não force o push sem entender a causa.

### 11.5 Gerar componentes

```bash
# Componente em shared
ng g component shared/components/meu-componente --style=scss

# Service em core
ng g service core/services/meu-service

# Feature completa (criar estrutura manualmente ou usar ng g)
mkdir src/app/features/minha-feature
```

---

## 12. Configurações Relevantes

### 12.1 angular.json (pontos críticos)

- **Builder do portal:** `@angular/build:application`
- **Builder da lib:** `@angular/build:ng-packagr` (não `@angular-devkit/build-angular`)
- **SCSS includePaths:** `["src/styles", "projects/leme/src/styles"]`
- **fileReplacements:** prod usa `environment.prod.ts`

### 12.2 tsconfig.json (paths)

```json
"paths": {
  "leme":        ["dist/leme"],
  "@core/*":     ["src/app/core/*"],
  "@shared/*":   ["src/app/shared/*"],
  "@features/*": ["src/app/features/*"],
  "@layouts/*":  ["src/app/layouts/*"],
  "@env/*":      ["src/environments/*"]
}
```

### 12.3 Pacotes instalados além do padrão

- `@angular/animations@21.2.17` — necessário para `provideAnimationsAsync` (não incluído por default no `ng new`)
- `ng-packagr@21.2.5` — necessário para compilar a biblioteca Leme

---

## 13. Registro de Decisões Técnicas

| Data | Decisão | Justificativa |
|---|---|---|
| 2026-07-01 | Angular 21 em vez de 16 | Node.js 24 incompatível com Angular 16 |
| 2026-07-01 | Monorepo workspace | Leme DS é privado, não publicado no npm; desenvolvimento local integrado |
| 2026-07-01 | `@angular/build:ng-packagr` | `@angular-devkit/build-angular` não está instalado no Angular 21; builder correto é `@angular/build` |
| 2026-07-01 | `provideAnimationsAsync` | Preferível ao `provideAnimations` em Angular 17+ para lazy animations |
| 2026-07-01 | `withComponentInputBinding()` | Permite binding de route params em `@Input()` — padrão moderno |
| 2026-07-01 | Material Symbols via `<link>` no `index.html` | Mais performático que CSS `@import`; a `_icons.scss` do Leme usa `@import url()` que pode ter posição inválida no CSS gerado |
| 2026-07-07 | Exceção de `max-width`/`margin: auto` na página `senha-acesso` (regra §7.5) | Formulário de coluna única; esticar pela largura cheia do `__content-inner` (640–900px) deixaria os campos desproporcionais |
| 2026-07-07 | `git pull` obrigatório antes do primeiro `npm start` da sessão (regra §11.1) | Evitar desenvolver sobre uma branch local desatualizada em relação ao GitHub |
| 2026-07-08 | `ignoreDeprecations` em `tsconfig.app.json` corrigido de `"6.0"` para `"5.0"` | Valor `"6.0"` é inválido para TypeScript `~5.9.2` instalado (erro TS5103), quebrava a build após um `git pull` |
| 2026-07-08 | Push sempre em dois remotes — `origin master` e `vercel master:main` (regra §11.4) | Vercel monitora o repositório `prototipooceanov2` (remote `vercel`), diferente do repositório principal `Oceano` (remote `origin`); push só em `origin` não gera deploy |
| 2026-07-12 | Exceção de `max-width` (regra §7.5) ampliada de "só `senha-acesso`" para uma categoria "telas de cartão único centralizado" (`verificacao-cpf`, `retomar-adesao`, `recuperar-senha`, `conclusao`, `acompanhamento`) | Essas páginas já haviam sido implementadas com `max-width` próprio, no mesmo padrão da exceção original, sem que a exceção tivesse sido formalmente estendida — auditoria de conformidade encontrou o desvio e a documentação foi atualizada para refletir a decisão real |
| 2026-07-12 | `--icon-size-*` (tokens de `_project-tokens.scss`) aplicados nos ícones do app que ainda usavam `font-size` em px hardcoded | Auditoria de conformidade com a regra §4 (sem hardcode); tokens já existiam mas não eram usados em `src/app/` |
| 2026-07-12 | Removido `$spacing-*` (dead code) de `_variables.scss` e apagado `_typography.scss` | Nenhum dos dois era importado em `styles.scss`; `$spacing-*` duplicava tokens que já existem no Leme (`var(--spacing-*)`) e `_typography.scss` tinha um `font-family` hardcoded sem efeito real |

---

## 14. Próximos Passos (não implementados)

Registrar aqui quando implementar:

- [ ] Feature `auth` — login, logout, refresh token
- [ ] Shell layout real — sidebar, header, breadcrumb usando tokens Leme
- [ ] ESLint com regras Angular + acessibilidade
- [ ] Primeira feature de negócio (a definir)
- [ ] Estratégia de testes (jest vs karma)
- [ ] Husky + lint-staged para validação pre-commit

---

*Última atualização: 2026-07-12 — Flávio Rossato + Claude*
