// ==========================================================================
// CHARTS.JS — Gráficos do Dashboard 
// ==========================================================================

const CORES_STATUS = {
    "Rascunho": "#94a3b8", "Enviado": "#f59e0b",
    "Pendente": "#fb7185", "Aprovado": "#16a34a"
};

const PALETA = ["#0056b3", "#0ea5e9", "#16a34a", "#f59e0b", "#7c3aed", "#dc3545", "#0891b2"];
const dashboardCharts = { status: null, setor: null, prazo: null, lae: null, og: null };

function destruirGrafico(chave) {
    if (dashboardCharts[chave]) {
        dashboardCharts[chave].destroy();
        dashboardCharts[chave] = null;
    }
}

function alternarEstadoVazio(canvasId, vazio) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const container = canvas.parentElement;
    let placeholder = container.querySelector('.dashboard-chart-empty');

    if (vazio) {
        canvas.style.display = 'none';
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'dashboard-chart-empty';
            placeholder.textContent = 'Nenhum dado para exibir.';
            container.appendChild(placeholder);
        }
    } else {
        canvas.style.display = 'block';
        if (placeholder) placeholder.remove();
    }
}

// 1) Gráfico de Pizza — Status da Aprovação
window.renderizarGraficoStatus = function(contagens) {
    const labels = Object.keys(CORES_STATUS).filter(k => contagens[k] > 0);
    const dados = labels.map(k => contagens[k]);
    
    destruirGrafico('status');
    alternarEstadoVazio('chartStatus', dados.length === 0);
    if (dados.length === 0) return;

    const ctx = document.getElementById('chartStatus').getContext('2d');
    dashboardCharts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{ data: dados, backgroundColor: labels.map(k => CORES_STATUS[k]), borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
};

// 2) Gráfico de Rosca — Setor Responsável
window.renderizarGraficoSetor = function(labels, dados) {
    destruirGrafico('setor');
    alternarEstadoVazio('chartSetor', labels.length === 0);
    if (labels.length === 0) return;

    const ctx = document.getElementById('chartSetor').getContext('2d');
    dashboardCharts.setor = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data: dados, backgroundColor: labels.map((_, i) => PALETA[i % PALETA.length]), borderWidth: 2 }]
        },
        options: { cutout: '60%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
};

// Função base para gráficos horizontais (Prazo, LAE, OG)
function criarGraficoHorizontal(chave, canvasId, labels, dados, cor, alturaMinima) {
    destruirGrafico(chave);
    alternarEstadoVazio(canvasId, labels.length === 0);
    if (labels.length === 0) return;

    const canvas = document.getElementById(canvasId);
    canvas.parentElement.style.height = `${Math.max(alturaMinima, labels.length * 24)}px`;

    const ctx = canvas.getContext('2d');
    dashboardCharts[chave] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Qtd. Matrizes', data: dados, backgroundColor: cor, borderRadius: 4 }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { grid: { display: false } } }
        }
    });
}

// 3, 4, 5) Chamadas dos Gráficos Horizontais
window.renderizarGraficoPrazo = function(labels, dados) {
    criarGraficoHorizontal('prazo', 'chartPrazo', labels, dados, '#0056b3', 220);
};

window.renderizarGraficoLAE = function(labels, dados) {
    criarGraficoHorizontal('lae', 'chartLAE', labels, dados, '#0ea5e9', 260);
};

window.renderizarGraficoOG = function(labels, dados) {
    criarGraficoHorizontal('og', 'chartOG', labels, dados, '#7c3aed', 260);
};