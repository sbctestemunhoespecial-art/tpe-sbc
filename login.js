const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

/*function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (res.sucesso) {

      iniciarSistema(res);

      document.getElementById("telaLogin").style.display = "none";
      document.getElementById("conteudoProtegido").style.display = "block";

    } else {
      msgErro.textContent = res.mensagem;
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=login" +
    "&email=" + encodeURIComponent(email) +
    "&senha=" + encodeURIComponent(senha) +
    "&callback=" + callback;

  document.body.appendChild(script);
}*/

let perfilUsuario = null;
let idUsuarioLogado = null;
let emailUsuario = null;

async function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  try {

    const response = await fetch(`${API_URL}?acao=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);
    const res = await response.json();

    if (!res || !res.perfil) {
      esconderSpinner();
      msgErro.textContent = res.mensagem || '❌ Erro ao fazer login.';
      return;
    }

    // ==============================
    // DADOS DO USUÁRIO
    // ==============================

    perfilUsuario = res.perfil;
    idUsuarioLogado = res.id;
    emailUsuario = res.email;

    localStorage.setItem("usuarioLogado", JSON.stringify({
      id: res.id,
      perfil: res.perfil,
      email: res.email,
      timestamp: Date.now()
    }));

    // ==============================
    // UI LOGIN -> SISTEMA
    // ==============================

    document.getElementById('emailLogin').value = '';
    document.getElementById('senhaLogin').value = '';
    msgErro.textContent = '';

    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('conteudoProtegido').style.display = 'block';

    // ==============================
    // CABEÇALHO
    // ==============================

    const saudacaoEl = document.getElementById("saudacaoUsuario");
    const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

    if (saudacaoEl) saudacaoEl.textContent = "Bem-vindo(a) 👋";
    if (tipoAcessoEl) tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;

    // ==============================
    // MENU INICIAL
    // ==============================

    document.querySelectorAll('.tela').forEach(el => {
      el.classList.remove('aberta');
    });

    document.getElementById('menuCards')?.classList.add('aberta');

    // ==============================
    // PERFIL / PERMISSÕES
    // ==============================

    mostrarSecoesPorPerfil(perfilUsuario);

    limparCamposUsuario();
    restaurarCamposPerfil();

    // ==============================
    // BUSCAR NOME (API)
    // ==============================

    const nomeResponse = await fetch(`${API_URL}?acao=buscarNome&id=${res.id}`);
    const resNome = await nomeResponse.json();

    if (saudacaoEl) {
      if (resNome.sucesso && resNome.nome) {
        saudacaoEl.textContent = `Bem-vindo(a) ${resNome.nome} 👋`;
      } else {
        saudacaoEl.textContent = `Bem-vindo(a) 👋`;
      }
    }

    esconderSpinner();

    verificarTreinamentoPendente();

  } catch (err) {
    esconderSpinner();
    msgErro.textContent = '❌ Erro de conexão: ' + err.message;
  }
}