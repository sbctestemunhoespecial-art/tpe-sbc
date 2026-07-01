const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

async function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  try {

    const url = `${API_URL}?acao=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`;

    const response = await fetch(url);
    const res = await response.json();

    esconderSpinner();

    if (res.sucesso) {

      alert("Login OK");

      document.getElementById("telaLogin").style.display = "none";
      document.getElementById("conteudoProtegido").style.display = "block";

    } else {
      msgErro.textContent = res.mensagem;
    }

  } catch (err) {

    esconderSpinner();
    msgErro.textContent = "Erro: " + err.message;

  }
}