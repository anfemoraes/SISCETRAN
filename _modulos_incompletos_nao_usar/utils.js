// utils.js — funções utilitárias usadas pela UI
export function formatarData(data) {
    if (!data) return "-";
    const partes = String(data).split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

export function formatarImpacto(impacto) {
    const cores = { 'baixo': '🟢 Baixo', 'medio': '🟡 Médio', 'alto': '🔴 Alto' };
    return cores[impacto] || impacto;
}

export function escaparTexto(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function slugificar(texto) {
    if (!texto) return "nao-informado";
    return String(texto)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

// Expor como globais para compatibilidade com script.js legado
if (typeof window !== 'undefined') {
    window.formatarData = formatarData;
    window.formatarImpacto = formatarImpacto;
    window.escaparTexto = escaparTexto;
    window.slugificar = slugificar;
}

export default { formatarData, formatarImpacto, escaparTexto, slugificar };
