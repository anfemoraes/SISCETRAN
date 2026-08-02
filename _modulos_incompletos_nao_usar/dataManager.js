// dataManager.js — adapter para o estado e persistência existentes
// Fornece uma camada mínima de API compatível com o código legado em script.js

export function loadDB() {
  if (window.carregarBanco && typeof window.carregarBanco === 'function') {
    window.db = window.carregarBanco();
    // sincroniza registros globais se existir
    window.registros = window.db.registros || window.registros || [];
    return window.db;
  }

  const DB_KEY = 'siscetran_db';
  const dadosSalvos = JSON.parse(localStorage.getItem(DB_KEY));
  window.db = dadosSalvos || { usuarios: [], registros: [] };
  window.registros = window.db.registros || [];
  return window.db;
}

export function saveDB() {
  if (window.salvarBanco && typeof window.salvarBanco === 'function') {
    return window.salvarBanco();
  }
  if (!window.db) window.db = { usuarios: [], registros: window.registros || [] };
  window.db.registros = window.registros || [];
  localStorage.setItem('siscetran_db', JSON.stringify(window.db));
}

export function getRegistros() {
  return window.registros || (window.db && window.db.registros) || [];
}

export function setRegistros(arr) {
  window.registros = Array.isArray(arr) ? arr : (window.registros || []);
  if (window.db) window.db.registros = window.registros;
  saveDB();
}

export function getUsuarioLogado() {
  if (window.usuarioLogado) return window.usuarioLogado;
  const usuarioSalvo = localStorage.getItem('usuarioLogadoDados');
  return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

export function setUsuarioLogado(usuario) {
  window.usuarioLogado = usuario;
  if (usuario) {
    localStorage.setItem('usuarioLogadoDados', JSON.stringify(usuario));
    localStorage.setItem('usuarioLogado', 'true');
  } else {
    localStorage.removeItem('usuarioLogadoDados');
    localStorage.removeItem('usuarioLogado');
  }
}

export function clearSession() {
  if (window.limparSessao && typeof window.limparSessao === 'function') {
    return window.limparSessao();
  }
  window.usuarioLogado = null;
  localStorage.removeItem('usuarioLogadoDados');
  localStorage.removeItem('usuarioLogado');
}

export function gerarID() {
  if (window.gerarID && typeof window.gerarID === 'function') return window.gerarID();
  return 'ID-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function validarCredenciais(email, senha) {
  const banco = window.db || loadDB();
  const usuarios = banco.usuarios || [];
  return usuarios.find(u => u.email === email && u.senha === senha) || null;
}

export default {
  loadDB,
  saveDB,
  getRegistros,
  setRegistros,
  getUsuarioLogado,
  setUsuarioLogado,
  clearSession,
  gerarID,
  validarCredenciais
};

// ------------------------------------------------------------------
// CRUD e operações de fluxo (compatibilidade com script.js legado)
// ------------------------------------------------------------------
export function addRegistro(reg) {
  const registrosLocal = window.registros || [];
  const novo = {
    id: reg.id || gerarID(),
    dataCriacao: reg.dataCriacao || new Date().toLocaleString(),
    status: reg.status || 'Rascunho',
    comentarioComite: reg.comentarioComite || '-',
    criadoPor: reg.criadoPor || (getUsuarioLogado() && getUsuarioLogado().email) || 'anon',
    acoesEstrategicas: reg.acoesEstrategicas || [],
    ...reg
  };
  registrosLocal.push(novo);
  window.registros = registrosLocal;
  saveDB();
  return novo;
}

export function updateRegistro(id, updates) {
  const regs = window.registros || [];
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return null;
  regs[idx] = { ...regs[idx], ...updates };
  window.registros = regs;
  saveDB();
  return regs[idx];
}

export function deleteRegistro(id) {
  const regs = window.registros || [];
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return false;
  regs.splice(idx, 1);
  window.registros = regs;
  saveDB();
  return true;
}

export function findRegistroById(id) {
  const regs = window.registros || [];
  return regs.find(r => r.id === id) || null;
}

export function enviarRegistroDireto(id) {
  const reg = findRegistroById(id);
  if (!reg) return null;
  // valida campos mínimos
  if (!reg.oque || !reg.porque || !reg.como || !reg.quando || !reg.onde || !reg.impacto || reg.percentual === undefined) {
    return { error: 'incomplete' };
  }
  reg.status = 'Enviado';
  reg.comentarioComite = '-';
  reg.avaliadoPor = null;
  reg.dataAvaliacao = null;
  updateRegistro(id, reg);
  return reg;
}

export function avaliarRegistro(id, novoStatus, parecer, avaliadorEmail) {
  const reg = findRegistroById(id);
  if (!reg) return null;
  const statusFinal = novoStatus === 'Reprovado' ? 'Pendente' : novoStatus;
  reg.status = statusFinal;
  reg.comentarioComite = parecer || reg.comentarioComite || '-';
  reg.avaliadoPor = avaliadorEmail || (getUsuarioLogado() && getUsuarioLogado().email) || '-';
  reg.dataAvaliacao = new Date().toLocaleString();
  updateRegistro(id, reg);
  return reg;
}

// Expor wrappers globais para compatibilidade com os handlers inline existentes
if (typeof window !== 'undefined') {
  window.addRegistro = addRegistro;
  window.updateRegistro = updateRegistro;
  window.deleteRegistro = deleteRegistro;
  window.findRegistroById = findRegistroById;
  window.enviarRegistroDireto = enviarRegistroDireto;
  window.avaliarRegistro = avaliarRegistro;
  // compatibilidade: nomes em português/ingles para funções de sessão e DB
  window.loadDB = loadDB;
  window.saveDB = saveDB;
  window.getUsuarioLogado = getUsuarioLogado;
  window.setUsuarioLogado = setUsuarioLogado;
  window.clearSession = clearSession;
  window.salvarSessao = setUsuarioLogado;
  window.limparSessao = clearSession;
  window.estaLogado = function() { return Boolean(getUsuarioLogado()); };
}
