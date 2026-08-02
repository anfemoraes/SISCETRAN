// admin.js — funções auxiliares para a área administrativa

export function renderizarTabelaAdminUsuarios(db) {
    const tbody = document.getElementById("adminUsuariosBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (db.usuarios || []).forEach((u) => {
        const linha = document.createElement("tr");
        let badgeClasse = "badge-rascunho";
        let nomePerfil = "Usuário Comum";
        if (u.role === "admin") { badgeClasse = "badge-reprovado"; nomePerfil = "Administrador"; }
        if (u.role === "comite") { badgeClasse = "badge-enviado"; nomePerfil = "Conselheiro"; }

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

export function renderizarTabelaAdminAcoes(acoes) {
    const tbody = document.getElementById("adminAcoesBody"); if (!tbody) return;
    tbody.innerHTML = "";
    if (!acoes || acoes.length === 0) {
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

export default { renderizarTabelaAdminUsuarios, renderizarTabelaAdminAcoes };

export function initAdmin() {
    if (document.body.dataset.adminInit) return;
    document.body.dataset.adminInit = '1';
    console.info('admin.js: initAdmin executed.');

    const adminTabs = document.querySelectorAll('#adminTabs .filtro-btn');
    adminTabs.forEach(tab => {
        if (tab.dataset._bound) return;
        tab.dataset._bound = '1';
        tab.addEventListener('click', () => {
            document.querySelectorAll('#adminTabs .filtro-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.style.display = 'block';
            if (targetId === 'tabAdminAcoes' && typeof window.renderizarTabelaAdminAcoes === 'function') window.renderizarTabelaAdminAcoes();
            if (targetId === 'tabAdminUsuarios' && typeof window.renderizarTabelaAdminUsuarios === 'function') window.renderizarTabelaAdminUsuarios();
        });
    });
    // inicializar handlers de formulários/modais
    try { initAdminFormHandlers(); } catch (e) { /* ignore */ }
}

// Funções de gestão de registros e UI administrativas (migradas de script.js)
export function renderizarTabelaAdminGestaoDados() {
    const tbody = document.getElementById("adminGestaoDadosBody"); if (!tbody) return;
    tbody.innerHTML = "";

    const registros = window.registros || [];
    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty-state">Nenhum dado lançado no sistema.</td></tr>`;
        return;
    }

    const listaInvertida = [...registros].reverse();
    listaInvertida.forEach(reg => {
        const tr = document.createElement('tr');

        let acoesTexto = '-';
        if (reg.acoesEstrategicas && Array.isArray(reg.acoesEstrategicas)) {
            acoesTexto = reg.acoesEstrategicas.map(a => `<strong>${a.id}</strong>`).join(', ');
        }

        tr.innerHTML = `
            <td><strong>${reg.id}</strong></td>
            <td>${acoesTexto}</td>
            <td>${(reg.oque ? (reg.oque.substring(0,50) + '...') : '-')}</td>
            <td><strong>${reg.percentual || 0}%</strong></td>
            <td>
                <select class="form-control admin-status-select" data-reg-id="${reg.id}" style="padding: 4px; font-size: 0.85rem; border-radius: 4px;">
                    <option value="Rascunho" ${reg.status === 'Rascunho' ? 'selected' : ''}>Rascunho</option>
                    <option value="Enviado" ${reg.status === 'Enviado' ? 'selected' : ''}>Enviado (Comitê)</option>
                    <option value="Aprovado" ${reg.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                    <option value="Pendente" ${reg.status === 'Pendente' ? 'selected' : ''}>Pendente (Correção)</option>
                </select>
            </td>
            <td>${reg.criadoPor || '-'}</td>
            <td style="white-space: nowrap; display: flex; gap: 6px; align-items: center;">
                <button class="button-editar" style="color: #3b82f6;" title="Ajustar Porcentagem" data-edit-percent="${reg.id}"><i class="bi bi-percent"></i></button>
                <button class="button-excluir" title="Excluir Definitivamente" data-del-reg="${reg.id}"><i class="bi bi-trash3-fill"></i></button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // ligar handlers delegados
    tbody.querySelectorAll('.admin-status-select').forEach(sel => {
        if (sel.dataset._bound) return; sel.dataset._bound = '1';
        sel.addEventListener('change', (e) => {
            const id = sel.dataset.regId; window.adminAlterarStatus && window.adminAlterarStatus(id, sel.value);
        });
    });
    tbody.querySelectorAll('[data-del-reg]').forEach(btn => {
        if (btn.dataset._bound) return; btn.dataset._bound = '1';
        btn.addEventListener('click', () => { const id = btn.dataset.delReg; window.excluirRegistroAdmin && window.excluirRegistroAdmin(id); });
    });
    tbody.querySelectorAll('[data-edit-percent]').forEach(btn => {
        if (btn.dataset._bound) return; btn.dataset._bound = '1';
        btn.addEventListener('click', () => { const id = btn.dataset.editPercent; window.abrirModalEditarPorcentagem && window.abrirModalEditarPorcentagem(id); });
    });
}

export async function adminAlterarStatus(id, novoStatus) {
    const registros = window.registros || [];
    const reg = registros.find(r => r.id === id);
    if (!reg) return;
    reg.status = novoStatus;
    if (window.saveDB) window.saveDB();
    if (window.Swal) Swal.fire({ icon: 'success', title: 'Status atualizado!', text: `O registro ID ${id} agora está como "${novoStatus}".`, timer: 1500, showConfirmButton: false });
    if (window.renderizarTabelaAdminGestaoDados) window.renderizarTabelaAdminGestaoDados();
    if (window.atualizarTabelaRegistros) window.atualizarTabelaRegistros();
}

export async function excluirRegistroAdmin(id) {
    const registros = window.registros || [];
    const index = registros.findIndex(r => r.id === id);
    if (index === -1) return;

    if (!window.Swal) return;
    const result = await Swal.fire({ title: 'Excluir registro?', text: `Deseja apagar definitivamente o registro ID ${id} do sistema e do dashboard?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e63946', cancelButtonColor: '#6c757d', confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) {
        registros.splice(index,1);
        if (window.saveDB) window.saveDB();
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500, showConfirmButton: false });
        if (window.renderizarTabelaAdminGestaoDados) window.renderizarTabelaAdminGestaoDados();
        if (window.atualizarTabelaRegistros) window.atualizarTabelaRegistros();
    }
}

export async function abrirModalEditarPorcentagem(idRegistro) {
    if (!(window.usuarioLogado && window.usuarioLogado.role === 'admin')) {
        if (window.Swal) Swal.fire('Acesso negado', 'Apenas administradores podem ajustar percentuais.', 'error');
        return;
    }
    const registro = (window.registros || []).find(r => r.id === idRegistro);
    if (!registro) return;
    const { value: novoPercentual } = await Swal.fire({ title: 'Ajustar Porcentagem da Ação', text: `Registro ID: ${registro.id} - O quê: ${registro.oque}`, input: 'number', inputAttributes: { min: 0, max: 100, step: 1 }, inputValue: registro.percentual || 0, showCancelButton: true, confirmButtonText: 'Salvar Ajuste', cancelButtonText: 'Cancelar', confirmButtonColor: '#2563eb' });
    if (novoPercentual !== undefined) {
        const valorNumerico = parseFloat(novoPercentual);
        if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 100) { if (window.Swal) Swal.fire('Valor inválido', 'Digite uma porcentagem entre 0 e 100.', 'warning'); return; }
        registro.percentual = valorNumerico;
        if (window.saveDB) window.saveDB();
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Porcentagem atualizada!', text: `O novo peso desta ação foi alterado para ${valorNumerico}%.`, timer: 2000, showConfirmButton: false });
        if (window.renderizarTabelaAdminGestaoDados) window.renderizarTabelaAdminGestaoDados();
        if (window.atualizarTabelaRegistros) window.atualizarTabelaRegistros();
    }
}

export function abrirModalAdminNovaAcao() {
    const modal = document.getElementById('modalAdminNovaAcao');
    const form = document.getElementById('formAdminAcao');
    if (!modal || !form) return;
    form.reset();
    modal.style.display = 'flex';
}

export function excluirAcaoBase(id) {
    if (!window.Swal) return;
    Swal.fire({ title: 'Excluir Ação?', text: 'Esta ação será removida da lista em memória.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e63946', cancelButtonColor: '#6c757d', confirmButtonText: 'Sim, excluir' }).then((result) => {
        if (result.isConfirmed) {
            const index = (window.acoesEstrategicas || []).findIndex(a => a.id === id);
            if (index > -1) { window.acoesEstrategicas.splice(index,1); if (window.renderizarTabelaAdminAcoes) window.renderizarTabelaAdminAcoes(window.acoesEstrategicas); if (window.Swal) Swal.fire({ icon: 'success', title: 'Excluída!', text: 'Ação removida com sucesso.', timer: 1500, showConfirmButton: false }); }
        }
    });
}

export function initAdminFormHandlers() {
    const btnNovaAcaoAdmin = document.getElementById('btnNovaAcaoAdmin');
    const closeModalAdminAcao = document.getElementById('closeModalAdminAcao');
    const modalAdminNovaAcao = document.getElementById('modalAdminNovaAcao');
    const formAdminAcao = document.getElementById('formAdminAcao');

    if (btnNovaAcaoAdmin && !btnNovaAcaoAdmin.dataset._bound) { btnNovaAcaoAdmin.dataset._bound = '1'; btnNovaAcaoAdmin.addEventListener('click', abrirModalAdminNovaAcao); }
    if (closeModalAdminAcao && !closeModalAdminAcao.dataset._bound) { closeModalAdminAcao.dataset._bound = '1'; closeModalAdminAcao.addEventListener('click', () => { if (modalAdminNovaAcao) modalAdminNovaAcao.style.display = 'none'; }); }
    if (modalAdminNovaAcao && !modalAdminNovaAcao.dataset._bound) { modalAdminNovaAcao.dataset._bound = '1'; modalAdminNovaAcao.addEventListener('click', (e) => { if (e.target === modalAdminNovaAcao) modalAdminNovaAcao.style.display = 'none'; }); }

    if (formAdminAcao && !formAdminAcao.dataset._bound) {
        formAdminAcao.dataset._bound = '1';
        formAdminAcao.addEventListener('submit', (e) => {
            e.preventDefault();
            const novaAcao = {
                id: document.getElementById('adminAcaoId').value.trim(),
                diretriz: document.getElementById('adminAcaoDiretriz').value.trim(),
                lae: document.getElementById('adminAcaoLae').value.trim(),
                og: document.getElementById('adminAcaoOg').value.trim(),
                prazo: document.getElementById('adminAcaoPrazo').value,
                setor: document.getElementById('adminAcaoSetor').value.trim(),
                meta: 'Não definida', indicador: 'Não definido', restricoes: '', dadosIncompletos: []
            };
            window.acoesEstrategicas = window.acoesEstrategicas || [];
            window.acoesEstrategicas.push(novaAcao);
            if (modalAdminNovaAcao) modalAdminNovaAcao.style.display = 'none';
            if (window.renderizarTabelaAdminAcoes) window.renderizarTabelaAdminAcoes(window.acoesEstrategicas);
            if (window.Swal) Swal.fire({ icon: 'success', title: 'Ação Adicionada!', text: 'A ação foi injetada no sistema e já está disponível para testes.', timer: 2500, showConfirmButton: false });
        });
    }
}

// Gerenciar usuários (edição/exclusão)
export async function editarUsuario(email) {
    const banco = window.db || { usuarios: [] };
    const usuario = (banco.usuarios || []).find(u => u.email === email);
    if (!usuario) return;
    if (!window.Swal) return;
    const { value: novoPerfil } = await Swal.fire({ title: `Editar Usuário`, html: `Alterar o perfil de acesso de <strong>${email}</strong>:`, input: 'select', inputOptions: { 'usuario': 'Usuário Comum (Lançador)', 'comite': 'Conselheiro (Avaliação)', 'admin': 'Administrador (Sistema)' }, inputValue: usuario.role, showCancelButton: true, confirmButtonColor: '#2563eb', cancelButtonColor: '#6c757d', confirmButtonText: 'Salvar Alteração', cancelButtonText: 'Cancelar' });
    if (novoPerfil && novoPerfil !== usuario.role) {
        usuario.role = novoPerfil; if (window.saveDB) window.saveDB(); if (window.renderizarTabelaAdminUsuarios) window.renderizarTabelaAdminUsuarios(window.db); if (window.usuarioLogado && window.usuarioLogado.email === email) { if (window.setUsuarioLogado) window.setUsuarioLogado(usuario); if (window.atualizarVisibilidadeMenu) window.atualizarVisibilidadeMenu(); }
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Atualizado!', text: 'O perfil do usuário foi alterado com sucesso.', timer: 1500, showConfirmButton: false });
    }
}

export async function excluirUsuario(email) {
    if (window.usuarioLogado && window.usuarioLogado.email === email) { if (window.Swal) Swal.fire({ icon: 'error', title: 'Ação Negada', text: 'Você não pode excluir a sua própria conta enquanto estiver logado.', confirmButtonColor: '#2563eb' }); return; }
    if (!window.Swal) return;
    const result = await Swal.fire({ title: 'Excluir Usuário?', html: `Tem certeza que deseja remover o acesso de <strong>${email}</strong> permanentemente?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e63946', cancelButtonColor: '#6c757d', confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) {
        const banco = window.db || { usuarios: [] };
        const index = (banco.usuarios || []).findIndex(u => u.email === email);
        if (index > -1) { banco.usuarios.splice(index,1); if (window.saveDB) window.saveDB(); if (window.renderizarTabelaAdminUsuarios) window.renderizarTabelaAdminUsuarios(window.db); if (window.Swal) Swal.fire({ icon: 'success', title: 'Excluído!', text: 'Usuário removido do sistema.', timer: 1500, showConfirmButton: false }); }
    }
}

// Expor globais para compatibilidade com o legado
if (typeof window !== 'undefined') {
    window.renderizarTabelaAdminGestaoDados = renderizarTabelaAdminGestaoDados;
    window.renderizarTabelaAdminAcoes = (acoes) => renderizarTabelaAdminAcoes(acoes || window.acoesEstrategicas || []);
    window.renderizarTabelaAdminUsuarios = (db) => renderizarTabelaAdminUsuarios(db || window.db || { usuarios: [] });
    window.adminAlterarStatus = adminAlterarStatus;
    window.excluirRegistroAdmin = excluirRegistroAdmin;
    window.abrirModalEditarPorcentagem = abrirModalEditarPorcentagem;
    window.abrirModalAdminNovaAcao = abrirModalAdminNovaAcao;
    window.excluirAcaoBase = excluirAcaoBase;
    window.editarUsuario = editarUsuario;
    window.excluirUsuario = excluirUsuario;
    window.initAdminFormHandlers = initAdminFormHandlers;
}
