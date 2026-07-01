let perfilUsuario = "";
let idUsuarioLogado = "";

function iniciarSistema(res) {

    perfilUsuario = res.perfil;
    idUsuarioLogado = res.id;

    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("conteudoProtegido").style.display = "block";

    document.getElementById("saudacaoUsuario").textContent =
        "Bem-vindo(a) 👋";

    document.getElementById("tipoAcessoUsuario").textContent =
        "Seu tipo de acesso é " + perfilUsuario;
}