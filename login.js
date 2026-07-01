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

function fazerLogin() {
  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  fetch(API_URL + `?acao=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`)
    .then(r => r.json())
    .then(res => {

      if (!res || !res.perfil) {
        esconderSpinner();
        msgErro.textContent = res.mensagem || '❌ Erro ao fazer login.';
        return;
      }

      // =========================
      // DADOS DO USUÁRIO (igual ao seu sistema)
      // =========================

      perfilUsuario = res.perfil;
      idUsuarioLogado = res.id;
      emailUsuario = email;

      localStorage.setItem("usuarioLogado", JSON.stringify({
        id: res.id,
        perfil: res.perfil,
        timestamp: Date.now()
      }));

      // =========================
      // LIMPA LOGIN
      // =========================

      document.getElementById('emailLogin').value = '';
      document.getElementById('senhaLogin').value = '';
      msgErro.textContent = '';

      // =========================
      // TROCA DE TELA
      // =========================

      document.getElementById('telaLogin').style.display = 'none';
      document.getElementById('conteudoProtegido').style.display = 'block';

      document.querySelectorAll('.tela').forEach(el => el.classList.remove('aberta'));
      document.getElementById('menuCards')?.classList.add('aberta');

      // =========================
      // SUA LÓGICA ORIGINAL (mantida)
      // =========================

      mostrarSecoesPorPerfil(res.perfil);
      limparCamposUsuario();
      restaurarCamposPerfil();

      const saudacaoEl = document.getElementById("saudacaoUsuario");
      const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

      if (saudacaoEl) saudacaoEl.textContent = "Bem-vindo(a) 👋";
      if (tipoAcessoEl) tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;

      esconderSpinner();

      verificarTreinamentoPendente();

    })
    .catch(err => {
      esconderSpinner();
      msgErro.textContent = '❌ Erro de conexão: ' + err.message;
    });
}