const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function mostrarTela(id) {
  document.querySelectorAll('.quadro-centralizado').forEach(div => {
    div.style.display = (div.id === id) ? 'block' : 'none';
  });
  limparMensagens();
}

function limparMensagens() {
  ['msgLogin', 'msgSolicitarCodigo', 'msgConfirmarCodigo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

let perfilUsuario = null;
let idUsuarioLogado = null;
let emailUsuario = null;

function fazerLogin() {

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();
  const msgErro = document.getElementById('msgLogin');

  msgErro.textContent = '';
  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(res) {

    if (res && res.perfil) {

      perfilUsuario = res.perfil;
      idUsuarioLogado = res.id;

      const saudacaoEl = document.getElementById("saudacaoUsuario");
      const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

      if (saudacaoEl) {
        saudacaoEl.textContent = "Bem-vindo(a) 👋";
      }

      if (tipoAcessoEl) {
        tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;
      }

      document.getElementById('emailLogin').value = '';
      document.getElementById('senhaLogin').value = '';
      document.getElementById('msgLogin').textContent = '';

      localStorage.setItem("usuarioLogado", JSON.stringify({
        id: res.id,
        perfil: res.perfil,
        timestamp: Date.now()
      }));

      document.getElementById("menuBtn").style.display = "inline-block";
      document.getElementById('telaLogin').style.display = 'none';
      document.getElementById('conteudoProtegido').style.display = 'block';

      historico.length = 0;

      document.querySelectorAll('.tela').forEach(el => {
        el.classList.remove('aberta');
      });

      document.getElementById('menuCards')?.classList.add('aberta');

      telaAtual = 'menuCards';

      atualizarBotaoVoltar();

      mostrarSecoesPorPerfil(res.perfil);

      limparCamposUsuario();
      restaurarCamposPerfil();

      // 🔁 segundo request (nome do usuário)
      const cbNome = "cb_nome_" + Date.now();

      window[cbNome] = function(resNome) {

        const saudacaoEl = document.getElementById("saudacaoUsuario");
        const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

        if (!saudacaoEl) return;

        if (resNome.sucesso && resNome.nome) {
          saudacaoEl.textContent = `Bem-vindo(a) ${resNome.nome} 👋`;
        } else {
          saudacaoEl.textContent = `Bem-vindo(a) 👋`;
        }

        if (tipoAcessoEl) {
          tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;
        }

        esconderSpinner();
        verificarTreinamentoPendente();

        delete window[cbNome];
      };

      const scriptNome = document.createElement("script");
      scriptNome.src =
        API_URL +
        "?acao=buscarNomeDoUsuario" +
        "&id=" + encodeURIComponent(idUsuarioLogado) +
        "&callback=" + cbNome;

      document.body.appendChild(scriptNome);

    } else {
      esconderSpinner();
      msgErro.textContent = res?.mensagem || '❌ Erro desconhecido ao fazer login.';
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
}

function mostrarSecoesPorPerfil(perfil) {

  document.querySelectorAll('.so-admin, .so-escalas, .so-organizadores, .so-treinandos, .so-participantes')
    .forEach(el => el.style.display = 'none');

  if (perfil === 'admin') {
    document.querySelectorAll('.so-admin, .so-escalas, .so-organizadores, .so-treinandos, .so-participantes')
      .forEach(el => el.style.display = '');
  } else if (perfil === 'escalas') {
    document.querySelectorAll('.so-escalas, .so-organizadores, .so-participantes')
      .forEach(el => el.style.display = '');
  } else if (perfil === 'organizadores') {
    document.querySelectorAll('.so-organizadores, .so-participantes')
      .forEach(el => el.style.display = '');
  } else if (perfil === 'treinandos') {
    document.querySelectorAll('.so-treinandos')
      .forEach(el => el.style.display = '');
  } else if (perfil === 'participantes') {
    document.querySelectorAll('.so-participantes')
      .forEach(el => el.style.display = '');
  }

  document.querySelectorAll('.bloquear-treinandos').forEach(el => {
    if (perfil === 'treinandos') {
      el.style.display = 'none';
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {

  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  if (usuarioSalvo) {

    const dados = JSON.parse(usuarioSalvo);

    const expirou = Date.now() - dados.timestamp > 60 * 60 * 1000;

    if (expirou) {
      localStorage.removeItem("usuarioLogado");
      mostrarAlertaGlobal("⏰ Sua sessão expirou. Faça login novamente.");
      document.getElementById('telaLogin').style.display = 'block';
      document.getElementById('conteudoProtegido').style.display = 'none';
      return;
    }

    perfilUsuario = dados.perfil;
    idUsuarioLogado = dados.id;

    document.getElementById("menuBtn").style.display = "inline-block";
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('conteudoProtegido').style.display = 'block';

    mostrarSecoesPorPerfil(dados.perfil);

    const cbNome = "cb_nome_" + Date.now();

    window[cbNome] = function(resNome) {

      const saudacaoEl = document.getElementById("saudacaoUsuario");
      const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

      if (saudacaoEl) {

        if (resNome.sucesso && resNome.nome) {
          saudacaoEl.textContent = `Bem-vindo(a) ${resNome.nome} 👋`;
        } else {
          saudacaoEl.textContent = `Bem-vindo(a) 👋`;
        }
      }

      if (tipoAcessoEl) {
        tipoAcessoEl.textContent = `Seu tipo de acesso é ${dados.perfil}`;
      }

      delete window[cbNome];
    };

    const scriptNome = document.createElement("script");
    scriptNome.src =
      API_URL +
      "?acao=buscarNomeDoUsuario" +
      "&id=" + encodeURIComponent(dados.id) +
      "&callback=" + cbNome;

    document.body.appendChild(scriptNome);

  } else {
    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('conteudoProtegido').style.display = 'none';
  }
});

let participantesSemDisponibilidade = [];

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function pesquisarParticipantesSemDisponibilidade() {

  mostrarSpinner();

  const callback = "cb_semdisp_" + Date.now();

  window[callback] = function(resultado) {

    esconderSpinner();

    participantesSemDisponibilidade = resultado || [];

    preencherTabelaSemDisponibilidade();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarParticipantesSemDisponibilidade" +
    "&callback=" + callback;

  document.body.appendChild(script);
}


// mantém exatamente igual
document.addEventListener('click', function (event) {

  const link = event.target.closest('a[href*="wa.me"]');

  if (!link) return;

  setTimeout(() => {

    link.style.color = 'gray';
    link.style.fontStyle = 'italic';

    if (!link.dataset.enviado) {

      link.innerHTML += ' <span title="Mensagem enviada">📤</span>';
      link.dataset.enviado = 'true';

    }

  }, 200);

});


function preencherTabelaSemDisponibilidade() {

  const tbody = document.getElementById("tbodySemDisponibilidade");

  tbody.innerHTML = "";

  document.getElementById("totalSemDisponibilidade").textContent =
    "Participantes sem disponibilidade: " +
    participantesSemDisponibilidade.length;

  participantesSemDisponibilidade.forEach(p => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.email}</td>
      <td>
        <a href="${p.whatsapp}" target="_blank"
           style="color:#25D366;font-weight:bold;text-decoration:none;">
          📱 ${p.telefone}
        </a>
      </td>
    `;

    tbody.appendChild(tr);

  });

}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

let participantesSemDisponibilidade = [];

function salvarDisponibilidadeIdUsuarioLogado2h() {

  const jaTenhoDesignacao =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade")?.checked;

  const frequenciaEl =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado2h");

  const somenteSubstituicao =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade").checked;

  const condicao = jaTenhoDesignacao
    ? "Já possui designação"
    : somenteSubstituicao
      ? "Somente substituição"
      : "Disponível para ponto fixo";

  const frequencia =
    frequenciaEl ? frequenciaEl.value.trim() : "";

  if (frequenciaEl) {
    frequenciaEl.classList.remove("erro-campo");
  }

  let valid = true;

  if (!somenteSubstituicao && !jaTenhoDesignacao && !frequencia) {
    mostrarAlertaGlobal("⚠️ Informe a frequência.");
    frequenciaEl.classList.add("erro-campo");
    valid = false;
  }

  let diasTurnos = [];

  if (!somenteSubstituicao && !jaTenhoDesignacao) {

    diasTurnos = Array.from(
      document.querySelectorAll(".dia-turno-usuario")
    )
      .filter(cb => cb.checked)
      .map(cb => `${cb.dataset.diaU} - ${cb.dataset.turnoU}`);

    if (diasTurnos.length === 0) {
      mostrarAlertaGlobal("⚠️ Selecione pelo menos um dia e turno disponível.");
      valid = false;
    }
  }

  if (!valid) return;

  mostrarSpinner();

  const callback = "cb_salvar_disp_" + Date.now();

  window[callback] = function() {

    esconderSpinner();

    mostrarAlertaGlobal("✅ Disponibilidade atualizada com sucesso.");

    cancelarModoEdicaoUsuarioLogado2h();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidade2h" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&condicao=" + encodeURIComponent(condicao) +
    "&frequencia=" + encodeURIComponent(frequencia) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function pesquisarDisponibilidadeUsuarioLogado2h() {

  console.log("pesquisarDisponibilidadeUsuarioLogado2h");

  if (!idUsuarioLogado) {
    mostrarAlertaGlobal("❌ Usuário não identificado.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_disp_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    carregarDadosDisponibilidadeUsuarioLogado2h(dados);

    if (abrirModalDepoisDaPesquisa) {
      abrirModalDepoisDaPesquisa = false;

      abrirModalEditarDisponibilidade(
        entrarModoEdicaoUsuarioLogado2h
      );
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidade2h" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function abrirCalendario2h() {
  abrirModalDepoisDaPesquisa = true;
  pesquisarDisponibilidadeUsuarioLogado2h();
}

function carregarDadosDisponibilidadeUsuarioLogado2h(dados) {

  renderizarDisponibilidade(dados, {
    chkSubstituicao: "somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade",
    chkDesignado: "jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade",
    frequencia: "frequenciaDisponibilidadeUsuarioLogado2h",
    checkboxes: ".dia-turno-usuario"
  });
}

let modoEdicaoAtivoUsuarioLogado2h = false;

function alternarModoEdicaoUsuarioLogado2h() {

  if (modoEdicaoAtivoUsuarioLogado2h) {
    cancelarModoEdicaoUsuarioLogado2h();
  } else {
    entrarModoEdicaoUsuarioLogado2h();
  }
}

function entrarModoEdicaoUsuarioLogado2h() {

  modoEdicaoAtivoUsuarioLogado2h = true;

  const jtd =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");

  const ss =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

  if (jtd) jtd.checked = false;
  if (ss) ss.checked = false;

  const tabela =
    document.getElementById("tabelaDisponibilidadeUsuarioLogado2h");

  tabela.classList.add("tabela-sistemaEdicao");

  const container =
    document.getElementById("disponibilidadeContainerUsuarioLogado2h");

  container
    .querySelectorAll(".dia-turno-usuario")
    .forEach(cb => cb.disabled = false);

  const frequencia =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado2h");

  frequencia.disabled = false;
  frequencia.classList.add("selectEdicao");

  document.getElementById("btnEditarDisponibilidadeUsuarioLogado2h")
    .textContent = "❌ Cancelar";
}

function cancelarModoEdicaoUsuarioLogado2h() {

  modoEdicaoAtivoUsuarioLogado2h = false;

  const tabela =
    document.getElementById("tabelaDisponibilidadeUsuarioLogado2h");

  tabela.classList.remove("tabela-sistemaEdicao");

  const container =
    document.getElementById("disponibilidadeContainerUsuarioLogado2h");

  container
    .querySelectorAll(".dia-turno-usuario")
    .forEach(cb => cb.disabled = true);

  const frequencia =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado2h");

  frequencia.disabled = true;
  frequencia.classList.remove("selectEdicao");

  document.getElementById("btnEditarDisponibilidadeUsuarioLogado2h")
    .textContent = "✏️ Editar";

  pesquisarDisponibilidadeUsuarioLogado2h();
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function habilitarCamposDisponibilidadeID() {
  const checkboxes = document.querySelectorAll('.dia-turno-id');
  checkboxes.forEach(cb => cb.disabled = false);

  document.getElementById('frequenciaDisponibilidadeUsuarioLogado4h').disabled = false;
}

function salvarDisponibilidadeIdUsuarioLogado4h() {

  console.log('Entrou na função salvarDisponibilidaeIdUsuarioLogado, pelo botão somente substituição');

  const jaTenhoDesignacao =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade")?.checked;

  const frequenciaEl =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  const somenteSubstituicao =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade").checked;

  const idUsuario = idUsuarioLogado;

  const condicao = jaTenhoDesignacao
    ? "Já possui designação"
    : somenteSubstituicao
      ? "Somente substituição"
      : "Disponível para ponto fixo";

  const frequencia = somenteSubstituicao
    ? ""
    : (frequenciaEl ? frequenciaEl.value.trim() : "");

  if (frequenciaEl) {
    frequenciaEl.classList.remove("erro-campo");
  }

  let valid = true;

  if (!idUsuario) {
    mostrarAlertaGlobal("❌ Usuário inválido.");
    valid = false;
  }

  if (!somenteSubstituicao && !jaTenhoDesignacao && !frequencia) {
    mostrarAlertaGlobal("⚠️ Informe a frequência, pois ela é obrigatória para ponto fixo.");
    frequenciaEl.classList.add("erro-campo");
    valid = false;
  }

  let diasTurnos = [];

  if (!somenteSubstituicao && !jaTenhoDesignacao) {

    diasTurnos = Array.from(
      document.querySelectorAll(".dia-turno-id")
    )
      .filter(cb => cb.checked)
      .map(cb => `${cb.dataset.diaId} - ${cb.dataset.turnoId}`);

    if (diasTurnos.length === 0) {
      mostrarAlertaGlobal("⚠️ Selecione pelo menos um dia e turno disponível.");
      valid = false;
    }
  }

  if (!valid) return;

  mostrarSpinner();

  const callback = "cb_save_disp4h_" + Date.now();

  window[callback] = function() {

    esconderSpinner();

    mostrarAlertaGlobal("✅ Disponibilidade atualizada com sucesso!");

    if (frequenciaEl) {
      frequenciaEl.classList.remove("erro-campo");
    }

    cancelarModoEdicaoUsuarioLogado4h();

    if (jaTenhoDesignacao || somenteSubstituicao) {
      sincronizarCardsComSwitch();
      console.log('Chamando sincronizar cards pelo botão somente Substituição!!!');
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidade4h" +
    "&id=" + encodeURIComponent(idUsuario) +
    "&condicao=" + encodeURIComponent(condicao) +
    "&frequencia=" + encodeURIComponent(frequencia) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function alternarSomenteSubstituicaoID() {

  const chkSubstituicao =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

  const chkDesignacao =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");

  const ativo = chkSubstituicao.checked;

  if (ativo) {
    chkDesignacao.checked = false;
  }

  document.querySelectorAll(".dia-turno-id").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  if (ativo) {
    salvarDisponibilidadeIdUsuarioLogado4h();
  }
}

function alternarDesignadoID() {

  const chkDesignacao =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");

  const chkSubstituicao =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

  const ativo = chkDesignacao.checked;

  if (ativo) {
    chkSubstituicao.checked = false;
  }

  document.querySelectorAll(".dia-turno-id").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  if (ativo) {
    salvarDisponibilidadeIdUsuarioLogado4h();
  }
}

function pesquisarDisponibilidadeUsuarioLogado4h() {

  console.log("pesquisarDisponibilidadeUsuarioLogado4h");

  if (!idUsuarioLogado) {
    mostrarAlertaGlobal("❌ Usuário inválido.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_disp4h_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    carregarDadosDisponibilidadeUsuarioLogado4h(dados);

    if (abrirModalDepoisDaPesquisa) {
      abrirModalDepoisDaPesquisa = false;

      abrirModalEditarDisponibilidade(
        entrarModoEdicaoUsuarioLogado4h
      );
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidade4h" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function abrirCalendario4h() {
  abrirModalDepoisDaPesquisa = true;
  pesquisarDisponibilidadeUsuarioLogado4h();
}

function norm(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function carregarDadosDisponibilidadeUsuarioLogado4h(dados) {

  renderizarDisponibilidade(dados, {
    chkSubstituicao: "somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade",
    chkDesignado: "jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade",
    frequencia: "frequenciaDisponibilidadeUsuarioLogado4h",
    checkboxes: ".dia-turno-id"
  });
}

let modoEdicaoAtivoUsuarioLogado4h = false;

function alternarModoEdicaoUsuarioLogado4h() {

  if (modoEdicaoAtivoUsuarioLogado4h) {
    cancelarModoEdicaoUsuarioLogado4h();
  } else {
    entrarModoEdicaoUsuarioLogado4h();
  }
}

function entrarModoEdicaoUsuarioLogado4h() {

  console.trace("ENTROU EM entrarModoEdicaoUsuarioLogado4h");

  modoEdicaoAtivoUsuarioLogado4h = true;

  const jtd =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");

  const ss =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

  if (jtd) jtd.checked = false;
  if (ss) ss.checked = false;

  const tabela =
    document.getElementById("tabelaDisponibilidadeUsuarioLogado4h");

  tabela.classList.add("tabela-sistemaEdicao");

  document.querySelectorAll(".dia-turno-id").forEach(cb => cb.disabled = false);

  const frequencia =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  frequencia.disabled = false;
  frequencia.classList.add("selectEdicao");

  document.getElementById("btnEditarDisponibilidadeUsuarioLogado4h")
    .textContent = "❌ Cancelar";
}

function cancelarModoEdicaoUsuarioLogado4h() {

  modoEdicaoAtivoUsuarioLogado4h = false;

  const tabela =
    document.getElementById("tabelaDisponibilidadeUsuarioLogado4h");

  tabela.classList.remove("tabela-sistemaEdicao");

  document.querySelectorAll(".dia-turno-id").forEach(cb => cb.disabled = true);

  const frequencia =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  frequencia.disabled = true;
  frequencia.classList.remove("selectEdicao");

  document.getElementById("btnEditarDisponibilidadeUsuarioLogado4h")
    .textContent = "✏️ Editar";

  pesquisarDisponibilidadeUsuarioLogado4h();
}

function configurarCampoDisponibilidadeID() {

  if (!idUsuarioLogado) return;

  pesquisarDisponibilidadeUsuarioLogado4h();
}

let modoEdicaoAtivoNovoPonto20 = false;

function salvarDisponibilidade2h() {

  const jaTenhoDesignacao =
    document.getElementById("jaTenhoDesignacaoNovoPonto20")?.checked;

  const somenteSubstituicao =
    document.getElementById("somenteSubstituicaoNovoPonto20")?.checked;

  const frequenciaEl =
    document.getElementById("frequenciaDisponibilidadeNovoPonto20");

  if (!participanteSelecionado2horas) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante = participanteSelecionado2horas.id;
  const nome = participanteSelecionado2horas.nome;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  const isDesignacao = jaTenhoDesignacao === true;
  const isSubstituicao = somenteSubstituicao === true;
  const isPontoFixo = !isDesignacao && !isSubstituicao;

  const condicao =
    isDesignacao
      ? "Já possui designação"
      : isSubstituicao
        ? "Somente substituição"
        : "Disponível para ponto fixo";

  const frequencia =
    frequenciaEl ? frequenciaEl.value.trim() : "";

  frequenciaEl?.classList.remove("erro-campo");

  if (isPontoFixo && !frequencia) {
    mostrarAlertaGlobal(
      "⚠️ Informe a frequência, pois ela é obrigatória para ponto fixo."
    );

    frequenciaEl?.classList.add("erro-campo");
    return;
  }

  let diasTurnos = [];

  if (isPontoFixo) {

    diasTurnos = Array.from(
      document.querySelectorAll(".dia-turno-novoPonto20")
    )
      .filter(cb => cb.checked)
      .map(cb => `${cb.dataset.diaN} - ${cb.dataset.turnoN}`);

    if (diasTurnos.length === 0) {
      mostrarAlertaGlobal(
        "⚠️ Selecione pelo menos um dia e turno disponível."
      );
      return;
    }
  }

  mostrarSpinner();

  const callback = "cb_salvar_2h_novo_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    mostrarAlertaGlobal(
      `✅ Disponibilidade atualizada com sucesso para ${nome}!`
    );

    frequenciaEl?.classList.remove("erro-campo");

    modoEdicaoAtivoNovoPonto20 = true;
    alternarModoEdicaoNovoPonto20();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidade2h" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&condicao=" + encodeURIComponent(condicao) +
    "&frequencia=" + encodeURIComponent(frequencia) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function alternarSomenteSubstituicaoNovoPonto20() {

  const ativo =
    document.getElementById("somenteSubstituicaoNovoPonto20")?.checked;

  document.querySelectorAll(".dia-turno-novoPonto20").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidadeNovoPonto20");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  if (ativo) {
    salvarDisponibilidade2h();
  }
}

function alternarDesignadoNovoPonto20() {

  const ativo =
    document.getElementById("jaTenhoDesignacaoNovoPonto20")?.checked;

  document.querySelectorAll(".dia-turno-novoPonto20").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidadeNovoPonto20");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  const substituicao2h =
    document.getElementById("somenteSubstituicaoNovoPonto20");

  if (substituicao2h) {
    substituicao2h.disabled = ativo;
  }

  if (ativo) {
    salvarDisponibilidade2h();
  }
}

function pesquisarDisponibilidadeNovoPonto20() {

  if (!participanteSelecionado2horas) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante = participanteSelecionado2horas.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_2h_novo_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    if (!dados) {
      mostrarAlertaGlobal("⚠️ Nenhuma disponibilidade encontrada.");
      return;
    }

    if (typeof carregarDadosDisponibilidadeNovoPonto20 === "function") {
      carregarDadosDisponibilidadeNovoPonto20(dados);
    } else {
      console.error("Função carregarDadosDisponibilidadeNovoPonto20 não encontrada");
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidade2h" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function alternarModoEdicaoNovoPonto20() {

  modoEdicaoAtivoNovoPonto20 = !modoEdicaoAtivoNovoPonto20;

  const container =
    document.getElementById("disponibilidadeContainerNovoPonto20");

  const checkboxes =
    container.querySelectorAll('.dia-turno-novoPonto20');

  checkboxes.forEach(cb =>
    cb.disabled = !modoEdicaoAtivoNovoPonto20
  );

  const select =
    document.getElementById('frequenciaDisponibilidadeNovoPonto20');

  if (select) {
    select.disabled = !modoEdicaoAtivoNovoPonto20;
  }

  const botao =
    document.getElementById('btnEditarDisponibilidadeNovoPonto20');

  botao.textContent = modoEdicaoAtivoNovoPonto20
    ? '❌ Cancelar'
    : '✏️ Editar Disponibilidade';

  if (!modoEdicaoAtivoNovoPonto20) {
    pesquisarDisponibilidadeNovoPonto20();
  }
}

function carregarDadosDisponibilidadeNovoPonto20(dados) {

  renderizarDisponibilidadeBase(dados, {
    chkSubstituicao: "somenteSubstituicaoNovoPonto20",
    chkDesignado: "jaTenhoDesignacaoNovoPonto20",
    frequencia: "frequenciaDisponibilidadeNovoPonto20",
    checkboxes: ".dia-turno-novoPonto20"
  });
}

function coletarDiasTurnos(containerId) {
  const container = document.getElementById(containerId);
  return Array.from(container.querySelectorAll('.dia-turno'))
    .filter(cb => cb.checked)
    .map(cb => `${cb.dataset.dia} - ${cb.dataset.turno}`);
}

function salvarDisponibilidadeParticipante4h() {

  const jaTenhoDesignacao =
    document.getElementById("jaTenhoDesignacao")?.checked;

  const somenteSubstituicao =
    document.getElementById("somenteSubstituicao")?.checked;

  const frequenciaEl =
    document.getElementById("frequenciaDisponibilidade");

  if (!participanteSelecionado4horas) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionado4horas.id;

  const nome =
    participanteSelecionado4horas.nome;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  const isDesignacao = jaTenhoDesignacao === true;
  const isSubstituicao = somenteSubstituicao === true;
  const isPontoFixo = !isDesignacao && !isSubstituicao;

  const condicao =
    isDesignacao
      ? "Já possui designação"
      : isSubstituicao
        ? "Somente substituição"
        : "Disponível para ponto fixo";

  const frequencia =
    frequenciaEl ? frequenciaEl.value.trim() : "";

  frequenciaEl?.classList.remove("erro-campo");

  if (isPontoFixo && !frequencia) {
    mostrarAlertaGlobal(
      "⚠️ Informe a frequência, pois ela é obrigatória para ponto fixo."
    );
    frequenciaEl?.classList.add("erro-campo");
    return;
  }

  let diasTurnos = [];

  if (isPontoFixo) {

    diasTurnos = Array.from(
      document.querySelectorAll(".dia-turno")
    )
      .filter(cb => cb.checked)
      .map(cb => `${cb.dataset.dia} - ${cb.dataset.turno}`);

    if (diasTurnos.length === 0) {
      mostrarAlertaGlobal(
        "⚠️ Selecione pelo menos um dia e turno disponível."
      );
      return;
    }
  }

  mostrarSpinner();

  const callback = "cb_salvar_4h_" + Date.now();

  window[callback] = function() {

    esconderSpinner();

    mostrarAlertaGlobal(
      `✅ Disponibilidade atualizada com sucesso para ${nome}!`
    );

    modoEdicaoAtivo = true;
    alternarModoEdicao();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidade4h" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&condicao=" + encodeURIComponent(condicao) +
    "&frequencia=" + encodeURIComponent(frequencia) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function alternarSomenteSubstituicao() {

  const ativo =
    document.getElementById("somenteSubstituicao")?.checked;

  document.querySelectorAll(".dia-turno").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidade");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  if (ativo) {
    salvarDisponibilidadeParticipante4h();
  }
}

function alternarDesignado() {

  const ativo =
    document.getElementById("jaTenhoDesignacao")?.checked;

  document.querySelectorAll(".dia-turno").forEach(cb => {
    cb.disabled = ativo;
    if (ativo) cb.checked = false;
  });

  const freq =
    document.getElementById("frequenciaDisponibilidade");

  if (freq) {
    freq.disabled = ativo;
    if (ativo) freq.value = "";
  }

  const substituicao =
    document.getElementById("somenteSubstituicao");

  if (substituicao) {
    substituicao.disabled = ativo;
  }

  if (ativo) {
    salvarDisponibilidadeParticipante4h();
  }
}

function pesquisarDisponibilidade() {

  if (!participanteSelecionado4horas) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionado4horas.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_4h_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    if (!dados) {
      mostrarAlertaGlobal("⚠️ Nenhuma disponibilidade encontrada.");
      return;
    }

    if (typeof carregarDadosDisponibilidade === "function") {
      carregarDadosDisponibilidade(dados);
    } else {
      console.error("Função carregarDadosDisponibilidade não encontrada");
    }

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidade4h" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function norm(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function carregarDadosDisponibilidade(dados) {

  renderizarDisponibilidadeBase(dados, {
    chkSubstituicao: "somenteSubstituicao",
    chkDesignado: "jaTenhoDesignacao",
    frequencia: "frequenciaDisponibilidade",
    checkboxes: ".dia-turno"
  });
}

let modoEdicaoAtivo = false;

function alternarModoEdicao() {

  modoEdicaoAtivo = !modoEdicaoAtivo;

  const checkboxes = document.querySelectorAll('.dia-turno');
  checkboxes.forEach(cb => cb.disabled = !modoEdicaoAtivo);

  const selects = [
    document.getElementById('frequenciaDisponibilidade')
  ];

  selects.forEach(select => {
    if (select) select.disabled = !modoEdicaoAtivo;
  });

  const botao = document.getElementById('btnEditarDisponibilidade');

  botao.textContent = modoEdicaoAtivo
    ? '❌ Cancelar'
    : '✏️ Editar';

  if (!modoEdicaoAtivo) {

    const nome =
      document.getElementById("selectModalParticipantes")?.value?.trim();

    if (!nome) {
      mostrarAlertaGlobal("⚠️ Nenhum participante selecionado.");
      return;
    }

    const id =
      window.mapaParticipantesPorNome?.[nome];

    if (!id) {
      mostrarAlertaGlobal("❌ ID não encontrado.");
      return;
    }

    pesquisarDisponibilidade(id);
  }
}

function salvarTP() {

  if (!participanteSelecionadoTreinamentoPratico) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  const nome =
    participanteSelecionadoTreinamentoPratico.nome;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  const diasTurnos = Array.from(
    document.querySelectorAll('.dia-turno-treinamentoPratico')
  )
    .filter(cb => cb.checked)
    .map(cb => `${cb.dataset.diaT} - ${cb.dataset.turnoT}`);

  mostrarSpinner();

  const callback = "cb_salvar_tp_" + Date.now();

  window[callback] = function() {

    esconderSpinner();

    mostrarAlertaGlobal(
      `✅ Disponibilidade atualizada com sucesso para ${nome}!`
    );

    modoEdicaoAtivoTP = true;
    alternarModoEdicaoTP();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidadeNoSheetTPPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function pesquisarTP() {

  if (!participanteSelecionadoTreinamentoPratico) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_tp_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    carregarDadosTP(dados);

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidadeNoSheetTPPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function carregarDadosTP(dados) {

  if (!dados) {
    document.querySelectorAll('.dia-turno-treinamentoPratico')
      .forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
      });
    return;
  }

  document.querySelectorAll('.dia-turno-treinamentoPratico')
    .forEach(cb => cb.checked = false);

  if (Array.isArray(dados.diasTurnos)) {

    dados.diasTurnos.forEach(item => {

      const partes = item.split(' - ');
      if (partes.length !== 2) return;

      const diaT = partes[0];
      const turnoT = partes[1];

      const checkbox =
        Array.from(document.querySelectorAll('.dia-turno-treinamentoPratico'))
          .find(cb =>
            norm(cb.dataset.diaT) === norm(diaT) &&
            norm(cb.dataset.turnoT) === norm(turnoT)
          );

      if (checkbox) checkbox.checked = true;
    });
  }
}

let modoEdicaoAtivoTP = false;

function alternarModoEdicaoTP() {

  modoEdicaoAtivoTP = !modoEdicaoAtivoTP;

  const container =
    document.getElementById("treinamentoPraticoContainer");

  const checkboxes =
    container.querySelectorAll('.dia-turno-treinamentoPratico');

  checkboxes.forEach(cb =>
    cb.disabled = !modoEdicaoAtivoTP
  );

  const botao =
    document.getElementById('btnEditarTP');

  botao.textContent =
    modoEdicaoAtivoTP
      ? '❌ Cancelar'
      : '✏️ Editar Disponibilidade';

  if (!modoEdicaoAtivoTP) {

    const idParticipante =
      participanteSelecionadoTreinamentoPratico?.id;

    if (idParticipante) {
      pesquisarTP();
    }
  }
}

function salvarTP() {

  if (!participanteSelecionadoTreinamentoPratico) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  const nome =
    participanteSelecionadoTreinamentoPratico.nome;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  const diasTurnos = Array.from(
    document.querySelectorAll('.dia-turno-treinamentoPratico')
  )
    .filter(cb => cb.checked)
    .map(cb => `${cb.dataset.diaT} - ${cb.dataset.turnoT}`);

  mostrarSpinner();

  const callback = "cb_salvar_tp_" + Date.now();

  window[callback] = function() {

    esconderSpinner();

    mostrarAlertaGlobal(
      `✅ Disponibilidade atualizada com sucesso para ${nome}!`
    );

    modoEdicaoAtivoTP = true;
    alternarModoEdicaoTP();

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarDisponibilidadeNoSheetTPPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function pesquisarTP() {

  if (!participanteSelecionadoTreinamentoPratico) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  mostrarSpinner();

  const callback = "cb_buscar_tp_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();

    carregarDadosTP(dados);

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarDisponibilidadeNoSheetTPPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function carregarDadosTP(dados) {

  if (!dados) {
    document.querySelectorAll('.dia-turno-treinamentoPratico')
      .forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
      });
    return;
  }

  document.querySelectorAll('.dia-turno-treinamentoPratico')
    .forEach(cb => cb.checked = false);

  if (Array.isArray(dados.diasTurnos)) {

    dados.diasTurnos.forEach(item => {

      const partes = item.split(' - ');
      if (partes.length !== 2) return;

      const diaT = partes[0];
      const turnoT = partes[1];

      const checkbox =
        Array.from(document.querySelectorAll('.dia-turno-treinamentoPratico'))
          .find(cb =>
            norm(cb.dataset.diaT) === norm(diaT) &&
            norm(cb.dataset.turnoT) === norm(turnoT)
          );

      if (checkbox) checkbox.checked = true;
    });
  }
}

let modoEdicaoAtivoTP = false;

function alternarModoEdicaoTP() {

  modoEdicaoAtivoTP = !modoEdicaoAtivoTP;

  const container =
    document.getElementById("treinamentoPraticoContainer");

  const checkboxes =
    container.querySelectorAll('.dia-turno-treinamentoPratico');

  checkboxes.forEach(cb =>
    cb.disabled = !modoEdicaoAtivoTP
  );

  const botao =
    document.getElementById('btnEditarTP');

  botao.textContent =
    modoEdicaoAtivoTP
      ? '❌ Cancelar'
      : '✏️ Editar Disponibilidade';

  if (!modoEdicaoAtivoTP) {

    const idParticipante =
      participanteSelecionadoTreinamentoPratico?.id;

    if (idParticipante) {
      pesquisarTP();
    }
  }
}

function pesquisarMinhaInfo() {

  if (!idUsuarioLogado) {
    mostrarAlertaGlobal('❌ Usuário não identificado.');
    return;
  }

  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function (dados) {

    esconderSpinner();

    mostrarResultadosMinhaInfo(dados);

    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=pesquisarMeuCadastro" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

let map;
let todosOsPontos = [];
let marcadoresFixos = [];
let marcadorDestaque = null;
let infoWindow = null;
let mapScriptLoaded = false;
let mapaIniciado = false;

function initMap() {
  if (mapaIniciado) return;

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -14.2350, lng: -51.9253 },
    zoom: 4,
  });

  mapaIniciado = true;

  const cb = "cb_pontos_" + Date.now();

  window[cb] = function(res) {

    todosOsPontos = res;

    const select = document.getElementById("pontoSelectMap");
    select.innerHTML = "<option value=''>Selecione</option>";

    res.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nome;
      opt.textContent = p.nome;
      select.appendChild(opt);
    });

    renderAllMarkers(todosOsPontos);

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=getTodosOsPontos" +
    "&callback=" + cb;

  document.body.appendChild(script);
}

window.initMap = initMap;

function renderAllMarkers(pontos) {
  marcadoresFixos.forEach(m => m.setMap(null));
  marcadoresFixos = [];

  pontos.forEach(ponto => {
    const marker = new google.maps.Marker({
      position: { lat: ponto.lat, lng: ponto.lng },
      map: map,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new google.maps.Size(50, 50),
        labelOrigin: new google.maps.Point(25, -20)
      },
      label: {
        text: ponto.nome,
        color: "black",
        fontSize: "30px",
        fontWeight: "normal"
      },
      title: ponto.nome
    });

    marcadoresFixos.push(marker);
  });
}

function verMapa() {
  const select = document.getElementById("pontoSelectMap");
  const nomeSelecionado = select.value;

  if (!nomeSelecionado) {
    mostrarAlertaGlobal("Selecione um ponto.");
    return;
  }

  const ponto = todosOsPontos.find(p => p.nome === nomeSelecionado);

  if (!ponto) {
    mostrarAlertaGlobal("Ponto não encontrado.");
    return;
  }

  document.getElementById("infoEncarregado").textContent = ponto.encarregado || "";
  document.getElementById("infoEndereco").textContent = ponto.endereco || "";
  document.getElementById("infoDeposito").textContent = ponto.deposito || "";

  map.setCenter({ lat: ponto.lat, lng: ponto.lng });
  map.setZoom(15);

  if (marcadorDestaque) marcadorDestaque.setMap(null);
  if (infoWindow) infoWindow.close();

  marcadorDestaque = new google.maps.Marker({
    position: { lat: ponto.lat, lng: ponto.lng },
    map: map,
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      scaledSize: new google.maps.Size(50, 50),
      labelOrigin: new google.maps.Point(25, -20)
    },
    label: {
      text: ponto.nome,
      color: "blue",
      fontSize: "30px",
      fontWeight: "bold"
    }
  });

  const conteudo =
    "<div style='font-family: Arial; border: 1px solid #888; border-radius: 6px; overflow: hidden;'>" +
    "<div style='background-color:#2a4d8f;color:white;font-weight:bold;padding:6px 10px;font-size:40px;'>" +
    ponto.nome +
    "</div>" +
    "<div style='padding:10px;font-size:30px;'>" +
    "<b>AAC:</b> " + (ponto.encarregado || "") + "<br>" +
    "<b>Endereço:</b> " + (ponto.endereco || "") + "<br>" +
    "<b>Depósito:</b> " + (ponto.deposito || "") +
    "</div></div>";

  infoWindow = new google.maps.InfoWindow({
    content: conteudo
  });

  infoWindow.open(map, marcadorDestaque);
}

function editarMapa() {
  const nomeSelecionado = document.getElementById("pontoSelectMap2").value;

  if (!nomeSelecionado) {
    mostrarAlertaGlobal("Selecione um ponto.");
    return;
  }

  const cb = "cb_editarMapa_" + Date.now();

  window[cb] = function(dados) {

    if (!dados) {
      mostrarAlertaGlobal('Mapa não cadastrado. Preencha os campos e clique em "Cadastrar/Editar Mapa".');
      delete window[cb];
      return;
    }

    document.getElementById("novoPonto").value = dados[0] || "";
    document.getElementById("novaLatitude").value = dados[1] || "";
    document.getElementById("novaLongitude").value = dados[2] || "";
    document.getElementById("novoAAC").value = dados[3] || "";
    document.getElementById("novoEndereco").value = dados[4] || "";
    document.getElementById("novoDeposito").value = dados[5] || "";

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarDadosDoMapa" +
    "&nome=" + encodeURIComponent(nomeSelecionado) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function cadastrarNovoMapa() {
  const nome = document.getElementById("novoPonto").value;
  const lat = document.getElementById("novaLatitude").value;
  const lng = document.getElementById("novaLongitude").value;
  const aac = document.getElementById("novoAAC").value;
  const endereco = document.getElementById("novoEndereco").value;
  const deposito = document.getElementById("novoDeposito").value;

  if (!nome) {
    mostrarAlertaGlobal("Nome do ponto não informado.");
    return;
  }

  const cb = "cb_salvarMapa_" + Date.now();

  window[cb] = function(res) {
    mostrarAlertaGlobal(res);
    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=cadastrarOuAtualizarMapa" +
    "&nome=" + encodeURIComponent(nome) +
    "&lat=" + encodeURIComponent(lat) +
    "&lng=" + encodeURIComponent(lng) +
    "&aac=" + encodeURIComponent(aac) +
    "&endereco=" + encodeURIComponent(endereco) +
    "&deposito=" + encodeURIComponent(deposito) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function carregarMapaQuandoClicar() {
  if (mapScriptLoaded && mapaIniciado) return;

  if (!mapScriptLoaded) {
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDYnIBhSeL0_SmimlgDn8Ube3jS6uporHg&callback=initMap";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    mapScriptLoaded = true;
  } else {
    initMap();
  }
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function pesquisarTcs() {

  if (!participanteSelecionadoTcs) {

    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante = participanteSelecionadoTcs.id;

  if (!idParticipante) {

    mostrarAlertaGlobal("❌ ID não encontrado para este participante.");
    return;
  }

  mostrarSpinner();

  const cb = "cb_pesquisarTcs_" + Date.now();

  window[cb] = function(email) {

    esconderSpinner();

    mostrarResultadoTcs(email);

    mostrarAlertaGlobal("✅ E-mail encontrado.");

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=pesquisarEmailTcsPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

let modoEdicaoTcs = false;
let emailOriginalTcs = "";

function alternarModoEdicaotcs() {

  const emailInput = document.getElementById("emailTcs");
  const botao = document.getElementById("btnEditartcs");

  modoEdicaoTcs = !modoEdicaoTcs;

  if (modoEdicaoTcs) {

    emailInput.readOnly = false;
    botao.textContent = "❌ Cancelar edição";
    botao.className = "botao cancel";

  } else {

    emailInput.readOnly = true;
    botao.textContent = "✏️ Editar e-mail tcs";
    botao.className = "botao editar";

    emailInput.value = emailOriginalTcs;
  }
}

function mostrarResultadoTcs(email) {

  const emailInput = document.getElementById("emailTcs");

  emailOriginalTcs = email || "";

  emailInput.value = emailOriginalTcs;
  emailInput.readOnly = true;

  modoEdicaoTcs = false;

  document.getElementById("btnEditartcs").textContent = "✏️ Editar e-mail tcs";
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.toLowerCase());
}

function salvartcs() {

  const nome =
    document.getElementById("selectModalParticipantes")
      ?.value?.trim();

  let novoEmail =
    document.getElementById("emailTcs")
      .value
      .trim();

  const textosInvalidos = [
    "email tcs não encontrado.",
    "email não encontrado",
    "não encontrado",
    ""
  ];

  if (!nome) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    window.mapaParticipantesPorNome?.[nome];

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  const emailLower = novoEmail.toLowerCase();

  if (
    !novoEmail ||
    textosInvalidos.includes(emailLower) ||
    emailLower.includes("@jwpub.org") ||
    !validarEmail(novoEmail)
  ) {
    mostrarAlertaGlobal("⚠️ Por favor, digite um e-mail válido (não pode conter @jwpub.org).");
    return;
  }

  novoEmail = emailLower;

  mostrarSpinner();

  const cb = "cb_salvarTcs_" + Date.now();

  window[cb] = function() {

    esconderSpinner();

    mostrarAlertaGlobal("✅ E-mail atualizado com sucesso!");

    document.getElementById("emailTcs").readOnly = true;

    document.getElementById("btnEditartcs").textContent = "✏️ Editar e-mail tcs";

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarEmailTcsPorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&email=" + encodeURIComponent(novoEmail) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function pesquisarParticipante() {

  if (!participanteSelecionadoEditar) {

    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const id = participanteSelecionadoEditar.id;

  if (!id) {
    mostrarAlertaGlobal('❌ ID não encontrado para este participante.');
    return;
  }

  mostrarSpinner();

  const cb = "cb_pesquisarParticipante_" + Date.now();

  window[cb] = function(dados) {

    esconderSpinner();
    mostrarResultados(dados);

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=pesquisarParticipantesPorId" +
    "&id=" + encodeURIComponent(id) +
    "&callback=" + cb;

  document.body.appendChild(script);

  // segunda chamada (sem tratamento de retorno)
  const cb2 = "cb_designacoes_" + Date.now();

  window[cb2] = function() {
    delete window[cb2];
  };

  const script2 = document.createElement("script");
  script2.src =
    API_URL +
    "?acao=pesquisarDesignacoesPorParticipanteId" +
    "&id=" + encodeURIComponent(id) +
    "&callback=" + cb2;

  document.body.appendChild(script2);
}


function calcularIdade(dataString) {
  if (!dataString) return '';
  const hoje = new Date();
  const [dia, mes, ano] = dataString.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - data.getFullYear();
  const m = hoje.getMonth() - data.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
    idade--;
  }

  return idade;
}

function calcularAnosBatismo(dataString) {
  if (!dataString) return '';
  const hoje = new Date();
  const [dia, mes, ano] = dataString.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);

  let anos = hoje.getFullYear() - data.getFullYear();
  const m = hoje.getMonth() - data.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
    anos--;
  }

  return anos;
}

function mostrarResultados(dados) {
  const tInfo = document.getElementById('tabelaInfoPessoal'),
        bInfo = document.getElementById('infoPessoalBody'),

        tInfo1 = document.getElementById('tabelaInfoPessoal1'),
        bInfo1 = document.getElementById('infoPessoalBody1'),

        tInfo2 = document.getElementById('tabelaInfoPessoal2'),
        bInfo2 = document.getElementById('infoPessoalBody2'),

        tInfo3 = document.getElementById('tabelaInfoPessoal3'),
        bInfo3 = document.getElementById('infoPessoalBody3'),

        tClas = document.getElementById('tabelaClassificacao'),
        bClas = document.getElementById('classificacaoBody'),

        tDet = document.getElementById('tabelaDetalhes'),
        bDet = document.getElementById('detalhesBody');

  bInfo.innerHTML = '';
  bInfo1.innerHTML = '';
  bInfo2.innerHTML = '';
  bInfo3.innerHTML = '';
  bClas.innerHTML = '';
  bDet.innerHTML = '';

  if (!dados || (dados.length === 0 && (!dados.participantes || dados.participantes.length === 0))) {
    tInfo.style.display = 'none';
    tInfo1.style.display = 'none';
    tInfo2.style.display = 'none';
    tInfo3.style.display = 'none';
    tClas.style.display = 'none';
    tDet.style.display = 'none';
    document.getElementById('detalhesDesignacoes').style.display = 'none';
    document.getElementById('detalhesPrivilegios').style.display = 'none';
    return;
  }

  let part = dados.participantes || dados,
      privs = dados.privilegios || [];

  if (Array.isArray(privs) && privs.length === 1 && Array.isArray(privs[0])) privs = privs[0];
  if (privs.length === 1 && typeof privs[0] === 'string' && privs[0].includes(',')) privs = privs[0].split(',').map(p => p.trim());

  part.forEach((linha, idx) => {

    const trInfo = document.createElement('tr'),
          trInfo1 = document.createElement('tr'),
          trInfo2 = document.createElement('tr'),
          trInfo3 = document.createElement('tr'),
          trClas = document.createElement('tr'),
          trDet = document.createElement('tr');

    trDet.dataset.identificadorOriginal = (linha[11] || '').toString().trim();

    linha.slice(0, 2).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trInfo.appendChild(td);
    });

    linha.slice(2, 3).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trInfo1.appendChild(td);
    });

    linha.slice(3, 5).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trInfo2.appendChild(td);
    });

    const dataNasc = linha[8] || '';
    const dataBat  = linha[9] || '';

    const idade = dataNasc ? calcularIdade(dataNasc) : '';
    const anosBat = dataBat ? calcularAnosBatismo(dataBat) : '';

    let td = document.createElement('td');
    td.textContent = dataNasc;
    trInfo3.appendChild(td);

    td = document.createElement('td');
    td.textContent = idade ? idade + ' anos' : '';
    td.style.textAlign = "center";
    trInfo3.appendChild(td);

    td = document.createElement('td');
    td.textContent = dataBat;
    trInfo3.appendChild(td);

    td = document.createElement('td');
    td.textContent = anosBat ? anosBat + ' anos' : '';
    td.style.textAlign = "center";
    trInfo3.appendChild(td);

    linha.slice(5, 8).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trClas.appendChild(td);
    });

    linha.slice(10, 11).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trDet.appendChild(td);
    });

    const tdA = document.createElement('td');
    tdA.style.display = 'flex';
    tdA.style.justifyContent = 'flex-end';
    tdA.style.gap = '10px';

    const btnE = document.createElement('button');
    btnE.textContent = '✏️ Editar';
    btnE.className = 'botao editar';

    const btnS = document.createElement('button');
    btnS.textContent = '💾 Salvar';
    btnS.className = 'botao salvar';
    btnS.style.display = 'none';

    const btnC = document.createElement('button');
    btnC.textContent = '❌ Cancelar';
    btnC.className = 'botao cancel';
    btnC.style.display = 'none';

    const btnX = document.createElement('button');
    btnX.textContent = '🗑️ Excluir';
    btnX.className = 'botao excluir';

    btnE.onclick = () => tornarEditavel([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);
    btnS.onclick = () => salvarAlteracoes([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);
    btnC.onclick = () => cancelarEdicao([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);

    tdA.appendChild(btnE);
    tdA.appendChild(btnS);
    tdA.appendChild(btnC);
    tdA.appendChild(btnX);

    trDet.appendChild(tdA);

    bInfo.appendChild(trInfo);
    bInfo1.appendChild(trInfo1);
    bInfo2.appendChild(trInfo2);
    bInfo3.appendChild(trInfo3);
    bClas.appendChild(trClas);
    bDet.appendChild(trDet);
  });

  tInfo.style.display = 'table';
  tInfo1.style.display = 'table';
  tInfo2.style.display = 'table';
  tInfo3.style.display = 'table';
  tClas.style.display = 'table';
  tDet.style.display = 'table';
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function cadastrarParticipante() {

  const campos = {
    nome: document.getElementById('filtroCadastro'),
    congregacao: document.getElementById('congregacao'),
    telefone: document.getElementById('telefone'),
    temPeticao: document.getElementById('temPeticao'),
    email: document.getElementById('email'),
    estaNoZap: document.getElementById('estaNoZap'),
    sexo: document.getElementById('sexo'),
    situacao: document.getElementById('situacao'),

    dataNascimento: document.getElementById('dataNascimento'),
    idade: document.getElementById('idade'),
    dataBatismo: document.getElementById('dataBatismo'),
    anosBatismo: document.getElementById('anosBatismo')
  };

  const dados = {
    nome: campos.nome.value.trim(),
    congregacao: campos.congregacao.value.trim(),
    telefone: campos.telefone.value.trim(),
    temPeticao: campos.temPeticao.value,
    email: campos.email.value.trim(),
    estaNoZap: campos.estaNoZap.value,
    sexo: campos.sexo.value,
    situacao: campos.situacao.value,
    dataNascimento: campos.dataNascimento.value,
    idade: campos.idade.value,
    dataBatismo: campos.dataBatismo.value,
    anosBatismo: campos.anosBatismo.value
  };

  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
  });

  let camposVazios = Object.entries(dados)
    .filter(([_, valor]) => !valor)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Atenção! Preencha todos os campos!");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const telefoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;
  if (!telefoneRegex.test(dados.telefone)) {
    mostrarAlertaGlobal("⚠️ Telefone inválido. Use o formato: (11) 99217-3945");
    campos.telefone.classList.add("erro-campo");
    campos.telefone.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dados.email)) {
    mostrarAlertaGlobal("⚠️ E-mail inválido.");
    campos.email.classList.add("erro-campo");
    campos.email.focus();
    return;
  }

  mostrarSpinner();

  const cb = "cb_cadastrarParticipante_" + Date.now();

  window[cb] = function(resposta) {

    esconderSpinner();

    mostrarAlertaGlobal("✅ Participante cadastrado com sucesso!");

    document.getElementById("formParticipante").reset();
    carregarOpcoes();

    Object.values(campos).forEach(el => el.classList.remove("erro-campo"));

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=salvarCadastroParticipante" +
    "&dados=" + encodeURIComponent(JSON.stringify(dados)) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

document.getElementById("telefone").addEventListener("input", function (e) {
  let input = e.target.value.replace(/\D/g, "").substring(0, 11);
  let formatted = "";

  if (input.length > 0) formatted += "(" + input.substring(0, 2);
  if (input.length >= 3) formatted += ") " + input.substring(2, 7);
  if (input.length >= 8) formatted += "-" + input.substring(7, 11);

  e.target.value = formatted;
});

function parseDataBR(dataTexto) {
  if (!dataTexto) return null;

  const partes = dataTexto.split("/");
  if (partes.length !== 3) return null;

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);

  return new Date(ano, mes, dia);
}

function calcularIdade(dataTexto) {
  const nasc = parseDataBR(dataTexto);
  if (!nasc || isNaN(nasc)) return "";

  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();

  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

  return idade;
}

function calcularAnosBatismo(dataTexto) {
  const bat = parseDataBR(dataTexto);
  if (!bat || isNaN(bat)) return "";

  const hoje = new Date();
  let anos = hoje.getFullYear() - bat.getFullYear();

  const m = hoje.getMonth() - bat.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < bat.getDate())) anos--;

  return anos;
}

function validarData(input) {

  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 8) valor = valor.slice(0, 8);

  if (valor.length > 4) {
    valor = valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4);
  } else if (valor.length > 2) {
    valor = valor.slice(0, 2) + "/" + valor.slice(2);
  }

  input.value = valor;

  if (valor.length === 10) {
    if (!dataValida(valor)) {
      input.style.borderColor = "red";
    } else {
      input.style.borderColor = "";
      atualizarCamposDerivados(input.id, valor);
    }
  } else {
    input.style.borderColor = "";
  }
}

function dataValida(data) {
  const partes = data.split("/");
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);

  const dt = new Date(ano, mes, dia);

  return (
    dt.getFullYear() === ano &&
    dt.getMonth() === mes &&
    dt.getDate() === dia
  );
}

function atualizarCamposDerivados(campoId, data) {

  const [dia, mes, ano] = data.split("/").map(Number);
  const hoje = new Date();

  let anos = hoje.getFullYear() - ano;

  if (
    hoje.getMonth() < mes - 1 ||
    (hoje.getMonth() === mes - 1 && hoje.getDate() < dia)
  ) {
    anos--;
  }

  if (campoId === "dataNascimento") {
    document.getElementById("idade").value = anos >= 0 ? anos : "";
  }

  if (campoId === "dataBatismo") {
    document.getElementById("anosBatismo").value = anos >= 0 ? anos : "";
  }
}

document.getElementById("dataNascimento").addEventListener("change", () => {
  document.getElementById("idade").value =
    calcularIdade(document.getElementById("dataNascimento").value);
});

document.getElementById("dataBatismo").addEventListener("change", () => {
  document.getElementById("anosBatismo").value =
    calcularAnosBatismo(document.getElementById("dataBatismo").value);
});

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function abrirNovoPonto() {

  const prefixoInput = document.getElementById('prefixo');
  const numeroInput = document.getElementById('numero');

  const prefixo = prefixoInput.value.toUpperCase();
  const numero = numeroInput.value;

  let valid = true;

  prefixoInput.classList.remove('erro-campo');
  numeroInput.classList.remove('erro-campo');

  if (!prefixo) {
    prefixoInput.classList.add('erro-campo');
    valid = false;
  }

  if (!numero) {
    numeroInput.classList.add('erro-campo');
    valid = false;
  }

  if (!valid) {
    mostrarAlertaGlobal("⚠️ Por favor, preencha ambos os campos: Turno e Número.");
    return;
  }

  mostrarSpinner();

  const cb = "cb_abrirNovoPonto_" + Date.now();

  window[cb] = function(res) {

    esconderSpinner();

    prefixoInput.classList.remove('erro-campo');
    numeroInput.classList.remove('erro-campo');

    if (res && res.erro) {
      mostrarAlertaGlobal("❌ " + res.mensagem);
    } else {
      mostrarAlertaGlobal("✅ " + res.mensagem);
    }

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=criarTabelaManual" +
    "&prefixo=" + encodeURIComponent(prefixo) +
    "&numero=" + encodeURIComponent(numero) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

let participantesEncontrados = [];

function buscarParticipantes() {

  const campos = {
    dia: document.getElementById('diasSelect'),
    turno: document.getElementById('turnosSelect'),
    frequencia: document.getElementById('frequenciasSelect')
  };

  const msg = document.getElementById("msgPesqDisponiveis");

  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
  });

  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Por favor, selecione dia, turno e frequência.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;
  const frequencia = campos.frequencia.value;

  const diasTurnos = [`${dia} - ${turno}`];
  const frequencias = [frequencia];

  const resultadoDiv = document.getElementById('resultadoBusca');
  resultadoDiv.textContent = '';

  mostrarSpinner();

  const cb = "cb_buscarParticipantes_" + Date.now();

  window[cb] = function(participantes) {

    esconderSpinner();

    Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

    participantesEncontrados = participantes;

    if (!participantes || participantes.length === 0) {
      mostrarAlertaGlobal("❌ Nenhum participante encontrado.");
      resultadoDiv.textContent = '';
      delete window[cb];
      return;
    }

    msg.textContent = `✅ ${participantes.length} participante(s) encontrado(s).`;

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();

    ['Nome Completo', 'Condição', 'Frequência', 'Dias e Turnos Disponíveis']
      .forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        trHead.appendChild(th);
      });

    const tbody = tabela.createTBody();

    participantes.forEach(p => {
      const tr = tbody.insertRow();

      const tdNome = tr.insertCell();
      const nome = p.nomeCompleto || '';
      const linhas = nome.split('\n');

      if (linhas.length > 0) {
        const nomeFormatado =
          `<strong>${linhas[0]}</strong>` +
          (linhas.length > 1 ? '<br>' + linhas.slice(1).join('<br>') : '');
        tdNome.innerHTML = nomeFormatado;
      } else {
        tdNome.textContent = nome;
      }

      tdNome.classList.add('clicavel-nome');
      tdNome.style.cursor = 'pointer';
      tdNome.style.color = 'green';
      tdNome.title = 'Clique para interagir';

      tr.insertCell().textContent = p.condicao || '';
      tr.insertCell().textContent = p.frequencia || '';
      tr.insertCell().textContent = (p.diasTurnos || []).join(", ");
    });

    resultadoDiv.appendChild(tabela);

    document.getElementById('dadosUsuarioContainer').style.display = 'inline-block';
    document.getElementById('enviarEmailTodosBtn').style.display = 'inline-block';

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarParticipantesPorFiltroAvancado" +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&frequencias=" + encodeURIComponent(JSON.stringify(frequencias)) +
    "&callback=" + cb;

  document.body.appendChild(script);
}


// clique em participante
document.addEventListener('click', function (event) {

  const alvo = event.target.closest('.clicavel-nome');
  if (!alvo) return;

  mostrarSpinner();

  const nome = alvo.innerText.trim();

  const campos = {
    dia: document.getElementById('diasSelect'),
    turno: document.getElementById('turnosSelect'),
    frequencia: document.getElementById('frequenciasSelect'),
    ponto: document.getElementById('pontosParaOferecerSelect'),
    equipamento: document.getElementById('equipamentosParaOferecerSelect'),
    necessidade: document.getElementById('necessidade')
  };

  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
  });

  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    esconderSpinner();
    mostrarAlertaGlobal("⚠️ Por favor, preencha todos os campos antes de enviar a mensagem.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;
  const frequencia = campos.frequencia.value;
  const ponto = campos.ponto.value;
  const equipamento = campos.equipamento.value;
  const necessidade = campos.necessidade.value;

  const mensagem =
    "*DESIGNAÇÃO NO TPE*\n\n" +
    "Olá querido(a) irmão(ã). Temos uma designação para você no TPE que está de acordo com sua disponibilidade atual.\n\n" +
    "Informações da designação:\n\n" +
    `🛠️ *Necessidade* ${necessidade}\n` +
    `📍 *${ponto}*\n` +
    `📆 *Dia:* ${dia}\n` +
    `🕒 *Turno:* ${turno}\n` +
    `📈 *Frequência:* ${frequencia}\n` +
    `📚 *Mostruário:* ${equipamento}\n\n` +
    "Aguardamos sua confirmação para esta designação. Se puder aceitar, ficaremos muito gratos e felizes.";

  const alvoFix = alvo;
  alvo.classList.remove('clicavel-nome');

  const cb = "cb_whatsapp_" + Date.now();

  window[cb] = function(url) {

    esconderSpinner();

    Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

    window.open(url, '_blank');

    alvoFix.style.color = 'gray';
    alvoFix.style.fontStyle = 'italic';
    alvoFix.innerHTML += ' <span title="Mensagem enviada">📤</span>';

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarNumeroWhatsAppPorNomeComMensagem" +
    "&nome=" + encodeURIComponent(nome) +
    "&mensagem=" + encodeURIComponent(mensagem) +
    "&callback=" + cb;

  document.body.appendChild(script);
});


// enviar email todos
document.getElementById('enviarEmailTodosBtn').addEventListener('click', function () {

  if (!participantesEncontrados || participantesEncontrados.length === 0) {
    mostrarAlertaGlobal("⚠️ Nenhum participante disponível para envio de e-mail.");
    return;
  }

  const campos = {
    dia: document.getElementById('diasSelect'),
    turno: document.getElementById('turnosSelect'),
    frequencia: document.getElementById('frequenciasSelect'),
    ponto: document.getElementById('pontosParaOferecerSelect'),
    equipamento: document.getElementById('equipamentosParaOferecerSelect'),
    necessidade: document.getElementById('necessidade'),
    nomeUsuarioAtual: document.getElementById('nomeSelectUsuario'),
    telefone: document.getElementById('telefoneInputUsuario'),
    email: document.getElementById('emailInputUsuario')
  };

  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
  });

  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value || !el.value.trim())
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Por favor, preencha todos os campos antes de enviar o e-mail.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;
  const frequencia = campos.frequencia.value;
  const ponto = campos.ponto.value;
  const equipamento = campos.equipamento.value;
  const necessidade = campos.necessidade.value;
  const nomeUsuarioAtual = campos.nomeUsuarioAtual.value;
  const telefone = campos.telefone.value.trim();
  const email = campos.email.value.trim();

  const assunto = "Designação no TPE";

  const mensagem =
    "Olá querido(a) irmão(ã),\n\n" +
    "Temos uma designação para você no TPE, de acordo com sua disponibilidade atual.\n\n" +
    "Necessidade: " + necessidade + "\n" +
    "Local: " + ponto + "\n" +
    "Dia: " + dia + "\n" +
    "Turno: " + turno + "\n" +
    "Frequência: " + frequencia + "\n" +
    "Mostruário: " + equipamento + "\n\n" +
    "Aguardamos sua confirmação. Se puder aceitar, ficaremos muito felizes!\n\n";

  mostrarConfirmacaoGlobal(
    `📧 Deseja enviar e-mail para aqueles dentre os <strong>${participantesEncontrados.length}</strong> disponíveis encontrados cujo sexo combine com a necessidade?`,
    () => {

      mostrarSpinner();

      const nomes = participantesEncontrados.map(p => p.nomeCompleto);

      const cb = "cb_email_" + Date.now();

      window[cb] = function() {

        esconderSpinner();

        Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

        document.getElementById('dadosUsuarioContainer').style.display = 'none';
        document.getElementById('enviarEmailTodosBtn').style.display = 'none';

        mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");

        delete window[cb];
      };

      const script = document.createElement("script");

      script.src =
        API_URL +
        "?acao=buscarEmailsPorNomesEEnviarMensagem" +
        "&nomes=" + encodeURIComponent(JSON.stringify(nomes)) +
        "&nomeUsuarioAtual=" + encodeURIComponent(nomeUsuarioAtual) +
        "&assunto=" + encodeURIComponent(assunto) +
        "&mensagem=" + encodeURIComponent(mensagem) +
        "&necessidade=" + encodeURIComponent(necessidade) +
        "&callback=" + cb;

      document.body.appendChild(script);
    }
  );
});


// contatos usuário
document.getElementById('nomeInputUsuario').addEventListener('input', function () {

  setTimeout(() => {
    const nomeSelecionado = document.getElementById('nomeSelectUsuario').value;

    if (nomeSelecionado) {
      pegarContatosDoUsuario(nomeSelecionado);
    }
  }, 300);

});


function pegarContatosDoUsuario(nome) {

  mostrarSpinner();

  const cb = "cb_contato_" + Date.now();

  window[cb] = function(contato) {

    esconderSpinner();

    if (contato) {
      const telefoneInput = document.getElementById('telefoneInputUsuario');
      const emailInput = document.getElementById('emailInputUsuario');
      const nomeSelect = document.getElementById('nomeSelectUsuario');

      telefoneInput.value = contato.telefone || '';
      emailInput.value = contato.email || '';

      telefoneInput.disabled = true;
      emailInput.disabled = true;
      nomeSelect.disabled = true;

      const container = document.querySelector('#dadosUsuarioContainer > div[style*="display: none"]');
      if (container) container.style.display = 'block';

    }

    delete window[cb];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=pegarContatoUsuario" +
    "&nome=" + encodeURIComponent(nome) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

let participantesEncontrados2h = [];

function buscarParticipantes2h() {

  const campos = {
    dia: document.getElementById('diasSelect2h'),
    turno: document.getElementById('turnosSelect2h'),
    frequencia: document.getElementById('frequenciasSelect2h')
  };

  const msg = document.getElementById("msgPesqDisponiveis2h");

  // 🔹 Remove marcações de erro anteriores
  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', function () {
      el.classList.remove('erro-campo');
    }, { once: true });

    el.addEventListener('change', function () {
      el.classList.remove('erro-campo');
    }, { once: true });
  });

  // 🔍 Verifica se há algum campo vazio
  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Por favor, selecione dia, turno e frequência.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;
  const frequencia = campos.frequencia.value;

  const diasTurnos = [`${dia} - ${turno}`];
  const frequencias = [frequencia];

  const resultadoDiv = document.getElementById('resultadoBusca2h');

  resultadoDiv.textContent = '';
  mostrarSpinner();

  google.script.run
    .withSuccessHandler(participantes => {

      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

      participantesEncontrados2h = participantes;

      esconderSpinner();

      if (!participantes || participantes.length === 0) {
        mostrarAlertaGlobal("❌ Nenhum participante encontrado.");
        resultadoDiv.textContent = '';
        return;
      }

      msg.textContent = `✅ ${participantes.length} participante(s) encontrado(s).`;

      const tabela = document.createElement('table');
      tabela.classList.add('tabela-listagem');

      const thead = tabela.createTHead();
      const trHead = thead.insertRow();

      ['Nome Completo', 'Condição', 'Frequência', 'Dias e Turnos Disponíveis']
        .forEach(text => {
          const th = document.createElement('th');
          th.textContent = text;
          trHead.appendChild(th);
        });

      const tbody = tabela.createTBody();

      participantes.forEach(p => {
        const tr = tbody.insertRow();

        const tdNome = tr.insertCell();
        const nome = p.nomeCompleto || '';
        const linhas = nome.split('\n');

        if (linhas.length > 0) {
          const nomeFormatado = `<strong>${linhas[0]}</strong>` +
            (linhas.length > 1 ? '<br>' + linhas.slice(1).join('<br>') : '');
          tdNome.innerHTML = nomeFormatado;
        } else {
          tdNome.textContent = nome;
        }

        tdNome.classList.add('clicavel-nome2h');
        tdNome.style.cursor = 'pointer';
        tdNome.style.color = 'green';
        tdNome.title = 'Clique para interagir';

        tr.insertCell().textContent = p.condicao || '';
        tr.insertCell().textContent = p.frequencia || '';
        tr.insertCell().textContent = (p.diasTurnos || []).join(", ");
      });

      resultadoDiv.appendChild(tabela);

      document.getElementById('dadosUsuarioContainer2h').style.display = 'inline-block';
      document.getElementById('enviarEmailTodosBtn2h').style.display = 'inline-block';

    })
    .withFailureHandler(err => {
      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro na busca: " + err.message);
      resultadoDiv.textContent = '';
    })
    .buscarParticipantesPorFiltroAvancado2h({ diasTurnos, frequencias });
}

document.addEventListener('click', function (event) {
  const alvo = event.target.closest('.clicavel-nome2h');
  if (alvo) {
    mostrarSpinner();
    const nome = alvo.innerText.trim();

    const campos = {
      dia: document.getElementById('diasSelect2h'),
      turno: document.getElementById('turnosSelect2h'),
      frequencia: document.getElementById('frequenciasSelect2h'),
      ponto: document.getElementById('pontosParaOferecerSelect2h'),
      equipamento: document.getElementById('equipamentosParaOferecerSelect2h'),
      necessidade: document.getElementById('necessidade2h')
    };

    Object.values(campos).forEach(el => {
      el.classList.remove('erro-campo');

      el.addEventListener('change', function () {
        el.classList.remove('erro-campo');
      }, { once: true });

      el.addEventListener('input', function () {
        el.classList.remove('erro-campo');
      }, { once: true });
    });

    const camposVazios = Object.entries(campos)
      .filter(([_, el]) => !el.value)
      .map(([chave]) => chave);

    if (camposVazios.length > 0) {
      esconderSpinner();
      mostrarAlertaGlobal("⚠️ Por favor, preencha todos os campos antes de enviar a mensagem.");
      camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
      return;
    }

    const dia = campos.dia.value;
    const turno = campos.turno.value;
    const frequencia = campos.frequencia.value;
    const ponto = campos.ponto.value;
    const equipamento = campos.equipamento.value;
    const necessidade = campos.necessidade.value;

    const mensagem =
      "*DESIGNAÇÃO NO TPE*\n\n" +
      "Olá querido(a) irmão(ã). Temos uma designação para você no TPE que está de acordo com sua disponibilidade atual.\n\n" +
      "Informações da designação:\n\n" +
      `🛠️ *Necessidade* ${necessidade}\n` +
      `📍 *${ponto}*\n` +
      `📆 *Dia:* ${dia}\n` +
      `🕒 *Turno:* ${turno}\n` +
      `📈 *Frequência:* ${frequencia}\n` +
      `📚 *Mostruário:* ${equipamento}\n\n` +
      "Aguardamos sua confirmação para esta designação. Se puder aceitar, ficaremos muito gratos e felizes.";

    const mensagemCodificada = encodeURIComponent(mensagem);

    alvo.classList.remove('clicavel-nome2h');

    google.script.run
      .withSuccessHandler(function (url) {
        esconderSpinner();

        Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

        window.open(url, '_blank');

        alvo.style.color = 'gray';
        alvo.style.fontStyle = 'italic';
        alvo.innerHTML += ' <span title="Mensagem enviada">📤</span>';
      })
      .withFailureHandler(function (error) {
        esconderSpinner();

        Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

        mostrarAlertaGlobal("❌ Erro: " + error.message);

        alvo.classList.add('clicavel-nome2h');
      })
      .buscarNumeroWhatsAppPorNomeComMensagem(nome, mensagemCodificada);
  }
});

document.getElementById('enviarEmailTodosBtn2h').addEventListener('click', function () {

  if (!participantesEncontrados2h || participantesEncontrados2h.length === 0) {
    mostrarAlertaGlobal("⚠️ Nenhum participante disponível para envio de e-mail.");
    return;
  }

  const campos = {
    dia: document.getElementById('diasSelect2h'),
    turno: document.getElementById('turnosSelect2h'),
    frequencia: document.getElementById('frequenciasSelect2h'),
    ponto: document.getElementById('pontosParaOferecerSelect2h'),
    equipamento: document.getElementById('equipamentosParaOferecerSelect2h'),
    necessidade: document.getElementById('necessidade2h'),
    nomeUsuarioAtual: document.getElementById('nomeSelectUsuario2h'),
    telefone: document.getElementById('telefoneInputUsuario2h'),
    email: document.getElementById('emailInputUsuario2h')
  };

  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');

    el.addEventListener('input', function () {
      el.classList.remove('erro-campo');
    }, { once: true });

    el.addEventListener('change', function () {
      el.classList.remove('erro-campo');
    }, { once: true });
  });

  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value || !el.value.trim())
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Por favor, preencha todos os campos antes de enviar o e-mail.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;
  const frequencia = campos.frequencia.value;
  const ponto = campos.ponto.value;
  const equipamento = campos.equipamento.value;
  const necessidade = campos.necessidade.value;
  const nomeUsuarioAtual = campos.nomeUsuarioAtual.value;
  const telefone = campos.telefone.value.trim();
  const email = campos.email.value.trim();

  const assunto = "Designação no TPE";
  const mensagem =
    "Olá querido(a) irmão(ã),\n\n" +
    "Temos uma designação para você no TPE, de acordo com sua disponibilidade atual.\n\n" +
    "Necessidade: " + necessidade + "\n" +
    "Local: " + ponto + "\n" +
    "Dia: " + dia + "\n" +
    "Turno: " + turno + "\n" +
    "Frequência: " + frequencia + "\n" +
    "Mostruário: " + equipamento + "\n\n" +
    "Aguardamos sua confirmação. Se puder aceitar, ficaremos muito felizes!\n\n";

  mostrarConfirmacaoGlobal(
    `📧 Deseja enviar e-mail para aqueles dentre os <strong>${participantesEncontrados2h.length}</strong> disponíveis encontrados cujo sexo combine com a necessidade?`,
    () => {

      mostrarSpinner();

      const nomes =
        participantesEncontrados2h.map(p => p.nomeCompleto);

      google.script.run
        .withSuccessHandler(() => {

          esconderSpinner();

          Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

          document.getElementById('dadosUsuarioContainer2h').style.display = 'none';
          document.getElementById('enviarEmailTodosBtn2h').style.display = 'none';

          mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");
        })
        .withFailureHandler(err => {

          esconderSpinner();

          Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

          mostrarAlertaGlobal("❌ Erro ao enviar e-mails: " + err.message);
        })
        .buscarEmailsPorNomesEEnviarMensagem(
          nomes,
          nomeUsuarioAtual,
          assunto,
          mensagem,
          necessidade
        );
    }
  );
});

document.getElementById('nomeInputUsuario2h').addEventListener('input', function () {

  setTimeout(() => {
    const nomeSelecionado = document.getElementById('nomeSelectUsuario2h').value;

    if (nomeSelecionado) {
      pegarContatosDoUsuario2h(nomeSelecionado);
    }
  }, 300);
});

function pegarContatosDoUsuario2h(nome) {
  mostrarSpinner();

  google.script.run
    .withSuccessHandler(function (contato) {
      esconderSpinner();

      if (contato) {
        const telefoneInput = document.getElementById('telefoneInputUsuario2h');
        const emailInput = document.getElementById('emailInputUsuario2h');
        const nomeSelect = document.getElementById('nomeSelectUsuario2h');

        telefoneInput.value = contato.telefone || '';
        emailInput.value = contato.email || '';

        telefoneInput.disabled = true;
        emailInput.disabled = true;
        nomeSelect.disabled = true;

        const container = document.querySelector('#dadosUsuarioContainer2h');
        if (container) container.style.display = 'block';

      } else {
        esconderSpinner();
      }
    })
    .withFailureHandler(function (erro) {
      esconderSpinner();
      console.error("❌ Erro:", erro.message);
    })
    .pegarContatoUsuario(nome);
}

