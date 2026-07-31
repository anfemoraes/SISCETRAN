// ==========================================================================
// FILTERS.JS — Filtros do Dashboard, baseados EXCLUSIVAMENTE nos campos
// oficiais da planilha "Plano_de_Trabalho_Cetran-PA_2030.xlsx" (aba
// "Diretrizes"): Objetivo de Governo (OG), Linha de Ação Estratégica (LAE),
// Ação Estratégica (AE), Setor Responsável pela AE e Prazo para Consecução
// da AE. Nenhum desses campos é derivado — todos vêm literalmente das
// colunas da planilha (ver js/acoes_data.js).
//
// A única exceção é o "Status da Aprovação": a planilha não tem essa coluna
// (ela não acompanha fluxo de aprovação). Por isso ele NÃO é inventado aqui:
// é lido diretamente do campo "status" que já existe nos registros 5W2H do
// próprio sistema (o mesmo usado no Painel do Comitê). Para uma ação sem
// nenhum registro vinculado, o status exibido é "Não iniciada".
//
// Depende de variáveis globais definidas em script.js (registros,
// escaparTexto, window.acoesEstrategicas) — carregar sempre depois dele.
// ==========================================================================

// --------------------------------------------------------------------------
// Setor Responsável pela AE
// A coluna oficial pode conter mais de um setor por ação, separados por
// vírgula (ex.: "CTSEG, CTEDUC, Secretaria-Executiva"). Para permitir filtro
// e contagem, cada ação é considerada em TODOS os setores mencionados (não
// é uma escolha de "setor principal" — é apenas separar o que já está na
// célula). Ações sem o campo preenchido entram em "Não informado".
// --------------------------------------------------------------------------
function obterSetoresDaAcao(acao) {
    if (!acao.setor) return ["Não informado"];
    return acao.setor.split(",").map(s => s.trim()).filter(Boolean);
}

function obterSetoresUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    const setores = new Set();
    todasAcoes.forEach(a => obterSetoresDaAcao(a).forEach(s => setores.add(s)));
    return Array.from(setores).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function obterPrazoDaAcao(acao) {
    return acao.prazo || "Não informado";
}

function obterPrazosUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    const prazos = new Set(todasAcoes.map(obterPrazoDaAcao));
    // Ordem institucional (Curto/Médio/Longo), com "Não informado" ao final.
    const ordem = ["Curto Prazo", "Médio Prazo", "Longo Prazo"];
    return [
        ...ordem.filter(p => prazos.has(p)),
        ...Array.from(prazos).filter(p => !ordem.includes(p)).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    ];
}

function obterObjetivosGovernoUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    return Array.from(new Set(todasAcoes.map(a => a.og).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function obterLinhasAcaoUnicas() {
    const todasAcoes = window.acoesEstrategicas || [];
    return Array.from(new Set(todasAcoes.map(a => a.lae).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// --------------------------------------------------------------------------
// Status da Aprovação — lido do campo real "status" dos registros 5W2H
// vinculados a cada ação (não é uma coluna da planilha, ver nota acima).
// --------------------------------------------------------------------------
function obterRegistroPrincipalDaAcao(idAcao) {
    const vinculados = registros.filter(r =>
        (r.acoesEstrategicas || []).some(a => a.id === idAcao)
    );
    if (vinculados.length === 0) return null;

    const aprovados = vinculados.filter(r => r.status === "Aprovado");
    if (aprovados.length > 0) return aprovados[aprovados.length - 1];
    return vinculados[vinculados.length - 1];
}

function obterStatusAprovacaoDaAcao(acao) {
    const registro = obterRegistroPrincipalDaAcao(acao.id);
    return registro ? registro.status : "Não iniciada";
}

const STATUS_APROVACAO_VALORES = ["Não iniciada", "Rascunho", "Enviado", "Pendente", "Aprovado"];

// --------------------------------------------------------------------------
// Popular as opções dinâmicas dos 6 filtros oficiais
// --------------------------------------------------------------------------
function popularFiltrosDashboard() {
    const popular = (id, valores, formatador) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.populado) return;
        valores.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = formatador ? formatador(v) : v;
            el.appendChild(opt);
        });
        el.dataset.populado = "true";
    };

    popular("filtroOG", obterObjetivosGovernoUnicos());
    popular("filtroLAE", obterLinhasAcaoUnicas());
    popular("filtroAE", (window.acoesEstrategicas || []).map(a => a.id),
        (id) => {
            const acao = (window.acoesEstrategicas || []).find(a => a.id === id);
            const resumo = acao && acao.diretriz ? acao.diretriz.substring(0, 60) + (acao.diretriz.length > 60 ? "…" : "") : "";
            return `${id} — ${resumo}`;
        });
    popular("filtroSetor", obterSetoresUnicos());
    popular("filtroPrazo", obterPrazosUnicos());
    popular("filtroStatusAprovacao", STATUS_APROVACAO_VALORES);
}

// --------------------------------------------------------------------------
// Leitura e aplicação dos filtros
// --------------------------------------------------------------------------
function obterFiltrosAtuais() {
    const el = id => document.getElementById(id);
    return {
        og: el("filtroOG") ? el("filtroOG").value : "Todos",
        lae: el("filtroLAE") ? el("filtroLAE").value : "Todos",
        ae: el("filtroAE") ? el("filtroAE").value : "Todos",
        setor: el("filtroSetor") ? el("filtroSetor").value : "Todos",
        prazo: el("filtroPrazo") ? el("filtroPrazo").value : "Todos",
        statusAprovacao: el("filtroStatusAprovacao") ? el("filtroStatusAprovacao").value : "Todos"
    };
}

function obterAcoesFiltradasDashboard(filtros) {
    const todasAcoes = window.acoesEstrategicas || [];
    filtros = filtros || obterFiltrosAtuais();

    return todasAcoes.filter(a => {
        const passaOG = filtros.og === "Todos" || a.og === filtros.og;
        const passaLAE = filtros.lae === "Todos" || a.lae === filtros.lae;
        const passaAE = filtros.ae === "Todos" || a.id === filtros.ae;
        const passaSetor = filtros.setor === "Todos" || obterSetoresDaAcao(a).includes(filtros.setor);
        const passaPrazo = filtros.prazo === "Todos" || obterPrazoDaAcao(a) === filtros.prazo;
        const passaStatus = filtros.statusAprovacao === "Todos" || obterStatusAprovacaoDaAcao(a) === filtros.statusAprovacao;
        return passaOG && passaLAE && passaAE && passaSetor && passaPrazo && passaStatus;
    });
}

function limparFiltrosDashboard() {
    ["filtroOG", "filtroLAE", "filtroAE", "filtroSetor", "filtroPrazo", "filtroStatusAprovacao"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "Todos";
    });
}
