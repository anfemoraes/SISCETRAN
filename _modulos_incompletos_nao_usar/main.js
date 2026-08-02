// js/main.js
import { initAuth, atualizarVisibilidadeMenu } from './auth.js';
import { initUser, preencherFormularioComAcoes, limparFormulario } from './user.js';
import { initComite } from './comite.js';
import { initDashboard } from './dashboard.js';
import { findRegistroById } from './dataManager.js';
import './acoes_data.js'; // Garante o carregamento dos dados base globais

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando SISCETRAN Modular...");

    // 1. Inicializa subsistemas
    initAuth();
    initUser();
    initComite();
    initDashboard(); // initDashboard já chama renderizarAndamento() internamente

    // Garante que os botões do menu (Admin/Comitê/Rascunhos) reflitam o login já restaurado
    if (typeof atualizarVisibilidadeMenu === 'function') atualizarVisibilidadeMenu();

    // 2. Mapeamento de Eventos e Navegação Global dos Botões
    setupNavegacaoGlobal();

    console.log("SISCETRAN pronto e operante!");
});

function setupNavegacaoGlobal() {
    // Exemplo de vinculação de cliques caso precise garantir o roteamento de telas
    const btnAdminGeral = document.getElementById('btnAdminGeral');
    if (btnAdminGeral) {
        btnAdminGeral.addEventListener('click', () => {
            // Ação do painel de administração
            console.log("Abrindo painel administrativo...");
        });
    }

    // Você pode centralizar aqui ouvintes globais de navegação se houverem, 
    // garantindo que os handlers legados chamados pelos botões do HTML encontrem as funções.
}