// ==========================================================================
// FILTERS.JS — Filtros e regras de negócio do Dashboard do Plano PETRANS
// Depende de variáveis globais definidas em script.js (registros, escaparTexto,
// window.acoesEstrategicas) — carregar SEMPRE depois de script.js.
// ==========================================================================

// --------------------------------------------------------------------------
// Identificação de Matriz / Eixo a partir do ID da ação (ex: "AE 1.1.1.2")
// --------------------------------------------------------------------------
function obterMatrizId(idAcao) {
    return idAcao.replace(/\.\d+$/, '');
}

// O primeiro número após "AE " identifica o Eixo Estratégico (ex: "AE 2.1.3.1" -> Eixo 2).
// Observação: a base de dados (acoes_data.js) não possui um campo "eixo" nomeado,
// por isso ele é derivado do próprio código da ação. Caso a Diretoria do PETRANS
// forneça nomes oficiais para cada eixo, basta preencher o mapa EIXO_LABELS abaixo.
const EIXO_LABELS = {
    // "1": "Nome oficial do Eixo 1",
};

function obterEixoId(idAcao) {
    const match = idAcao.match(/AE\s*(\d+)\./);
    return match ? match[1] : "0";
}

function obterEixoLabel(eixoId) {
    return EIXO_LABELS[eixoId] || `Eixo ${eixoId}`;
}

// --------------------------------------------------------------------------
// Responsáveis / Setores
// O campo "responsavel" do acoes_data.js é texto livre, podendo conter várias
// entidades separadas por vírgula (ex: "Secretaria-Executiva, CTSIST").
// Como o modelo de dados atual não separa "Setor" de "Responsável", adotamos
// a seguinte convenção arquitetural, documentada aqui e no README:
//   - SETOR      = primeira entidade listada (o setor coordenador da ação)
//   - RESPONSÁVEL = qualquer entidade listada (coordenadora ou coparticipante)
// --------------------------------------------------------------------------
function obterEntidadesResponsavel(acao) {
    return (acao.responsavel || "")
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);
}

function obterSetorPrincipal(acao) {
    const entidades = obterEntidadesResponsavel(acao);
    return entidades.length ? entidades[0] : "Não informado";
}

function obterSetoresUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    const setores = new Set();
    todasAcoes.forEach(a => setores.add(obterSetorPrincipal(a)));
    return Array.from(setores).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function obterResponsaveisUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    const responsaveis = new Set();
    todasAcoes.forEach(a => obterEntidadesResponsavel(a).forEach(nome => responsaveis.add(nome)));
    return Array.from(responsaveis).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// --------------------------------------------------------------------------
// Aprovações (comitê)
// --------------------------------------------------------------------------
function obterIdsAcoesAprovadas() {
    const idsAprovados = new Set();
    registros
        .filter(r => r.status === "Aprovado")
        .forEach(r => {
            (r.acoesEstrategicas || []).forEach(a => idsAprovados.add(a.id));
        });
    return idsAprovados;
}

// Retorna, para uma ação, o registro 5W2H mais relevante para determinar seu
// status de execução: prioriza o registro Aprovado mais recente; na ausência
// de aprovação, usa o registro mais recente em qualquer outro status
// (Enviado, Pendente ou Rascunho), indicando que a ação já está em processo.
function obterRegistroPrincipalDaAcao(idAcao) {
    const vinculados = registros.filter(r =>
        (r.acoesEstrategicas || []).some(a => a.id === idAcao)
    );
    if (vinculados.length === 0) return null;

    const aprovados = vinculados.filter(r => r.status === "Aprovado");
    if (aprovados.length > 0) {
        return aprovados[aprovados.length - 1];
    }
    return vinculados[vinculados.length - 1];
}

// --------------------------------------------------------------------------
// Status de execução do Dashboard (Concluída / Em andamento / Atrasada / Não iniciada)
//
// Regra de negócio (derivada, pois o sistema ainda não possui um campo dedicado
// de "andamento da execução" — apenas o status de avaliação do comitê e o prazo
// estimado informado no formulário 5W2H):
//   - Não iniciada : nenhum registro 5W2H foi vinculado à ação ainda.
//   - Em andamento : existe registro vinculado, mas nenhum foi Aprovado
//                    (está em Rascunho, Enviado ou devolvido como Pendente).
//   - Concluída    : existe registro Aprovado e o prazo estimado ("quando")
//                    ainda não venceu (ou não foi informado).
//   - Atrasada     : existe registro Aprovado, mas o prazo estimado já passou.
// --------------------------------------------------------------------------
function calcularStatusExecucaoAcao(acao) {
    const registro = obterRegistroPrincipalDaAcao(acao.id);
    if (!registro) return "Não iniciada";

    if (registro.status !== "Aprovado") return "Em andamento";

    if (!registro.quando) return "Concluída";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataPrevista = new Date(registro.quando + "T00:00:00");

    return dataPrevista < hoje ? "Atrasada" : "Concluída";
}

// --------------------------------------------------------------------------
// Popular as opções dinâmicas dos filtros (Responsável, Setor, Eixo)
// --------------------------------------------------------------------------
function popularFiltrosDashboard() {
    const filtroResponsavel = document.getElementById("filtroResponsavel");
    const filtroSetor = document.getElementById("filtroSetor");
    const filtroEixo = document.getElementById("filtroEixo");

    if (filtroResponsavel && !filtroResponsavel.dataset.populado) {
        obterResponsaveisUnicos().forEach(nome => {
            const opt = document.createElement('option');
            opt.value = nome;
            opt.textContent = nome;
            filtroResponsavel.appendChild(opt);
        });
        filtroResponsavel.dataset.populado = "true";
    }

    if (filtroSetor && !filtroSetor.dataset.populado) {
        obterSetoresUnicos().forEach(nome => {
            const opt = document.createElement('option');
            opt.value = nome;
            opt.textContent = nome;
            filtroSetor.appendChild(opt);
        });
        filtroSetor.dataset.populado = "true";
    }

    if (filtroEixo && !filtroEixo.dataset.populado) {
        const todasAcoes = window.acoesEstrategicas || [];
        const eixos = Array.from(new Set(todasAcoes.map(a => obterEixoId(a.id)))).sort();
        eixos.forEach(eixoId => {
            const opt = document.createElement('option');
            opt.value = eixoId;
            opt.textContent = obterEixoLabel(eixoId);
            filtroEixo.appendChild(opt);
        });
        filtroEixo.dataset.populado = "true";
    }
}

// --------------------------------------------------------------------------
// Leitura e aplicação dos filtros
// --------------------------------------------------------------------------
function obterFiltrosAtuais() {
    const el = id => document.getElementById(id);
    return {
        prazo: el("filtroPrazo") ? el("filtroPrazo").value : "Todos",
        responsavel: el("filtroResponsavel") ? el("filtroResponsavel").value : "Todos",
        setor: el("filtroSetor") ? el("filtroSetor").value : "Todos",
        eixo: el("filtroEixo") ? el("filtroEixo").value : "Todos",
        status: el("filtroStatus") ? el("filtroStatus").value : "Todos"
    };
}

function obterAcoesFiltradasDashboard(filtros) {
    const todasAcoes = window.acoesEstrategicas || [];
    filtros = filtros || obterFiltrosAtuais();

    return todasAcoes.filter(a => {
        const passaPrazo = filtros.prazo === "Todos" || a.prazo === filtros.prazo;
        const passaResponsavel = filtros.responsavel === "Todos" ||
            obterEntidadesResponsavel(a).includes(filtros.responsavel);
        const passaSetor = filtros.setor === "Todos" || obterSetorPrincipal(a) === filtros.setor;
        const passaEixo = filtros.eixo === "Todos" || obterEixoId(a.id) === filtros.eixo;
        const passaStatus = filtros.status === "Todos" || calcularStatusExecucaoAcao(a) === filtros.status;
        return passaPrazo && passaResponsavel && passaSetor && passaEixo && passaStatus;
    });
}

function limparFiltrosDashboard() {
    ["filtroPrazo", "filtroResponsavel", "filtroSetor", "filtroEixo", "filtroStatus"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "Todos";
    });
}

// --------------------------------------------------------------------------
// Agrupamento por matriz (usado no ranking) — mantém a mesma regra de
// conclusão já validada no painel anterior (aprovação do comitê).
// --------------------------------------------------------------------------
function calcularAndamentoPorMatriz(acoesFiltradas) {
    const idsAprovados = obterIdsAcoesAprovadas();
    const porMatriz = {};

    acoesFiltradas.forEach(a => {
        const matrizId = obterMatrizId(a.id);
        if (!porMatriz[matrizId]) {
            porMatriz[matrizId] = { matrizId, total: 0, aprovadas: 0 };
        }
        porMatriz[matrizId].total += 1;
        if (idsAprovados.has(a.id)) porMatriz[matrizId].aprovadas += 1;
    });

    const lista = Object.values(porMatriz).map(m => ({
        ...m,
        percentual: Math.round((m.aprovadas / m.total) * 1000) / 10
    }));

    lista.sort((a, b) => b.percentual - a.percentual || b.total - a.total);
    return lista;
}
