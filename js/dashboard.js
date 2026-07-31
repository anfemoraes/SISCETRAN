// ==========================================================================
// DASHBOARD.JS — Orquestração do Dashboard do Plano PETRANS, modelado
// exclusivamente sobre a planilha oficial (ver js/acoes_data.js e
// js/filters.js). Depende de script.js, filters.js e charts.js.
// ==========================================================================

const dashboardKpiGrid = document.getElementById("dashboardKpiGrid");
const dashboardResultadosBody = document.getElementById("dashboardResultadosBody");
const dashboardAvisoQualidade = document.getElementById("dashboardAvisoQualidade");
const btnLimparFiltrosDashboard = document.getElementById("btnLimparFiltrosDashboard");

// --------------------------------------------------------------------------
// Aviso de qualidade de dados (transparência sobre a planilha oficial)
// --------------------------------------------------------------------------
function renderizarAvisoQualidadeDados() {
    if (!dashboardAvisoQualidade) return;
    const avisos = window.avisosQualidadeDados || { idsDuplicados: [], acoesAusentesDaAbaOficial: [] };
    const itens = [];

    if (avisos.idsDuplicados.length) {
        itens.push(`Código de Ação Estratégica duplicado na planilha oficial: <strong>${avisos.idsDuplicados.join(', ')}</strong> (duas diretrizes diferentes sob o mesmo código).`);
    }
    if (avisos.acoesAusentesDaAbaOficial.length) {
        itens.push(`${avisos.acoesAusentesDaAbaOficial.length} ação(ões) constam na aba "Geral" da planilha mas não na aba oficial "Diretrizes", por isso não foram incluídas no Dashboard: <strong>${avisos.acoesAusentesDaAbaOficial.join(', ')}</strong>.`);
    }
    const comCamposFaltantes = (window.acoesEstrategicas || []).filter(a => a.dadosIncompletos && a.dadosIncompletos.length);
    if (comCamposFaltantes.length) {
        itens.push(`${comCamposFaltantes.length} ação(ões) têm campos em branco na planilha oficial (ex.: Prazo, Setor ou Meta não preenchidos): <strong>${comCamposFaltantes.map(a => a.id).join(', ')}</strong>.`);
    }

    if (itens.length === 0) {
        dashboardAvisoQualidade.style.display = "none";
        return;
    }
    dashboardAvisoQualidade.style.display = "flex";
    dashboardAvisoQualidade.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>
            <strong>Aviso de qualidade de dados da planilha oficial</strong>
            <ul>${itens.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
    `;
}

// --------------------------------------------------------------------------
// KPIs institucionais
// --------------------------------------------------------------------------
function renderizarKpisDashboard(acoesFiltradas) {
    if (!dashboardKpiGrid) return;

    const idsFiltrados = new Set(acoesFiltradas.map(a => a.id));
    const objetivosGoverno = new Set(acoesFiltradas.map(a => a.og).filter(Boolean)).size;
    const linhasEstrategicas = new Set(acoesFiltradas.map(a => a.lae).filter(Boolean)).size;
    const totalAcoes = acoesFiltradas.length;

    const planos5w2h = registros.filter(r =>
        (r.acoesEstrategicas || []).some(a => idsFiltrados.has(a.id))
    ).length;

    const acoesAprovadas = acoesFiltradas.filter(a => obterStatusAprovacaoDaAcao(a) === "Aprovado").length;
    const percentualExecucao = totalAcoes === 0 ? 0 : Math.round((acoesAprovadas / totalAcoes) * 1000) / 10;

    const cards = [
        { valor: objetivosGoverno, label: "Objetivos de Governo", icone: "bi-flag", classe: "kpi-og" },
        { valor: linhasEstrategicas, label: "Linhas Estratégicas", icone: "bi-diagram-3", classe: "kpi-lae" },
        { valor: totalAcoes, label: "Ações Estratégicas", icone: "bi-list-check", classe: "kpi-ae" },
        { valor: planos5w2h, label: "Planos 5W2H Elaborados", icone: "bi-file-earmark-text", classe: "kpi-planos" },
        { valor: acoesAprovadas, label: "Ações Aprovadas", icone: "bi-check-circle", classe: "kpi-aprovadas" },
        { valor: `${percentualExecucao}%`, label: "Percentual de Execução", icone: "bi-graph-up-arrow", classe: "kpi-percentual" }
    ];

    dashboardKpiGrid.innerHTML = cards.map(c => `
        <div class="dashboard-kpi-card ${c.classe}">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi ${c.icone}"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${c.valor}</span>
            <span class="dashboard-kpi-label">${c.label}</span>
        </div>
    `).join('');
}

// --------------------------------------------------------------------------
// Gráficos
// --------------------------------------------------------------------------
function renderizarGraficosDashboard(acoesFiltradas) {
    // 1) Status da Aprovação (pizza)
    const contagensStatus = { "Não iniciada": 0, "Rascunho": 0, "Enviado": 0, "Pendente": 0, "Aprovado": 0 };
    acoesFiltradas.forEach(a => { contagensStatus[obterStatusAprovacaoDaAcao(a)]++; });
    renderizarGraficoStatus(contagensStatus);

    // 2) Setor Responsável (rosca)
    const porSetor = {};
    acoesFiltradas.forEach(a => {
        obterSetoresDaAcao(a).forEach(setor => { porSetor[setor] = (porSetor[setor] || 0) + 1; });
    });
    const entradasSetor = Object.entries(porSetor).sort((a, b) => b[1] - a[1]);
    renderizarGraficoSetor(entradasSetor.map(e => e[0]), entradasSetor.map(e => e[1]));

    // 3) Prazo (barras horizontais)
    const porPrazo = {};
    acoesFiltradas.forEach(a => {
        const prazo = obterPrazoDaAcao(a);
        porPrazo[prazo] = (porPrazo[prazo] || 0) + 1;
    });
    const ordemPrazo = obterPrazosUnicos().filter(p => porPrazo[p]);
    renderizarGraficoPrazo(ordemPrazo, ordemPrazo.map(p => porPrazo[p]));

    // 4) Linha de Ação Estratégica (barras horizontais)
    const porLAE = {};
    acoesFiltradas.forEach(a => {
        if (!a.lae) return;
        porLAE[a.lae] = (porLAE[a.lae] || 0) + 1;
    });
    const entradasLAE = Object.entries(porLAE).sort((a, b) => b[1] - a[1]);
    renderizarGraficoLAE(entradasLAE.map(e => e[0]), entradasLAE.map(e => e[1]));

    // 5) Objetivo de Governo (barras horizontais) — exibido apenas se houver dados suficientes
    const porOG = {};
    acoesFiltradas.forEach(a => {
        if (!a.og) return;
        porOG[a.og] = (porOG[a.og] || 0) + 1;
    });
    const entradasOG = Object.entries(porOG).sort((a, b) => b[1] - a[1]);
    renderizarGraficoOG(entradasOG.map(e => e[0]), entradasOG.map(e => e[1]));
}

// --------------------------------------------------------------------------
// Tabela de resultados — uma linha por Ação Estratégica filtrada, com todos
// os campos oficiais da planilha (Meta e Indicador incluídos, sem ocultar).
// --------------------------------------------------------------------------
function renderizarTabelaResultadosDashboard(acoesFiltradas) {
    if (!dashboardResultadosBody) return;

    const contagemEl = document.getElementById("dashboardResultadosContagem");
    if (contagemEl) {
        contagemEl.textContent = `${acoesFiltradas.length} ação(ões)`;
    }

    if (acoesFiltradas.length === 0) {
        dashboardResultadosBody.innerHTML = `<tr><td colspan="7" class="table-empty-state">Nenhuma ação encontrada para este filtro.</td></tr>`;
        return;
    }

    dashboardResultadosBody.innerHTML = acoesFiltradas.map(a => {
        const status = obterStatusAprovacaoDaAcao(a);
        const badgeClasse = {
            "Não iniciada": "badge-rascunho",
            "Rascunho": "badge-rascunho",
            "Enviado": "badge-enviado",
            "Pendente": "badge-pendente",
            "Aprovado": "badge-aprovado"
        }[status] || "badge-rascunho";

        return `
            <tr>
                <td><strong>${escaparTexto(a.id)}</strong>${(a.dadosIncompletos && a.dadosIncompletos.length) ? ' <i class="bi bi-exclamation-triangle-fill" style="color:#d97706;" title="Dados incompletos na planilha oficial"></i>' : ''}</td>
                <td>${escaparTexto(a.lae || '-')}</td>
                <td style="min-width:220px;">${escaparTexto(a.diretriz || '-')}</td>
                <td>${escaparTexto(a.setor || 'Não informado')}</td>
                <td>${escaparTexto(a.prazo || 'Não informado')}</td>
                <td>${escaparTexto(a.meta || '-')}</td>
                <td>${escaparTexto(a.indicador || '-')}</td>
                <td><span class="${badgeClasse}">${escaparTexto(status)}</span></td>
            </tr>
        `;
    }).join('');
}

// --------------------------------------------------------------------------
// Entrada pública — mantém o nome "renderizarAndamento" usado em script.js
// (ex.: ao fazer login/logout) para não precisar alterar aquele arquivo.
// --------------------------------------------------------------------------
function renderizarAndamento() {
    if (!andamentoView) return;

    popularFiltrosDashboard();
    renderizarAvisoQualidadeDados();
    const filtros = obterFiltrosAtuais();
    const acoesFiltradas = obterAcoesFiltradasDashboard(filtros);

    renderizarKpisDashboard(acoesFiltradas);
    renderizarGraficosDashboard(acoesFiltradas);
    renderizarTabelaResultadosDashboard(acoesFiltradas);
}

// --------------------------------------------------------------------------
// Eventos — os 6 filtros oficiais atualizam KPIs, gráficos e tabela juntos
// --------------------------------------------------------------------------
["filtroOG", "filtroLAE", "filtroAE", "filtroSetor", "filtroPrazo", "filtroStatusAprovacao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onchange = renderizarAndamento;
});

if (btnLimparFiltrosDashboard) {
    btnLimparFiltrosDashboard.onclick = () => {
        limparFiltrosDashboard();
        renderizarAndamento();
    };
}

// --------------------------------------------------------------------------
// Navegação (mesmo comportamento já existente)
// --------------------------------------------------------------------------
if (btnAndamento) {
    btnAndamento.onclick = () => {
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        if (comiteView) comiteView.style.display = "none";
        andamentoView.style.display = "block";
        renderizarAndamento();
    };
}

if (btnVoltarAcoesDoAndamento) {
    btnVoltarAcoesDoAndamento.onclick = () => {
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "block";
        andamentoView.style.display = "none";
        renderizarTabelaAcoes();
    };
}
