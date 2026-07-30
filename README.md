# 🚦 SISCETRAN – Sistema de Gestão do Plano PETRANS

<p align="center">
  <img src="assets/img/logo.png" width="180" alt="Logo do Sistema">
</p>

## 📖 Sobre o Projeto

O **SISCETRAN** é um sistema web desenvolvido para apoiar o gerenciamento do **Plano Estadual de Redução de Sinistros de Trânsito (PETRANS)**.

A plataforma centraliza o planejamento, acompanhamento e monitoramento das ações estratégicas executadas pelos diversos setores responsáveis, permitindo maior transparência, controle e apoio à tomada de decisão.

O sistema foi concebido para atender o fluxo completo do Plano PETRANS, desde a criação de uma ação baseada na metodologia **5W2H**, passando pela validação do Comitê Gestor, até sua consolidação no painel gerencial.

---

# 🎯 Objetivos

- Centralizar o gerenciamento das ações do PETRANS;
- Organizar ações por Eixos Estratégicos;
- Acompanhar o andamento das ações;
- Facilitar o processo de aprovação pelo Comitê;
- Disponibilizar indicadores gerenciais;
- Fornecer um Dashboard para acompanhamento em tempo real.

---

# 🏛 Fluxo do Sistema

```text
Usuário
    │
    ▼
Cadastro da Ação
(Formulário 5W2H)
    │
    ▼
Envio ao Comitê
    │
    ▼
Análise e Aprovação
    │
    ▼
Inclusão no Plano PETRANS
    │
    ▼
Dashboard Gerencial
```

---

# 👥 Perfis de Usuário

## 👤 Usuário

Responsável por:

- Cadastrar ações;
- Editar ações;
- Consultar andamento;
- Enviar para aprovação.

---

## 👥 Comitê

Responsável por:

- Avaliar ações;
- Aprovar ou reprovar;
- Solicitar ajustes;
- Validar o Plano de Ação.

---

## 👨‍💼 Administrador

Responsável por:

- Gerenciar usuários;
- Gerenciar setores;
- Gerenciar eixos;
- Gerenciar permissões;
- Acompanhar indicadores.

---

# 📋 Plano de Ação (5W2H)

Cada ação é cadastrada utilizando a metodologia **5W2H**, composta pelos seguintes elementos:

- What
- Why
- Where
- When
- Who
- How
- How Much

Essas informações subsidiam a análise realizada pelo Comitê.

---

# 📊 Dashboard Gerencial

O Dashboard apresenta indicadores consolidados das ações aprovadas.

## Indicadores

- Total de ações
- Ações concluídas
- Ações em andamento
- Ações atrasadas
- Percentual de execução

---

## Filtros disponíveis

- Prazo
- Responsável
- Setor
- Eixo Estratégico
- Status

Todos os filtros atualizam simultaneamente os indicadores e gráficos.

---

## Gráficos

O Dashboard contempla gráficos voltados ao apoio à tomada de decisão.

Exemplos:

- Distribuição das ações por status;
- Evolução das ações;
- Distribuição por setor;
- Distribuição por eixo estratégico.

---

# 🧠 Inteligência Artificial (Roadmap)

Como evolução futura do sistema, está prevista a integração de um módulo de Inteligência Artificial capaz de:

- Resumir automaticamente ações cadastradas;
- Auxiliar o Comitê durante a análise;
- Identificar inconsistências;
- Gerar resumos executivos.

---

# 🗂 Estrutura do Projeto

```
SISCETRAN/

├── frontend/
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── páginas HTML
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── database/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 💻 Tecnologias

Frontend

- HTML5
- CSS3
- JavaScript

Backend

- Node.js
- Express.js

Banco de Dados

- SQLite

Bibliotecas

- Chart.js
- Express
- SQLite3
- JWT
- Multer

---

# 🚀 Funcionalidades

- Login
- Controle de usuários
- Cadastro de ações
- Aprovação pelo Comitê
- Dashboard gerencial
- Indicadores
- Filtros inteligentes
- Relatórios
- Controle de andamento

---

# 🔒 Segurança

O sistema foi projetado considerando diferentes níveis de acesso:

- Usuário
- Comitê
- Administrador

Cada perfil possui permissões específicas de acordo com suas atribuições.

---

# 📈 Objetivo Estratégico

O SISCETRAN foi desenvolvido para apoiar o monitoramento do Plano PETRANS, contribuindo para o acompanhamento das ações voltadas à redução dos sinistros de trânsito, fornecendo informações consolidadas para gestores e tomadores de decisão.

---

# 👨‍💻 Desenvolvedores

André Moraes
Beatriz Brito
Geovanna Moy

Projeto desenvolvido para apoio à gestão do Plano Estadual de Redução de Sinistros de Trânsito (PETRANS).

---

# 📄 Licença

Projeto desenvolvido para fins institucionais e acadêmicos.