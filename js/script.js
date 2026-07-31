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

    // Lista de usuários para testar o Front
    const usuariosMock = [
        { email: "usuario@email.com", senha: "usuario123", role: "usuario" },
        { email: "comite@email.com", senha: "comite123", role: "comite" },
        { email: "admin@email.com", senha: "admin123", role: "admin" }
    ];

    // Se já existem dados no navegador da época do backend real
    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        // Injeta os usuários mockados à força se o array de usuários estiver vazio ou quebrado
        if (!dadosSalvos.usuarios || dadosSalvos.usuarios.length === 0) {
            dadosSalvos.usuarios = usuariosMock;
            localStorage.setItem(DB_KEY, JSON.stringify(dadosSalvos));
        }
        return dadosSalvos;
    }

    // Se for o primeiro acesso limpo
    const bancoInicial = {
        usuarios: usuariosMock,
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
    const btnAdminGeral = document.getElementById("btnAdminGeral");
    if (btnAdminGeral) {
        btnAdminGeral.style.display = (usuarioLogado && usuarioLogado.role === 'admin') ? "inline-flex" : "none";
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
    if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
    renderizarTabelaAcoes();
};

if (btnVoltarHero) btnVoltarHero.onclick = () => {
    heroSection.style.display = "block";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
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
    if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
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
    if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
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
        if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
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
        if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
        limparSelecao();
    };
}

function atualizarBotaoFlutuante() {
    const checkboxes = document.querySelectorAll('.acao-checkbox:checked');
    const floatingBtn = document.getElementById('floatingDetalharBtn');
    if (checkboxes.length > 0) {
        floatingBtn.classList.add('visible');
    } else {
        floatingBtn.classList.remove('visible');
    }
}

function renderizarTabelaAcoes() {
    corpoTabelaAcoes.innerHTML = "";
    const floatingBtn = document.getElementById('floatingDetalharBtn');

    if (!window.acoesEstrategicas || window.acoesEstrategicas.length === 0) {
        corpoTabelaAcoes.innerHTML = `<tr><td colspan="7" class="table-empty-state">Nenhuma ação estratégica encontrada</td></tr>`;
        return;
    }

    window.acoesEstrategicas.forEach((acao) => {
        const linha = document.createElement("tr");
        const prazoTexto = acao.prazo || "Não informado";
        const prazoSlug = slugificar(prazoTexto);
        linha.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="acao-checkbox" value="${acao.id}">
            </td>
            <td><strong>${acao.id}</strong></td>
            <td>${escaparTexto(acao.diretriz)}</td>
            <td><span class="badge-${prazoSlug}">${escaparTexto(prazoTexto)}</span></td>
            <td>${escaparTexto(acao.meta)}</td>
            <td>${escaparTexto(acao.indicador)}</td>
            <td>${escaparTexto(acao.setor || "Não informado")}</td>
        `;
        corpoTabelaAcoes.appendChild(linha);
    });

    document.querySelectorAll('.acao-checkbox').forEach(cb => {
        cb.onchange = function() {
            atualizarBotaoFlutuante();
        };
    });

    if (floatingBtn) floatingBtn.classList.remove('visible');
}

btnDetalharSelecionada.onclick = () => {
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

    const floatingBtn = document.getElementById('floatingDetalharBtn');
    if (floatingBtn) floatingBtn.classList.remove('visible');
};

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

function atualizarTabelaRegistros() {
    corpoTabelaRegistros.innerHTML = "";

    const esComite = Boolean(usuarioLogado && (usuarioLogado.role === 'comite' || usuarioLogado.role === 'admin'));

    let dadosFiltrados = registros;

    if (modoVisualizacao === "meus_rascunhos" && usuarioLogado) {
        dadosFiltrados = registros.filter(r => r.criadoPor === usuarioLogado.email && (r.status === "Rascunho" || r.status === "Pendente"));
    } else if (modoVisualizacao === "geral") {
        dadosFiltrados = registros.filter(r => r.status !== "Rascunho");
    }

    if (dadosFiltrados.length === 0) {
        corpoTabelaRegistros.innerHTML = `<tr><td colspan="9" class="table-empty-state">Nenhum registro encontrado</td></tr>`;
        return;
    }

    dadosFiltrados.forEach((registro) => {
        const linha = document.createElement("tr");
        let botoesAcao = "";

        // CORREÇÃO AQUI: Se estiver em "Meus Rascunhos" e for o dono, mostra os botões SEMPRE.
        if (modoVisualizacao === "meus_rascunhos" && registro.criadoPor === usuarioLogado?.email && (registro.status === "Rascunho" || registro.status === "Pendente")) {
            botoesAcao = `
                <button onclick="enviarRegistroDireto('${registro.id}')" class="button-editar" style="color: #16a34a;" title="Enviar para Comitê">
                    <i class="bi bi-send-fill"></i>
                </button>
                <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            `;
        } else if (esComite) {
            // Lógica do Comitê visualizando a tabela geral
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
            // Usuário comum visualizando a tabela geral
            const rotulos = { 'Rascunho': 'Rascunho', 'Pendente': 'Correção Solicitada', 'Enviado': 'Em Análise', 'Aprovado': 'Em Análise' };
            botoesAcao = `<span class="table-status-text">${rotulos[registro.status] || 'Em Análise'}</span>`;
        }

        let colunaAcoes = "";
        if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
            colunaAcoes = registro.acoesEstrategicas.map(a => 
                `<div><strong>${a.id}</strong> ${a.diretriz}</div>`
            ).join('');
        } else if (registro.acaoEstrategicaId) {
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

function escaparTexto(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function slugificar(texto) {
    if (!texto) return "nao-informado";
    return String(texto)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
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

window.enviarRegistroDireto = async function(id) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const reg = registros[index];
    
    if (!reg.oque || !reg.porque || !reg.como || !reg.quando || !reg.onde || !reg.impacto) {
        Swal.fire({
            icon: 'warning',
            title: 'Rascunho incompleto',
            text: 'Este rascunho possui campos obrigatórios em branco. Clique em "Editar" para preenchê-los antes de enviar.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar envio',
        text: 'Deseja enviar este rascunho diretamente para avaliação do comitê?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, enviar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        registros[index].status = "Enviado";
        registros[index].comentarioComite = "-";
        registros[index].avaliadoPor = null;
        registros[index].dataAvaliacao = null;
        
        salvarBanco();
        
        Swal.fire({
            icon: 'success',
            title: 'Enviado!',
            text: 'Sua ação foi enviada para o Comitê com sucesso.',
            timer: 2000,
            showConfirmButton: false
        });
        
        atualizarTabelaRegistros();
    }
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

// ==========================================================================
// LÓGICA DO PAINEL DO ADMINISTRADOR (FRONTEND MOCK)
// ==========================================================================
const btnAdminGeral = document.getElementById("btnAdminGeral");
const adminView = document.getElementById("adminView");
const btnVoltarAcoesDoAdmin = document.getElementById("btnVoltarAcoesDoAdmin");

if (btnAdminGeral) {
    btnAdminGeral.onclick = () => {
        if (!exigirLogin() || usuarioLogado.role !== 'admin') return;
        
        document.getElementById("heroSection").style.display = "none";
        document.getElementById("acoesTableContainer").style.display = "none";
        document.getElementById("formularioContainer").style.display = "none";
        document.getElementById("registroView").style.display = "none";
        if (document.getElementById("comiteView")) document.getElementById("comiteView").style.display = "none";
        if (document.getElementById("andamentoView")) document.getElementById("andamentoView").style.display = "none";
        
        adminView.style.display = "block";
        renderizarTabelaAdminUsuarios();
    };
}

if (btnVoltarAcoesDoAdmin) {
    btnVoltarAcoesDoAdmin.onclick = () => {
        adminView.style.display = "none";
        document.getElementById("acoesTableContainer").style.display = "block";
        renderizarTabelaAcoes();
    };
}

const adminTabs = document.querySelectorAll("#adminTabs .filtro-btn");
const adminTabContents = document.querySelectorAll(".admin-tab-content");

adminTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        adminTabs.forEach(t => t.classList.remove("active"));
        adminTabContents.forEach(c => c.style.display = "none");
        
        tab.classList.add("active");
        const targetId = tab.getAttribute("data-tab");
        document.getElementById(targetId).style.display = "block";

        if (targetId === "tabAdminAcoes") {
            renderizarTabelaAdminAcoes();
        }
    });
});

function renderizarTabelaAdminUsuarios() {
    const tbody = document.getElementById("adminUsuariosBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    db.usuarios.forEach((u) => {
        const linha = document.createElement("tr");
        let badgeClasse = "badge-rascunho";
        let nomePerfil = "Usuário Comum";
        
        if(u.role === "admin") { badgeClasse = "badge-reprovado"; nomePerfil = "Administrador"; }
        if(u.role === "comite") { badgeClasse = "badge-enviado"; nomePerfil = "Conselheiro"; }
        
        linha.innerHTML = `
            <td><strong>${u.email}</strong></td>
            <td><span class="${badgeClasse}" style="font-size: 0.7rem;">${nomePerfil}</span></td>
            <td>
                <button class="button-editar" title="Editar Usuário" onclick="alert('Requer Backend')"><i class="bi bi-pencil-square"></i></button>
                <button class="button-excluir" title="Excluir Usuário" onclick="alert('Requer Backend')"><i class="bi bi-trash3-fill"></i></button>
            </td>
        `;
        tbody.appendChild(linha);
    });
}

function renderizarTabelaAdminAcoes() {
    const tbody = document.getElementById("adminAcoesBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    const acoes = window.acoesEstrategicas || [];

    if (acoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty-state">Nenhuma ação base cadastrada.</td></tr>`;
        return;
    }

    const acoesExibicao = [...acoes].reverse();

    acoesExibicao.forEach(acao => {
        const linha = document.createElement("tr");
        const prazoTexto = acao.prazo || "Não informado";
        let badgePrazo = "badge-rascunho"; 
        
        if (prazoTexto.includes("Curto")) badgePrazo = "badge-aprovado";
        if (prazoTexto.includes("Médio")) badgePrazo = "badge-enviado";
        if (prazoTexto.includes("Longo")) badgePrazo = "badge-reprovado";

        linha.innerHTML = `
            <td><strong>${acao.id}</strong></td>
            <td title="${acao.diretriz}">${acao.diretriz.length > 60 ? acao.diretriz.substring(0, 60) + "..." : acao.diretriz}</td>
            <td><span class="${badgePrazo}" style="padding: 4px 8px; font-size: 0.7rem;">${prazoTexto}</span></td>
            <td>${acao.setor || "Não informado"}</td>
            <td style="white-space: nowrap;">
                <button class="button-editar" title="Editar Ação" onclick="alert('Edição requer backend')"><i class="bi bi-pencil-square"></i></button>
                <button class="button-excluir" title="Excluir Ação" onclick="excluirAcaoBase('${acao.id}')"><i class="bi bi-trash3-fill"></i></button>
            </td>
        `;
        tbody.appendChild(linha);
    });
}

const modalAdminNovaAcao = document.getElementById("modalAdminNovaAcao");
const btnNovaAcaoAdmin = document.getElementById("btnNovaAcaoAdmin");
const closeModalAdminAcao = document.getElementById("closeModalAdminAcao");
const formAdminAcao = document.getElementById("formAdminAcao");

if (btnNovaAcaoAdmin) {
    btnNovaAcaoAdmin.onclick = () => {
        formAdminAcao.reset();
        modalAdminNovaAcao.style.display = "flex";
    };
}

if (closeModalAdminAcao) {
    closeModalAdminAcao.onclick = () => {
        modalAdminNovaAcao.style.display = "none";
    };
}

if (modalAdminNovaAcao) {
    modalAdminNovaAcao.addEventListener('click', (e) => {
        if (e.target === modalAdminNovaAcao) modalAdminNovaAcao.style.display = 'none';
    });
}

if (formAdminAcao) {
    formAdminAcao.onsubmit = (e) => {
        e.preventDefault();
        
        const novaAcao = {
            id: document.getElementById("adminAcaoId").value.trim(),
            diretriz: document.getElementById("adminAcaoDiretriz").value.trim(),
            lae: document.getElementById("adminAcaoLae").value.trim(),
            og: document.getElementById("adminAcaoOg").value.trim(),
            prazo: document.getElementById("adminAcaoPrazo").value,
            setor: document.getElementById("adminAcaoSetor").value.trim(),
            meta: "Não definida",
            indicador: "Não definido",
            restricoes: "",
            dadosIncompletos: []
        };

        window.acoesEstrategicas.push(novaAcao);
        
        modalAdminNovaAcao.style.display = "none";
        renderizarTabelaAdminAcoes();

        Swal.fire({
            icon: 'success',
            title: 'Ação Adicionada!',
            text: 'A ação foi injetada no sistema e já está disponível para testes.',
            timer: 2500,
            showConfirmButton: false
        });
    };
}

window.excluirAcaoBase = function(id) {
    Swal.fire({
        title: 'Excluir Ação?',
        text: "Esta ação será removida da lista em memória.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir'
    }).then((result) => {
        if (result.isConfirmed) {
            const index = window.acoesEstrategicas.findIndex(a => a.id === id);
            if (index > -1) {
                window.acoesEstrategicas.splice(index, 1);
                renderizarTabelaAdminAcoes();
                Swal.fire({
                    icon: 'success',
                    title: 'Excluída!',
                    text: 'Ação removida com sucesso.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    });
}