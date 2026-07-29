# SISCETRAN — Arquitetura do Projeto

> Documento de referência gerado a partir da inspeção do repositório em 28/07/2026.
> Objetivo: registrar o estado real do projeto (o que existe, o que é esqueleto, e como as
> partes se conectam) para não se perder o fio da meada entre uma sessão e outra.

---

## 1. Visão geral

SISCETRAN é o **Sistema de Ações Estratégicas do PETRANS**, usado para que solicitantes
detalhem ações estratégicas (metodologia 5W2H), enviem para aprovação de um comitê de
conselheiros, e acompanhem o andamento geral do plano.

O projeto está dividido em duas partes que **ainda não estão conectadas**:

```
SISCETRAN/
├── frontend/     → 100% funcional, mas roda isolado no navegador (localStorage)
└── backend/      → esqueleto Spring Boot, schema de banco pronto, sem lógica implementada
```

---

## 2. Frontend

**Stack:** HTML + CSS + JavaScript vanilla (sem framework), SweetAlert2 (modais/toasts via
CDN) e Bootstrap Icons (CDN).

```
frontend/
├── index.html         → estrutura de todas as "telas" (seções mostradas/ocultadas via JS)
├── css/styles.css
├── js/
│   ├── acoes_data.js  → dados estáticos das 147 ações estratégicas do PETRANS
│   └── script.js      → toda a lógica da aplicação (~1360 linhas)
└── assets/logo.png
```

### 2.1 Persistência atual

**Tudo vive no `localStorage` do navegador.** Não há nenhuma chamada de rede.
Chave principal: `siscetran_db`, contendo:

```js
{
  usuarios: [ { email, senha, role } ],   // roles: "usuario" | "comite" | "admin"
  registros: [ ... ]                       // ver estrutura abaixo
}
```

Sessão do usuário logado fica em `usuarioLogadoDados` / `usuarioLogado` (chaves separadas).

### 2.2 Modelo de dados das Ações Estratégicas

`acoes_data.js` define `acoesEstrategicas`: um array de **147 ações**, cada uma com:

```js
{ id, diretriz, prazo, meta, indicador, responsavel }
```

- `id` segue o padrão `AE X.Y.Z.N` (ex: `AE 1.1.1.1`, `AE 1.1.1.2`...).
- Removendo o último segmento (`.N`) chega-se ao código da **matriz**
  (ex: `AE 1.1.1`) — há **28 matrizes** no total, cada uma agrupando de 1 a várias ações.
- `prazo` ∈ {`Curto`, `Médio`, `Longo`}.
- `responsavel` é texto livre, podendo conter múltiplos responsáveis separados por vírgula.

### 2.3 Modelo de dados dos Registros (detalhamentos 5W2H)

Cada vez que alguém detalha uma ou mais ações e salva, é criado um **registro**:

```js
{
  id,                     // gerado via Date.now() + random
  dataCriacao,
  status,                  // "Rascunho" | "Enviado" | "Aprovado" | "Pendente"
  criadoPor,                // e-mail do solicitante
  acoesEstrategicas: [{ id, diretriz }],  // ações vinculadas a este registro (multi-seleção)
  oque, porque, como, quando, onde, quanto, impacto, observacao,
  comentarioComite, avaliadoPor, dataAvaliacao
}
```

Fluxo de status:

```
Rascunho → Enviado → [Comitê avalia] → Aprovado
                                     ↳ Pendente (reprovado, volta para correção → reenvia)
```

Um registro pode ficar preso em `Rascunho` indefinidamente (salvo mas não enviado) e só
pode ser excluído nesse estado ou em `Pendente`. Depois de `Enviado`, exclusão é bloqueada.

### 2.4 Papéis de usuário

| role      | pode fazer |
|-----------|------------|
| `usuario` | detalhar ações, salvar rascunho, enviar para comitê, ver "Meus Rascunhos" |
| `comite`  | tudo do usuário + acessar Painel de Avaliação, aprovar/reprovar |
| `admin`   | mesmo acesso que `comite` no frontend atual |

Usuários de teste embutidos no banco inicial (`carregarBanco()`):
`usuario@email.com` / `usuario123`, `comite@email.com` / `comite123`, `admin@email.com` / `admin123`.

### 2.5 Telas (seções em `index.html`, alternadas via `display`)

| Seção (`id`)             | Acionada por                          | O que mostra |
|---------------------------|----------------------------------------|--------------|
| `heroSection`             | logo / estado inicial                  | landing page |
| `acoesTableContainer`     | botão "Ações Estratégicas"              | tabela das 147 ações, com checkbox de seleção múltipla |
| `formularioContainer`     | "Nova Ação" (após selecionar ações)     | formulário 5W2H |
| `registroView`            | "Consultar Ações Detalhadas" / "Meus Rascunhos" | tabela de registros do usuário |
| `comiteView`              | "Avaliação do Comitê" (só `comite`/`admin`) | cards de aprovação, stats, filtros |
| `andamentoView`           | **botão "Andamento"** (novo)            | painel de progresso — ver seção 2.6 |
| `modalAvaliacao`          | clique em "Analisar e Avaliar"          | modal com detalhamento completo 5W2H + aprovar/reprovar |

### 2.6 Painel de Andamento (`andamentoView`)

Página dedicada, inspirada no Painel Municipal do Infosiga/Detran-SP, criada para
acompanhar o progresso das ações **aprovadas** (não conta rascunho nem enviado).

- **Filtros:** Prazo (Curto/Médio/Longo) e Responsável (populado dinamicamente a partir
  de `acoesEstrategicas`).
- **Cards de KPI:** ações no filtro, ações aprovadas, matrizes envolvidas, % de progresso
  geral.
- **Gráfico de barras por matriz:** uma linha por matriz (`AE X.Y.Z`), ordenado da mais
  completa para a menos completa.
- **Tabela de ranking:** posição, matriz, total de ações, aprovadas, % concluído.

**Regra de negócio central:** uma ação só é considerada "concluída" se estiver vinculada
a pelo menos um registro com `status === "Aprovado"`. Peso de cada matriz no total é
proporcional ao número de ações que ela contém (matriz com mais ações pesa mais) — o que,
matematicamente, equivale a `total de ações aprovadas / total de ações` no cálculo do
percentual geral.

Funções-chave em `script.js`:
`obterMatrizId`, `obterIdsAcoesAprovadas`, `obterResponsaveisUnicos`,
`obterAcoesFiltradasAndamento`, `calcularAndamentoPorMatriz`, `renderizarAndamento`.

---

## 3. Backend

**Stack:** Spring Boot 4.1 / Java 21 / Maven.

```
backend/
├── pom.xml                      → dependências: spring-boot-starter-web,
│                                    spring-boot-starter-data-jpa, driver postgresql
├── application.properties       → configuração do datasource (raiz do projeto)
├── schema.sql                    → schema completo do banco (ver seção 3.1)
└── src/
    ├── main/java/br/com/siscetran/BackendApplication.java  → único arquivo Java existente
    └── test/java/br/com/siscetran/BackendApplicationTests.java
```

**Estado atual: só o esqueleto do Spring Initializr.** Não existem entidades JPA,
repositories, services, controllers, autenticação JWT nem RBAC implementados no lado
Java — apenas o `schema.sql` já modela o domínio completo.

### 3.1 Schema do banco (`schema.sql`)

| Tabela               | Papel |
|-----------------------|-------|
| `usuario`              | dados de login, `tipo_usuario` ∈ {ADMIN, CONSELHEIRO, USUARIO_COMUM}, `status` ∈ {ATIVO, INATIVO, BLOQUEADO} |
| `conselheiro`          | extensão de `usuario` para membros do comitê (área de atuação, registro profissional) |
| `administrador`        | extensão de `usuario` para admins (nível de acesso, cargo) |
| `solicitacao`          | o detalhamento 5W2H (equivalente ao "registro" do frontend), com `status` ∈ {PENDENTE, EM_AVALIACAO, APROVADA, REPROVADA, CANCELADA} |
| `voto_conselheiro`     | voto individual de cada conselheiro sobre uma solicitação (`APROVADO`/`REPROVADO`/`ABSTENCAO` + parecer) |
| `decisao_final`        | decisão consolidada de um administrador sobre uma solicitação |

Observação: o schema já modela um fluxo **mais granular** que o frontend atual — no
frontend, a aprovação é decidida por qualquer usuário `comite`/`admin` individualmente
(sem votação); no schema, existe a tabela `voto_conselheiro` (voto por conselheiro) mais
`decisao_final` (decisão consolidada). Isso é um ponto de atenção para quando o backend
for implementado: decidir se o frontend precisa evoluir para suportar votação múltipla
ou se o schema será simplificado.

**Não há tabela para "ação estratégica"** (os dados de `acoes_data.js`) nem para
"matriz" — isso ainda precisa ser modelado no banco se o backend for assumir essa
responsabilidade (hoje esses dados são estáticos, hardcoded no frontend).

### 3.2 Configuração do banco

Histórico de decisões:
- Testou-se migrar de PostgreSQL para MySQL (por questão de instalação local sem admin) —
  **decisão final: manter PostgreSQL**, já que o `schema.sql` e o `application.properties`
  foram escritos para ele desde o início.
- `spring.jpa.hibernate.ddl-auto=validate` → o schema é gerenciado manualmente via SQL,
  o Hibernate **não** cria/altera tabelas sozinho. Qualquer mudança de schema precisa ser
  replicada manualmente no `schema.sql` e aplicada via `psql -f schema.sql`.
- Postgres roda localmente via terminal (sem pgAdmin), banco `siscetran`.

---

## 4. O elo que falta (frontend ↔ backend)

Hoje as duas partes não se conversam. Para integrar, os principais pontos de entrada no
`script.js` que precisam virar chamadas `fetch` para uma API REST são:

| Função no frontend          | Endpoint que precisaria existir (sugestão) |
|-------------------------------|----------------------------------------------|
| `capturarDadosFormulario` + salvar/enviar | `POST /solicitacoes` |
| `atualizarTabelaRegistros`    | `GET /solicitacoes?usuario=...` |
| `confirmarAvaliacaoModal` (avaliar) | `POST /solicitacoes/{id}/decisao` ou `POST /votos` |
| `excluirRegistro`             | `DELETE /solicitacoes/{id}` |
| `renderizarAndamento` (novo)  | `GET /andamento?prazo=&responsavel=` (ou calcular no frontend a partir de `GET /solicitacoes` + `acoes_data.js`) |

Autenticação (JWT) e autorização por papel (RBAC) precisam ser implementadas no backend
e o header `Authorization: Bearer <token>` precisa ser adicionado em todas as chamadas do
frontend após o login.

---

## 5. Próximos passos sugeridos

1. Criar as entidades JPA a partir do `schema.sql` (Usuario, Conselheiro, Administrador,
   Solicitacao, VotoConselheiro, DecisaoFinal).
2. Decidir se o modelo de aprovação será "voto único decide" (como está no frontend hoje)
   ou "votação de conselheiros + decisão final" (como sugere o schema) — isso muda o
   design dos endpoints.
3. Modelar `AcaoEstrategica` e `Matriz` no banco (hoje só existem como array estático no
   frontend) caso se queira que sejam editáveis/administráveis via backend no futuro.
4. Implementar autenticação JWT + RBAC.
5. Trocar as chamadas de `localStorage` por `fetch` nos pontos listados na seção 4.
6. Portar o cálculo de `renderizarAndamento` para o backend (ou manter no frontend,
   consumindo `GET /solicitacoes` com status `Aprovado` já filtrado pela API).

---

## 6. Créditos / última verificação

Este documento reflete o estado do código no upload mais recente do repositório
(`SISCETRAN.zip`, verificado em 28/07/2026). Atualize esta seção sempre que o backend
ganhar implementação real, para este README não ficar desatualizado.