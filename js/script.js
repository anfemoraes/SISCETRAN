// ==========================================================================
// 1. SELEÇÃO DE ELEMENTOS DA INTERFACE
// ==========================================================================
const heroSection = document.getElementById("heroSection");
const acoesTableContainer = document.getElementById("acoesTableContainer");
const formulario = document.getElementById("formularioContainer");
const tabelaRegistros = document.getElementById("registroView");

const btnAcoes = document.getElementById("btnAcoes");
const btnConsultar = document.getElementById("btnConsultar");
const btnMeusRascunhos = document.getElementById("btnMeusRascunhos");
const btnComite = document.getElementById("btnComite");
const btnAndamento = document.getElementById("btnAndamento");

const btnDetalharSelecionada = document.getElementById("btnDetalharSelecionada");
const btnVoltarHero = document.getElementById("btnVoltarHero");

const btnSalvarRascunho = document.getElementById("btnSalvarRascunho");
const btnLimpar = document.getElementById("btnLimpar");
const btnEnviarComite = document.getElementById("btnEnviarComite");
const btnVoltarAcoes = document.getElementById("btnVoltarAcoes");
const btnVoltarAcoesDaConsulta = document.getElementById("btnVoltarAcoesDaConsulta");
const btnVoltarAcoesDoComite = document.getElementById("btnVoltarAcoesDoComite");
const btnVoltarAcoesDoAndamento = document.getElementById("btnVoltarAcoesDoAndamento");

const corpoTabelaAcoes = document.getElementById("acoesTableBody");
const corpoTabelaRegistros = document.getElementById("registroTableBody");

const camposForm = {
    oque: document.getElementById("f_oque"),
    porque: document.getElementById("f_porque"),
    como: document.getElementById("f_como"),
    quando: document.getElementById("f_quando"),
    onde: document.getElementById("f_onde"),
    quanto: document.getElementById("f_quanto"),
    impacto: document.getElementById("f_impacto"),
    observacao: document.getElementById("f_observacao")
};

const listaAcoesVinculadasEl = document.getElementById("listaAcoesVinculadas");

const comiteView = document.getElementById("comiteView");
const comiteStatsGrid = document.getElementById("comiteStatsGrid");
const comiteCardsContainer = document.getElementById("comiteCardsContainer");
const comiteFiltros = document.getElementById("comiteFiltros");
const modalAvaliacao = document.getElementById("modalAvaliacao");
const modalAvaliacaoBody = document.getElementById("modalAvaliacaoBody");
const closeModalAvaliacao = document.getElementById("closeModalAvaliacao");

const andamentoView = document.getElementById("andamentoView");
const andamentoKpiGrid = document.getElementById("andamentoKpiGrid");
const andamentoGrafico = document.getElementById("andamentoGrafico");
const andamentoRankingBody = document.getElementById("andamentoRankingBody");
const andamentoFiltroPrazo = document.getElementById("andamentoFiltroPrazo");
const andamentoFiltroResponsavel = document.getElementById("andamentoFiltroResponsavel");

// ==========================================================================
// 2. ESTADO DO SISTEMA
// ==========================================================================
const DB_KEY = "siscetran_db";
let db = carregarBanco();
let registros = db.registros || [];
let idRegistroSendoEditado = null;
let usuarioLogado = carregarSessao();
let acoesSelecionadas = []; 
let modoVisualizacao = "geral";
let filtroComiteAtual = "Enviado";

// ==========================================================================
// 3. FUNÇÕES DE BANCO DE DADOS E LOGIN
// ==========================================================================
function carregarBanco() {
    const dadosSalvos = JSON.parse(localStorage.getItem(DB_KEY));
    const registrosLegados = JSON.parse(localStorage.getItem("registros"));

    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        return dadosSalvos;
    }

    const bancoInicial = {
        usuarios: [
            { email: "usuario@email.com", senha: "usuario123", role: "usuario" },
            { email: "comite@email.com", senha: "comite123", role: "comite" },
            { email: "admin@email.com", senha: "admin123", role: "admin" }
        ],
        registros: Array.isArray(registrosLegados) ? registrosLegados : []
    };

    localStorage.setItem(DB_KEY, JSON.stringify(bancoInicial));
    return bancoInicial;
}

function salvarBanco() {
    db.registros = registros;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function carregarSessao() {
    const usuarioSalvo = localStorage.getItem("usuarioLogadoDados");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

function salvarSessao(usuario) {
    usuarioLogado = usuario;
    localStorage.setItem("usuarioLogadoDados", JSON.stringify(usuario));
    localStorage.setItem("usuarioLogado", "true");
}

function limparSessao() {
    usuarioLogado = null;
    localStorage.removeItem("usuarioLogadoDados");
    localStorage.removeItem("usuarioLogado");
}

function estaLogado() {
    return Boolean(usuarioLogado);
}

function ehComiteOuAdmin() {
    return Boolean(usuarioLogado && (usuarioLogado.role === 'comite' || usuarioLogado.role === 'admin'));
}

function atualizarVisibilidadeMenu() {
    if (btnMeusRascunhos) {
        btnMeusRascunhos.style.display = estaLogado() ? "inline-flex" : "none";
    }
    if (btnComite) {
        btnComite.style.display = ehComiteOuAdmin() ? "inline-flex" : "none";
    }
}

function exigirLogin() {
    if (!estaLogado()) {
        Swal.fire({
            icon: 'warning',
            title: 'Acesso restrito',
            text: 'Faça login para acessar esta função.',
            confirmButtonColor: '#2563eb'
        });
        return false;
    }
    return true;
}

// ==========================================================================
// 4. NAVEGAÇÃO ENTRE TELAS
// ==========================================================================
btnAcoes.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    renderizarTabelaAcoes();
};

if (btnVoltarHero) btnVoltarHero.onclick = () => {
    heroSection.style.display = "block";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    limparSelecao();
};

btnConsultar.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "block";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    modoVisualizacao = "geral";
    atualizarTabelaRegistros();
};

btnVoltarAcoesDaConsulta.onclick = () => {
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    renderizarTabelaAcoes();
};

btnMeusRascunhos.onclick = () => {
    if (!exigirLogin()) return;
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "block";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    modoVisualizacao = "meus_rascunhos";
    atualizarTabelaRegistros();
};

if (btnComite) {
    btnComite.onclick = () => {
        if (!exigirLogin()) return;
        if (!ehComiteOuAdmin()) return;
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        if (andamentoView) andamentoView.style.display = "none";
        comiteView.style.display = "block";
        renderizarPainelComite();
    };
}

if (btnVoltarAcoesDoComite) {
    btnVoltarAcoesDoComite.onclick = () => {
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "block";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        comiteView.style.display = "none";
        renderizarTabelaAcoes();
    };
}

const brandClick = document.querySelector(".header-brand");
if (brandClick) {
    brandClick.style.cursor = "pointer";
    brandClick.onclick = () => {
        heroSection.style.display = "block";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        if (comiteView) comiteView.style.display = "none";
        if (andamentoView) andamentoView.style.display = "none";
        limparSelecao();
    };
}

// ==========================================================================
// 5. CONTROLE DO BOTÃO FLUTUANTE E RENDERIZAÇÃO
// ==========================================================================
const floatingBtn = document.getElementById('floatingDetalharBtn');
const btnDetalhar = document.getElementById('btnDetalharSelecionada');

function atualizarBotaoFlutuante() {
    const checkboxes = document.querySelectorAll('.acao-checkbox:checked');
    if (checkboxes.length > 0) {
        floatingBtn.classList.add('visible');
    } else {
        floatingBtn.classList.remove('visible');
    }
}

// ==========================================================================
// 5.1 PAINEL DE ANDAMENTO (progresso por matriz, estilo painel municipal)
// ==========================================================================

// Extrai o código da "matriz" a partir do id de uma ação (ex: "AE 1.1.1.2" -> "AE 1.1.1").
function obterMatrizId(idAcao) {
    return idAcao.replace(/\.\d+$/, '');
}

// Um registro conta como aprovação de uma ação se o registro está com status "Aprovado"
// e a ação está entre as vinculadas a ele.
function obterIdsAcoesAprovadas() {
    const idsAprovados = new Set();
    registros
        .filter(r => r.status === "Aprovado")
        .forEach(r => {
            (r.acoesEstrategicas || []).forEach(a => idsAprovados.add(a.id));
        });
    return idsAprovados;
}

function obterResponsaveisUnicos() {
    const todasAcoes = window.acoesEstrategicas || [];
    const responsaveis = new Set();
    todasAcoes.forEach(a => {
        (a.responsavel || "").split(",").forEach(r => {
            const nome = r.trim();
            if (nome) responsaveis.add(nome);
        });
    });
    return Array.from(responsaveis).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function popularFiltrosAndamento() {
    if (!andamentoFiltroResponsavel || andamentoFiltroResponsavel.dataset.populado) return;
    obterResponsaveisUnicos().forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.textContent = nome;
        andamentoFiltroResponsavel.appendChild(opt);
    });
    andamentoFiltroResponsavel.dataset.populado = "true";
}

function obterAcoesFiltradasAndamento() {
    const todasAcoes = window.acoesEstrategicas || [];
    const prazo = andamentoFiltroPrazo ? andamentoFiltroPrazo.value : "Todos";
    const responsavel = andamentoFiltroResponsavel ? andamentoFiltroResponsavel.value : "Todos";

    return todasAcoes.filter(a => {
        const passaPrazo = prazo === "Todos" || a.prazo === prazo;
        const passaResponsavel = responsavel === "Todos" ||
            (a.responsavel || "").split(",").map(r => r.trim()).includes(responsavel);
        return passaPrazo && passaResponsavel;
    });
}

// Agrupa as ações (já filtradas) por matriz e calcula total/aprovadas/% de cada uma,
// ordenado da matriz mais completa para a menos completa.
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

function renderizarKpisAndamento(acoesFiltradas) {
    const idsAprovados = obterIdsAcoesAprovadas();
    const total = acoesFiltradas.length;
    const aprovadas = acoesFiltradas.filter(a => idsAprovados.has(a.id)).length;
    const percentual = total === 0 ? 0 : Math.round((aprovadas / total) * 1000) / 10;
    const matrizesEnvolvidas = new Set(acoesFiltradas.map(a => obterMatrizId(a.id))).size;

    andamentoKpiGrid.innerHTML = `
        <div class="andamento-kpi-card">
            <span class="andamento-kpi-numero">${total}</span>
            <span class="andamento-kpi-label">Ações no filtro</span>
        </div>
        <div class="andamento-kpi-card">
            <span class="andamento-kpi-numero">${aprovadas}</span>
            <span class="andamento-kpi-label">Ações aprovadas</span>
        </div>
        <div class="andamento-kpi-card">
            <span class="andamento-kpi-numero">${matrizesEnvolvidas}</span>
            <span class="andamento-kpi-label">Matrizes envolvidas</span>
        </div>
        <div class="andamento-kpi-card">
            <span class="andamento-kpi-numero">${percentual}%</span>
            <span class="andamento-kpi-label">Progresso geral</span>
        </div>
    `;
}

function renderizarGraficoAndamento(andamentoPorMatriz) {
    if (andamentoPorMatriz.length === 0) {
        andamentoGrafico.innerHTML = `<div class="andamento-empty-state">Nenhuma ação encontrada para este filtro.</div>`;
        return;
    }

    andamentoGrafico.innerHTML = andamentoPorMatriz.map(m => `
        <div class="andamento-barra-linha">
            <span>${escaparTexto(m.matrizId)}</span>
            <div class="andamento-barra-trilho">
                <div class="andamento-barra-preenchimento" style="width: ${m.percentual}%;"></div>
            </div>
            <span class="andamento-barra-percentual">${m.percentual}%</span>
        </div>
    `).join('');
}

function renderizarRankingAndamento(andamentoPorMatriz) {
    if (andamentoPorMatriz.length === 0) {
        andamentoRankingBody.innerHTML = `<tr><td colspan="5" class="table-empty-state">Nenhuma ação encontrada para este filtro.</td></tr>`;
        return;
    }

    andamentoRankingBody.innerHTML = andamentoPorMatriz.map((m, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escaparTexto(m.matrizId)}</strong></td>
            <td>${m.total}</td>
            <td>${m.aprovadas}</td>
            <td>${m.percentual}%</td>
        </tr>
    `).join('');
}

function renderizarAndamento() {
    if (!andamentoView) return;

    popularFiltrosAndamento();

    const acoesFiltradas = obterAcoesFiltradasAndamento();
    const andamentoPorMatriz = calcularAndamentoPorMatriz(acoesFiltradas);

    renderizarKpisAndamento(acoesFiltradas);
    renderizarGraficoAndamento(andamentoPorMatriz);
    renderizarRankingAndamento(andamentoPorMatriz);
}

if (andamentoFiltroPrazo) andamentoFiltroPrazo.onchange = renderizarAndamento;
if (andamentoFiltroResponsavel) andamentoFiltroResponsavel.onchange = renderizarAndamento;

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

function renderizarTabelaAcoes() {
    corpoTabelaAcoes.innerHTML = "";

    if (!window.acoesEstrategicas || window.acoesEstrategicas.length === 0) {
        corpoTabelaAcoes.innerHTML = `<tr><td colspan="7" class="table-empty-state">Nenhuma ação estratégica encontrada</td></tr>`;
        return;
    }

    window.acoesEstrategicas.forEach((acao) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="acao-checkbox" value="${acao.id}">
            </td>
            <td><strong>${acao.id}</strong></td>
            <td>${acao.diretriz}</td>
            <td><span class="badge-${acao.prazo.toLowerCase()}">${acao.prazo}</span></td>
            <td>${acao.meta}</td>
            <td>${acao.indicador}</td>
            <td>${acao.responsavel}</td>
        `;
        corpoTabelaAcoes.appendChild(linha);
    });

    document.querySelectorAll('.acao-checkbox').forEach(cb => {
        cb.onchange = function() {
            atualizarBotaoFlutuante();
        };
    });

    floatingBtn.classList.remove('visible');
}

// ==========================================================================
// 6. DETALHAR MÚLTIPLAS AÇÕES SELECIONADAS
// ==========================================================================
btnDetalhar.onclick = () => {
    if (!exigirLogin()) return;
    
    const checkboxes = document.querySelectorAll('.acao-checkbox:checked');
    if (checkboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Nenhuma ação selecionada',
            text: 'Por favor, selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    acoesSelecionadas = [];
    checkboxes.forEach(cb => {
        const acao = window.acoesEstrategicas.find(a => a.id === cb.value);
        if (acao) acoesSelecionadas.push(acao);
    });

    preencherFormularioComAcoes(acoesSelecionadas);
    
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "block";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";

    floatingBtn.classList.remove('visible');
};

// ==========================================================================
// 7. FUNÇÕES DO FORMULÁRIO (MULTI-AÇÃO)
// ==========================================================================
function preencherFormularioComAcoes(acoes) {
    idRegistroSendoEditado = null;

    listaAcoesVinculadasEl.innerHTML = "";
    acoes.forEach(acao => {
        const item = document.createElement("div");
        item.className = "lista-acoes-item";
        item.innerHTML = `<span>✓ ${acao.id}</span> <span>${acao.diretriz}</span>`;
        listaAcoesVinculadasEl.appendChild(item);
    });

    camposForm.oque.value = "";
    camposForm.porque.value = "";
    camposForm.como.value = "";
    camposForm.quando.value = "";
    camposForm.onde.value = "";
    camposForm.quanto.value = "";
    camposForm.impacto.value = "";
    camposForm.observacao.value = "";
}

function limparSelecao() {
    document.querySelectorAll('.acao-checkbox').forEach(cb => cb.checked = false);
    acoesSelecionadas = [];
    listaAcoesVinculadasEl.innerHTML = "";
}

function limparFormulario() {
    Object.values(camposForm).forEach(campo => campo.value = "");
    idRegistroSendoEditado = null;
    limparSelecao();
}

btnLimpar.onclick = limparFormulario;

btnVoltarAcoes.onclick = () => {
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    limparFormulario();
    renderizarTabelaAcoes();
};

function gerarID() {
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
}

function validarFormulario() {
    const camposObrigatorios = ['oque', 'porque', 'como', 'quando', 'onde', 'quanto', 'impacto'];
    return camposObrigatorios.every(chave => camposForm[chave].value.trim() !== "");
}

function capturarDadosFormulario() {
    return {
        oque: camposForm.oque.value,
        porque: camposForm.porque.value,
        como: camposForm.como.value,
        quando: camposForm.quando.value,
        onde: camposForm.onde.value,
        quanto: camposForm.quanto.value,
        impacto: camposForm.impacto.value,
        observacao: camposForm.observacao.value
    };
}

function gerarEstruturaAcoesVinculadas(acoes) {
    return acoes.map(a => ({
        id: a.id,
        diretriz: a.diretriz
    }));
}

// ==========================================================================
// 8. OPERAÇÕES DO FORMULÁRIO (SALVAR E ENVIAR)
// ==========================================================================
btnSalvarRascunho.onclick = async () => {
    if (!exigirLogin()) return;

    if (!validarFormulario()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (acoesSelecionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ações não selecionadas',
            text: 'Selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const dadosAcao = capturarDadosFormulario();

    if (idRegistroSendoEditado) {
        const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
        if (index !== -1) {
            registros[index] = {
                ...registros[index],
                ...dadosAcao,
                status: "Rascunho",
                dataEdicao: new Date().toLocaleString(),
                acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas) 
            };
            Swal.fire({
                icon: 'success',
                title: 'Rascunho salvo!',
                text: 'O rascunho foi atualizado com sucesso.',
                timer: 2000,
                showConfirmButton: false
            });
        }
        idRegistroSendoEditado = null;
    } else {
        const novoRegistro = {
            id: gerarID(),
            dataCriacao: new Date().toLocaleString(),
            status: "Rascunho",
            comentarioComite: "-",
            criadoPor: usuarioLogado.email,
            acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
            ...dadosAcao
        };
        registros.push(novoRegistro);
        
        Swal.fire({
            icon: 'success',
            title: 'Rascunho salvo!',
            text: `ID: ${novoRegistro.id}. Você pode continuar editando.`,
            timer: 3000,
            showConfirmButton: false
        });
        idRegistroSendoEditado = novoRegistro.id;
    }

    salvarBanco();
};

btnEnviarComite.onclick = async () => {
    if (!exigirLogin()) return;

    if (!validarFormulario()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (acoesSelecionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ações não selecionadas',
            text: 'Selecione pelo menos uma ação estratégica.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar envio',
        text: 'Deseja enviar o detalhamento para a aprovação dos conselheiros?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#e63946',
        confirmButtonText: 'Sim, enviar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const dadosAcao = capturarDadosFormulario();

    if (idRegistroSendoEditado) {
        const index = registros.findIndex(reg => reg.id === idRegistroSendoEditado);
        if (index !== -1) {
            registros[index] = { 
                ...registros[index], 
                ...dadosAcao, 
                status: "Enviado",
                comentarioComite: "-",
                avaliadoPor: null,
                dataAvaliacao: null,
                acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas)
            };
        }
        idRegistroSendoEditado = null;
    } else {
        const novoRegistro = {
            id: gerarID(),
            dataCriacao: new Date().toLocaleString(),
            status: "Enviado",
            comentarioComite: "-",
            criadoPor: usuarioLogado.email,
            acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
            ...dadosAcao
        };
        registros.push(novoRegistro);
    }

    salvarBanco();
    Swal.fire({
        icon: 'success',
        title: 'Ação enviada!',
        text: 'O detalhamento foi enviado para análise.',
        timer: 2000,
        showConfirmButton: false
    });
    
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "block";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    limparFormulario();
    renderizarTabelaAcoes();
};

// ==========================================================================
// 9. TABELA DE REGISTROS (CONSULTA VISUAL E GERENCIAMENTO)
// ==========================================================================
function atualizarTabelaRegistros() {
    corpoTabelaRegistros.innerHTML = "";

    const esComite = Boolean(usuarioLogado && (usuarioLogado.role === 'comite' || usuarioLogado.role === 'admin'));

    let dadosFiltrados = registros;

    if (modoVisualizacao === "meus_rascunhos" && usuarioLogado) {
        dadosFiltrados = registros.filter(r => r.criadoPor === usuarioLogado.email && (r.status === "Rascunho" || r.status === "Pendente"));
    } else if (modoVisualizacao === "geral") {
        // Rascunhos ainda não enviados não devem aparecer na consulta geral
        // (nem para outros usuários, nem para o comitê, que não têm nada a avaliar ali).
        dadosFiltrados = registros.filter(r => r.status !== "Rascunho");
    }

    if (dadosFiltrados.length === 0) {
        corpoTabelaRegistros.innerHTML = `<tr><td colspan="9" class="table-empty-state">Nenhum registro encontrado</td></tr>`;
        return;
    }

    dadosFiltrados.forEach((registro) => {
        const linha = document.createElement("tr");
        let botoesAcao = "";

        // Lógica de permissões:
        // 1. Comitê: vê botões de Aprovar/Reprovar apenas em registros "Enviado".
        // 2. Usuário dono do Rascunho: vê botões de Editar/Excluir APENAS no modo "meus_rascunhos".
        // 3. Consulta Geral (btnConsultar): Apenas visualização para usuários comuns.

        if (esComite) {
            if (registro.status === "Enviado") {
                botoesAcao = `
                    <button onclick="avaliarAcao('${registro.id}', 'Aprovado')" class="button-aprovar" title="Aprovar">Aprovar</button>
                    <button onclick="avaliarAcao('${registro.id}', 'Reprovado')" class="button-reprovar" title="Reprovar">Reprovar</button>
                `;
            } else if (registro.status === "Pendente") {
                botoesAcao = `<span class="table-status-text">Devolvido para correção</span>`;
            } else if (registro.status === "Rascunho") {
                botoesAcao = `<span class="table-status-text">Ainda não enviado</span>`;
            } else {
                botoesAcao = `<span class="table-status-text">Avaliado</span>`;
            }
        } else {
            // Usuário comum
           if (modoVisualizacao === "meus_rascunhos" && registro.criadoPor === usuarioLogado?.email && (registro.status === "Rascunho" || registro.status === "Pendente")) {

    botoesAcao = `
        <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar">
            <i class="bi bi-pencil-square"></i>
        </button>

        <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir">
            <i class="bi bi-trash3-fill"></i>
        </button>
    `;

} else {

    const rotulos = { 'Rascunho': 'Rascunho', 'Pendente': 'Correção Solicitada', 'Enviado': 'Em Análise', 'Aprovado': 'Em Análise' };
    botoesAcao = `<span class="table-status-text">${rotulos[registro.status] || 'Em Análise'}</span>`;

}
        }

        // Renderização das Ações Vinculadas (Compatibilidade)
        let colunaAcoes = "";
        if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
            // Novo formato
            colunaAcoes = registro.acoesEstrategicas.map(a => 
                `<div><strong>${a.id}</strong> ${a.diretriz}</div>`
            ).join('');
        } else if (registro.acaoEstrategicaId) {
            // Formato antigo
            colunaAcoes = `<div><strong>${registro.acaoEstrategicaId}</strong> ${registro.acaoEstrategicaDiretriz || ''}</div>`;
        } else {
            colunaAcoes = "-";
        }

        linha.innerHTML = `
            <td>${registro.id || `ID-${Math.random().toString(36).substr(2, 4)}`}</td>
            <td>${colunaAcoes}</td>
            <td>${registro.oque}</td>
            <td>${registro.onde}</td>
            <td>${formatarData(registro.quando)}</td>
            <td>${formatarImpacto(registro.impacto)}</td>
            <td><span class="badge-${registro.status.toLowerCase()}">${registro.status}</span></td>
            <td><em>${registro.comentarioComite || "-"}</em></td>
            <td>${botoesAcao}</td>
        `;
        corpoTabelaRegistros.appendChild(linha);
    });
}

// ==========================================================================
// 10. AÇÕES DO COMITÊ E UTILITÁRIOS
// ==========================================================================
window.avaliarAcao = async function(id, novoStatus) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const { value: parecer } = await Swal.fire({
        title: `Avaliar ação - ${novoStatus}`,
        input: 'textarea',
        inputLabel: 'Digite seu parecer/comentário',
        inputPlaceholder: 'Seu parecer sobre esta ação...',
        showCancelButton: true,
        confirmButtonColor: novoStatus === 'Aprovado' ? '#2ecc71' : '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: novoStatus === 'Aprovado' ? '✅ Aprovar' : '❌ Reprovar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value.trim() === '') {
                return 'Por favor, digite um parecer!';
            }
        }
    });

    if (parecer === null) return;

    // Ao reprovar, o registro volta para o solicitante como "Pendente" (correção necessária),
    // em vez de ficar travado permanentemente como "Reprovado".
    const statusFinal = novoStatus === 'Reprovado' ? 'Pendente' : novoStatus;

    registros[index].status = statusFinal;
    registros[index].comentarioComite = parecer.trim();
    registros[index].avaliadoPor = usuarioLogado ? usuarioLogado.email : "-";
    registros[index].dataAvaliacao = new Date().toLocaleString();

    salvarBanco();
    Swal.fire({
        icon: 'success',
        title: novoStatus === 'Aprovado' ? 'Ação Aprovada!' : 'Ação Reprovada!',
        text: novoStatus === 'Aprovado'
            ? 'A ação foi aprovada com sucesso.'
            : 'A ação foi reprovada e devolvida ao solicitante para correção.',
        timer: 2500,
        showConfirmButton: false
    });
    atualizarTabelaRegistros();
    if (typeof renderizarPainelComite === 'function' && comiteView && comiteView.style.display === 'block') {
        renderizarPainelComite();
    }
};

function formatarData(data) {
    if (!data) return "-";
    const partes = data.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

function formatarImpacto(impacto) {
    const cores = {
        'baixo': '🟢 Baixo',
        'medio': '🟡 Médio',
        'alto': '🔴 Alto'
    };
    return cores[impacto] || impacto;
}

// ==========================================================================
// 12. PAINEL DEDICADO DE AVALIAÇÃO DO COMITÊ
// ==========================================================================

// Escapa texto simples para evitar quebra de HTML/XSS ao exibir dados no painel.
function escaparTexto(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function obterAcoesVinculadasTexto(registro) {
    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        return registro.acoesEstrategicas.map(a => `${a.id} - ${a.diretriz}`).join(' | ');
    } else if (registro.acaoEstrategicaId) {
        return `${registro.acaoEstrategicaId} - ${registro.acaoEstrategicaDiretriz || ''}`;
    }
    return "-";
}

function renderizarStatsComite() {
    const pendentes = registros.filter(r => r.status === "Enviado").length;
    const aprovadas = registros.filter(r => r.status === "Aprovado").length;
    const aguardandoCorrecao = registros.filter(r => r.status === "Pendente").length;
    const total = registros.filter(r => r.status !== "Rascunho").length;

    comiteStatsGrid.innerHTML = `
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

function renderizarCardsComite() {
    let dadosFiltrados;
    if (filtroComiteAtual === "Todos") {
        dadosFiltrados = registros.filter(r => r.status !== "Rascunho");
    } else {
        dadosFiltrados = registros.filter(r => r.status === filtroComiteAtual);
    }

    // Mais recentes primeiro
    dadosFiltrados = [...dadosFiltrados].reverse();

    if (dadosFiltrados.length === 0) {
        comiteCardsContainer.innerHTML = `<div class="table-empty-state comite-empty-state">Nenhuma ação encontrada para este filtro.</div>`;
        return;
    }

    comiteCardsContainer.innerHTML = dadosFiltrados.map(registro => {
        const podeAvaliar = registro.status === "Enviado";
        const acoesTexto = obterAcoesVinculadasTexto(registro);
        const oqueResumo = (registro.oque || "").length > 140
            ? escaparTexto(registro.oque.substring(0, 140)) + "…"
            : escaparTexto(registro.oque || "-");

        return `
            <div class="comite-card">
                <div class="comite-card-header">
                    <span class="comite-card-id">ID ${escaparTexto(registro.id)}</span>
                    <span class="badge-${registro.status.toLowerCase()}">${escaparTexto(registro.status)}</span>
                </div>
                <div class="comite-card-acoes" title="${escaparTexto(acoesTexto)}">${escaparTexto(acoesTexto)}</div>
                <p class="comite-card-oque">${oqueResumo}</p>
                <div class="comite-card-meta">
                    <span><strong>Onde:</strong> ${escaparTexto(registro.onde || "-")}</span>
                    <span><strong>Quando:</strong> ${formatarData(registro.quando)}</span>
                    <span><strong>Impacto:</strong> ${formatarImpacto(registro.impacto)}</span>
                </div>
                <div class="comite-card-footer">
                    <span class="comite-card-autor">Enviado por: ${escaparTexto(registro.criadoPor || "-")}</span>
                    <button class="button button-detalhes" onclick="abrirDetalheAvaliacao('${registro.id}')">
                        ${podeAvaliar ? "Analisar e Avaliar" : "Ver Detalhes"}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarPainelComite() {
    renderizarStatsComite();
    renderizarCardsComite();
}

if (comiteFiltros) {
    comiteFiltros.querySelectorAll('.filtro-btn').forEach(btn => {
        if (btn.dataset.filtro === filtroComiteAtual) btn.classList.add('active');
        btn.onclick = () => {
            filtroComiteAtual = btn.dataset.filtro;
            comiteFiltros.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizarCardsComite();
        };
    });
}

// Abre o modal com o detalhamento completo (5W2H) de uma ação para análise do comitê.
window.abrirDetalheAvaliacao = function(id) {
    const registro = registros.find(reg => reg.id === id);
    if (!registro) return;

    const podeAvaliar = registro.status === "Enviado" && ehComiteOuAdmin();
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
                    <button class="button button-reprovar-modal" onclick="confirmarAvaliacaoModal('${registro.id}', 'Reprovado')">
                        ❌ Reprovar
                    </button>
                    <button class="button button-aprovar-modal" onclick="confirmarAvaliacaoModal('${registro.id}', 'Aprovado')">
                        ✅ Aprovar
                    </button>
                </div>
            </div>
        `;
    } else {
        blocoParecerOuAcoes = `<p class="table-status-text">Esta ação ainda aguarda avaliação.</p>`;
    }

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
};

// Confirma a decisão do comitê a partir do parecer digitado dentro do modal de detalhe.
window.confirmarAvaliacaoModal = async function(id, novoStatus) {
    const textarea = document.getElementById('modalParecerInput');
    const parecer = textarea ? textarea.value.trim() : "";

    if (!parecer) {
        Swal.fire({
            icon: 'warning',
            title: 'Parecer obrigatório',
            text: 'Por favor, digite um parecer antes de confirmar a decisão.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: `Confirmar decisão`,
        text: `Deseja realmente marcar esta ação como "${novoStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: novoStatus === 'Aprovado' ? '#2ecc71' : '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: novoStatus === 'Aprovado' ? '✅ Sim, aprovar' : '❌ Sim, reprovar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    // Ao reprovar, o registro volta para o solicitante como "Pendente" (correção necessária),
    // em vez de ficar travado permanentemente como "Reprovado".
    const statusFinal = novoStatus === 'Reprovado' ? 'Pendente' : novoStatus;

    registros[index].status = statusFinal;
    registros[index].comentarioComite = parecer;
    registros[index].avaliadoPor = usuarioLogado ? usuarioLogado.email : "-";
    registros[index].dataAvaliacao = new Date().toLocaleString();

    salvarBanco();

    modalAvaliacao.style.display = 'none';

    Swal.fire({
        icon: 'success',
        title: novoStatus === 'Aprovado' ? 'Ação Aprovada!' : 'Ação Reprovada!',
        text: novoStatus === 'Aprovado'
            ? 'A ação foi aprovada com sucesso.'
            : 'A ação foi reprovada e devolvida ao solicitante para correção.',
        timer: 2500,
        showConfirmButton: false
    });

    renderizarPainelComite();
    if (andamentoView && andamentoView.style.display === "block") renderizarAndamento();
    if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
};

if (closeModalAvaliacao) {
    closeModalAvaliacao.onclick = () => { modalAvaliacao.style.display = 'none'; };
}
if (modalAvaliacao) {
    modalAvaliacao.addEventListener('click', (e) => {
        if (e.target === modalAvaliacao) modalAvaliacao.style.display = 'none';
    });
}

window.excluirRegistro = async function(id) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    if (registros[index].status !== "Rascunho" && registros[index].status !== "Pendente") {
        Swal.fire({
            icon: 'error',
            title: 'Ação não permitida',
            text: 'Esta ação já foi enviada ao comitê e não pode mais ser excluída.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: `Deseja realmente excluir o rascunho ID: ${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        registros.splice(index, 1);
        salvarBanco();
        Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'O rascunho foi removido.',
            timer: 2000,
            showConfirmButton: false
        });
        atualizarTabelaRegistros();
    }
};

window.editarRegistro = function(id) {
    const registro = registros.find(reg => reg.id === id);
    if (!registro) return;

    if (registro.status !== "Rascunho" && registro.status !== "Pendente") {
        Swal.fire({
            icon: 'error',
            title: 'Ação não permitida',
            text: 'Esta ação já foi enviada ao comitê e não pode mais ser modificada.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        acoesSelecionadas = registro.acoesEstrategicas.map(acaoRef => {
            return window.acoesEstrategicas.find(a => a.id === acaoRef.id) || acaoRef;
        });
    } else if (registro.acaoEstrategicaId) {
        const acao = window.acoesEstrategicas.find(a => a.id === registro.acaoEstrategicaId);
        acoesSelecionadas = acao ? [acao] : [{ id: registro.acaoEstrategicaId, diretriz: registro.acaoEstrategicaDiretriz || "" }];
    } else {
        acoesSelecionadas = [];
    }

    preencherFormularioComAcoes(acoesSelecionadas);

    camposForm.oque.value = registro.oque || "";
    camposForm.porque.value = registro.porque || "";
    camposForm.como.value = registro.como || "";
    camposForm.quando.value = registro.quando || "";
    camposForm.onde.value = registro.onde || "";
    camposForm.quanto.value = registro.quanto || "";
    camposForm.impacto.value = registro.impacto || "";
    camposForm.observacao.value = registro.observacao || "";

    idRegistroSendoEditado = registro.id;

    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "block";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";

    Swal.fire({
        icon: registro.status === 'Pendente' ? 'warning' : 'info',
        title: registro.status === 'Pendente' ? 'Ação devolvida para correção' : 'Rascunho carregado',
        html: registro.status === 'Pendente'
            ? `<strong>Parecer do Comitê:</strong><br>${escaparTexto(registro.comentarioComite || '-')}<br><br>Corrija as informações e reenvie para avaliação.`
            : 'Modifique as informações.',
        confirmButtonColor: '#2563eb'
    });
};

// ==========================================================================
// 11. LOGIN (Inalterado)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    if (usuarioLogado && loginButton) {
        loginButton.textContent = 'Logout';
        loginButton.classList.add('is-logged-in');
    }

    if (loginButton && loginModal && closeLoginModal) {
        loginButton.onclick = async () => {
            if (estaLogado()) {
                const result = await Swal.fire({
                    title: 'Sair da sessão?',
                    text: 'Você tem certeza que deseja fazer logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#e63946',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sim, sair',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    limparSessao();
                    loginButton.textContent = 'Login';
                    loginButton.classList.remove('is-logged-in');
                    atualizarVisibilidadeMenu();
                    Swal.fire({
                        icon: 'success',
                        title: 'Logout realizado!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
                }
            } else {
                loginModal.style.display = 'flex';
            }
        };
        closeLoginModal.onclick = () => loginModal.style.display = 'none';
    }

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            const usuarioEncontrado = db.usuarios.find((u) => u.email === email && u.senha === password);

            if (usuarioEncontrado) {
                salvarSessao(usuarioEncontrado);
                loginModal.style.display = 'none';
                loginButton.textContent = 'Logout';
                loginButton.classList.add('is-logged-in');
                atualizarVisibilidadeMenu();

                if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();

                document.getElementById('username').value = "";
                document.getElementById('password').value = "";

                Swal.fire({
                    icon: 'success',
                    title: 'Login realizado!',
                    text: `Bem-vindo, ${usuarioEncontrado.email}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no login',
                    text: 'E-mail ou senha incorretos!',
                    confirmButtonColor: '#2563eb'
                });
            }
        };
    }

    // Inicialização
    heroSection.style.display = 'block';
    acoesTableContainer.style.display = 'none';
    formulario.style.display = 'none';
    tabelaRegistros.style.display = 'none';
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    atualizarVisibilidadeMenu();
});