// ==========================================================================
// FILTER.JS — Filtros do Dashboard focados em Matrizes de Ação (Planos 5W2H)
// ==========================================================================

export function obterRegistrosFiltro() {
    const dadosSalvos = JSON.parse(localStorage.getItem("siscetran_db"));
    if (dadosSalvos && Array.isArray(dadosSalvos.registros)) {
        return dadosSalvos.registros;
    }
    return window.registros || [];
}

export function obterSetoresDaMatriz(matriz) {
    if (!matriz.acoesEstrategicas || !Array.isArray(matriz.acoesEstrategicas)) return ["Não informado"];
    const setores = new Set();
    matriz.acoesEstrategicas.forEach(aRef => {
        const aBase = (window.acoesEstrategicas || []).find(a => a.id === aRef.id);
        if (aBase && aBase.setor) {
            aBase.setor.split(",").map(s => s.trim()).filter(Boolean).forEach(s => setores.add(s));
        }
    });
    return setores.size > 0 ? Array.from(setores) : ["Não informado"];
}

export function obterSetoresUnicos() {
    const matrizes = obterRegistrosFiltro();
    const setores = new Set();
    matrizes.forEach(m => obterSetoresDaMatriz(m).forEach(s => setores.add(s)));
    return Array.from(setores).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function obterPrazoDaMatriz(matriz) {
    if (matriz.quando) {
        return `Ano ${matriz.quando.substring(0, 4)}`;
    }
    return "Não informado";
}

export function obterPrazosUnicos() {
    const matrizes = obterRegistrosFiltro();
    const prazos = new Set();
    matrizes.forEach(m => prazos.add(obterPrazoDaMatriz(m)));
    return Array.from(prazos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function obterObjetivosGovernoUnicos() {
    const matrizes = obterRegistrosFiltro();
    const ogs = new Set();
    matrizes.forEach(m => {
        if (Array.isArray(m.acoesEstrategicas)) {
            m.acoesEstrategicas.forEach(aRef => {
                const aBase = (window.acoesEstrategicas || []).find(a => a.id === aRef.id);
                if (aBase && aBase.og) ogs.add(aBase.og);
            });
        }
    });
    return Array.from(ogs).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function obterLinhasAcaoUnicas() {
    const matrizes = obterRegistrosFiltro();
    const laes = new Set();
    matrizes.forEach(m => {
        if (Array.isArray(m.acoesEstrategicas)) {
            m.acoesEstrategicas.forEach(aRef => {
                const aBase = (window.acoesEstrategicas || []).find(a => a.id === aRef.id);
                if (aBase && aBase.lae) laes.add(aBase.lae);
            });
        }
    });
    return Array.from(laes).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// O dashboard só exibe matrizes Aprovadas (ver regra em dashboard.js/renderizarAndamento).
// Este filtro existe para eventual uso futuro, mas hoje só faz sentido oferecer "Aprovado".
export const STATUS_APROVACAO_VALORES = ["Aprovado"];

export function popularFiltrosDashboard() {
    const popular = (id, valores, formatador) => {
        const el = document.getElementById(id);
        if (!el) return;
        // Limpa opções antigas exceto a primeira ("Todos")
        el.innerHTML = `<option value="Todos">Todos</option>`;
        valores.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = formatador ? formatador(v) : v;
            el.appendChild(opt);
        });
    };

    popular("filtroOG", obterObjetivosGovernoUnicos());
    popular("filtroLAE", obterLinhasAcaoUnicas());
    
    // Filtro de Matrizes específicas (ID)
    const matrizes = obterRegistrosFiltro();
    popular("filtroAE", matrizes.map(m => m.id), (id) => {
        const mat = matrizes.find(m => m.id === id);
        if (mat && mat.nome) {
            return mat.nome;
        }
        const resumo = mat && mat.oque ? mat.oque.substring(0, 50) + (mat.oque.length > 50 ? "…" : "") : "";
        return `${id} — ${resumo}`;
    });

    popular("filtroSetor", obterSetoresUnicos());
    popular("filtroPrazo", obterPrazosUnicos());
    popular("filtroStatusAprovacao", STATUS_APROVACAO_VALORES);
}

export function obterFiltrosAtuais() {
    const el = id => document.getElementById(id);
    return {
        og: el("filtroOG") ? el("filtroOG").value : "Todos",
        lae: el("filtroLAE") ? el("filtroLAE").value : "Todos",
        ae: el("filtroAE") ? el("filtroAE").value : "Todos",
        setor: el("filtroSetor") ? el("filtroSetor").value : "Todos",
        prazo: el("filtroPrazo") ? el("filtroPrazo").value : "Todos",
        statusAprovacao: el("filtroStatusAprovacao") ? el("filtroStatusAprovacao").value : "Todos"
    };
}

export function obterMatrizesFiltradasDashboard(filtros) {
    const matrizes = obterRegistrosFiltro();
    filtros = filtros || obterFiltrosAtuais();

    return matrizes.filter(m => {
        // Exclui rascunhos pessoais do dashboard geral corporativo (a menos que filtrado especificamente)
        if (m.status === "Rascunho" && filtros.statusAprovacao !== "Rascunho") {
            return false;
        }

        const passaStatus = filtros.statusAprovacao === "Todos" || m.status === filtros.statusAprovacao;
        const passaID = filtros.ae === "Todos" || m.id === filtros.ae;
        const passaPrazo = filtros.prazo === "Todos" || obterPrazoDaMatriz(m) === filtros.prazo;
        const passaSetor = filtros.setor === "Todos" || obterSetoresDaMatriz(m).includes(filtros.setor);

        // Verifica OG e LAE nas ações base vinculadas à matriz
        let passaOG = filtros.og === "Todos";
        let passaLAE = filtros.lae === "Todos";

        if (Array.isArray(m.acoesEstrategicas)) {
            m.acoesEstrategicas.forEach(aRef => {
                const aBase = (window.acoesEstrategicas || []).find(a => a.id === aRef.id);
                if (aBase) {
                    if (aBase.og === filtros.og) passaOG = true;
                    if (aBase.lae === filtros.lae) passaLAE = true;
                }
            });
        }

        return passaStatus && passaID && passaPrazo && passaSetor && passaOG && passaLAE;
    });
}

export function limparFiltrosDashboard() {
    ["filtroOG", "filtroLAE", "filtroAE", "filtroSetor", "filtroPrazo", "filtroStatusAprovacao"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "Todos";
    });
}

export default {
    obterSetoresUnicos,
    obterPrazosUnicos,
    obterObjetivosGovernoUnicos,
    obterLinhasAcaoUnicas,
    popularFiltrosDashboard,
    obterFiltrosAtuais,
    obterMatrizesFiltradasDashboard,
    limparFiltrosDashboard
};

// Exposição global para compatibilidade com scripts legados
if (typeof window !== 'undefined') {
    window.popularFiltrosDashboard = popularFiltrosDashboard;
    window.obterFiltrosAtuais = obterFiltrosAtuais;
    window.obterMatrizesFiltradasDashboard = obterMatrizesFiltradasDashboard;
    window.limparFiltrosDashboard = limparFiltrosDashboard;
}