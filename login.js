const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

async function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  /*mostrarSpinner();*/

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        acao: "login",
        email,
        senha
      })
    });

    const data = await res.json();

    esconderSpinner();

    if (data.sucesso) {

      perfilUsuario = data.perfil;
      idUsuarioLogado = data.id;

      alert("Login OK ✔");

      console.log(data);

    } else {
      msgErro.textContent = data.mensagem;
    }

  } catch (err) {

    esconderSpinner();
    msgErro.textContent = "Erro de conexão: " + err.message;

  }
}