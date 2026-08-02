// ==========================================================================
// DASHBOARD.JS — Lógica Estratégica e Tabela de 21 Colunas
// ==========================================================================

const dashboardKpiGrid = document.getElementById("dashboardKpiGrid");
const dashboardResultadosBody = document.getElementById("dashboardResultadosBody");
let ultimasMatrizesRenderizadas = []; // Usado para a exportação

function obterRegistrosAtualizadosDashboard() {
    const dadosSalvos = JSON.parse(localStorage.getItem("siscetran_db"));
    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        return dadosSalvos.registros;
    }
    return window.registros || [];
}

// --------------------------------------------------------------------------
// KPIs do Dashboard
// --------------------------------------------------------------------------
function renderizarKpisDashboard(matrizesFiltradas) {
    if (!dashboardKpiGrid) return;

    const totalMatrizes = matrizesFiltradas.length;
    const matrizesAprovadas = matrizesFiltradas.filter(m => m.status === "Aprovado").length;
    const matrizesPendentes = matrizesFiltradas.filter(m => m.status === "Enviado" || m.status === "Pendente").length;

    const idsAcoesVinculadas = new Set();
    matrizesFiltradas.forEach(m => {
        if (Array.isArray(m.acoesEstrategicas)) {
            m.acoesEstrategicas.forEach(a => idsAcoesVinculadas.add(a.id));
        }
    });

    const acoesBase = window.acoesEstrategicas || [];
    const acoesVinculadasFiltradas = acoesBase.filter(a => idsAcoesVinculadas.has(a.id));
    const objetivosGoverno = new Set(acoesVinculadasFiltradas.map(a => a.og).filter(Boolean)).size;
    const linhasEstrategicas = new Set(acoesVinculadasFiltradas.map(a => a.lae).filter(Boolean)).size;

    let somaPercentual = 0;
    matrizesFiltradas.forEach(m => somaPercentual += Number(m.percentual) || 0);
    const percentualMedioGeral = totalMatrizes > 0 ? Math.round((somaPercentual / totalMatrizes) * 10) / 10 : 0;

    const cards = [
        { valor: objetivosGoverno, label: "Objetivos de Governo", icone: "bi-flag", classe: "kpi-og" },
        { valor: linhasEstrategicas, label: "Linhas Estratégicas", icone: "bi-diagram-3", classe: "kpi-lae" },
        { valor: totalMatrizes, label: "Matrizes Elaboradas", icone: "bi-file-earmark-text", classe: "kpi-planos" },
        { valor: matrizesAprovadas, label: "Matrizes Aprovadas", icone: "bi-check-circle", classe: "kpi-aprovadas" },
        { valor: matrizesPendentes, label: "Matrizes em Análise", icone: "bi-clock-history", classe: "kpi-ae" },
        { valor: `${percentualMedioGeral}%`, label: "Avanço Médio Geral", icone: "bi-graph-up-arrow", classe: "kpi-percentual" }
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
// Preparação de Dados para o charts.js
// --------------------------------------------------------------------------
function prepararDadosGraficosDashboard(matrizesFiltradas) {
    // 1. Status da Aprovação
    const contagensStatus = { "Rascunho": 0, "Enviado": 0, "Pendente": 0, "Aprovado": 0 };
    matrizesFiltradas.forEach(m => { 
        if (contagensStatus[m.status] !== undefined) contagensStatus[m.status]++; 
    });
    if (window.renderizarGraficoStatus) window.renderizarGraficoStatus(contagensStatus);

    // 2. Setor Responsável, LAE, OG e Prazo
    const porSetor = {}; const porLAE = {}; const porOG = {}; const porPrazo = {};
    const acoesBase = window.acoesEstrategicas || [];

    matrizesFiltradas.forEach(m => {
        const prazo = m.quando ? `Prazo: ${m.quando.substring(0, 4)}` : "Não informado";
        porPrazo[prazo] = (porPrazo[prazo] || 0) + 1;

        if (Array.isArray(m.acoesEstrategicas)) {
            m.acoesEstrategicas.forEach(aRef => {
                const acaoBase = acoesBase.find(a => a.id === aRef.id);
                if (acaoBase) {
                    const setor = acaoBase.setor || "Não informado";
                    porSetor[setor] = (porSetor[setor] || 0) + 1;
                    if (acaoBase.lae) porLAE[acaoBase.lae] = (porLAE[acaoBase.lae] || 0) + 1;
                    if (acaoBase.og) porOG[acaoBase.og] = (porOG[acaoBase.og] || 0) + 1;
                }
            });
        }
    });

    const formatarEntradas = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
    
    const entradasSetor = formatarEntradas(porSetor);
    if (window.renderizarGraficoSetor) window.renderizarGraficoSetor(entradasSetor.map(e => e[0]), entradasSetor.map(e => e[1]));

    const ordemPrazo = Object.keys(porPrazo);
    if (window.renderizarGraficoPrazo) window.renderizarGraficoPrazo(ordemPrazo, ordemPrazo.map(p => porPrazo[p]));

    const entradasLAE = formatarEntradas(porLAE);
    if (window.renderizarGraficoLAE) window.renderizarGraficoLAE(entradasLAE.map(e => e[0]), entradasLAE.map(e => e[1]));

    const entradasOG = formatarEntradas(porOG);
    if (window.renderizarGraficoOG) window.renderizarGraficoOG(entradasOG.map(e => e[0]), entradasOG.map(e => e[1]));
}

// --------------------------------------------------------------------------
// Tabela Completa (21 Colunas)
// --------------------------------------------------------------------------
function renderizarTabelaResultadosDashboard(matrizesFiltradas) {
    if (!dashboardResultadosBody) return;

    const contagemEl = document.getElementById("dashboardResultadosContagem");
    if (contagemEl) contagemEl.textContent = `${matrizesFiltradas.length} matriz(es)`;

    if (matrizesFiltradas.length === 0) {
        dashboardResultadosBody.innerHTML = `<tr><td colspan="21" class="table-empty-state">Nenhuma matriz aprovada encontrada para este filtro.</td></tr>`;
        return;
    }

    const acoesBase = window.acoesEstrategicas || [];

    dashboardResultadosBody.innerHTML = matrizesFiltradas.map(m => {
        const status = m.status || "Rascunho";
        const badgeClasse = {
            "Rascunho": "badge-rascunho", "Enviado": "badge-enviado",
            "Pendente": "badge-pendente", "Aprovado": "badge-aprovado"
        }[status] || "badge-rascunho";

        let acoesVinculadasTexto = "-"; let setorResponsavel = "Não informado";
        let metaTexto = "-"; let indicadorTexto = "-";

        if (Array.isArray(m.acoesEstrategicas) && m.acoesEstrategicas.length > 0) {
            acoesVinculadasTexto = m.acoesEstrategicas.map(a => `<strong>${a.id}</strong>`).join(', ');
            const primeiraAcaoBase = acoesBase.find(a => a.id === m.acoesEstrategicas[0].id);
            if (primeiraAcaoBase) {
                setorResponsavel = primeiraAcaoBase.setor || setorResponsavel;
                metaTexto = primeiraAcaoBase.meta || metaTexto;
                indicadorTexto = primeiraAcaoBase.indicador || indicadorTexto;
            }
        }

        const escape = (str) => str ? String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;") : '-';

        return `
            <tr>
                <td><strong>${m.nome ? escape(m.nome) : '<span style="color:#94a3b8;">(sem nome)</span>'}</strong></td>
                <td>${escape(m.id)}</td>
                <td>${acoesVinculadasTexto}</td>
                <td style="min-width:220px;">${escape(m.oque)}</td>
                <td style="min-width:220px;">${escape(m.porque)}</td>
                <td style="min-width:220px;">${escape(m.como)}</td>
                <td>${m.quando ? escape(m.quando) : '-'}</td>
                <td>${escape(m.onde)}</td>
                <td>${escape(m.quanto)}</td>
                <td style="min-width:120px;">${escape(m.impacto)}</td>
                <td style="min-width:180px;">${escape(m.observacao)}</td>
                <td>${escape(setorResponsavel)}</td>
                <td>${escape(metaTexto)}</td>
                <td>${escape(indicadorTexto)}</td>
                <td style="text-align: center;"><strong>${m.percentual || 0}%</strong></td>
                <td><span class="${badgeClasse}">${escape(status)}</span></td>
                <td>${escape(m.avaliadoPor)}</td>
                <td>${escape(m.dataAvaliacao)}</td>
                <td style="min-width:180px;">${escape(m.comentarioComite)}</td>
                <td>${escape(m.criadoPor)}</td>
                <td>${escape(m.dataCriacao)}</td>
            </tr>
        `;
    }).join('');
}

// --------------------------------------------------------------------------
// Orquestrador Principal do Dashboard
// --------------------------------------------------------------------------
window.atualizarDashboard = function() {
    const view = document.getElementById("andamentoView");
    if (!view || view.style.display === "none") return;
    
    let matrizesFiltradas = obterRegistrosAtualizadosDashboard().filter(r => r.status === "Aprovado");

    // Lógica de Filtros Base (integração com o seu filters.js se existir)
    const filtros = ['filtroOG', 'filtroLAE', 'filtroStatusAprovacao'];
    filtros.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value && el.value !== "Todos") {
            if(id === 'filtroStatusAprovacao') matrizesFiltradas = matrizesFiltradas.filter(m => m.status === el.value);
            // Aqui você pode expandir a lógica para ler dentro de m.acoesEstrategicas conforme o filtro
        }
    });

    renderizarKpisDashboard(matrizesFiltradas);
    prepararDadosGraficosDashboard(matrizesFiltradas);
    renderizarTabelaResultadosDashboard(matrizesFiltradas);
    ultimasMatrizesRenderizadas = matrizesFiltradas;
};

// Listeners dos selects para atualizar
["filtroOG", "filtroLAE", "filtroAE", "filtroSetor", "filtroPrazo", "filtroStatusAprovacao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', window.atualizarDashboard);
});

const btnLimparDash = document.getElementById("btnLimparFiltrosDashboard");
if (btnLimparDash) {
    btnLimparDash.addEventListener('click', () => {
        ["filtroOG", "filtroLAE", "filtroAE", "filtroSetor", "filtroPrazo", "filtroStatusAprovacao"].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).value = "Todos";
        });
        window.atualizarDashboard();
    });
}
// ==========================================================================
// FUNÇÕES DE EXPORTAÇÃO (EXCEL E CSV)
// ==========================================================================

function obterMatrizesParaExportar() {
    if (typeof ultimasMatrizesRenderizadas !== 'undefined' && ultimasMatrizesRenderizadas.length > 0) {
        return ultimasMatrizesRenderizadas;
    }
    const dadosSalvos = JSON.parse(localStorage.getItem("siscetran_db"));
    const registrosDB = (dadosSalvos && Array.isArray(dadosSalvos.registros)) ? dadosSalvos.registros : (window.registros || []);
    return registrosDB.filter(m => m.status === "Aprovado");
}

function montarLinhasExportacao(matrizes) {
    const acoesBase = window.acoesEstrategicas || [];
    return matrizes.map(m => {
        const primeiraAcaoBase = Array.isArray(m.acoesEstrategicas) && m.acoesEstrategicas.length > 0
            ? acoesBase.find(a => a.id === m.acoesEstrategicas[0].id)
            : null;

        return {
            "Nome da Matriz": m.nome || "(sem nome)",
            "Matriz (ID)": m.id,
            "Ações Vinculadas": Array.isArray(m.acoesEstrategicas) ? m.acoesEstrategicas.map(a => a.id).join(", ") : "-",
            "O quê": m.oque || "-",
            "Por quê": m.porque || "-",
            "Como": m.como || "-",
            "Quando": m.quando || "-",
            "Onde": m.onde || "-",
            "Quanto": m.quanto || "-",
            "Impacto": m.impacto || "-",
            "Observação": m.observacao || "-",
            "Setor Responsável": primeiraAcaoBase ? (primeiraAcaoBase.setor || "Não informado") : "Não informado",
            "Meta": primeiraAcaoBase ? (primeiraAcaoBase.meta || "-") : "-",
            "Indicador de Desempenho": primeiraAcaoBase ? (primeiraAcaoBase.indicador || "-") : "-",
            "% Concluído": m.percentual || 0,
            "Status": m.status,
            "Avaliado Por": m.avaliadoPor || "-",
            "Data de Avaliação": m.dataAvaliacao || "-",
            "Comentário do Comitê": m.comentarioComite || "-",
            "Criado Por": m.criadoPor || "-",
            "Data de Criação": m.dataCriacao || "-"
        };
    });
}

window.exportarMatrizesAprovadasParaExcel = function() {
    if (typeof XLSX === 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Biblioteca indisponível',
            text: 'A biblioteca SheetJS (xlsx) não carregou. Verifique sua conexão.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const matrizes = obterMatrizesParaExportar();
    if (matrizes.length === 0) {
        Swal.fire({ icon: 'info', title: 'Nada para exportar', text: 'Não há matrizes para o filtro atual.', confirmButtonColor: '#2563eb' });
        return;
    }

    const linhas = montarLinhasExportacao(matrizes);
    const planilha = XLSX.utils.json_to_sheet(linhas);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Matrizes Aprovadas");

    const dataHoje = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(livro, `siscetran_matrizes_aprovadas_${dataHoje}.xlsx`);
};

window.exportarMatrizesAprovadasParaCSV = function() {
    const matrizes = obterMatrizesParaExportar();
    if (matrizes.length === 0) {
        Swal.fire({ icon: 'info', title: 'Nada para exportar', text: 'Não há matrizes para o filtro atual.', confirmButtonColor: '#2563eb' });
        return;
    }

    const linhas = montarLinhasExportacao(matrizes);
    const colunas = Object.keys(linhas[0]);

    const escaparCampoCSV = (valor) => {
        const texto = String(valor === undefined || valor === null ? "" : valor).replace(/"/g, '""');
        return `"${texto}"`;
    };

    const linhasCSV = [
        colunas.map(escaparCampoCSV).join(";"),
        ...linhas.map(linha => colunas.map(c => escaparCampoCSV(linha[c])).join(";"))
    ];
    const conteudoCSV = "\uFEFF" + linhasCSV.join("\r\n");

    const blob = new Blob([conteudoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataHoje = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `siscetran_matrizes_aprovadas_${dataHoje}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Vinculação automática aos botões do HTML se existirem na tela
document.addEventListener("DOMContentLoaded", () => {
    const btnExcel = document.getElementById("btnExportarAprovadas");
    const btnCSV = document.getElementById("btnExportarAprovadasCSV");

    if (btnExcel) btnExcel.onclick = window.exportarMatrizesAprovadasParaExcel;
    if (btnCSV) btnCSV.onclick = window.exportarMatrizesAprovadasParaCSV;
});