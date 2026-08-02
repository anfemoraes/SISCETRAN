// auth.js — inicializador e adaptador de login para a versão modular
import { loadDB, getUsuarioLogado, setUsuarioLogado, clearSession, validarCredenciais } from './dataManager.js';

export function initAuth() {
  loadDB();

  const loginButton = document.getElementById('loginButton');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginForm = document.getElementById('loginForm');

  if (!loginButton) return;
  if (loginButton.dataset._authInit) return;
  loginButton.dataset._authInit = '1';

  const usuario = getUsuarioLogado();
  if (usuario && loginButton) {
    loginButton.textContent = 'Logout';
    loginButton.classList.add('is-logged-in');
  }

  loginButton.onclick = async () => {
    if (getUsuarioLogado()) {
      if (window.Swal) {
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
          clearSession();
          loginButton.textContent = 'Login';
          loginButton.classList.remove('is-logged-in');
          if (window.atualizarVisibilidadeMenu) window.atualizarVisibilidadeMenu();
          if (window.Swal) Swal.fire({ icon: 'success', title: 'Logout realizado!', timer: 1500, showConfirmButton: false });
        }
      } else {
        clearSession();
      }
    } else {
      if (loginModal) loginModal.style.display = 'flex';
    }
  };

  if (closeLoginModal) closeLoginModal.onclick = () => { if (loginModal) loginModal.style.display = 'none'; };

  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('username').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      const usuarioEncontrado = validarCredenciais(email, password);
      if (usuarioEncontrado) {
        setUsuarioLogado(usuarioEncontrado);
        if (loginModal) loginModal.style.display = 'none';
        loginButton.textContent = 'Logout';
        loginButton.classList.add('is-logged-in');
        if (window.atualizarVisibilidadeMenu) window.atualizarVisibilidadeMenu();
        if (window.tabelaRegistros && window.tabelaRegistros.style.display === 'block' && window.atualizarTabelaRegistros) window.atualizarTabelaRegistros();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        if (window.Swal) Swal.fire({ icon: 'success', title: 'Login realizado!', text: `Bem-vindo, ${usuarioEncontrado.email}`, timer: 2000, showConfirmButton: false });
      } else {
        if (window.Swal) Swal.fire({ icon: 'error', title: 'Erro no login', text: 'E-mail ou senha incorretos!', confirmButtonColor: '#2563eb' });
      }
    };
  }
}

export default { initAuth };
// Adicione esta função logo abaixo do initAuth no seu auth.js:
export function atualizarVisibilidadeMenu() {
    const usuarioLogado = getUsuarioLogado();
    const btnAdminGeral = document.getElementById('btnAdminGeral');
    
    // Verifica se o usuário logado é administrador (ajuste a regra conforme a propriedade do seu objeto de usuário)
    const isAdmin = usuarioLogado && (usuarioLogado.role === 'admin' || usuarioLogado.isAdmin || usuarioLogado.email?.includes('admin'));
    
    if (btnAdminGeral) {
        btnAdminGeral.style.display = isAdmin ? 'inline-flex' : 'none';
    }
}
