// ==========================================================================
// CHARTS.JS — Gráficos institucionais do Dashboard (Chart.js)
// Gráfico 1: Pizza — Status da Aprovação
// Gráfico 2: Rosca — Setor Responsável pela AE
// Gráfico 3: Barras horizontais — Prazo para Consecução da AE
// Gráfico 4: Barras horizontais — Linha de Ação Estratégica (LAE)
// Gráfico 5: Barras horizontais — Objetivo de Governo (OG)
// ==========================================================================

const CORES_STATUS_APROVACAO = {
    "Não iniciada": "#cbd5e1",
    "Rascunho": "#94a3b8",
    "Enviado": "#f59e0b",
    "Pendente": "#fb7185",
    "Aprovado": "#16a34a"
};

const PALETA_CATEGORICA = [
    "#0056b3", "#0ea5e9", "#16a34a", "#f59e0b", "#7c3aed",
    "#dc3545", "#0891b2", "#64748b", "#c026d3", "#334155"
];

const dashboardCharts = { status: null, setor: null, prazo: null, lae: null, og: null };

function destruirGrafico(chave) {
    if (dashboardCharts[chave]) {
        dashboardCharts[chave].destroy();
        dashboardCharts[chave] = null;
    }
}

function alternarEstadoVazio(canvasId, vazio, mensagem) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const container = canvas.parentElement;
    let placeholder = container.querySelector('.dashboard-chart-empty');

    if (vazio) {
        canvas.style.display = 'none';
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'dashboard-chart-empty';
            container.appendChild(placeholder);
        }
        placeholder.textContent = mensagem || 'Nenhum dado para este filtro.';
    } else {
        canvas.style.display = 'block';
        if (placeholder) placeholder.remove();
    }
}

// Ajusta a altura do container do gráfico proporcionalmente ao número de
// categorias, para que barras horizontais com muitas categorias (LAE/OG)
// continuem legíveis em vez de ficarem espremidas.
function ajustarAlturaDinamica(canvasId, quantidadeCategorias, alturaMinima) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const alturaCalculada = Math.max(alturaMinima || 260, quantidadeCategorias * 24);
    canvas.parentElement.style.height = `${alturaCalculada}px`;
}

// --------------------------------------------------------------------------
// 1) Pizza — Status da Aprovação
// --------------------------------------------------------------------------
function renderizarGraficoStatus(contagens) {
    const labels = Object.keys(CORES_STATUS_APROVACAO).filter(k => contagens[k] > 0);
    const dados = labels.map(k => contagens[k]);
    const total = dados.reduce((a, b) => a + b, 0);

    destruirGrafico('status');
    alternarEstadoVazio('chartStatus', total === 0);
    if (total === 0) return;

    const ctx = document.getElementById('chartStatus').getContext('2d');
    dashboardCharts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: dados,
                backgroundColor: labels.map(k => CORES_STATUS_APROVACAO[k]),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: (item) => {
                            const pct = total ? Math.round((item.raw / total) * 1000) / 10 : 0;
                            return ` ${item.label}: ${item.raw} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// --------------------------------------------------------------------------
// 2) Rosca — Setor Responsável pela AE
// --------------------------------------------------------------------------
function renderizarGraficoSetor(labels, dados) {
    destruirGrafico('setor');
    alternarEstadoVazio('chartSetor', labels.length === 0);
    if (labels.length === 0) return;

    const ctx = document.getElementById('chartSetor').getContext('2d');
    dashboardCharts.setor = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: dados,
                backgroundColor: labels.map((_, i) => PALETA_CATEGORICA[i % PALETA_CATEGORICA.length]),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } }
            }
        }
    });
}

// --------------------------------------------------------------------------
// 3/4/5) Barras horizontais genéricas — Prazo / LAE / OG
// --------------------------------------------------------------------------
function renderizarGraficoBarrasHorizontais(chave, canvasId, labels, dados, cor, alturaMinima) {
    destruirGrafico(chave);
    alternarEstadoVazio(canvasId, labels.length === 0);
    if (labels.length === 0) return;

    ajustarAlturaDinamica(canvasId, labels.length, alturaMinima);

    const ctx = document.getElementById(canvasId).getContext('2d');
    dashboardCharts[chave] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ações Estratégicas',
                data: dados,
                backgroundColor: cor || '#0ea5e9',
                borderRadius: 4,
                maxBarThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

function renderizarGraficoPrazo(labels, dados) {
    renderizarGraficoBarrasHorizontais('prazo', 'chartPrazo', labels, dados, '#0056b3', 220);
}

function renderizarGraficoLAE(labels, dados) {
    renderizarGraficoBarrasHorizontais('lae', 'chartLAE', labels, dados, '#0ea5e9', 260);
}

function renderizarGraficoOG(labels, dados) {
    renderizarGraficoBarrasHorizontais('og', 'chartOG', labels, dados, '#7c3aed', 260);
}
