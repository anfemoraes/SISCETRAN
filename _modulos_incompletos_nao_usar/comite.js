// comite.js — funções e renderizadores do painel do comitê

export function obterAcoesVinculadasTexto(registro) {
    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        return registro.acoesEstrategicas.map(a => `${a.id} - ${a.diretriz}`).join(' | ');
    } else if (registro.acaoEstrategicaId) {
        return `${registro.acaoEstrategicaId} - ${registro.acaoEstrategicaDiretriz || ''}`;
    }
    return "-";
}

export function renderizarStatsComite(registros) {
    const grid = document.getElementById('comiteStatsGrid'); if (!grid) return;
    const pendentes = registros.filter(r => r.status === "Enviado").length;
    const aprovadas = registros.filter(r => r.status === "Aprovado").length;
    const aguardandoCorrecao = registros.filter(r => r.status === "Pendente").length;
    const total = registros.filter(r => r.status !== "Rascunho").length;

    grid.innerHTML = `
        <div class="stat-card stat-pendente">
            <span class="stat-numero">${pendentes}</span>
            <span class="stat-label">Aguardando Avaliação</span>
        </div>
        <div class="stat-card stat-aprovado">
            <span class="stat-numero">${aprovadas}</span>
            <span class="stat-label">Aprovadas</span>
        </div>
        <div class="stat-card stat-reprovado">
            <span class="stat-numero">${aguardandoCorrecao}</span>
            <span class="stat-label">Aguardando Correção</span>
        </div>
        <div class="stat-card stat-total">
            <span class="stat-numero">${total}</span>
            <span class="stat-label">Total Enviado</span>
        </div>
    `;
}

export function renderizarCardsComite(registros, filtroComiteAtual) {
    const container = document.getElementById('comiteCardsContainer'); if (!container) return;
    let dadosFiltrados;
    if (filtroComiteAtual === "Todos") {
        dadosFiltrados = registros.filter(r => r.status !== "Rascunho");
    } else {
        dadosFiltrados = registros.filter(r => r.status === filtroComiteAtual);
    }

    dadosFiltrados = [...dadosFiltrados].reverse();

    if (dadosFiltrados.length === 0) {
        container.innerHTML = `<div class="table-empty-state comite-empty-state">Nenhuma ação encontrada para este filtro.</div>`;
        return;
    }

    container.innerHTML = dadosFiltrados.map(registro => {
        const podeAvaliar = registro.status === "Enviado";
        const acoesTexto = obterAcoesVinculadasTexto(registro);
        const oqueResumo = (registro.oque || "").length > 140
            ? (registro.oque.substring(0, 140)) + "…"
            : (registro.oque || "-");

        return `
            <div class="comite-card">
                <div class="comite-card-header">
                    <span class="comite-card-id">ID ${registro.id}</span>
                    <span class="badge-${registro.status.toLowerCase()}">${registro.status}</span>
                </div>
                <div class="comite-card-acoes" title="${acoesTexto}">${acoesTexto}</div>
                <p class="comite-card-oque">${oqueResumo}</p>
                <div class="comite-card-meta">
                    <span><strong>Onde:</strong> ${registro.onde || "-"}</span>
                    <span><strong>Quando:</strong> ${registro.quando || "-"}</span>
                    <span><strong>Peso:</strong> ${registro.percentual || 0}%</span>
                    <span><strong>Impacto:</strong> ${registro.impacto || '-'}</span>
                </div>
                <div class="comite-card-footer">
                    <span class="comite-card-autor">Enviado por: ${registro.criadoPor || "-"}</span>
                    <button class="button button-detalhes" onclick="abrirDetalheAvaliacao('${registro.id}')">
                        ${podeAvaliar ? "Analisar e Avaliar" : "Ver Detalhes"}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

export default { obterAcoesVinculadasTexto, renderizarStatsComite, renderizarCardsComite };

export function initComite() {
    if (document.body.dataset.comiteInit) return;
    document.body.dataset.comiteInit = '1';
    console.info('comite.js: initComite executed.');

    const comiteFiltros = document.getElementById('comiteFiltros');
    if (comiteFiltros) {
        comiteFiltros.querySelectorAll('.filtro-btn').forEach(btn => {
            if (btn.dataset._bound) return;
            btn.dataset._bound = '1';
            btn.addEventListener('click', () => {
                comiteFiltros.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filtro = btn.dataset.filtro;
                // use global render if present
                if (typeof window.renderizarPainelComite === 'function') window.renderizarPainelComite();
            });
        });
    }
}

export function renderizarPainelComite() {
    const registros = window.registros || [];
    renderizarStatsComite(registros);
    renderizarCardsComite(registros, window.filtroComiteAtual || 'Enviado');
}

// registrar globais para compatibilidade com o legado
if (typeof window !== 'undefined') {
    window.renderizarPainelComite = renderizarPainelComite;
    window.abrirDetalheAvaliacao = abrirDetalheAvaliacao;
    window.confirmarAvaliacaoModal = confirmarAvaliacaoModal;
    window.obterAcoesVinculadasTexto = obterAcoesVinculadasTexto;
    window.renderizarStatsComite = function(regs) { return renderizarStatsComite(regs); };
    window.renderizarCardsComite = function(regs, filtro) { return renderizarCardsComite(regs, filtro); };
}

export function abrirDetalheAvaliacao(id) {
    const registro = window.findRegistroById ? window.findRegistroById(id) : (window.registros || []).find(r => r.id === id);
    if (!registro) return;

    const podeAvaliar = registro.status === "Enviado" && (window.usuarioLogado && (window.usuarioLogado.role === 'comite' || window.usuarioLogado.role === 'admin'));
    const acoesTexto = obterAcoesVinculadasTexto(registro);

    let blocoParecerOuAcoes = "";
    if (registro.status !== "Enviado") {
        blocoParecerOuAcoes = `
            <div class="detalhe-parecer">
                <strong>Parecer do Comitê:</strong>
                <p>${escaparTexto(registro.comentarioComite || "-")}</p>
                <small>Avaliado por ${escaparTexto(registro.avaliadoPor || "-")} em ${escaparTexto(registro.dataAvaliacao || "-")}</small>
            </div>
        `;
    } else if (podeAvaliar) {
        blocoParecerOuAcoes = `
            <div class="detalhe-avaliacao-form">
                <label for="modalParecerInput">Parecer / Justificativa da decisão</label>
                <textarea id="modalParecerInput" rows="3" placeholder="Descreva o parecer sobre esta ação..."></textarea>
                <div class="detalhe-avaliacao-botoes">
                    <button class="button button-reprovar-modal" onclick="confirmarAvaliacaoModal('${registro.id}', 'Reprovado')">❌ Reprovar</button>
                    <button class="button button-aprovar-modal" onclick="confirmarAvaliacaoModal('${registro.id}', 'Aprovado')">✅ Aprovar</button>
                </div>
            </div>
        `;
    } else {
        blocoParecerOuAcoes = `<p class="table-status-text">Esta ação ainda aguarda avaliação.</p>`;
    }

    const modalAvaliacao = document.getElementById('modalAvaliacao');
    const modalAvaliacaoBody = document.getElementById('modalAvaliacaoBody');
    if (!modalAvaliacao || !modalAvaliacaoBody) return;

    modalAvaliacaoBody.innerHTML = `
        <h2 style="margin-bottom: 0.25rem;">Detalhamento da Ação — ID ${escaparTexto(registro.id)}</h2>
        <span class="badge-${registro.status.toLowerCase()}">${escaparTexto(registro.status)}</span>

        <div class="detalhe-secao">
            <strong>Ações Estratégicas Vinculadas</strong>
            <p>${escaparTexto(acoesTexto)}</p>
        </div>

        <div class="detalhe-grid">
            <div class="detalhe-item detalhe-item-full">
                <strong>O quê?</strong>
                <p>${escaparTexto(registro.oque)}</p>
            </div>
            <div class="detalhe-item detalhe-item-full">
                <strong>Por quê?</strong>
                <p>${escaparTexto(registro.porque)}</p>
            </div>
            <div class="detalhe-item">
                <strong>Onde?</strong>
                <p>${escaparTexto(registro.onde)}</p>
            </div>
            <div class="detalhe-item">
                <strong>Quando?</strong>
                <p>${formatarData(registro.quando)}</p>
            </div>
            <div class="detalhe-item detalhe-item-full">
                <strong>Como?</strong>
                <p>${escaparTexto(registro.como)}</p>
            </div>
            <div class="detalhe-item">
                <strong>Quanto?</strong>
                <p>${escaparTexto(registro.quanto || "-")}</p>
            </div>
            <div class="detalhe-item">
                <strong>Porcentagem de Avanço (Peso)</strong>
                <p><strong>${registro.percentual || 0}%</strong></p>
            </div>
            <div class="detalhe-item">
                <strong>Impacto</strong>
                <p>${formatarImpacto(registro.impacto)}</p>
            </div>
            <div class="detalhe-item detalhe-item-full">
                <strong>Observações</strong>
                <p>${escaparTexto(registro.observacao || "-")}</p>
            </div>
        </div>

        <div class="detalhe-rodape">
            <span>Enviado por: <strong>${escaparTexto(registro.criadoPor || "-")}</strong></span>
            <span>Data de criação: ${escaparTexto(registro.dataCriacao || "-")}</span>
        </div>

        ${blocoParecerOuAcoes}
    `;

    modalAvaliacao.style.display = 'flex';
}

export async function confirmarAvaliacaoModal(id, novoStatus) {
    const textarea = document.getElementById('modalParecerInput');
    const parecer = textarea ? textarea.value.trim() : "";

    if (!parecer) {
        Swal.fire({ icon: 'warning', title: 'Parecer obrigatório', text: 'Por favor, digite um parecer antes de confirmar a decisão.', confirmButtonColor: '#2563eb' });
        return;
    }

    const modal = document.getElementById('modalAvaliacao');
    if (modal) modal.style.display = 'none';

    const result = await Swal.fire({ title: `Confirmar decisão`, text: `Deseja realmente marcar esta ação como "${novoStatus}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: novoStatus === 'Aprovado' ? '#2ecc71' : '#e63946', cancelButtonColor: '#6c757d', confirmButtonText: novoStatus === 'Aprovado' ? '✅ Sim, aprovar' : '❌ Sim, reprovar', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) { if (modal) modal.style.display = 'flex'; return; }

    const atualizado = window.avaliarRegistro ? window.avaliarRegistro(id, novoStatus === 'Reprovado' ? 'Reprovado' : novoStatus, parecer, (window.usuarioLogado && window.usuarioLogado.email) ) : null;
    if (atualizado) {
        Swal.fire({ icon: 'success', title: novoStatus === 'Aprovado' ? 'Ação Aprovada!' : 'Ação Reprovada!', text: novoStatus === 'Aprovado' ? 'A ação foi aprovada com sucesso.' : 'A ação foi reprovada e devolvida ao solicitante para correção.', timer: 2500, showConfirmButton: false });
    }

    if (typeof renderizarPainelComite === 'function') renderizarPainelComite();
    if (typeof atualizarTabelaRegistros === 'function' && document.getElementById('registroView') && document.getElementById('registroView').style.display === 'block') atualizarTabelaRegistros();
}
