// ==========================================================================
// DASHBOARD.JS — Orquestração do Dashboard do Plano PETRANS
// Depende de: script.js (registros, escaparTexto, heroSection, etc.),
// filters.js e charts.js. Deve ser o último script carregado.
// ==========================================================================

const dashboardKpiGrid = document.getElementById("dashboardKpiGrid");
const dashboardRankingBody = document.getElementById("andamentoRankingBody");
const btnLimparFiltrosDashboard = document.getElementById("btnLimparFiltrosDashboard");

// --------------------------------------------------------------------------
// KPIs
// --------------------------------------------------------------------------
function renderizarKpisDashboard(acoesFiltradas) {
    if (!dashboardKpiGrid) return;

    const total = acoesFiltradas.length;
    let concluidas = 0, emAndamento = 0, atrasadas = 0;

    acoesFiltradas.forEach(a => {
        const status = calcularStatusExecucaoAcao(a);
        if (status === "Concluída") concluidas++;
        else if (status === "Em andamento") emAndamento++;
        else if (status === "Atrasada") atrasadas++;
    });

    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 1000) / 10;

    dashboardKpiGrid.innerHTML = `
        <div class="dashboard-kpi-card kpi-total">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi bi-clipboard-data"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${total}</span>
            <span class="dashboard-kpi-label">Total de Ações</span>
        </div>
        <div class="dashboard-kpi-card kpi-concluidas">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi bi-check-circle"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${concluidas}</span>
            <span class="dashboard-kpi-label">Concluídas</span>
        </div>
        <div class="dashboard-kpi-card kpi-andamento">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi bi-hourglass-split"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${emAndamento}</span>
            <span class="dashboard-kpi-label">Em Andamento</span>
        </div>
        <div class="dashboard-kpi-card kpi-atrasadas">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi bi-exclamation-triangle"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${atrasadas}</span>
            <span class="dashboard-kpi-label">Atrasadas</span>
        </div>
        <div class="dashboard-kpi-card kpi-percentual">
            <div class="dashboard-kpi-top">
                <span class="dashboard-kpi-icone"><i class="bi bi-graph-up-arrow"></i></span>
            </div>
            <span class="dashboard-kpi-numero">${percentual}%</span>
            <span class="dashboard-kpi-label">Percentual Concluído</span>
        </div>
    `;

    return { total, concluidas, emAndamento, atrasadas, percentual };
}

// --------------------------------------------------------------------------
// Gráficos — monta os datasets a partir das ações já filtradas e delega
// a renderização para charts.js
// --------------------------------------------------------------------------
function renderizarGraficosDashboard(acoesFiltradas) {
    // 1) Status (pizza)
    const contagens = { "Concluída": 0, "Em andamento": 0, "Atrasada": 0, "Não iniciada": 0 };
    acoesFiltradas.forEach(a => { contagens[calcularStatusExecucaoAcao(a)]++; });
    renderizarGraficoStatus(contagens);

    // 2) Evolução das aprovações ao longo do tempo (acumulado por mês)
    const idsFiltrados = new Set(acoesFiltradas.map(a => a.id));
    const aprovacoesPorMes = {};
    registros
        .filter(r => r.status === "Aprovado")
        .filter(r => (r.acoesEstrategicas || []).some(a => idsFiltrados.has(a.id)))
        .forEach(r => {
            const dataRef = r.dataAvaliacao || r.dataCriacao;
            const data = dataRef ? new Date(dataRef) : null;
            if (!data || isNaN(data.getTime())) return;
            const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            aprovacoesPorMes[chave] = (aprovacoesPorMes[chave] || 0) + 1;
        });

    const mesesOrdenados = Object.keys(aprovacoesPorMes).sort();
    const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labelsEvolucao = mesesOrdenados.map(chave => {
        const [ano, mes] = chave.split('-');
        return `${MESES_PT[parseInt(mes, 10) - 1]}/${ano.slice(2)}`;
    });
    let acumulado = 0;
    const dadosEvolucao = mesesOrdenados.map(chave => {
        acumulado += aprovacoesPorMes[chave];
        return acumulado;
    });
    renderizarGraficoEvolucao(labelsEvolucao, dadosEvolucao);

    // 3) Distribuição por Setor (top 8 + "Outros")
    const porSetor = {};
    acoesFiltradas.forEach(a => {
        const setor = obterSetorPrincipal(a);
        porSetor[setor] = (porSetor[setor] || 0) + 1;
    });
    let entradasSetor = Object.entries(porSetor).sort((a, b) => b[1] - a[1]);
    if (entradasSetor.length > 8) {
        const top = entradasSetor.slice(0, 8);
        const outros = entradasSetor.slice(8).reduce((soma, [, v]) => soma + v, 0);
        entradasSetor = [...top, ['Outros', outros]];
    }
    entradasSetor.reverse(); // barras horizontais: maior valor no topo
    renderizarGraficoSetor(entradasSetor.map(e => e[0]), entradasSetor.map(e => e[1]));

    // 4) Distribuição por Eixo Estratégico (empilhado por status)
    const porEixo = {};
    acoesFiltradas.forEach(a => {
        const eixoId = obterEixoId(a.id);
        if (!porEixo[eixoId]) porEixo[eixoId] = { "Concluída": 0, "Em andamento": 0, "Atrasada": 0, "Não iniciada": 0 };
        porEixo[eixoId][calcularStatusExecucaoAcao(a)]++;
    });
    const eixosOrdenados = Object.keys(porEixo).sort();
    renderizarGraficoEixo(eixosOrdenados.map(obterEixoLabel), eixosOrdenados.map(id => porEixo[id]));
}

// --------------------------------------------------------------------------
// Ranking de matrizes (mantém a tabela já existente, agora restilizada)
// --------------------------------------------------------------------------
function renderizarRankingDashboard(acoesFiltradas) {
    if (!dashboardRankingBody) return;
    const andamentoPorMatriz = calcularAndamentoPorMatriz(acoesFiltradas);

    if (andamentoPorMatriz.length === 0) {
        dashboardRankingBody.innerHTML = `<tr><td colspan="5" class="table-empty-state">Nenhuma ação encontrada para este filtro.</td></tr>`;
        return;
    }

    dashboardRankingBody.innerHTML = andamentoPorMatriz.map((m, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escaparTexto(m.matrizId)}</strong></td>
            <td>${m.total}</td>
            <td>${m.aprovadas}</td>
            <td>${m.percentual}%</td>
        </tr>
    `).join('');
}

// --------------------------------------------------------------------------
// Entrada pública — mantém o nome "renderizarAndamento" usado em script.js
// (ex.: ao fazer login/logout) para não precisar alterar aquele arquivo.
// --------------------------------------------------------------------------
function renderizarAndamento() {
    if (!andamentoView) return;

    popularFiltrosDashboard();
    const filtros = obterFiltrosAtuais();
    const acoesFiltradas = obterAcoesFiltradasDashboard(filtros);

    renderizarKpisDashboard(acoesFiltradas);
    renderizarGraficosDashboard(acoesFiltradas);
    renderizarRankingDashboard(acoesFiltradas);
}

// --------------------------------------------------------------------------
// Eventos — os 5 filtros atualizam KPIs, gráficos e tabela simultaneamente
// --------------------------------------------------------------------------
["filtroPrazo", "filtroResponsavel", "filtroSetor", "filtroEixo", "filtroStatus"].forEach(id => {
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
// Navegação (equivalente ao que existia antes em script.js)
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
