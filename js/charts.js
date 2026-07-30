// ==========================================================================
// CHARTS.JS — Criação e atualização dos gráficos Chart.js do Dashboard
// Depende da lib Chart.js (CDN, carregada no <head> do index.html) e das
// funções utilitárias de filters.js. Carregar depois de filters.js.
// ==========================================================================

const CORES_STATUS = {
    "Concluída": "#16a34a",
    "Em andamento": "#f59e0b",
    "Atrasada": "#dc3545",
    "Não iniciada": "#94a3b8"
};

const CORES_EIXO = ["#0056b3", "#2563eb", "#0ea5e9", "#7c3aed", "#0891b2", "#334155"];

// Guarda as instâncias ativas dos gráficos para poder destruí-las antes de redesenhar.
const dashboardCharts = {
    status: null,
    evolucao: null,
    setor: null,
    eixo: null
};

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

// --------------------------------------------------------------------------
// 1) Gráfico de Pizza — Status das Ações
// --------------------------------------------------------------------------
function renderizarGraficoStatus(contagens) {
    const labels = Object.keys(CORES_STATUS).filter(k => contagens[k] > 0);
    const dados = labels.map(k => contagens[k]);

    destruirGrafico('status');
    const total = dados.reduce((a, b) => a + b, 0);
    alternarEstadoVazio('chartStatus', total === 0);
    if (total === 0) return;

    const ctx = document.getElementById('chartStatus').getContext('2d');
    dashboardCharts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: dados,
                backgroundColor: labels.map(k => CORES_STATUS[k]),
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
// 2) Gráfico de Linha — Evolução das aprovações ao longo do tempo (acumulado)
// --------------------------------------------------------------------------
function renderizarGraficoEvolucao(labels, dadosAcumulados) {
    destruirGrafico('evolucao');
    alternarEstadoVazio('chartEvolucao', labels.length === 0, 'Ainda não há ações aprovadas neste filtro.');
    if (labels.length === 0) return;

    const ctx = document.getElementById('chartEvolucao').getContext('2d');
    const gradiente = ctx.createLinearGradient(0, 0, 0, 260);
    gradiente.addColorStop(0, 'rgba(0, 86, 179, 0.25)');
    gradiente.addColorStop(1, 'rgba(0, 86, 179, 0.02)');

    dashboardCharts.evolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Ações aprovadas (acumulado)',
                data: dadosAcumulados,
                borderColor: '#0056b3',
                backgroundColor: gradiente,
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: '#0056b3',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// --------------------------------------------------------------------------
// 3) Barras horizontais — Distribuição por Setor
// --------------------------------------------------------------------------
function renderizarGraficoSetor(labels, dados) {
    destruirGrafico('setor');
    alternarEstadoVazio('chartSetor', labels.length === 0);
    if (labels.length === 0) return;

    const ctx = document.getElementById('chartSetor').getContext('2d');
    dashboardCharts.setor = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ações',
                data: dados,
                backgroundColor: '#0ea5e9',
                borderRadius: 4,
                maxBarThickness: 22
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

// --------------------------------------------------------------------------
// 4) Barras empilhadas — Distribuição por Eixo Estratégico
// --------------------------------------------------------------------------
function renderizarGraficoEixo(labels, statusPorEixo) {
    destruirGrafico('eixo');
    alternarEstadoVazio('chartEixo', labels.length === 0);
    if (labels.length === 0) return;

    const chaves = Object.keys(CORES_STATUS);
    const datasets = chaves.map(status => ({
        label: status,
        data: labels.map((_, i) => statusPorEixo[i][status] || 0),
        backgroundColor: CORES_STATUS[status],
        borderRadius: 3,
        maxBarThickness: 46
    }));

    const ctx = document.getElementById('chartEixo').getContext('2d');
    dashboardCharts.eixo = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }
            },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}
