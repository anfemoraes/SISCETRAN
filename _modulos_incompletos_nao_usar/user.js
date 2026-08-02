// user.js — funções relacionadas ao usuário / criação e navegação de ações
// Este módulo contém implementações extraídas de `script.js`.

export function preencherFormularioComAcoes(acoes) {
    const listaAcoesVinculadasEl = document.getElementById('listaAcoesVinculadas');
    const camposForm = {
        oque: document.getElementById('f_oque'),
        porque: document.getElementById('f_porque'),
        como: document.getElementById('f_como'),
        quando: document.getElementById('f_quando'),
        onde: document.getElementById('f_onde'),
        quanto: document.getElementById('f_quanto'),
        impacto: document.getElementById('f_impacto'),
        observacao: document.getElementById('f_observacao'),
        percentual: document.getElementById('f_percentual')
    };

    window.idRegistroSendoEditado = null;

    if (listaAcoesVinculadasEl) listaAcoesVinculadasEl.innerHTML = "";
    acoes.forEach(acao => {
        const item = document.createElement("div");
        item.className = "lista-acoes-item";
        item.innerHTML = `<span>✓ ${acao.id}</span> <span>${acao.diretriz}</span>`;
        if (listaAcoesVinculadasEl) listaAcoesVinculadasEl.appendChild(item);
    });

    Object.values(camposForm).forEach(c => { if (c) c.value = ""; });
}

export function limparFormulario() {
    const campos = ['f_oque','f_porque','f_como','f_quando','f_onde','f_quanto','f_impacto','f_observacao','f_percentual'];
    campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    window.idRegistroSendoEditado = null;
    document.querySelectorAll('.acao-checkbox').forEach(cb => cb.checked = false);
    const lista = document.getElementById('listaAcoesVinculadas'); if (lista) lista.innerHTML = '';
}

export function gerarEstruturaAcoesVinculadas(acoes) {
    return acoes.map(a => ({ id: a.id, diretriz: a.diretriz }));
}

export function validarFormulario() {
    const camposObrigatorios = ['f_oque','f_porque','f_como','f_quando','f_onde','f_quanto','f_impacto','f_percentual'];
    return camposObrigatorios.every(id => {
        const el = document.getElementById(id); return el && String(el.value || '').trim() !== '';
    });
}

export function capturarDadosFormulario() {
    return {
        oque: document.getElementById('f_oque')?.value || '',
        porque: document.getElementById('f_porque')?.value || '',
        como: document.getElementById('f_como')?.value || '',
        quando: document.getElementById('f_quando')?.value || '',
        onde: document.getElementById('f_onde')?.value || '',
        quanto: document.getElementById('f_quanto')?.value || '',
        impacto: document.getElementById('f_impacto')?.value || '',
        observacao: document.getElementById('f_observacao')?.value || '',
        percentual: parseFloat(document.getElementById('f_percentual')?.value) || 0
    };
}

export function gerarID() {
    return 'ID-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export default {
    preencherFormularioComAcoes,
    limparFormulario,
    gerarEstruturaAcoesVinculadas,
    validarFormulario,
    capturarDadosFormulario,
    gerarID
};

export function initUser() {
    if (document.body.dataset.userInit) return;
    document.body.dataset.userInit = '1';
    console.info('user.js: initUser executed.');

    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) btnLimpar.addEventListener('click', () => limparFormulario());

    const lista = document.getElementById('listaAcoesVinculadas');
    if (lista) { /* placeholder to ensure element exists for module use */ }
}

export function editarRegistro(id) {
    const registro = window.findRegistroById ? window.findRegistroById(id) : (window.registros || []).find(r => r.id === id);
    if (!registro) return;

    const esAdmin = Boolean(window.usuarioLogado && window.usuarioLogado.role === 'admin');

    if (registro.status !== "Rascunho" && registro.status !== "Pendente" && !esAdmin) {
        if (window.Swal) Swal.fire({ icon: 'error', title: 'Ação não permitida', text: 'Apenas administradores podem modificar registros já enviados.', confirmButtonColor: '#2563eb' });
        return;
    }

    let acoesSelecionadas = [];
    if (registro.acoesEstrategicas && Array.isArray(registro.acoesEstrategicas)) {
        acoesSelecionadas = registro.acoesEstrategicas.map(acaoRef => (window.acoesEstrategicas || []).find(a => a.id === acaoRef.id) || acaoRef);
    }

    preencherFormularioComAcoes(acoesSelecionadas);

    const camposForm = {
        oque: document.getElementById('f_oque'),
        porque: document.getElementById('f_porque'),
        como: document.getElementById('f_como'),
        quando: document.getElementById('f_quando'),
        onde: document.getElementById('f_onde'),
        quanto: document.getElementById('f_quanto'),
        impacto: document.getElementById('f_impacto'),
        observacao: document.getElementById('f_observacao'),
        percentual: document.getElementById('f_percentual')
    };

    if (camposForm.oque) camposForm.oque.value = registro.oque || "";
    if (camposForm.porque) camposForm.porque.value = registro.porque || "";
    if (camposForm.como) camposForm.como.value = registro.como || "";
    if (camposForm.quando) camposForm.quando.value = registro.quando || "";
    if (camposForm.onde) camposForm.onde.value = registro.onde || "";
    if (camposForm.quanto) camposForm.quanto.value = registro.quanto || "";
    if (camposForm.impacto) camposForm.impacto.value = registro.impacto || "";
    if (camposForm.observacao) camposForm.observacao.value = registro.observacao || "";
    if (camposForm.percentual) camposForm.percentual.value = registro.percentual || "";

    window.idRegistroSendoEditado = registro.id;

    const heroSection = document.getElementById('heroSection');
    const acoesTableContainer = document.getElementById('acoesTableContainer');
    const formulario = document.getElementById('formularioContainer');
    const tabelaRegistros = document.getElementById('registroView');
    const comiteView = document.getElementById('comiteView');
    const andamentoView = document.getElementById('andamentoView');

    if (heroSection) heroSection.style.display = 'none';
    if (acoesTableContainer) acoesTableContainer.style.display = 'none';
    if (formulario) formulario.style.display = 'block';
    if (tabelaRegistros) tabelaRegistros.style.display = 'none';
    if (comiteView) comiteView.style.display = 'none';
    if (andamentoView) andamentoView.style.display = 'none';

    if (window.Swal) Swal.fire({ icon: 'info', title: esAdmin ? 'Edição Administrativa' : 'Rascunho carregado', text: 'Modifique as informações conforme necessário.', confirmButtonColor: '#2563eb' });
}

export async function enviarRegistroDireto(id) {
    const reg = window.findRegistroById ? window.findRegistroById(id) : (window.registros || []).find(r => r.id === id);
    if (!reg) return;

    if (!reg.oque || !reg.porque || !reg.como || !reg.quando || !reg.onde || !reg.impacto || reg.percentual === undefined) {
        if (window.Swal) Swal.fire({ icon: 'warning', title: 'Rascunho incompleto', text: 'Este rascunho possui campos obrigatórios em branco. Clique em "Editar" para preenchê-los antes de enviar.', confirmButtonColor: '#2563eb' });
        return;
    }

    const result = await Swal.fire({ title: 'Confirmar envio', text: 'Deseja enviar este rascunho diretamente para avaliação do comitê?', icon: 'question', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#6c757d', confirmButtonText: 'Sim, enviar', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;

    const atualizado = window.enviarRegistroDireto ? window.enviarRegistroDireto(id) : null;
    if (atualizado && atualizado.error) {
        if (window.Swal) Swal.fire({ icon: 'warning', title: 'Rascunho incompleto', text: 'Este rascunho possui campos obrigatórios em branco. Clique em "Editar" para preenchê-los antes de enviar.', confirmButtonColor: '#2563eb' });
        return;
    }

    if (window.Swal) Swal.fire({ icon: 'success', title: 'Enviado!', text: 'Sua ação foi enviada para o Comitê com sucesso.', timer: 2000, showConfirmButton: false });
    if (typeof window.atualizarTabelaRegistros === 'function') window.atualizarTabelaRegistros();
}

// Expor para compatibilidade com handlers inline
if (typeof window !== 'undefined') {
    window.editarRegistro = editarRegistro;
    window.enviarRegistroDireto = enviarRegistroDireto;
}

// Expor utilitários do módulo para compatibilidade com o código legado
if (typeof window !== 'undefined') {
    window.preencherFormularioComAcoes = preencherFormularioComAcoes;
    window.limparFormulario = limparFormulario;
    window.gerarEstruturaAcoesVinculadas = gerarEstruturaAcoesVinculadas;
    window.validarFormulario = validarFormulario;
    window.capturarDadosFormulario = capturarDadosFormulario;
    window.gerarID = gerarID;
    window.initUserModule = initUser;
}