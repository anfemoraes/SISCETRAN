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
    nome: document.getElementById("f_nome"),
    oque: document.getElementById("f_oque"),
    porque: document.getElementById("f_porque"),
    como: document.getElementById("f_como"),
    quando: document.getElementById("f_quando"),
    onde: document.getElementById("f_onde"),
    quanto: document.getElementById("f_quanto"),
    impacto: document.getElementById("f_impacto"),
    observacao: document.getElementById("f_observacao"),
    percentual: document.getElementById("f_percentual")
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

    const usuariosMock = [
        { email: "usuario@email.com", senha: "usuario123", role: "usuario" },
        { email: "comite@email.com", senha: "comite123", role: "comite" },
        { email: "admin@email.com", senha: "admin123", role: "admin" }
    ];

    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        if (!dadosSalvos.usuarios || dadosSalvos.usuarios.length === 0) {
            dadosSalvos.usuarios = usuariosMock;
            localStorage.setItem(DB_KEY, JSON.stringify(dadosSalvos));
        }
        return dadosSalvos;
    }

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

// Função para atualizar apenas o visual da lista (usada na criação e edição)
function atualizarVisorAcoesVinculadas(acoes) {
    listaAcoesVinculadasEl.innerHTML = "";
    acoes.forEach(acao => {
        const item = document.createElement("div");
        item.className = "lista-acoes-item";
        item.innerHTML = `<span>✓ <strong>${acao.id}</strong> - ${acao.diretriz}</span>`;
        listaAcoesVinculadasEl.appendChild(item);
    });
}

// Preenche o formulário (zerando os campos, usado apenas ao criar ou carregar tela)
function preencherFormularioComAcoes(acoes) {
    idRegistroSendoEditado = null;
    atualizarVisorAcoesVinculadas(acoes);

    camposForm.nome.value = "";
    camposForm.oque.value = "";
    camposForm.porque.value = "";
    camposForm.como.value = "";
    camposForm.quando.value = "";
    camposForm.onde.value = "";
    camposForm.quanto.value = "";
    camposForm.impacto.value = "";
    camposForm.observacao.value = "";
    if (camposForm.percentual) camposForm.percentual.value = "";
}

// NOVA FUNÇÃO: Abre o modal para alterar as diretrizes sem perder dados do formulário
window.editarDiretrizesVinculadas = function() {
    if (!window.acoesEstrategicas || window.acoesEstrategicas.length === 0) return;

    let htmlCheckboxes = `<div style="text-align: left; max-height: 350px; overflow-y: auto; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc;">`;
    
    window.acoesEstrategicas.forEach(acao => {
        const isChecked = acoesSelecionadas.some(sel => sel.id === acao.id) ? 'checked' : '';
        htmlCheckboxes += `
            <label style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 12px; font-size: 0.9rem; cursor: pointer; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
                <input type="checkbox" class="swal-acao-checkbox" value="${acao.id}" ${isChecked} style="margin-top: 3px;">
                <span><strong>${acao.id}</strong><br><span style="color: #64748b;">${acao.diretriz}</span></span>
            </label>
        `;
    });
    htmlCheckboxes += `</div>`;

    Swal.fire({
        title: 'Alterar Diretrizes Vinculadas',
        html: htmlCheckboxes,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: 'Salvar Seleção',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb',
        preConfirm: () => {
            const checkedNodes = document.querySelectorAll('.swal-acao-checkbox:checked');
            if (checkedNodes.length === 0) {
                Swal.showValidationMessage('Você precisa manter pelo menos uma diretriz selecionada.');
                return false;
            }
            const novosSelecionados = [];
            checkedNodes.forEach(node => {
                const acaoEncontrada = window.acoesEstrategicas.find(a => a.id === node.value);
                if (acaoEncontrada) novosSelecionados.push(acaoEncontrada);
            });
            return novosSelecionados;
        }
    }).then(result => {
        if (result.isConfirmed) {
            // Atualiza a variável global e o visor sem apagar o que já está nos inputs
            acoesSelecionadas = result.value;
            atualizarVisorAcoesVinculadas(acoesSelecionadas);
        }
    });
};

function limparSelecao() {
    document.querySelectorAll('.acao-checkbox').forEach(cb => cb.checked = false);
    acoesSelecionadas = [];
    listaAcoesVinculadasEl.innerHTML = "";
}

function limparFormulario() {
    Object.values(camposForm).forEach(campo => {
        if (campo) campo.value = "";
    });
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
    return 'ID-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function validarFormulario() {
    const camposObrigatorios = ['nome', 'oque', 'porque', 'como', 'quando', 'onde', 'quanto', 'impacto', 'percentual'];
    return camposObrigatorios.every(chave => camposForm[chave] && camposForm[chave].value.trim() !== "");
}

function capturarDadosFormulario() {
    return {
        nome: camposForm.nome.value,
        oque: camposForm.oque.value,
        porque: camposForm.porque.value,
        como: camposForm.como.value,
        quando: camposForm.quando.value,
        onde: camposForm.onde.value,
        quanto: camposForm.quanto.value,
        impacto: camposForm.impacto.value,
        observacao: camposForm.observacao.value,
        percentual: parseFloat(camposForm.percentual.value) || 0
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
            text: 'Por favor, preencha todos os campos obrigatórios (incluindo a porcentagem).',
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
            const registroOriginal = registros[index];

            // Regra de Acréscimo/Versioning: Se a matriz original já foi APROVADA,
            // criamos uma nova versão vinculada para preservar o histórico do comitê!
            if (registroOriginal.status === "Aprovado") {
                const novoRegistroAcrescentado = {
                    id: gerarID(),
                    dataCriacao: new Date().toLocaleString(),
                    status: "Rascunho",
                    comentarioComite: "-",
                    criadoPor: usuarioLogado.email,
                    versaoAnteriorId: registroOriginal.id,
                    acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
                    ...dadosAcao
                };
                registros.push(novoRegistroAcrescentado);
                idRegistroSendoEditado = novoRegistroAcrescentado.id;

                Swal.fire({
                    icon: 'info',
                    title: 'Nova Versão (Acréscimo) Criada!',
                    text: `Como a matriz ${registroOriginal.id} já estava aprovada, foi gerado um novo acréscimo (ID: ${novoRegistroAcrescentado.id}) mantendo o histórico intacto.`,
                    confirmButtonColor: '#2563eb'
                });
            } else {
                registros[index] = {
                    ...registroOriginal,
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
        }
        if (registros[index]?.status !== "Aprovado") {
            idRegistroSendoEditado = null;
        }
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

btnEnviarComite.onclick = async (e) => {
    e.preventDefault(); 

    if (!exigirLogin()) return;

    if (!validarFormulario()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios (incluindo a porcentagem).',
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
            const registroOriginal = registros[index];

            if (registroOriginal.status === "Aprovado") {
                const novoRegistroAcrescentado = {
                    id: gerarID(),
                    dataCriacao: new Date().toLocaleString(),
                    status: "Enviado",
                    comentarioComite: "-",
                    avaliadoPor: null,
                    dataAvaliacao: null,
                    criadoPor: usuarioLogado.email,
                    versaoAnteriorId: registroOriginal.id,
                    acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas),
                    ...dadosAcao
                };
                registros.push(novoRegistroAcrescentado);
            } else {
                registros[index] = { 
                    ...registroOriginal, 
                    ...dadosAcao, 
                    status: "Enviado",
                    comentarioComite: "-",
                    avaliadoPor: null,
                    dataAvaliacao: null,
                    acoesEstrategicas: gerarEstruturaAcoesVinculadas(acoesSelecionadas)
                };
            }
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
        title: 'Matriz enviada!',
        text: 'O detalhamento foi enviado para análise.',
        timer: 2000,
        showConfirmButton: false
    });
    
    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
    
    tabelaRegistros.style.display = "block"; 
    
    limparFormulario();
    atualizarTabelaRegistros(); 
};

function atualizarTabelaRegistros() {
    corpoTabelaRegistros.innerHTML = "";

    const esComite = Boolean(usuarioLogado && (usuarioLogado.role === 'comite' || usuarioLogado.role === 'admin'));
    const esAdmin = Boolean(usuarioLogado && usuarioLogado.role === 'admin');

    let dadosFiltrados = registros;

    if (modoVisualizacao === "meus_rascunhos" && usuarioLogado) {
        dadosFiltrados = registros.filter(r => r.criadoPor === usuarioLogado.email && (r.status === "Rascunho" || r.status === "Pendente"));
    } else if (modoVisualizacao === "geral") {
        dadosFiltrados = registros.filter(r => r.status !== "Rascunho");
    }

    if (dadosFiltrados.length === 0) {
        corpoTabelaRegistros.innerHTML = `<tr><td colspan="10" class="table-empty-state">Nenhum registro encontrado</td></tr>`;
        return;
    }

    dadosFiltrados.forEach((registro) => {
        const linha = document.createElement("tr");
        let botoesAcao = "";

        if (esAdmin) {
            // Aprovada -> "Atualizar" (acréscimo, preserva o histórico do comitê).
            // Rascunho/Enviado/Pendente -> "Editar" (edição direta, ainda não passou pelo comitê).
            const botaoEditarOuAtualizar = registro.status === "Aprovado" ? `
                <button onclick="editarRegistro('${registro.id}')" class="button-editar" style="color: #7c3aed;" title="Atualizar (adiciona impacto/progresso preservando a versão aprovada)">
                    <i class="bi bi-arrow-repeat"></i> Atualizar
                </button>
            ` : `
                <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar (ainda não enviada ao comitê)">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
            `;

            botoesAcao = `
                ${botaoEditarOuAtualizar}
                <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir (Admin)">
                    <i class="bi bi-trash3-fill"></i>
                </button>
                <button onclick="abrirModalEditarPorcentagem('${registro.id}')" class="button-editar" style="color: #d97706; margin-left: 4px;" title="Ajustar Porcentagem">
                    <i class="bi bi-percent"></i>
                </button>
            `;
        } 
        else if (modoVisualizacao === "meus_rascunhos" && registro.criadoPor === usuarioLogado?.email && (registro.status === "Rascunho" || registro.status === "Pendente")) {
            let botaoEnviar = registro.status === "Rascunho" ? `
                <button onclick="enviarRegistroDireto('${registro.id}')" class="button-editar" style="color: #16a34a;" title="Enviar para Comitê">
                    <i class="bi bi-send-fill"></i>
                </button>
            ` : "";

            let botaoExcluir = registro.versaoAnteriorId ? "" : `
                <button onclick="excluirRegistro('${registro.id}')" class="button-excluir" title="Excluir">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            `;

            botoesAcao = `
                ${botaoEnviar}
                <button onclick="editarRegistro('${registro.id}')" class="button-editar" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                ${botaoExcluir}
            `;
        } 
        else if (esComite && registro.status === "Enviado") {
            botoesAcao = `
                <button onclick="avaliarAcao('${registro.id}', 'Aprovado')" class="button-aprovar" title="Aprovar">Aprovar</button>
                <button onclick="avaliarAcao('${registro.id}', 'Reprovado')" class="button-reprovar" title="Reprovar">Reprovar</button>
            `;
        } 
        else {
            botoesAcao = `
                <button onclick="abrirDetalheAvaliacao('${registro.id}')" class="button-editar" style="color: #3b82f6;" title="Ver Detalhes">
                    <i class="bi bi-eye-fill"></i>
                </button>
            `;
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

        let idExibicao = registro.id;
        if (registro.versaoAnteriorId) {
            idExibicao += ` <span style="font-size:0.75rem; color:#2563eb;" title="Acréscimo gerado a partir de ${registro.versaoAnteriorId}">(Acréscimo)</span>`;
        }
        const nomeExibicao = registro.nome ? escaparTexto(registro.nome) : `<span style="color:#94a3b8;">(sem nome)</span>`;

        linha.innerHTML = `
            <td><strong>${nomeExibicao}</strong></td>
            <td>${idExibicao}</td>
            <td>${colunaAcoes}</td>
            <td>${registro.oque}</td>
            <td>${registro.onde}</td>
            <td>${formatarData(registro.quando)}</td>
            <td><strong>${registro.percentual || 0}%</strong></td>
            <td>${formatarImpacto(registro.impacto)}</td>
            <td><span class="badge-${registro.status.toLowerCase()}">${registro.status}</span></td>
            <td><em>${registro.comentarioComite || "-"}</em></td>
            <td>${botoesAcao}</td>
        `;
        corpoTabelaRegistros.appendChild(linha);
    });
}

function renderizarTabelaAdminGestaoDados() {
    const tbody = document.getElementById("adminGestaoDadosBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="table-empty-state">Nenhum dado lançado no sistema.</td></tr>`;
        return;
    }

    const listaInvertida = [...registros].reverse();

    listaInvertida.forEach(reg => {
        const tr = document.createElement("tr");

        let acoesTexto = "-";
        if (reg.acoesEstrategicas && Array.isArray(reg.acoesEstrategicas)) {
            acoesTexto = reg.acoesEstrategicas.map(a => `<strong>${a.id}</strong>`).join(', ');
        }

        tr.innerHTML = `
            <td><strong>${reg.nome ? escaparTexto(reg.nome) : '<span style="color:#94a3b8;">(sem nome)</span>'}</strong></td>
            <td>${reg.id}</td>
            <td>${acoesTexto}</td>
            <td>${escaparTexto(reg.oque ? reg.oque.substring(0, 50) + "..." : "-")}</td>
            <td><strong>${reg.percentual || 0}%</strong></td>
            <td>
                <select class="form-control" style="padding: 4px; font-size: 0.85rem; border-radius: 4px;" onchange="adminAlterarStatus('${reg.id}', this.value)">
                    <option value="Rascunho" ${reg.status === 'Rascunho' ? 'selected' : ''}>Rascunho</option>
                    <option value="Enviado" ${reg.status === 'Enviado' ? 'selected' : ''}>Enviado (Comitê)</option>
                    <option value="Aprovado" ${reg.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                    <option value="Pendente" ${reg.status === 'Pendente' ? 'selected' : ''}>Pendente (Correção)</option>
                </select>
            </td>
            <td>${escaparTexto(reg.criadoPor || "-")}</td>
            <td style="white-space: nowrap; display: flex; gap: 6px; align-items: center;">
                <button class="button-editar" style="color: #3b82f6;" title="Ajustar Porcentagem" onclick="abrirModalEditarPorcentagem('${reg.id}')"><i class="bi bi-percent"></i></button>
                <button class="button-excluir" title="Excluir Definitivamente" onclick="excluirRegistroAdmin('${reg.id}')"><i class="bi bi-trash3-fill"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.adminAlterarStatus = async function(id, novoStatus) {
    const reg = registros.find(r => r.id === id);
    if (!reg) return;

    reg.status = novoStatus;
    salvarBanco();

    if (typeof atualizarDashboard === 'function') {
        atualizarDashboard();
    }

    Swal.fire({
        icon: 'success',
        title: 'Status atualizado!',
        text: `O registro ID ${id} agora está como "${novoStatus}".`,
        timer: 1500,
        showConfirmButton: false
    });

    renderizarTabelaAdminGestaoDados();
    if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
};

window.excluirRegistroAdmin = async function(id) {
    const index = registros.findIndex(r => r.id === id);
    if (index === -1) return;

    const result = await Swal.fire({
        title: 'Excluir registro?',
        text: `Deseja apagar definitivamente o registro ID ${id} do sistema e do dashboard?`,
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

        if (typeof atualizarDashboard === 'function') {
            atualizarDashboard();
        }

        Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500, showConfirmButton: false });
        renderizarTabelaAdminGestaoDados();
        if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
    }
};

window.abrirModalEditarPorcentagem = async function(idRegistro) {
    if (!usuarioLogado || usuarioLogado.role !== 'admin') {
        Swal.fire('Acesso negado', 'Apenas administradores podem ajustar percentuais.', 'error');
        return;
    }

    const registro = registros.find(r => r.id === idRegistro);
    if (!registro) return;

    const { value: novoPercentual } = await Swal.fire({
        title: 'Ajustar Porcentagem da Matriz',
        text: `${registro.nome || 'Sem nome'} (ID: ${registro.id}) - O quê: ${registro.oque}`,
        input: 'number',
        inputAttributes: { min: 0, max: 100, step: 1 },
        inputValue: registro.percentual || 0,
        showCancelButton: true,
        confirmButtonText: 'Salvar Ajuste',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb'
    });

    if (novoPercentual !== undefined) {
        const valorNumerico = parseFloat(novoPercentual);
        if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 100) {
            Swal.fire('Valor inválido', 'Digite uma porcentagem entre 0 e 100.', 'warning');
            return;
        }

        registro.percentual = valorNumerico;
        salvarBanco();

        if (typeof atualizarDashboard === 'function') {
            atualizarDashboard();
        }

        Swal.fire({
            icon: 'success',
            title: 'Porcentagem atualizada!',
            text: `O novo progresso desta matriz foi alterado para ${valorNumerico}%.`,
            timer: 2000,
            showConfirmButton: false
        });

        if (document.getElementById("tabAdminGestaoDados") && document.getElementById("tabAdminGestaoDados").style.display === "block") {
            renderizarTabelaAdminGestaoDados();
        }
        if (tabelaRegistros.style.display === "block") atualizarTabelaRegistros();
    }
};

window.avaliarAcao = async function(id, novoStatus) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const { value: parecer } = await Swal.fire({
        title: `Avaliar matriz - ${novoStatus}`,
        input: 'textarea',
        inputLabel: 'Digite seu parecer/comentário',
        inputPlaceholder: 'Seu parecer sobre esta matriz...',
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

    if (typeof atualizarDashboard === 'function') {
        atualizarDashboard();
    }

    Swal.fire({
        icon: 'success',
        title: novoStatus === 'Aprovado' ? 'Matriz Aprovada!' : 'Matriz Reprovada!',
        text: novoStatus === 'Aprovado'
            ? 'A matriz foi aprovada com sucesso.'
            : 'A matriz foi reprovada e devolvida ao solicitante para correção.',
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
        comiteCardsContainer.innerHTML = `<div class="table-empty-state comite-empty-state">Nenhuma matriz encontrada para este filtro.</div>`;
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
                    <span class="comite-card-id">${registro.nome ? escaparTexto(registro.nome) : `ID ${escaparTexto(registro.id)}`}</span>
                    <span class="badge-${registro.status.toLowerCase()}">${escaparTexto(registro.status)}</span>
                </div>
                ${registro.nome ? `<div style="font-size:0.72rem; color:#94a3b8; margin-top:-0.4rem; margin-bottom:0.4rem;">ID ${escaparTexto(registro.id)}</div>` : ''}
                <div class="comite-card-acoes" title="${escaparTexto(acoesTexto)}">${escaparTexto(acoesTexto)}</div>
                <p class="comite-card-oque">${oqueResumo}</p>
                <div class="comite-card-meta">
                    <span><strong>Onde:</strong> ${escaparTexto(registro.onde || "-")}</span>
                    <span><strong>Quando:</strong> ${formatarData(registro.quando)}</span>
                    <span><strong>Progresso:</strong> ${registro.percentual || 0}%</span>
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
        // === [ AQUI ESTÁ A CORREÇÃO DE Z-INDEX COM AVISO INLINE ] ===
        blocoParecerOuAcoes = `
            <div class="detalhe-avaliacao-form">
                <label for="modalParecerInput">Parecer / Justificativa da decisão</label>
                <textarea id="modalParecerInput" rows="3" placeholder="Descreva o parecer sobre esta matriz..."></textarea>
                <span id="modalParecerErro" style="color: #e63946; font-size: 0.85rem; display: none; margin-top: 4px;">
                    ⚠️ Esse campo é obrigatório. Por favor, digite um parecer.
                </span>
                <div class="detalhe-avaliacao-botoes" style="margin-top: 10px;">
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
        blocoParecerOuAcoes = `<p class="table-status-text">Esta matriz ainda aguarda avaliação.</p>`;
    }

    modalAvaliacaoBody.innerHTML = `
        <h2 style="margin-bottom: 0.25rem;">${registro.nome ? escaparTexto(registro.nome) : 'Detalhamento da Matriz'} <span style="font-size:0.8rem; color:#94a3b8; font-weight:normal;">— ID ${escaparTexto(registro.id)}</span></h2>
        <span class="badge-${registro.status.toLowerCase()}">${escaparTexto(registro.status)}</span>

        <div class="detalhe-secao">
            <strong>Diretrizes Estratégicas Vinculadas</strong>
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
                <strong>Progresso (%)</strong>
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
};

// === [ AQUI ESTÁ A CORREÇÃO DE VALIDAÇÃO INLINE ] ===
window.confirmarAvaliacaoModal = async function(id, novoStatus) {
    const textarea = document.getElementById('modalParecerInput');
    const erroSpan = document.getElementById('modalParecerErro');
    const parecer = textarea ? textarea.value.trim() : "";

    if (!parecer) {
        if (erroSpan) erroSpan.style.display = 'block';
        if (textarea) textarea.style.borderColor = '#e63946';
        return;
    }

    // Se o usuário preencheu corretamente, oculta a mensagem de erro
    if (erroSpan) erroSpan.style.display = 'none';
    if (textarea) textarea.style.borderColor = '';

    const modal = document.getElementById('modalAvaliacao');
    modal.style.display = 'none';

    const result = await Swal.fire({
        title: `Confirmar decisão`,
        text: `Deseja realmente marcar esta matriz como "${novoStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: novoStatus === 'Aprovado' ? '#2ecc71' : '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: novoStatus === 'Aprovado' ? '✅ Sim, aprovar' : '❌ Sim, reprovar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        modal.style.display = 'flex';
        return;
    }

    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const statusFinal = novoStatus === 'Reprovado' ? 'Pendente' : novoStatus;

    registros[index].status = statusFinal;
    registros[index].comentarioComite = parecer;
    registros[index].avaliadoPor = usuarioLogado ? usuarioLogado.email : "-";
    registros[index].dataAvaliacao = new Date().toLocaleString();

    salvarBanco();

    if (typeof atualizarDashboard === 'function') {
        atualizarDashboard();
    }

    Swal.fire({
        icon: 'success',
        title: novoStatus === 'Aprovado' ? 'Matriz Aprovada!' : 'Matriz Reprovada!',
        text: novoStatus === 'Aprovado'
            ? 'A matriz foi aprovada com sucesso.'
            : 'A matriz foi reprovada e devolvida ao solicitante para correção.',
        timer: 2500,
        showConfirmButton: false
    });

    renderizarPainelComite();
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

    const registro = registros[index];
    const esAdmin = Boolean(usuarioLogado && usuarioLogado.role === 'admin');

    if (registro.versaoAnteriorId && !esAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Ação não permitida',
            text: 'Este é um acréscimo de uma matriz já aprovada. Apenas o Admin pode excluir acréscimos, para preservar o histórico do comitê.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (registro.status !== "Rascunho" && registro.status !== "Pendente" && !esAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Ação não permitida',
            text: 'Esta matriz já foi enviada e não pode ser excluída.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: `Deseja realmente excluir o registro ID: ${id} do dashboard?`,
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

        if (typeof atualizarDashboard === 'function') {
            atualizarDashboard();
        }

        Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'O registro foi removido com sucesso.',
            timer: 2000,
            showConfirmButton: false
        });
        atualizarTabelaRegistros();
    }
};

window.editarRegistro = function(id) {
    const registro = registros.find(reg => reg.id === id);
    if (!registro) return;

    const esAdmin = Boolean(usuarioLogado && usuarioLogado.role === 'admin');

    if (registro.status === "Aprovado") {
        Swal.fire({
            icon: 'info',
            title: 'Atualizando matriz aprovada',
            text: 'Esta matriz já foi aprovada pelo comitê, então o histórico dela é protegido. Ao salvar, será criado um novo acréscimo vinculado (com seus dados adicionais, ex.: impacto e progresso), que passa pelo comitê separadamente sem alterar a versão já aprovada.',
            confirmButtonColor: '#2563eb'
        });
    } else if (registro.status !== "Rascunho" && registro.status !== "Pendente" && !esAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Ação não permitida',
            text: 'Apenas rascunhos ou matrizes pendentes de correção podem ser editadas.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        acoesSelecionadas = registro.acoesEstrategicas.map(acaoRef => {
            return window.acoesEstrategicas.find(a => a.id === acaoRef.id) || acaoRef;
        });
    } else {
        acoesSelecionadas = [];
    }

    preencherFormularioComAcoes(acoesSelecionadas);

    camposForm.nome.value = registro.nome || "";
    camposForm.oque.value = registro.oque || "";
    camposForm.porque.value = registro.porque || "";
    camposForm.como.value = registro.como || "";
    camposForm.quando.value = registro.quando || "";
    camposForm.onde.value = registro.onde || "";
    camposForm.quanto.value = registro.quanto || "";
    camposForm.impacto.value = registro.impacto || "";
    camposForm.observacao.value = registro.observacao || "";
    if (camposForm.percentual) camposForm.percentual.value = registro.percentual || "";

    idRegistroSendoEditado = registro.id;

    heroSection.style.display = "none";
    acoesTableContainer.style.display = "none";
    formulario.style.display = "block";
    tabelaRegistros.style.display = "none";
    if (comiteView) comiteView.style.display = "none";
    if (andamentoView) andamentoView.style.display = "none";
};

window.enviarRegistroDireto = async function(id) {
    const index = registros.findIndex(reg => reg.id === id);
    if (index === -1) return;

    const reg = registros[index];
    
    if (!reg.oque || !reg.porque || !reg.como || !reg.quando || !reg.onde || !reg.impacto || reg.percentual === undefined) {
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
            text: 'Sua matriz foi enviada para o Comitê com sucesso.',
            timer: 2000,
            showConfirmButton: false
        });
        
        atualizarTabelaRegistros();
    }
};

// ==========================================================================
// 5. GERENCIAMENTO DE LOGIN / LOGOUT
// ==========================================================================
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
                
                heroSection.style.display = "block";
                acoesTableContainer.style.display = "none";
                formulario.style.display = "none";
                tabelaRegistros.style.display = "none";
                if (comiteView) comiteView.style.display = "none";
                if (andamentoView) andamentoView.style.display = "none";
                if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";

                Swal.fire({
                    icon: 'success',
                    title: 'Logout realizado!',
                    timer: 1500,
                    showConfirmButton: false
                });
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

heroSection.style.display = 'block';
acoesTableContainer.style.display = 'none';
formulario.style.display = 'none';
tabelaRegistros.style.display = 'none';
if (comiteView) comiteView.style.display = "none";
if (andamentoView) andamentoView.style.display = "none";
atualizarVisibilidadeMenu();

// ==========================================================================
// 6. LÓGICA DO PAINEL DO ADMINISTRADOR
// ==========================================================================
const btnAdminGeral = document.getElementById("btnAdminGeral");
const adminView = document.getElementById("adminView");
const btnVoltarAcoesDoAdmin = document.getElementById("btnVoltarAcoesDoAdmin");

if (btnAdminGeral) {
    btnAdminGeral.onclick = () => {
        if (!exigirLogin() || usuarioLogado.role !== 'admin') return;
        
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        if (comiteView) comiteView.style.display = "none";
        if (andamentoView) andamentoView.style.display = "none";
        
        adminView.style.display = "block";
        renderizarTabelaAdminUsuarios();
    };
}

if (btnVoltarAcoesDoAdmin) {
    btnVoltarAcoesDoAdmin.onclick = () => {
        adminView.style.display = "none";
        acoesTableContainer.style.display = "block";
        renderizarTabelaAcoes();
    };
}

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
                <button class="button-editar" title="Editar Perfil" onclick="editarUsuario('${u.email}')"><i class="bi bi-pencil-square"></i></button>
                <button class="button-excluir" title="Excluir Usuário" onclick="excluirUsuario('${u.email}')"><i class="bi bi-trash3-fill"></i></button>
            </td>
        `;
        tbody.appendChild(linha);
    });
}

window.editarUsuario = async function(email) {
    const usuario = db.usuarios.find(u => u.email === email);
    if (!usuario) return;

    const { value: novoPerfil } = await Swal.fire({
        title: `Editar Usuário`,
        html: `Alterar o perfil de acesso de <strong>${email}</strong>:`,
        input: 'select',
        inputOptions: {
            'usuario': 'Usuário Comum (Lançador)',
            'comite': 'Conselheiro (Avaliação)',
            'admin': 'Administrador (Sistema)'
        },
        inputValue: usuario.role,
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Salvar Alteração',
        cancelButtonText: 'Cancelar'
    });

    if (novoPerfil && novoPerfil !== usuario.role) {
        usuario.role = novoPerfil;
        salvarBanco();
        renderizarTabelaAdminUsuarios();
        
        if (usuarioLogado && usuarioLogado.email === email) {
            salvarSessao(usuario);
            atualizarVisibilidadeMenu();
        }

        Swal.fire({
            icon: 'success',
            title: 'Atualizado!',
            text: 'O perfil do usuário foi alterado com sucesso.',
            timer: 1500,
            showConfirmButton: false
        });
    }
};

window.excluirUsuario = async function(email) {
    if (usuarioLogado && usuarioLogado.email === email) {
        Swal.fire({
            icon: 'error',
            title: 'Ação Negada',
            text: 'Você não pode excluir a sua própria conta enquanto estiver logado.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Excluir Usuário?',
        html: `Tem certeza que deseja remover o acesso de <strong>${email}</strong> permanentemente?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        const index = db.usuarios.findIndex(u => u.email === email);
        if (index > -1) {
            db.usuarios.splice(index, 1);
            salvarBanco();
            renderizarTabelaAdminUsuarios();
            Swal.fire({
                icon: 'success',
                title: 'Excluído!',
                text: 'Usuário removido do sistema.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
};

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
};

const adminTabs = document.querySelectorAll("#adminTabs .filtro-btn");
const adminTabContents = document.querySelectorAll(".admin-tab-content");

adminTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        adminTabs.forEach(t => t.classList.remove("active"));
        adminTabContents.forEach(c => c.style.display = "none");
        
        tab.classList.add("active");
        const targetId = tab.getAttribute("data-tab");
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.style.display = "block";

        if (targetId === "tabAdminAcoes") renderizarTabelaAdminAcoes();
        if (targetId === "tabAdminUsuarios") renderizarTabelaAdminUsuarios();
        if (targetId === "tabAdminGestaoDados") renderizarTabelaAdminGestaoDados();
        if (targetId === "tabAdminErros") renderizarTabelaAdminErros();
        if (targetId === "tabAdminLogs") renderizarTabelaAdminLogs();
    });
});

function renderizarTabelaAdminErros() {
    const tbody = document.getElementById("adminErrosBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const erros = [];
    const agora = new Date().toLocaleString();

    const acoes = window.acoesEstrategicas || [];
    const idsVistos = new Set();
    const duplicadas = new Set();

    acoes.forEach(acao => {
        if (idsVistos.has(acao.id)) {
            duplicadas.add(acao.id);
        } else {
            idsVistos.add(acao.id);
        }
    });

    duplicadas.forEach(id => {
        erros.push({
            msg: `Ação Base duplicada detectada no banco de dados. ID em conflito: ${id}`,
            stack: "Fonte: acoes_data.js -> array acoesEstrategicas"
        });
    });

    if (erros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty-state" style="color: #16a34a;">Nenhum erro de integridade encontrado. O banco de dados está saudável! 🎉</td></tr>`;
        return;
    }

    erros.forEach(erro => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${agora}</td>
            <td style="color: #e63946;"><strong><i class="bi bi-exclamation-triangle-fill"></i> ${erro.msg}</strong></td>
            <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${erro.stack}</code></td>
        `;
        tbody.appendChild(tr);
    });
}

const modalNovoUsuario = document.getElementById("modalNovoUsuario");
const btnNovoUsuario = document.getElementById("btnNovoUsuario");
const closeModalNovoUsuario = document.getElementById("closeModalNovoUsuario");
const formNovoUsuario = document.getElementById("formNovoUsuario");

if (btnNovoUsuario) {
    btnNovoUsuario.onclick = () => {
        formNovoUsuario.reset();
        modalNovoUsuario.style.display = "flex";
    };
}

if (closeModalNovoUsuario) {
    closeModalNovoUsuario.onclick = () => {
        modalNovoUsuario.style.display = "none";
    };
}

if (modalNovoUsuario) {
    modalNovoUsuario.addEventListener('click', (e) => {
        if (e.target === modalNovoUsuario) modalNovoUsuario.style.display = 'none';
    });
}

if (formNovoUsuario) {
    formNovoUsuario.onsubmit = (e) => {
        e.preventDefault();

        const email = document.getElementById("novoUsuarioEmail").value.trim().toLowerCase();
        const perfil = document.getElementById("novoUsuarioPerfil").value;

        const usuarioExiste = db.usuarios.find(u => u.email === email);
        if (usuarioExiste) {
            Swal.fire({
                icon: 'error',
                title: 'Usuário já cadastrado',
                text: 'Este e-mail já possui um cadastro ativo no sistema.',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        const novoUsuario = {
            email: email,
            senha: "mudar@123",
            role: perfil
        };

        db.usuarios.push(novoUsuario);
        salvarBanco(); 

        modalNovoUsuario.style.display = "none";
        renderizarTabelaAdminUsuarios();

        Swal.fire({
            icon: 'success',
            title: 'Convite Enviado!',
            html: `O cadastro de <strong>${email}</strong> foi iniciado.<br><br>Um e-mail foi disparado para que o usuário defina sua senha.<br><br><small style="color: #64748b;">(Mock: Para testar o login dele agora, utilize a senha temporária <b>mudar@123</b>)</small>`,
            confirmButtonColor: '#16a34a'
        });
    };
}

function renderizarTabelaAdminLogs() {
    const tbody = document.getElementById("adminLogsBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const logsMock = [
        { time: new Date().toLocaleString(), user: usuarioLogado ? usuarioLogado.email : "Sistema", action: "Acesso", detalhes: "Login no painel administrativo e carregamento das métricas." },
        { time: new Date(Date.now() - 15 * 60000).toLocaleString(), user: "comite@email.com", action: "Consulta", detalhes: "Filtrou matrizes por prazo longo no Dashboard." },
        { time: new Date(Date.now() - 120 * 60000).toLocaleString(), user: "usuario@email.com", action: "Sessão", detalhes: "Token expirado. Logout automático realizado." }
    ];

    logsMock.forEach(log => {
        const tr = document.createElement("tr");
        let badgeClass = log.action === "Acesso" ? "badge-aprovado" : (log.action === "Consulta" ? "badge-enviado" : "badge-rascunho");
        
        tr.innerHTML = `
            <td>${log.time}</td>
            <td><strong>${log.user}</strong></td>
            <td><span class="${badgeClass}" style="font-size: 0.75rem;">${log.action}</span></td>
            <td>${log.detalhes}</td>
        `;
        tbody.appendChild(tr);
    });
}

if (btnAndamento) {
    btnAndamento.onclick = () => {
        if (!exigirLogin()) return;
        heroSection.style.display = "none";
        acoesTableContainer.style.display = "none";
        formulario.style.display = "none";
        tabelaRegistros.style.display = "none";
        if (comiteView) comiteView.style.display = "none";
        if (document.getElementById("adminView")) document.getElementById("adminView").style.display = "none";
        
        andamentoView.style.display = "block";
        
        if (typeof popularFiltrosDashboard === 'function') popularFiltrosDashboard();
        if (typeof atualizarDashboard === 'function') atualizarDashboard();
    };
}

if (btnVoltarAcoesDoAndamento) {
    btnVoltarAcoesDoAndamento.onclick = () => {
        andamentoView.style.display = "none";
        acoesTableContainer.style.display = "block";
        renderizarTabelaAcoes();
    };
}