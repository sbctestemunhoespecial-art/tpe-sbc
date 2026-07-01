const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  const script = document.createElement("script");

  const callbackName = "loginCallback_" + Date.now();

  window[callbackName] = function(res) {

    esconderSpinner();

    if (res.sucesso) {
      alert("Login OK");
      document.getElementById("telaLogin").style.display = "none";
      document.getElementById("conteudoProtegido").style.display = "block";
    } else {
      msgErro.textContent = res.mensagem;
    }

    delete window[callbackName];
    document.body.removeChild(script);
  };

  script.src =
    API_URL +
    "?acao=login" +
    "&email=" + encodeURIComponent(email) +
    "&senha=" + encodeURIComponent(senha) +
    "&callback=" + callbackName;

  document.body.appendChild(script);
}