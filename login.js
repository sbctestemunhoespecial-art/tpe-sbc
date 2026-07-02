const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function apiJSONP(acao, parametros = {}, callback) {

  const callbackName =
    "cb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

  window[callbackName] = function(resposta) {

    callback(resposta);

    delete window[callbackName];

    script.remove();

  };

  const query = new URLSearchParams({
    acao,
    ...parametros,
    callback: callbackName
  });

  const script = document.createElement("script");

  script.src = API_URL + "?" + query.toString();

  document.body.appendChild(script);

}

function abrirTela(idTela, card = null) {

    if (telaAtual) {
        historico.push(telaAtual);
    }

    // Esconde tudo
    document.querySelectorAll('.tela').forEach(el => {
        el.classList.remove('aberta');
    });

    // Mostra apenas a tela desejada
    document.getElementById(idTela)
        ?.classList.add('aberta');

    telaAtual = idTela;

    document.querySelectorAll('.card-menu')
        .forEach(c => c.classList.remove('ativo'));

    //atualizarBotaoVoltar();
}

function voltar() {

  console.log("ENTREI NA FUNÇÃO VOLTAR");

  console.log("Histórico:", historico);
  console.log("Tela recuperada:", telaAtual);

    if (historico.length === 0) return;

    document.querySelectorAll('.tela').forEach(el => {
        el.classList.remove('aberta');
    });

    telaAtual = historico.pop();

    // ==========================
    // LIMPA OS SWITCHES DE 2H/4H
    // ==========================
    [
        "tipoDisponibilidade2h",
        "tipoDisponibilidade4h"
    ].forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.checked = false;
        }

    });

    console.log("Tela recuperada:", telaAtual);

    document.getElementById(telaAtual)
        ?.classList.add('aberta');

    // ==========================
    // Carrega os dados da tela
    // ==========================
    switch (telaAtual) {

      case "telaUsuarioLogado":
        atualizarCondicaoDisponibilidadeUsuario(idUsuarioLogado)
        break;

    }

    atualizarBotaoVoltar();
}

function atualizarBotaoVoltar() {

    const btnVoltar = document.getElementById('btnVoltarMenu');

    if (!btnVoltar) return;

    if (historico.length === 0) {

        btnVoltar.classList.add('oculto');

    } else {

        btnVoltar.classList.remove('oculto');

        const destino = historico[historico.length - 1];

        btnVoltar.innerHTML =
            destino === 'menuCards'
                ? '👈 Início'
                : '👈 Voltar';

    }

}

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

/*let perfilUsuario = null;
let idUsuarioLogado = null;*/
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

      //document.getElementById("menuBtn").style.display = "inline-block";
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

    //document.getElementById("menuBtn").style.display = "inline-block";
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
 
function pesquisarParticipantesSemDisponibilidade() {

  mostrarSpinner();

  /*const callback = "cb_semdisp_" + Date.now();

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

  document.body.appendChild(script);*/
  apiJSONP(
    "buscarParticipantesSemDisponibilidade",
    {},
    function(resultado) {

      esconderSpinner();

      participantesSemDisponibilidade = resultado || [];

      preencherTabelaSemDisponibilidade();

    }
  );
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
      //"https://maps.googleapis.com/maps/api/js?key=AIzaSyDYnIBhSeL0_SmimlgDn8Ube3jS6uporHg&callback=initMap";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    mapScriptLoaded = true;
  } else {
    initMap();
  }
}

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

/*document.getElementById("telefone").addEventListener("input", function (e) {
  let input = e.target.value.replace(/\D/g, "").substring(0, 11);
  let formatted = "";

  if (input.length > 0) formatted += "(" + input.substring(0, 2);
  if (input.length >= 3) formatted += ") " + input.substring(2, 7);
  if (input.length >= 8) formatted += "-" + input.substring(7, 11);

  e.target.value = formatted;
});*/

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

let substitutosEncontrados = [];

function buscarParticipantesSub() {

  const campos = {
    dia: document.getElementById('diasSelectSub'),
    turno: document.getElementById('turnosSelectSub'),
  };

  const msg = document.getElementById("msgPesqDisponiveisSub");
  const data = document.getElementById('dataSelectSub').value;

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

  const resultadoDiv = document.getElementById('resultadoBuscaSub');

  const diasTurnos = [`${dia} - ${turno}`];
  const datas = [data];

  resultadoDiv.textContent = '';
  mostrarSpinner();

  const cb = "cb_sub_" + Date.now();

  window[cb] = function(participantes) {

    Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

    substitutosEncontrados = participantes;

    esconderSpinner();

    if (!participantes || participantes.length === 0) {
      mostrarAlertaGlobal("❌ Nenhum participante encontrado.");
      resultadoDiv.textContent = '';
      delete window[cb];
      return;
    }

    msg.textContent = `✅ ${participantes.length} substituto(s) encontrado(s).`;

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();

    ['Nome Completo', 'Condição', 'Dias e Turnos Disponíveis'].forEach(text => {
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
        tdNome.innerHTML =
          `<strong>${linhas[0]}</strong>` +
          (linhas.length > 1 ? '<br>' + linhas.slice(1).join('<br>') : '');
      } else {
        tdNome.textContent = nome;
      }

      tdNome.classList.add('clicavel-nomeSub');
      tdNome.style.cursor = 'pointer';
      tdNome.style.color = 'green';
      tdNome.title = 'Clique para interagir';

      tr.insertCell().textContent = p.condicao || '';
      tr.insertCell().textContent = (p.diasTurnos || []).join(", ");
    });

    resultadoDiv.appendChild(tabela);
    document.getElementById('dadosUsuarioContainerSb').style.display = 'inline-block';
    document.getElementById('enviarEmailSbTodosBtn').style.display = 'inline-block';

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarParticipantesPorFiltroAvancadoSub" +
    "&diasTurnos=" + encodeURIComponent(JSON.stringify(diasTurnos)) +
    "&datas=" + encodeURIComponent(JSON.stringify(datas)) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

document.addEventListener('click', function (event) {

  const alvo = event.target.closest('.clicavel-nomeSub');
  if (!alvo) return;

  mostrarSpinner();

  const nome = alvo.innerText.trim();

  const campos = {
    dia: document.getElementById('diasSelectSub'),
    turno: document.getElementById('turnosSelectSub'),
    data: document.getElementById('dataSelectSub'),
    ponto: document.getElementById('pontosParaOferecerSelectSub'),
    equipamento: document.getElementById('equipamentosParaOferecerSelectSub'),
    necessidade: document.getElementById('necessidadeSub')
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
  const data = campos.data.value;
  const ponto = campos.ponto.value;
  const equipamento = campos.equipamento.value;
  const necessidade = campos.necessidade.value;

  const mensagem =
    "*SUBSTITUIÇÃO NO TPE*\n\n" +
    "Olá querido(a) irmão(ã). Precisamos de uma *substituição* no TPE. Vimos que sua disponibilidade combina com esta necessidade, e gostaríamos de saber se pode ajudar.\n\n" +
    "Informações da substituição:\n\n" +
    `🛠️ *Necessidade:* ${necessidade}\n` +
    `📍 *${ponto}*\n` +
    `📆 *Dia:* ${dia} (Data _*${data}*_)\n` +
    `🕒 *Turno:* ${turno}\n` +
    `📚 *Mostruário:* ${equipamento}\n\n` +
    "Aguardamos sua confirmação para a substituição. Se puder aceitar, ficaremos muito gratos e felizes.";

  const mensagemCodificada = encodeURIComponent(mensagem);

  alvo.classList.remove('clicavel-nomeSub');

  const cb = "cb_wpp_" + Date.now();

  window[cb] = function(url) {

    Object.values(campos).forEach(el => el.classList.remove('erro-campo'));
    esconderSpinner();

    window.open(url, '_blank');

    alvo.style.color = 'gray';
    alvo.style.fontStyle = 'italic';
    alvo.innerHTML += ' <span title="Mensagem enviada">📤</span>';

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarNumeroWhatsAppPorNomeComMensagem" +
    "&nome=" + encodeURIComponent(nome) +
    "&mensagem=" + encodeURIComponent(mensagemCodificada) +
    "&callback=" + cb;

  document.body.appendChild(script);
});

document.getElementById('enviarEmailSbTodosBtn').addEventListener('click', function () {

  if (!substitutosEncontrados || substitutosEncontrados.length === 0) {
    mostrarAlertaGlobal("⚠️ Nenhum substituto disponível para envio de e-mail.");
    return;
  }

  const campos = {
    dia: document.getElementById('diasSelectSub'),
    turno: document.getElementById('turnosSelectSub'),
    data: document.getElementById('dataSelectSub'),
    ponto: document.getElementById('pontosParaOferecerSelectSub'),
    equipamento: document.getElementById('equipamentosParaOferecerSelectSub'),
    necessidade: document.getElementById('necessidadeSub'),
    nomeUsuarioAtual: document.getElementById('nomeSelectUsuarioSb'),
    telefone: document.getElementById('telefoneInputUsuarioSb'),
    email: document.getElementById('emailInputUsuarioSb')
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
  const data = campos.data.value;
  const ponto = campos.ponto.value;
  const equipamento = campos.equipamento.value;
  const necessidade = campos.necessidade.value;
  const nomeUsuarioAtual = campos.nomeUsuarioAtual.value;

  const assunto = "Substituição no TPE";

  const mensagem =
    "Olá querido(a) irmão(ã),\n\n" +
    "Precisamos de uma substituição no TPE. Vimos que sua disponibilidade combina com esta necessidade, e gostaríamos de saber se pode ajudar.\n\n" +
    "Necessidade: " + necessidade + "\n" +
    "Local: " + ponto + "\n" +
    "Dia: " + dia + " (Data " + data + ")\n" +
    "Turno: " + turno + "\n" +
    "Mostruário: " + equipamento + "\n\n" +
    "Aguardamos sua confirmação. Se puder aceitar, ficaremos muito felizes!\n\n";

  mostrarConfirmacaoGlobal(
    `📧 Deseja enviar e-mail para aqueles dentre os <strong>${substitutosEncontrados.length}</strong> substitutos encontrados cujo sexo combine com a necessidade?`,
    () => {

      mostrarSpinner();

      const nomes = substitutosEncontrados.map(p => p.nomeCompleto);

      const cb = "cb_email_" + Date.now();

      window[cb] = function() {

        Object.values(campos).forEach(el => el.classList.remove('erro-campo'));
        esconderSpinner();

        document.getElementById('dadosUsuarioContainerSb').style.display = 'none';
        document.getElementById('enviarEmailSbTodosBtn').style.display = 'none';

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

document.getElementById('nomeInputUsuarioSb').addEventListener('input', function () {

  setTimeout(() => {

    const nomeSelecionado = document.getElementById('nomeSelectUsuarioSb').value;

    if (!nomeSelecionado) return;

    pegarContatosDoUsuarioSb(nomeSelecionado);

  }, 300);
});

function pegarContatosDoUsuarioSb(nome) {

  mostrarSpinner();

  const cb = "cb_contato_" + Date.now();

  window[cb] = function(contato) {

    esconderSpinner();

    if (contato) {

      const telefoneInput = document.getElementById('telefoneInputUsuarioSb');
      const emailInput = document.getElementById('emailInputUsuarioSb');
      const nomeSelect = document.getElementById('nomeSelectUsuarioSb');

      telefoneInput.value = contato.telefone || '';
      emailInput.value = contato.email || '';

      telefoneInput.disabled = true;
      emailInput.disabled = true;
      nomeSelect.disabled = true;

      const container = document.querySelector('#dadosUsuarioContainerSb > div[style*="display: none"]');
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

  // Delegação para remover tabela
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnRemoverTabela")) {
      const tabela = e.target.closest("table");
      if (tabela.id === "tabela1") {
        mostrarAlertaGlobal("⚠️ Atenção! A primeira tabela não pode ser removida.");
        return;
      }
      tabela.remove();
    }
  });

  // Delegação para adicionar turno dentro de uma tabela
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnAddTurno")) {
      const tabela = e.target.closest("table");
      const tbody = tabela.querySelector("tbody");
      const numeroTurno = tbody.querySelectorAll("tr").length + 1;

      const novaLinha = document.createElement("tr");
      novaLinha.innerHTML = `
        <td class="turno-label">Turno ${numeroTurno}</td>
        <td><input type="time" name="inicio" required></td>
        <td><input type="time" name="fim" required></td>
        <td><input type="number" name="vagas" min="0" placeholder="0"></td>
        <td><button type="button" class="btnRemoverTurno">🗑️</button></td>
      `;
      tbody.appendChild(novaLinha);

      atualizarNumeracaoTurnosTabela(tabela);
    }
  });

  // Delegação para remover turno (dinâmico)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnRemoverTurno")) {
      const tabela = e.target.closest("table");
      const tbody = tabela.querySelector("tbody");

      if (tbody.querySelectorAll("tr").length > 1) {
        e.target.closest("tr").remove();
        atualizarNumeracaoTurnosTabela(tabela);
      } else {
        mostrarAlertaGlobal("⚠️ Atenção! Pelo menos um turno deve ser mantido.");
      }
    }
  });

  function atualizarNumeracaoTurnosTabela(tabela) {
    const linhas = tabela.querySelectorAll("tbody tr");
    linhas.forEach((linha, index) => {
      const label = linha.querySelector(".turno-label");
      if (label) label.textContent = `Turno ${index + 1}`;
    });
  }

  function atualizarNumeracaoTurnos() {
    const linhas = document.querySelectorAll("#tbodyTurnos1 tr");
    linhas.forEach((linha, index) => {
      const label = linha.querySelector(".turno-label");
      if (label) label.textContent = `Turno ${index + 1}`;
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btnRemoverTurno")) {
      const tbody = document.getElementById("tbodyTurnos1");
      const linha = e.target.closest("tr");

      if (tbody.querySelectorAll("tr").length > 1) {
        linha.remove();
        atualizarNumeracaoTurnos();
      } else {
        mostrarAlertaGlobal("⚠️ Atenção! Pelo menos um turno deve ser mantido.");
      }
    }
  });

  function adicionarTurno() {
    const tbody = document.getElementById("tbodyTurnos1");
    const numeroTurno = tbody.querySelectorAll("tr").length + 1;

    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
      <td class="turno-label">Turno ${numeroTurno}</td>
      <td><input type="time" name="inicio" required></td>
      <td><input type="time" name="fim" required></td>
      <td><input type="number" name="vagas" min="0" placeholder="0"></td>
      <td><button type="button" class="btnRemoverTurno">🗑️</button></td>
    `;
    tbody.appendChild(novaLinha);
    atualizarNumeracaoTurnos();
  }

  document.addEventListener("DOMContentLoaded", () => {
    adicionarTurno();
  });

  document.getElementById("btnAddTurno").addEventListener("click", () => {
    adicionarTurno();
  });

  // LISTAR EVENTOS
  document.getElementById('btnListarEventos').addEventListener('click', () => {

    mostrarSpinner();

    const dataHistorico = document.getElementById('dataHistoricoDeEventos').value;

    const cb = "cb_listar_eventos_" + Date.now();

    window[cb] = function(eventos) {

      const lista = document.getElementById("listaEventos");
      lista.innerHTML = "";

      const idsEventos = eventos.map(ev => ev.id);

      eventos.forEach(ev => {

        const partes = ev.data.split("/");
        const dataCurta = `${partes[0]}/${partes[1]}/${partes[2].slice(-2)}`;

        const card = document.createElement("div");
        card.className = "cardEvento";
        card.dataset.eventoId = ev.id;

        card.innerHTML = `
          <div class="cabecalhoEvento">
            <div>Nome do evento</div>
            <div>Data de início</div>
            <div>Editar evento</div>
          </div>

          <div class="dadosEvento">
            <div><b>${ev.nome}</b></div>
            <div>${dataCurta}</div>
            <div>
              <button class="btnMini editarBtn">✏️</button>
            </div>
          </div>

          <div class="cabecalhoMetricas">
            <div>Vagas preenchidas</div>
            <div>Vagas em aberto</div>
            <div>Mostruários por turno</div>
            <div>Participantes</div>
            <div>Enviar vagas</div>
          </div>

          <div class="dadosMetricas">
            <div class="designacoes">⏳</div>
            <div class="vagas">⏳</div>
            <div class="carrinhos">⏳</div>
            <div class="pessoas">⏳</div>
            <div>
              <button class="btnMini copiarBtn">➤</button>
            </div>
          </div>
        `;

        card.querySelector(".editarBtn").onclick = () => {
          mostrarSpinner();
          abrirCadastroEvento();
          editarEvento(ev.id);
        };

        card.querySelector(".copiarBtn").onclick = () => copiarMensagemEvento(ev.id);

        lista.appendChild(card);
      });

      window[cb_metrics] = function(metricas) {

        Object.keys(metricas).forEach(id => {

          const card = document.querySelector(`[data-evento-id="${id}"]`);
          if (!card) return;

          card.querySelector(".designacoes").textContent = metricas[id].designacoesRealizadas;
          card.querySelector(".vagas").textContent = metricas[id].vagasEmAberto;
          card.querySelector(".carrinhos").textContent = metricas[id].carrinhosUnicos;
          card.querySelector(".pessoas").textContent = metricas[id].pessoasUnicas;
        });

        esconderSpinner();
      };

      const cb_metrics = "cb_metrics_" + Date.now();

      const script2 = document.createElement("script");
      script2.src =
        API_URL +
        "?acao=obterMetricasEventos" +
        "&ids=" + encodeURIComponent(JSON.stringify(idsEventos)) +
        "&callback=" + cb_metrics;

      document.body.appendChild(script2);

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&data=" + encodeURIComponent(dataHistorico || "") +
      "&callback=" + cb;

    document.body.appendChild(script);
  });

  function copiarMensagemEvento(eventoId) {

    mostrarSpinner();

    const cb = "cb_msg_" + Date.now();

    window[cb] = async function(mensagem) {

      esconderSpinner();

      try {
        await navigator.clipboard.writeText(mensagem);
        mostrarAlertaGlobal("✅ Mensagem copiada para a área de transferência.");
      } catch (e) {
        mostrarAlertaGlobal("❌ Não foi possível copiar a mensagem.");
      }

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=gerarMensagemVagas" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  document.getElementById('btnCadastrarEvento').addEventListener('click', () => {

    const descricaoEl = document.getElementById('descricaoEvento');
    const ruaEl = document.getElementById('ruaEv');
    const numeroEl = document.getElementById('numeroEv');
    const bairroEl = document.getElementById('bairroEv');

    const descricao = descricaoEl.value.trim();
    const rua = ruaEl.value.trim();
    const numero = numeroEl.value.trim();
    const bairro = bairroEl.value.trim();

    if (!descricao) {
      mostrarAlertaGlobal("⚠️ Atenção! Informe a descrição do evento.");
      return;
    }

    if (!rua) {
      mostrarAlertaGlobal("⚠️ Atenção! Informe o endereço do evento.");
      return;
    }

    const turnos = extrairTurnosDoFormulario();

    if (turnos.length === 0) {
      mostrarAlertaGlobal("⚠️ Atenção! Informe pelo menos um turno com vagas.");
      return;
    }

    mostrarSpinner();

    const cb = "cb_cadastrar_" + Date.now();

    window[cb] = function() {

      esconderSpinner();
      mostrarAlertaGlobal("✅ Evento cadastrado com sucesso!");

      carregarEventosNoSelect();
      carregarEventosNoSelectUsuario();

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=cadastrarEventoNaPlanilha" +
      "&descricao=" + encodeURIComponent(descricao) +
      "&turnos=" + encodeURIComponent(JSON.stringify(turnos)) +
      "&rua=" + encodeURIComponent(rua) +
      "&numero=" + encodeURIComponent(numero) +
      "&bairro=" + encodeURIComponent(bairro) +
      "&callback=" + cb;

    document.body.appendChild(script);
  });

  document.getElementById('btnAddTable').addEventListener('click', () => {

    const container = document.getElementById('containerTables');
    const tabelaOriginal = document.getElementById('tabela1');
    const novaTabela = tabelaOriginal.cloneNode(true);

    const numTabelas = container.querySelectorAll('table').length + 1;
    novaTabela.id = 'tabela' + numTabelas;

    container.appendChild(novaTabela);
  });

  function gerarMensagemEvento() {
    return null;
  }

  function agruparTurnosPorData(turnos) {
    const agrupados = {};
    turnos.forEach(t => {
      if (!agrupados[t.data]) agrupados[t.data] = [];
      agrupados[t.data].push(t);
    });
    return agrupados;
  }

  function criarNovaTabela() {
    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');
    return tabela;
  }

  function popularTurnosNaTabela() {}

  function atualizarNumeracaoTurnosTabela() {}

  function editarEvento(id) {

    mostrarSpinner();

    const cb = "cb_editar_" + Date.now();

    window[cb] = function(evento) {

      document.getElementById('descricaoEvento').value = evento.nome;

      document.getElementById('ruaEv').value = evento.rua || '';
      document.getElementById('numeroEv').value = evento.numero || '';
      document.getElementById('bairroEv').value = evento.bairro || '';

      esconderSpinner();

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=obterEventoPorId" +
      "&id=" + encodeURIComponent(id) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  document.getElementById('btnSalvarEdicaoEvento').addEventListener('click', () => {

    const descricao = document.getElementById('descricaoEvento').value.trim();
    const nomeOriginal = document.getElementById('nomeOriginal').value;
    const dataOriginal = document.getElementById('dataOriginal').value;

    const ruaOriginal = document.getElementById('ruaOriginal').value;
    const numeroOriginal = document.getElementById('numeroOriginal').value;
    const bairroOriginal = document.getElementById('bairroOriginal').value;

    const rua = document.getElementById('ruaEv').value.trim();
    const numero = document.getElementById('numeroEv').value.trim();
    const bairro = document.getElementById('bairroEv').value.trim();

    const turnos = extrairTurnosDoFormulario();

    mostrarSpinner();

    const cb = "cb_salvar_edicao_" + Date.now();

    window[cb] = function() {

      esconderSpinner();
      mostrarAlertaGlobal("✅ Evento alterado com sucesso!");

      carregarEventosNoSelect();
      carregarEventosNoSelectUsuario();

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=salvarEdicoesDeEventoNaPlanilha" +
      "&descricao=" + encodeURIComponent(descricao) +
      "&turnos=" + encodeURIComponent(JSON.stringify(turnos)) +
      "&nomeOriginal=" + encodeURIComponent(nomeOriginal) +
      "&dataOriginal=" + encodeURIComponent(dataOriginal) +
      "&ruaOriginal=" + encodeURIComponent(ruaOriginal) +
      "&numeroOriginal=" + encodeURIComponent(numeroOriginal) +
      "&bairroOriginal=" + encodeURIComponent(bairroOriginal) +
      "&rua=" + encodeURIComponent(rua) +
      "&numero=" + encodeURIComponent(numero) +
      "&bairro=" + encodeURIComponent(bairro) +
      "&callback=" + cb;

    document.body.appendChild(script);
  });

  function extrairTurnosDoFormulario() {
    return [];
  }

  function criarMensagemWhatsApp() {
    return null;
  }

  document.getElementById('btnGerarMensagemWhatsApp').addEventListener('click', () => {
    const msg = criarMensagemWhatsApp();
    if (!msg) return;
  });

  document.getElementById('btnCopiarMensagemWhatsApp').addEventListener('click', async () => {
    const texto = document.getElementById('mensagemWhatsApp').value;
    await navigator.clipboard.writeText(texto);
  });

  function enviarEmailInformativo() {

    const descricao = document.getElementById('descricaoEvento').value.trim();
    if (!descricao) return;

    mostrarSpinner();

    const assunto = `Evento do TPE - ${descricao}`;
    const mensagemBase = gerarMensagemEvento();

    const cb = "cb_email_info_" + Date.now();

    window[cb] = function() {

      esconderSpinner();
      mostrarAlertaGlobal("E-mails enviados com sucesso.");

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=enviarEmailInformativoEvento" +
      "&assunto=" + encodeURIComponent(assunto) +
      "&mensagem=" + encodeURIComponent(mensagemBase) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

   // Carrega eventos no select de designados ao carregar a página
  function carregarEventosDesignados() {

    const cb = "cb_eventos_designados_" + Date.now();

    window[cb] = function(eventos) {

      const sel = document.getElementById("eventoSelectDesignados");
      if (!sel) {
        console.error("Select eventoSelectDesignados não encontrado no DOM");
        return;
      }

      sel.innerHTML = "<option value=''>- Selecione -</option>";

      eventos.forEach(evt => {
        const opt = document.createElement("option");
        opt.value = evt.id;

        const ano = evt.data ? evt.data.split("/")[2] : "";
        opt.textContent = `${evt.nome} - ${ano}`;

        sel.appendChild(opt);
      });

      const selTurno = document.getElementById("turnoSelectDesignados");
      selTurno.disabled = true;

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  // Função para popular turnos baseado no evento selecionado
  function eventoMudouDesignados() {

    const selEv = document.getElementById("eventoSelectDesignados");
    const eventoId = selEv.value;

    const selTurno = document.getElementById("turnoSelectDesignados");
    selTurno.innerHTML = "<option value=''>- Selecione turno -</option>";
    selTurno.disabled = true;

    document.getElementById("grupoTurnoDesignados").style.display = "none";
    mostrarSpinner();
    document.getElementById("resultadoDesignadosContainerEv").innerHTML = "";

    if (!eventoId) return;

    const cb = "cb_turnos_" + Date.now();

    window[cb] = function(turnos) {

      esconderSpinner();

      if (!turnos || turnos.length === 0) return;

      turnos.forEach(t => {
        const opt = document.createElement("option");
        opt.value = `${t.data}|${t.label}`;
        opt.textContent = `${t.data} - ${t.label}`;
        selTurno.appendChild(opt);
      });

      selTurno.disabled = false;
      document.getElementById("grupoTurnoDesignados").style.display = "flex";

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarTurnosDoEvento" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function mostrarConfirmacaoRegistrar() {

    const mensagemEl = document.getElementById("mensagemRegistro");

    mostrarConfirmacaoGlobal(
      "⚠️ Atenção! Você está criando a Escala do Evento. Você poderá atualizá-la se precisar. Deseja continuar?",
      () => {

        if (mensagemEl) mensagemEl.textContent = "";
        mostrarSpinner();

        if (mensagemEl) {
          mensagemEl.style.color = "blue";
          mensagemEl.textContent = "🔁 Registrando...";
        }

        const eventoId = document.getElementById("eventoSelectDesignados").value;

        if (!eventoId) {
          esconderSpinner();
          if (mensagemEl) mensagemEl.textContent = "";

          mostrarAlertaGlobal("⚠️ Por favor, selecione um evento antes de registrar.");
          return;
        }

        const cb = "cb_registrar_designados_" + Date.now();

        window[cb] = function() {

          esconderSpinner();
          if (mensagemEl) mensagemEl.textContent = "";

          mostrarAlertaGlobal(
            "✅ Designações do evento registradas com sucesso. Para imprimir o PDF, use a aba Relatórios!"
          );

          delete window[cb];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=registrarTodosDesignadosNoEvento" +
          "&eventoId=" + encodeURIComponent(eventoId) +
          "&callback=" + cb;

        document.body.appendChild(script);

      }
    );
  }

  function mostrarConfirmacaoRegistrarInscritos() {

    const mensagemEl = document.getElementById("mensagemRegistroInscritos");

    mostrarConfirmacaoGlobal(
      "⚠️ Atenção! Você está criando a lista de inscritos do evento. Você poderá atualizá-la posteriormente. Deseja continuar?",
      () => {

        if (mensagemEl) mensagemEl.textContent = "";
        mostrarSpinner();

        const eventoId = document.getElementById("eventoSelectInscritos").value;

        if (!eventoId) {
          esconderSpinner();
          mostrarAlertaGlobal("⚠️ Por favor, selecione um evento antes de registrar.");
          return;
        }

        const cb = "cb_registrar_inscritos_" + Date.now();

        window[cb] = function() {

          esconderSpinner();

          mostrarAlertaGlobal(
            "✅ Lista de inscritos registrada com sucesso. Consulte a nova aba criada na planilha."
          );

          delete window[cb];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=registrarTodosInscritosNoEvento" +
          "&eventoId=" + encodeURIComponent(eventoId) +
          "&callback=" + cb;

        document.body.appendChild(script);

      }
    );
  }

  document.addEventListener("DOMContentLoaded", function() {

    carregarEventosInscritos();

    document
      .getElementById("eventoSelectInscritos")
      .addEventListener("change", eventoMudouInscritos);

    carregarEventosDesignados();

    const selEv = document.getElementById("eventoSelectDesignados");
    selEv.addEventListener("change", eventoMudouDesignados);

    const btn = document.getElementById("btnMostrarDesignados");

    btn.addEventListener("click", function() {

      const eventoId = selEv.value;
      const turno = document.getElementById("turnoSelectDesignados").value;

      window.eventoIdAtual = eventoId;
      window.turnoSelecionadoAtual = turno;

      const container = document.getElementById("resultadoDesignadosContainerEv");
      container.innerHTML = "";

      if (!eventoId || !turno) {
        mostrarAlertaGlobal("⚠️ Selecione evento e turno.");
        return;
      }

      mostrarSpinner();
      container.innerHTML = "<p>Carregando designados...</p>";

      const cb = "cb_designados_" + Date.now();

      window[cb] = function(designados) {

        esconderSpinner();

        if (!designados || designados.length === 0) {
          container.innerHTML = "<p>❌ Nenhum designado encontrado para esse turno.</p>";
          delete window[cb];
          return;
        }

        let html = "<table class='tabela-listagem'>";

        html += `
          <thead>
            <tr>
              <th style="width: 20%;">Mostruário</th>
              <th style="width: 40%;">Nome</th>
              <th style="width: 15%;">Sexo</th>
              <th style="width: 20%;">Telefone</th>
              <th style="display:none; width: 5%;">Email</th>
            </tr>
          </thead>
          <tbody>
        `;

        designados.forEach(function(d) {

          const telefoneLimpo = String(d.telefone || "").replace(/\D/g, "");
          const nome = d.nome || "participante";

          const evento = selEv.options[selEv.selectedIndex].text;

          const selectTurno = document.getElementById("turnoSelectDesignados");
          const turnoTxt = selectTurno.options[selectTurno.selectedIndex]?.textContent || "Turno";

          const mensagem =
            "*Evento do TPE - Confirmação de Participação*\n\n" +
            "👤 Olá,\n" + nome + "\n\n" +
            "✍️ Você foi designado para o evento *" + evento + "*, para o dia *" + turnoTxt + "*.\n\n" +
            "📲 Por favor, confirme sua participação respondendo esta mensagem.\n\n" +
            "*Equipe de Eventos do TPE SBC*";

          const linkWhatsapp = telefoneLimpo
            ? "https://wa.me/55" + telefoneLimpo + "?text=" + encodeURIComponent(mensagem)
            : "";

          html += "<tr>" +
            "<td class='carrinho-editavel' style='color:blue; cursor:pointer;' data-carrinho='" + (d.carrinho || "") + "'>" + (d.carrinho || "Carrinho do Evento") + "</td>" +
            "<td class='nome-editavel' data-id='" + d.id + "'>" + (d.nome || "Participante") + "</td>" +
            "<td>" + (d.sexo || "") + "</td>" +
            "<td>" + (linkWhatsapp ? "<a href='" + linkWhatsapp + "' target='_blank' rel='noopener noreferrer'>" + (d.telefone || "") + "</a>" : "") + "</td>" +
            "<td style='display:none;'>" + (d.email || "") + "</td>" +
            "</tr>";
        });

        html += "</tbody></table>";
        container.innerHTML = html;

        document.querySelectorAll(".carrinho-editavel").forEach(td => {
          td.addEventListener("click", () => transformarCarrinhoEmSelect(td));
        });

        document.getElementById("areaBotoes").style.display = "block";

        document.getElementById("btnEnviarTodos").addEventListener("click", () => {
          enviarEmailParaTodos(container);
        });

        document.getElementById("btnEnviarDaAba").addEventListener("click", () => {
          enviarEmailParaTodosDaAba();
        });

        document.querySelectorAll(".nome-editavel").forEach(td => {
          td.addEventListener("click", () => {
            mostrarSpinner();
            transformarNomeEmSelect(td);
          });
        });

        delete window[cb];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=listarDesignadosDoEvento" +
        "&eventoId=" + encodeURIComponent(eventoId) +
        "&turno=" + encodeURIComponent(turno) +
        "&callback=" + cb;

      document.body.appendChild(script);
    });

    const btnRegistrarInscritos =
      document.getElementById("btnRegistrarInscritos");

    btnRegistrarInscritos.replaceWith(btnRegistrarInscritos.cloneNode(true));

    document.getElementById("btnRegistrarInscritos")
      .addEventListener("click", mostrarConfirmacaoRegistrarInscritos);

    const btnRegistrarDesignados =
      document.getElementById("btnRegistrarDesignados");

    btnRegistrarDesignados.replaceWith(btnRegistrarDesignados.cloneNode(true));

    document.getElementById("btnRegistrarDesignados")
      .addEventListener("click", mostrarConfirmacaoRegistrar);

    const btnMostrarInscritos =
      document.getElementById("btnMostrarInscritos");

    btnMostrarInscritos.addEventListener("click", function() {

      const container =
        document.getElementById("resultadoInscritosContainer");

      container.innerHTML = "";

      const eventoId =
        document.getElementById("eventoSelectInscritos").value;

      const valorSelecionado =
        document.getElementById("turnoSelectInscritos").value;

      if (!eventoId || !valorSelecionado) {
        mostrarAlertaGlobal("⚠️ Selecione evento e turno.");
        return;
      }

      const partes = valorSelecionado.split("|");
      const data = partes[0];
      const turno = partes[1];

      mostrarSpinner();

      const cb = "cb_inscritos_" + Date.now();

      window[cb] = function(res) {

        esconderSpinner();
        mostrarInscritos(res);
        document.getElementById("areaBotoesInscritos").style.display = "block";

        delete window[cb];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=listarInscritosPorTurno" +
        "&eventoId=" + encodeURIComponent(eventoId) +
        "&data=" + encodeURIComponent(data) +
        "&turno=" + encodeURIComponent(turno) +
        "&callback=" + cb;

      document.body.appendChild(script);
    });

  });

  function carregarEventosInscritos() {

    const cb = "cb_eventos_inscritos_" + Date.now();

    window[cb] = function(eventos) {

      const sel = document.getElementById("eventoSelectInscritos");

      sel.innerHTML = "<option value=''>- Selecione -</option>";

      eventos.forEach(evt => {

        const opt = document.createElement("option");
        opt.value = evt.id;

        const ano = evt.data ? evt.data.split("/")[2] : "";

        opt.textContent = `${evt.nome} - ${ano}`;

        sel.appendChild(opt);
      });

      document.getElementById("turnoSelectInscritos").disabled = true;

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function eventoMudouInscritos() {

    const eventoId =
      document.getElementById("eventoSelectInscritos").value;

    const selTurno =
      document.getElementById("turnoSelectInscritos");

    selTurno.innerHTML = "<option value=''>- Selecione turno -</option>";
    selTurno.disabled = true;

    document.getElementById("grupoTurnoInscritos").style.display = "none";
    mostrarSpinner();

    if (!eventoId) return;

    const cb = "cb_turnos_inscritos_" + Date.now();

    window[cb] = function(turnos) {

      esconderSpinner();

      turnos.forEach(t => {

        const opt = document.createElement("option");
        opt.value = `${t.data}|${t.label}`;
        opt.textContent = `${t.data} - ${t.label}`;
        selTurno.appendChild(opt);

      });

      selTurno.disabled = false;
      document.getElementById("grupoTurnoInscritos").style.display = "flex";

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarTurnosDoEvento" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function mostrarInscritos(inscritos) {

    esconderSpinner();

    const container =
      document.getElementById("resultadoInscritosContainer");

    if (!inscritos || inscritos.length === 0) {
      container.innerHTML = "<p>❌ Nenhum inscrito encontrado.</p>";
      return;
    }

    let html = `<table class='tabela-listagem'>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Sexo</th>
          <th>Telefone</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
    `;

    inscritos.forEach(i => {

      html += `
        <tr>
          <td>${i.nome}</td>
          <td>${i.sexo || ""}</td>
          <td>${i.telefone || ""}</td>
          <td>
            <button onclick="confirmarExclusao('${i.participanteId}')">
              Excluir
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  function confirmarExclusao(participanteId) {

    const eventoId =
      document.getElementById("eventoSelectInscritos").value;

    const valorSelecionado =
      document.getElementById("turnoSelectInscritos").value;

    if (!eventoId || !valorSelecionado) {
      mostrarAlertaGlobal("⚠️ Evento ou turno não selecionado.");
      return;
    }

    const [data, turno] = valorSelecionado.split("|");

    mostrarConfirmacaoGlobal(
      "⚠️ Deseja realmente excluir esta inscrição?",
      () => {

        mostrarSpinner();

        const cb = "cb_excluir_" + Date.now();

        window[cb] = function() {

          esconderSpinner();
          mostrarAlertaGlobal("✅ Inscrição excluída.");
          document.getElementById("btnMostrarInscritos").click();

          delete window[cb];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=excluirInscricao" +
          "&eventoId=" + encodeURIComponent(eventoId) +
          "&data=" + encodeURIComponent(data) +
          "&turno=" + encodeURIComponent(turno) +
          "&participanteId=" + encodeURIComponent(participanteId) +
          "&callback=" + cb;

        document.body.appendChild(script);

      }
    );
  }

  function enviarEmailParaTodos(container) {

    container.querySelector("#confirmEmailContainer")?.remove();

    const linhas = container.querySelectorAll("table tbody tr");

    if (!linhas || linhas.length === 0) {
      mostrarAlertaGlobal("❌ Não há designados para enviar email.");
      return;
    }

    const emails = [];

    linhas.forEach(tr => {
      const tdEmail = tr.children[4];
      if (tdEmail) {
        const email = tdEmail.textContent.trim();
        if (email && validateEmail(email)) emails.push(email);
      }
    });

    if (emails.length === 0) {
      mostrarAlertaGlobal("❌ Nenhum email válido encontrado para enviar.");
      return;
    }

    let confirmDiv = document.createElement("div");
    confirmDiv.id = "confirmEmailContainer";
    confirmDiv.classList.add("confirm-box");
    container.appendChild(confirmDiv);

    confirmDiv.innerHTML = `
      <p>⚠️ Atenção! Enviando confirmação...</p>
      <div class="confirm-buttons">
        <button id="confirmarEnvioEmailBtn">✅ Confirmar</button>
        <button id="cancelarEnvioEmailBtn">❌ Cancelar</button>
      </div>
    `;

    confirmDiv.querySelector("#confirmarEnvioEmailBtn").addEventListener("click", () => {

      confirmDiv.innerHTML = "Enviando emails...";

      const assunto = "Designação no TPE";

      const selectEvento = document.getElementById("eventoSelectDesignados");
      const eventoSelecionado = selectEvento.options[selectEvento.selectedIndex]?.textContent || "Evento";

      const selectTurno = document.getElementById("turnoSelectDesignados");
      const turnoSelecionado = selectTurno.options[selectTurno.selectedIndex]?.textContent || "Turno";

      const mensagem =
        `Olá querido(a) irmão(ã),\n\n` +
        `Você foi designado(a) para:\n\n` +
        `${eventoSelecionado}\nTurno: ${turnoSelecionado}\n\n` +
        `Equipe TPE`;

      const cb = "cb_email_designados_" + Date.now();

      window[cb] = function() {
        confirmDiv.innerHTML = `<div style="color: green;">✅ Emails enviados com sucesso!</div>`;
        delete window[cb];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=enviarEmailParaDesignadosEvento" +
        "&assunto=" + encodeURIComponent(assunto) +
        "&emails=" + encodeURIComponent(JSON.stringify(emails)) +
        "&mensagem=" + encodeURIComponent(mensagem) +
        "&callback=" + cb;

      document.body.appendChild(script);
    });

    confirmDiv.querySelector("#cancelarEnvioEmailBtn").addEventListener("click", () => {
      confirmDiv.remove();
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function transformarNomeEmSelect(td) {
    const eventoId = document.getElementById("eventoSelectDesignados").value;
    const selectTurno = document.getElementById("turnoSelectDesignados");
    const turnoCompleto = selectTurno.options[selectTurno.selectedIndex]?.textContent || "";

    const idAtual = td.dataset.id || "";

    if (!eventoId || !turnoCompleto) {
      mostrarAlertaGlobal("❌ Evento ou turno não selecionado");
      return;
    }

    const tr = td.parentElement;
    tr.classList.add("linha-em-edicao");

    const cb = "cb_cadastro_reserva_" + Date.now();

    window[cb] = function(nomesReserva) {

      const candidatos = nomesReserva.candidatos;

      const selectNome = document.createElement("select");

      const optVaga = document.createElement("option");
      optVaga.value = "VAGA";
      optVaga.textContent = "VAGA";
      selectNome.appendChild(optVaga);

      candidatos.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.nome;
        if (item.id === idAtual) opt.selected = true;
        selectNome.appendChild(opt);
      });

      td.innerHTML = "";
      td.appendChild(selectNome);

      esconderSpinner();

      selectNome.addEventListener("change", () => {

        const novoId = selectNome.value;
        const optSel = selectNome.options[selectNome.selectedIndex];

        td.textContent = optSel.textContent;
        td.dataset.id = novoId;

        const cbSave = "cb_save_" + Date.now();

        window[cbSave] = function() {
          esconderSpinner();
          delete window[cbSave];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=salvarAlteracaoDesignado" +
          "&eventoId=" + encodeURIComponent(eventoId) +
          "&turnoCompleto=" + encodeURIComponent(turnoCompleto) +
          "&idAtual=" + encodeURIComponent(idAtual) +
          "&novoId=" + encodeURIComponent(novoId) +
          "&callback=" + cbSave;

        document.body.appendChild(script);
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarCadastroReserva" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&turnoCompleto=" + encodeURIComponent(turnoCompleto) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function transformarCarrinhoEmSelect(td) {

    let carrinhoAtual = td.dataset.carrinho || "";

    const tr = td.parentElement;

    if (td.querySelector("select")) return;

    const select = document.createElement("select");

    for (let i = 1; i <= 10; i++) {
      const opt = document.createElement("option");
      opt.value = `Carrinho ${i}`;
      opt.textContent = `Carrinho ${i}`;
      if (opt.value === carrinhoAtual) opt.selected = true;
      select.appendChild(opt);
    }

    td.innerHTML = "";
    td.appendChild(select);

    select.addEventListener("change", () => {

      const novo = select.value;
      td.textContent = novo;
      td.dataset.carrinho = novo;

      const eventoId = document.getElementById("eventoSelectDesignados").value;

      const selectTurno = document.getElementById("turnoSelectDesignados");
      const turnoCompleto = selectTurno.options[selectTurno.selectedIndex]?.textContent || "";

      const cb = "cb_save_carrinho_" + Date.now();

      window[cb] = function() {
        esconderSpinner();
        delete window[cb];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=salvarAlteracaoDesignado" +
        "&eventoId=" + encodeURIComponent(eventoId) +
        "&turnoCompleto=" + encodeURIComponent(turnoCompleto) +
        "&novoCarrinho=" + encodeURIComponent(novo) +
        "&callback=" + cb;

      document.body.appendChild(script);
    });
  }

  function enviarEmailParaTodosDaAba() {

    const container = document.getElementById("resultadoDesignadosContainerEv");
    container.querySelector("#confirmEmailContainer")?.remove();

    const selectEvento = document.getElementById("eventoSelectDesignados");
    const eventoId = selectEvento.value;

    if (!eventoId) {
      mostrarAlertaGlobal("⚠️ Atenção! Selecione um evento.");
      return;
    }

    const cb = "cb_lista_emails_" + Date.now();

    window[cb] = function(emails) {

      if (!emails || emails.length === 0) {
        mostrarAlertaGlobal("❌ Nenhum email válido encontrado para enviar.");
        delete window[cb];
        return;
      }

      let confirmDiv = document.createElement("div");
      confirmDiv.id = "confirmEmailContainer";
      confirmDiv.classList.add("confirm-box");
      container.appendChild(confirmDiv);

      confirmDiv.innerHTML = `
        <p>📧 Enviar escala geral para ${emails.length} pessoas?</p>
        <button id="ok">Confirmar</button>
        <button id="no">Cancelar</button>
      `;

      confirmDiv.querySelector("#ok").addEventListener("click", () => {

        const assunto = "Designação Evento";

        const cbSend = "cb_send_" + Date.now();

        window[cbSend] = function() {
          mostrarAlertaGlobal("✅ Emails enviados com sucesso!");
          delete window[cbSend];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=enviarEmailParaDesignadosEvento" +
          "&emails=" + encodeURIComponent(JSON.stringify(emails)) +
          "&assunto=" + encodeURIComponent(assunto) +
          "&callback=" + cbSend;

        document.body.appendChild(script);
      });

      confirmDiv.querySelector("#no").addEventListener("click", () => {
        confirmDiv.remove();
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEmailsDesignados" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }


  function carregarEventosNoSelectUsuario() {

    const cb = "cb_eventos_usuario_" + Date.now();

    window[cb] = function(eventos) {

      const select = document.getElementById("eventoSelectUsuario");

      select.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Selecione um evento";

      select.appendChild(placeholder);

      eventos.forEach(ev => {

        const opt = document.createElement("option");
        opt.value = ev.id;

        const ano = ev.data ? ev.data.split("/")[2] : "";
        opt.textContent = `${ev.nome} - ${ano}`;

        select.appendChild(opt);
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  window.addEventListener("load", () => {
    carregarEventosNoSelectUsuario();
  });

  document
    .getElementById("eventoSelectUsuario")
    .addEventListener("change", function () {

      const eventoId = this.value;

      const turnoSelect =
        document.getElementById("turnoSelectUsuario");

      const apenasMost =
        document.getElementById("apenasMostUsuario");

      turnoSelect.innerHTML =
        '<option value="">Selecione um turno</option>';

      if (!eventoId) {
        turnoSelect.disabled = true;
        return;
      }

      mostrarSpinner();

      const cb = "cb_turnos_usuario_" + Date.now();

      window[cb] = function(turnos) {

        esconderSpinner();

        turnoSelect.innerHTML =
          '<option value="">Selecione um turno</option>';

        if (!turnos || turnos.length === 0) {
          turnoSelect.disabled = true;
          delete window[cb];
          return;
        }

        turnos.forEach(t => {

          const opt = document.createElement("option");

          opt.value = `${t.data} - ${t.label}`;
          opt.textContent = `${t.data} - ${t.label}`;

          turnoSelect.appendChild(opt);

        });

        apenasMost.style.display = "block";
        turnoSelect.disabled = false;

        delete window[cb];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=listarTurnosDoEvento" +
        "&eventoId=" + encodeURIComponent(eventoId) +
        "&callback=" + cb;

      document.body.appendChild(script);

    });

  function inscreverMinhaParticipacao() {

    const eventoSelect = document.getElementById("eventoSelectUsuario");
    const turnoSelect = document.getElementById("turnoSelectUsuario");

    const eventoIdSelecionado = eventoSelect.value;
    const turnoSelecionado = turnoSelect.value;
    const idUsuario = idUsuarioLogado;

    [eventoSelect, turnoSelect].forEach(el => {
      if (el) el.classList.remove("erro-campo");
    });

    if (!idUsuario) {
      mostrarAlertaGlobal("❌ Usuário não identificado.");
      return;
    }

    if (!eventoIdSelecionado || eventoIdSelecionado === "Selecione um evento") {
      mostrarAlertaGlobal("⚠️ Selecione o evento");
      eventoSelect.classList.add("erro-campo");
      return;
    }

    if (!turnoSelecionado) {
      mostrarAlertaGlobal("⚠️ Selecione o turno.");
      turnoSelect.classList.add("erro-campo");
      return;
    }

    const nomeEvento = eventoIdSelecionado
      .replace(/^Evento\s*-\s*/, "")
      .replace(/\s*-\s*\d{2}\/\d{2}\/\d{4}$/, "");

    const partesTurno = turnoSelecionado.split(" - ");
    const dataTurno = partesTurno[0] || "";
    const descricaoTurno = partesTurno[1] || "";

    mostrarConfirmacaoGlobal(
      `⚠️ Confira os dados antes de prosseguir:

🎊 Evento ${nomeEvento}

📅 Data ${dataTurno}

🕒 ${descricaoTurno}

Tem certeza de que deseja realizar esta inscrição?`,
      () => {

        mostrarSpinner();

        const cb = "cb_inscricao_usuario_" + Date.now();

        window[cb] = function(res) {

          esconderSpinner();

          let resultado =
            res?.mensagem || "⚠️ Resposta vazia do servidor.";

          document.getElementById("resultadoMinhaInscricao").innerHTML =
            resultado.replace(/\n/g, "<br>");

          if (resultado.includes("sucesso")) {
            mostrarAlertaGlobal("✅ Inscrição realizada com sucesso.");
          } else {
            mostrarAlertaGlobal(resultado);
          }

          delete window[cb];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=inscreverParticipante" +
          "&eventoId=" + encodeURIComponent(eventoIdSelecionado) +
          "&turno=" + encodeURIComponent(turnoSelecionado) +
          "&extra=" +
          "&idUsuario=" + encodeURIComponent(idUsuario) +
          "&callback=" + cb;

        document.body.appendChild(script);

      }
    );
  }

 function carregarEventosNoSelect() {

    const cb = "cb_eventos_admin_" + Date.now();

    window[cb] = function(eventos) {

      const select = document.getElementById("eventoSelect");
      select.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Selecione um evento";
      select.appendChild(placeholder);

      eventos.forEach(ev => {

        const opt = document.createElement("option");
        opt.value = ev.id;

        const ano = ev.data ? ev.data.split("/")[2] : "";
        opt.textContent = `${ev.nome} - ${ano}`;

        select.appendChild(opt);
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  window.addEventListener("load", () => {
    carregarEventosNoSelect();
  });

  document.getElementById("eventoSelect").addEventListener("change", function() {

    const eventoId = this.value;

    const turnoSelect = document.getElementById("turnoSelect");
    const apenasMost = document.getElementById("apenasMost");

    turnoSelect.innerHTML = '<option value="">Selecione um turno</option>';

    if (!eventoId) {
      turnoSelect.disabled = true;
      return;
    }

    mostrarSpinner();

    const cb = "cb_turnos_admin_" + Date.now();

    window[cb] = function(turnos) {

      esconderSpinner();

      turnoSelect.innerHTML = '<option value="">Selecione um turno</option>';

      if (!turnos || turnos.length === 0) {
        turnoSelect.disabled = true;
        delete window[cb];
        return;
      }

      turnos.forEach(t => {

        const opt = document.createElement("option");

        opt.value = `${t.data} - ${t.label}`;
        opt.textContent = `${t.data} - ${t.label}`;

        turnoSelect.appendChild(opt);

      });

      apenasMost.style.display = "block";
      turnoSelect.disabled = false;

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarTurnosDoEvento" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);

  });

  let participanteSelecionadoEv = {
    nome: "",
    id: ""
  };

  function inscreverParticipanteAdmin() {

    const eventoSelect = document.getElementById("eventoSelect");
    const turnoSelect = document.getElementById("turnoSelect");

    const eventoIdSelecionado = eventoSelect.value;
    const turnoSelecionado = turnoSelect.value;

    if (!participanteSelecionadoInscreverOutro) {
      mostrarAlertaGlobal("⚠️ Selecione um participante.");
      return;
    }

    const nomeUsuario = participanteSelecionadoInscreverOutro.nome;
    const idUsuario = participanteSelecionadoInscreverOutro.id;

    if (!idUsuario) {
      mostrarAlertaGlobal("❌ ID do participante não encontrado.");
      return;
    }

    [eventoSelect, turnoSelect].forEach(el => {
      if (el) el.classList.remove("erro-campo");
    });

    if (!eventoIdSelecionado || eventoIdSelecionado === "Selecione um evento") {
      mostrarAlertaGlobal("⚠️ Selecione o evento");
      eventoSelect.classList.add("erro-campo");
      return;
    }

    if (!turnoSelecionado) {
      mostrarAlertaGlobal("⚠️ Selecione o turno.");
      turnoSelect.classList.add("erro-campo");
      return;
    }

    const nomeEvento = eventoIdSelecionado
      .replace(/^Evento\s*-\s*/, "")
      .replace(/\s*-\s*\d{2}\/\d{2}\/\d{4}$/, "");

    const partesTurno = turnoSelecionado.split(" - ");
    const dataTurno = partesTurno[0] || "";
    const descricaoTurno = partesTurno[1] || "";

    mostrarConfirmacaoGlobal(
      `⚠️ Confira os dados antes de prosseguir:

🎊 Evento ${nomeEvento}
👤 ${nomeUsuario}

📅 Data ${dataTurno}
🕒 ${descricaoTurno}

Confirmar inscrição?`,
      () => {

        mostrarSpinner();

        const cb = "cb_inscricao_admin_" + Date.now();

        window[cb] = function(res) {

          esconderSpinner();

          let resultado =
            res?.mensagem || "⚠️ Resposta vazia do servidor.";

          document.getElementById("resultadoInscricao").innerHTML =
            resultado.replace(/\n/g, "<br>");

          if (resultado.includes("sucesso")) {
            mostrarAlertaGlobal("✅ Inscrição realizada com sucesso.");
          } else {
            mostrarAlertaGlobal(resultado);
          }

          delete window[cb];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=inscreverParticipante" +
          "&eventoId=" + encodeURIComponent(eventoIdSelecionado) +
          "&turno=" + encodeURIComponent(turnoSelecionado) +
          "&nome=" + encodeURIComponent(nomeUsuario) +
          "&idUsuario=" + encodeURIComponent(idUsuario) +
          "&callback=" + cb;

        document.body.appendChild(script);

      }
    );
  }
  
  function carregarAbasEv() {

    const cb = "cb_abas_ev_" + Date.now();

    window[cb] = function(nomes) {

      const select = document.getElementById('abaEv');
      select.innerHTML = "";

      const optionDefault = document.createElement('option');
      optionDefault.value = "";
      optionDefault.text = "- Selecione -";
      select.appendChild(optionDefault);

      nomes.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.text = nome;
        select.appendChild(option);
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarAbasEv" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function exportarEscalaEv() {

    const abaSelecionada = document.getElementById('abaEv').value;
    const mensagem = document.getElementById('mensagemEv');

    mensagem.innerHTML = "Gerando link de download...";
    mostrarSpinner();

    const cb = "cb_exportar_ev_" + Date.now();

    window[cb] = function(linkHTML) {

      mensagem.innerHTML = linkHTML;
      esconderSpinner();

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=exportarAbaSelecionada" +
      "&aba=" + encodeURIComponent(abaSelecionada) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

 function carregarEventosConversor() {

    const cb = "cb_eventos_conversor_" + Date.now();

    window[cb] = function(eventos) {

      const sel = document.getElementById("eventoSelectConversor");
      sel.innerHTML = "<option value=''>- Selecione -</option>";

      eventos.forEach(evt => {
        const opt = document.createElement("option");
        opt.value = evt.id;

        const ano = evt.data ? evt.data.split("/")[2] : "";
        opt.textContent = `${evt.nome} - ${ano}`;

        sel.appendChild(opt);
      });

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=listarEventos" +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  function converter() {

    const eventoId = document.getElementById("eventoSelectConversor").value;
    const status = document.getElementById("status");

    if (!eventoId) {
      status.textContent = "❗ Selecione um evento primeiro.";
      return;
    }

    status.textContent = "⏳ Convertendo... aguarde...";

    const cb = "cb_converter_" + Date.now();

    window[cb] = function(resultado) {

      status.innerHTML = `<p>${resultado.mensagem}</p>`;

      if (resultado.naoEncontrados && resultado.naoEncontrados.length > 0) {

        const lista = document.createElement("ul");

        resultado.naoEncontrados.forEach(item => {
          const li = document.createElement("li");
          li.textContent =
            `Linha ${item.linha} | Turno: ${item.turno} | Valor: ${item.id}`;
          lista.appendChild(li);
        });

        const titulo = document.createElement("p");
        titulo.textContent = "❌ Não encontrados:";

        status.appendChild(titulo);
        status.appendChild(lista);
      }

      delete window[cb];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=converterDesignadosDosEventosParaIDs" +
      "&eventoId=" + encodeURIComponent(eventoId) +
      "&callback=" + cb;

    document.body.appendChild(script);
  }

  carregarEventosConversor();

  function carregarAbasEv() {

    const callbackName = "cb_" + Date.now();

    window[callbackName] = function(nomes) {

      const select = document.getElementById('abaEv');
      select.innerHTML = "";

      const optionDefault = document.createElement('option');
      optionDefault.value = "";
      optionDefault.text = "- Selecione -";
      select.appendChild(optionDefault);

      nomes.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.text = nome;
        select.appendChild(option);
      });

      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src =
      "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec" +
      "?action=listarAbasEv" +
      "&callback=" + callbackName;

    document.body.appendChild(script);
  }


  function exportarEscalaEv() {

    const abaSelecionada = document.getElementById('abaEv').value;
    const mensagem = document.getElementById('mensagemEv');

    mensagem.innerHTML = "Gerando link de download...";
    mostrarSpinner();

    const callbackName = "cb_" + Date.now();

    window[callbackName] = function(linkHTML) {

      mensagem.innerHTML = linkHTML;
      esconderSpinner();

      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src =
      "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec" +
      "?action=exportarAbaSelecionada" +
      "&aba=" + encodeURIComponent(abaSelecionada) +
      "&callback=" + callbackName;

    document.body.appendChild(script);
  }
  
  function buscarDesignacoesPorPonto() {

    const ponto = document.getElementById("pontobepp").value;
    const msg = document.getElementById("msgDesignacoesPorPontopppp");
    const container = document.getElementById("resultadoDesignacoesPorPontopppp");

    container.innerHTML = "";
    msg.textContent = "";
    document.getElementById("btnExportarPdfDesignacoes").style.display = "none";

    if (!ponto) {
      mostrarAlertaGlobal("❌ Por favor, selecione um ponto.");
      return;
    }

    mostrarSpinner();

    const callbackName = "cb_" + Date.now();

    window[callbackName] = function(res) {

      esconderSpinner();

      if (!res || res.length === 0) {
        mostrarAlertaGlobal("❌ Nenhuma designação encontrada para esse ponto.");
        delete window[callbackName];
        return;
      }

      msg.textContent = `✅ ${res.length} designações encontradas.`;

      const numeroDoPonto = (ponto || "").replace("Ponto ", "").trim();

      let html = `<h5 style="text-align:center; margin-bottom: 20px;">Escalas do Ponto ${numeroDoPonto}</h5>`;

      html += `<table class="tabela-listagem">
        <thead>
          <tr>
            <th style="width: 35%;">Nome</th>
            <th style="width: 15%;">Turno</th>
            <th style="width: 15%;">Dia</th>
            <th style="width: 15%;">Freq.</th>
            <th style="width: 20%;">Most.</th>
          </tr>
        </thead><tbody>`;

      res.forEach(r => {
        html += `
          <tr>
            <td>${formatarNomeComNegrito(r.nome)}</td>
            <td>${r.turno}</td>
            <td>${r.dia}</td>
            <td>${r.frequencia}</td>
            <td>${r.equipamento}</td>
          </tr>`;
      });

      html += "</tbody></table>";

      container.innerHTML = html;
      document.getElementById("btnExportarPdfDesignacoes").style.display = "block";

      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src =
      "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec" +
      "?action=listarDesignacoesDoPonto" +
      "&ponto=" + encodeURIComponent(ponto) +
      "&callback=" + callbackName;

    document.body.appendChild(script);
  }


  function baixarDesignacoesPorPonto() {

    const ponto = document.getElementById("pontobepp").value;
    const msg = document.getElementById("msgBaixarPDFPonto");

    msg.textContent = "";

    if (!ponto) {
      mostrarAlertaGlobal("❌ Selecione um ponto.");
      return;
    }

    mostrarSpinner();

    const callbackName = "cb_" + Date.now();

    window[callbackName] = function(link) {

      esconderSpinner();

      msg.innerHTML =
        `✅ PDF pronto: <a href="${link}" target="_blank">Clique para baixar</a>`;

      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.src =
      "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec" +
      "?action=gerarPdfDesignacoesDoPonto" +
      "&ponto=" + encodeURIComponent(ponto) +
      "&callback=" + callbackName;

    document.body.appendChild(script);
  }
  
 function callJSONP(action, params, onSuccess, onFailure) {
  const cbName = "cb_" + Math.random().toString(36).substr(2);

  window[cbName] = function (res) {
    delete window[cbName];
    document.body.removeChild(script);
    onSuccess && onSuccess(res);
  };

  const query = Object.keys(params || {})
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");

  const script = document.createElement("script");

  script.onerror = function () {
    delete window[cbName];
    document.body.removeChild(script);
    onFailure && onFailure(new Error("Erro JSONP"));
  };

  script.src =
    action +
    "?" +
    query +
    "&callback=" +
    cbName;

  document.body.appendChild(script);
}

async function salvarDesignacao() {

  const ponto = document.getElementById("ponto").value;
  const dia = document.getElementById("dia").value;

  if (!participanteSelecionadoDesignacao) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const nomeParticipante = participanteSelecionadoDesignacao.nome;
  const idParticipante = participanteSelecionadoDesignacao.id;

  mostrarSpinner();

  const substituto =
    await selecionarSubstituicaoDesignados(ponto, dia);

  const substituirQuem = substituto ? substituto.id : "";

  const frequencia = document.getElementById("frequencia").value;
  const equipamento = document.getElementById("equipamento").value;

  if (!ponto || !dia || !idParticipante || !frequencia || !equipamento) {
    mostrarAlertaGlobal("⚠️ Preencha todos os campos obrigatórios.");
    return;
  }

  const mensagem = substituto
    ? `Confirma a designação de <b>${nomeParticipante}</b> para o ponto <b>${ponto}</b>, substituindo <b>${substituto.nome}</b>?`
    : `Confirma a designação de <b>${nomeParticipante}</b> para o ponto <b>${ponto}</b>?`;

  mostrarConfirmacaoGlobal(mensagem, () => {

    mostrarSpinner();

    callJSONP(
      "processarDesignacao",
      {
        idParticipante,
        ponto,
        dia,
        frequencia,
        substituirQuem,
        equipamento
      },
      (retorno) => {

        esconderSpinner();

        if (retorno.startsWith("🚫")) {
          mostrarAlertaGlobal(retorno);
          return;
        }

        mostrarAlertaGlobal(
          `✅ ${nomeParticipante} designado(a) com sucesso`
        );

        document.getElementById("ponto").selectedIndex = 0;
        document.getElementById("dia").selectedIndex = 0;
        document.getElementById("frequencia").selectedIndex = 0;
        document.getElementById("nomeSubstituido").value = "";
        document.getElementById("participanteDesignacao").value = "";
        participanteSelecionadoDesignacao = null;
        participanteSubstituido = null;

        document.getElementById("substituirQuem").selectedIndex = 0;
        document.getElementById("equipamento").selectedIndex = 0;

        carregarTodasVagasAbertas();
        carregarAbas();
      },
      () => {
        esconderSpinner();
        mostrarAlertaGlobal("❌ Erro ao salvar designação");
      }
    );

  });
}

function callJSONP(action, params, onSuccess, onFailure) {
  const cbName = "cb_" + Math.random().toString(36).substr(2);

  window[cbName] = function (res) {
    delete window[cbName];
    document.body.removeChild(script);
    onSuccess && onSuccess(res);
  };

  const query = Object.keys(params || {})
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");

  const script = document.createElement("script");

  script.onerror = function () {
    delete window[cbName];
    document.body.removeChild(script);
    onFailure && onFailure(new Error("Erro JSONP"));
  };

  script.src =
    action +
    "?" +
    query +
    "&callback=" +
    cbName;

  document.body.appendChild(script);
}

function converterDesignacoesParaIDs() {
  const pontoSelecionado = document.getElementById('pontoCorrigir').value;
  const msg = document.getElementById("msgCorrigir");
  const tabelaContainer = document.getElementById("tabelaNaoEncontradosContainer");

  msg.textContent = `🔄 Convertendo designações por nome para ID no ponto ${pontoSelecionado}...`;
  tabelaContainer.innerHTML = "";
  mostrarSpinner();

  callJSONP(
    "converterDesignacoesParaIDs",
    { ponto: pontoSelecionado },
    (resultado) => {

      msg.innerHTML = (resultado.mensagem || "").replace(/\n/g, "<br>");

      if (resultado.naoEncontrados && resultado.naoEncontrados.length > 0) {

        const tabela = document.createElement('table');
        tabela.classList.add('tabela-listagem');

        const thead = tabela.createTHead();
        const headerRow = thead.insertRow();

        ["Nome", "Ponto", "Dia"].forEach(texto => {
          const th = document.createElement("th");
          th.textContent = texto;
          headerRow.appendChild(th);
        });

        const tbody = tabela.createTBody();

        resultado.naoEncontrados.forEach(item => {
          const row = tbody.insertRow();
          [item.nome, item.ponto, item.dia].forEach(texto => {
            const cell = row.insertCell();
            cell.textContent = texto;
          });
        });

        tabelaContainer.appendChild(tabela);

      } else {
        tabelaContainer.innerHTML = "<p>✅ Todos os nomes foram convertidos com sucesso.</p>";
        mostrarAlertaGlobal("✅ Todos os nomes foram convertidos com sucesso.");
      }

      esconderSpinner();
    },
    (erro) => {
      mostrarAlertaGlobal("Erro: " + erro.message);
      esconderSpinner();
    }
  );
}

function corrigirDesignacoesPorId() {
  const pontoSelecionado = document.getElementById('pontoCorrigir').value;
  const msg = document.getElementById("msgCorrigir");
  const tabelaContainer = document.getElementById("tabelaNaoEncontradosContainer");

  msg.textContent = `🛠️ Corrigindo registros de designações com base nos IDs para o ponto ${pontoSelecionado}...`;
  tabelaContainer.innerHTML = "";
  mostrarSpinner();

  callJSONP(
    "corrigirDesignacoesPontosComID",
    { ponto: pontoSelecionado },
    (resultado) => {

      msg.innerHTML = (resultado.mensagem || "").replace(/\n/g, "<br>");

      if (resultado.naoEncontrados && resultado.naoEncontrados.length > 0) {

        const tabela = document.createElement('table');
        tabela.classList.add('tabela-listagem');

        const thead = tabela.createTHead();
        const headerRow = thead.insertRow();

        ["ID", "Ponto", "Dia"].forEach(texto => {
          const th = document.createElement("th");
          th.textContent = texto;
          headerRow.appendChild(th);
        });

        const tbody = tabela.createTBody();

        resultado.naoEncontrados.forEach(item => {
          const row = tbody.insertRow();
          [item.id, item.ponto, item.dia].forEach(texto => {
            const cell = row.insertCell();
            cell.textContent = texto;
          });
        });

        tabelaContainer.appendChild(tabela);

      } else {
        tabelaContainer.innerHTML = "<p>✅ Todos os registros foram encontrados e corrigidos.</p>";
        mostrarAlertaGlobal("✅ Todos os registros foram encontrados e corrigidos.");
      }

      esconderSpinner();
    },
    (erro) => {
      mostrarAlertaGlobal("Erro: " + erro.message);
      esconderSpinner();
    }
  );
}

function buscarTreinando() {
  const resultadoDiv = document.getElementById('resultadoTreinando');
  const msg = document.getElementById('msgTreinando') || { textContent: () => {} };

  resultadoDiv.innerHTML = '';

  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(lista) {

    esconderSpinner();

    if (!lista || lista.length === 0) {
      mostrarAlertaGlobal("❌ Nenhum participante em treinamento encontrado.");
      delete window[callback];
      return;
    }

    if (msg) msg.textContent = `✅ ${lista.length} treinando(s) encontrado(s).`;

    const tabela = document.createElement('table');
    tabela.className = 'tabela-listagem';

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();
    ['Nome', 'Congregação', 'Telefone', 'Sexo'].forEach(txt => {
      const th = document.createElement('th');
      th.textContent = txt;
      trHead.appendChild(th);
    });

    const tbody = tabela.createTBody();
    lista.forEach(item => {
      const tr = tbody.insertRow();

      const tdNome = tr.insertCell();
      tdNome.textContent = item.nome;
      tdNome.classList.add('clicavel-nome-treinando');
      tdNome.style.cursor = 'pointer';
      tdNome.style.color = 'green';
      tdNome.title = 'Clique para ver disponibilidade';

      tdNome.dataset.id = item.id || '';
      tdNome.dataset.nome = item.nome || '';
      tdNome.dataset.congregacao = item.congregacao || '';
      tdNome.dataset.telefone = item.telefone || '';
      tdNome.dataset.sexo = item.sexo || '';
      tdNome.dataset.diasTurnos = Array.isArray(item.diasTurnos)
        ? JSON.stringify(item.diasTurnos)
        : JSON.stringify((item.diasTurnos || '').split(',').map(s => s.trim()).filter(Boolean));

      tr.insertCell().textContent = item.congregacao || '';

      const tdTelefone = tr.insertCell();
      const telefoneOriginal = String(item.telefone || '');
      const telefoneLimpo = telefoneOriginal.replace(/\D/g, '');

      if (telefoneLimpo) {
        const nome = item.nome || 'Participante';

        const mensagem =
          "*TPE SBC - Confirmação de Treinamento*\n\n" +
          "👤 Olá, " + nome + "\n\n" +
          "📋 Recebemos sua petição para o TPE SBC. Em breve você vai assistir à reunião de treinamento.\n\n" +
          "📲 A data e o horário da reunião de treinamento serão informados em breve.\n\n" +
          "👥 Para se manter informado, por favor, entre no grupo da reunião de treinamento pelo link abaixo: \n" +
          "👉 https://chat.whatsapp.com/IzcPluEJthPKWMH5XzdFSw\n\n" +
          "*Seus irmãos*,\n" +
          "*Equipe do TPE SBC*";

        const linkWhatsApp =
          "https://wa.me/55" +
          telefoneLimpo +
          "?text=" +
          encodeURIComponent(mensagem);

        const a = document.createElement('a');
        a.href = linkWhatsApp;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = telefoneOriginal;
        a.style.color = 'blue';
        a.classList.add('enviar-whatsapp-treinando');

        tdTelefone.appendChild(a);
      } else {
        tdTelefone.textContent = telefoneOriginal;
      }

      tr.insertCell().textContent = item.sexo || '';
    });

    resultadoDiv.appendChild(tabela);

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal("❌ Erro na busca: " + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarTreinandoCompacto" +
    "&callback=" +
    callback;

  document.body.appendChild(script);
}

/* ====== eventos (mantidos, sem alterar lógica) ====== */

document.addEventListener('click', function(event) {
  if (event.target && event.target.classList.contains('clicavel-nome-treinando')) {

    if (perfilUsuario !== 'admin') {
      mostrarAlertaGlobal("⚠️ Permitido apenas consultar quem está alistado para o próximo treinamento.");
      return;
    }

    const nome = event.target.dataset.nome || event.target.textContent.trim();
    const idTreinando = event.target.dataset.id || '';
    const sexo = event.target.dataset.sexo || '';
    const congregacao = event.target.dataset.congregacao || '';
    const telefone = event.target.dataset.telefone || '';

    let diasTurnosArray;
    try {
      diasTurnosArray = JSON.parse(event.target.dataset.diasTurnos || '[]');
    } catch (e) {
      diasTurnosArray = [];
    }

    document.getElementById('idTreinando').value = idTreinando;
    document.getElementById('nomeTreinando').value = nome;
    document.getElementById('congregacaoTreinando').value = congregacao;
    document.getElementById('telefoneTreinando').value = telefone;
    document.getElementById('sexoTreinando').value = sexo;

    const container = document.getElementById('resultadoDiasTurnos');
    const containerTreinadores = document.getElementById('resultadoTreinadores');
    container.innerHTML = '';
    if (containerTreinadores) containerTreinadores.innerHTML = '';

    if (!diasTurnosArray || diasTurnosArray.length === 0) {
      mostrarAlertaGlobal(`❌ Nenhum dia/turno disponível para ${nome}.`);
      return;
    }

    const titulo = document.createElement('h4');
    titulo.textContent = `Dias disponíveis de ${nome}:`;
    container.appendChild(titulo);

    const tabela = document.createElement('table');
    tabela.className = 'tabela-listagem';

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();
    ['Dia', 'Turno', 'Ação'].forEach(txt => {
      const th = document.createElement('th');
      th.textContent = txt;
      trHead.appendChild(th);
    });

    const tbody = tabela.createTBody();
    diasTurnosArray.forEach(dt => {
      const [dia, turno] = dt.split(" - ").map(s => s.trim());
      if (!dia || !turno) return;

      const tr = tbody.insertRow();
      tr.insertCell().textContent = dia;
      tr.insertCell().textContent = turno;

      const tdAcao = tr.insertCell();
      tdAcao.textContent = "Buscar treinador";
      tdAcao.style.color = 'blue';
      tdAcao.style.cursor = 'pointer';
      tdAcao.classList.add('btn-dia-turno');
      tdAcao.dataset.sexo = sexo;
      tdAcao.dataset.dia = dia;
      tdAcao.dataset.turno = turno;
    });

    container.appendChild(tabela);
  }
});

document.addEventListener('click', function (event) {
  if (event.target && event.target.classList.contains('btn-dia-turno')) {
    const dia = event.target.dataset.dia;
    const turno = event.target.dataset.turno;
    const sexo = event.target.dataset.sexo;

    enviarPesquisaDireta(sexo, dia, turno);
  }
});

document.addEventListener('click', function (event) {
  if (event.target && event.target.classList.contains('enviar-whatsapp-treinando')) {
    event.preventDefault();

    if (perfilUsuario !== 'admin') {
      mostrarAlertaGlobal("⚠️ Permitido apenas consultar quem está alistado para o próximo treinamento.");
      return;
    }

    const link = event.target;

    window.open(link.href, '_blank');

    link.classList.remove('enviar-whatsapp-treinando');
    link.style.color = 'gray';
    link.style.fontStyle = 'italic';

    if (!link.dataset.enviado) {
      link.innerHTML += ' <span title="Mensagem enviada">📤</span>';
      link.dataset.enviado = 'true';
    }
  }
});

/* ===== funções restantes (mantidas iguais, sem refatorar) ===== */

function buscarTreinadoresParaTreinando(treinandoSelecionado, treinadores) {

  document.getElementById('nomeTreinando').value = treinandoSelecionado.nome;
  document.getElementById('congregacaoTreinando').value = treinandoSelecionado.congregacao;
  document.getElementById('telefoneTreinando').value = treinandoSelecionado.telefone;
  document.getElementById('sexoTreinando').value = treinandoSelecionado.sexo;

  montarTabela(treinadores);
}

function montarTabela(treinadores) {

  const container = document.getElementById('resultadoContainer');
  container.innerHTML = '';

  if (!treinadores || treinadores.length === 0) {
    container.textContent = "❌ Nenhum treinador encontrado.";
    return;
  }

  const tabela = document.createElement('table');
  tabela.className = 'tabela-listagem';

  const thead = tabela.createTHead();
  const trHead = thead.insertRow();

  ['Nome', 'Sexo', 'Ações'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    trHead.appendChild(th);
  });

  const tbody = tabela.createTBody();

  treinadores.forEach(treinador => {
    const tr = tbody.insertRow();

    tr.insertCell().textContent = treinador.nome || '';
    tr.insertCell().textContent = treinador.sexo || '';

    const tdAcoes = tr.insertCell();

    const btn = document.createElement('button');
    btn.textContent = '📌 Designar';

    btn.onclick = () => {

      const nomeTreinando = document.getElementById('nomeTreinando').value.trim();
      const idTreinando = document.getElementById('idTreinando').value.trim();
      const congregacao = document.getElementById('congregacaoTreinando').value.trim();
      const telefone = document.getElementById('telefoneTreinando').value.trim();

      if (!nomeTreinando || !congregacao || !telefone) {
        mostrarAlertaGlobal("⚠️ Atenção! Os dados do candidato estão incompletos.");
        return;
      }

      abrirFluxoDesignacao(
        idTreinando,
        treinador.id,
        nomeTreinando,
        congregacao,
        telefone
      );
    };

    tdAcoes.appendChild(btn);
  });

  container.appendChild(tabela);
}

function abrirFluxoDesignacao(idTreinando, idTreinador, nomeTreinando, congregacao, telefone) {

  const modal = document.getElementById('modalConfirmarDesignacao');

  modal.dataset.idTreinando = idTreinando;
  modal.dataset.idTreinador = idTreinador;
  modal.dataset.nomeTreinando = nomeTreinando;
  modal.dataset.congregacao = congregacao;
  modal.dataset.telefone = telefone;

  modal.classList.remove('oculto');
}

function confirmarDesignacao() {

  const modal = document.getElementById('modalConfirmarDesignacao');

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;
  const nomeTreinando = modal.dataset.nomeTreinando;
  const congregacao = modal.dataset.congregacao;
  const telefone = modal.dataset.telefone;

  mostrarSpinner();

  const callback = "cb_designacao_" + Date.now();

  window[callback] = function() {

    esconderSpinner();
    fecharModalDesignacao();
    buscarTreinando();

    abrirModalWhatsapp(
      idTreinando,
      idTreinador,
      nomeTreinando,
      congregacao,
      telefone
    );

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=registrarDesignacaoTreinamento" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function abrirModalWhatsapp(idTreinando, idTreinador, nomeTreinando, congregacao, telefone) {

  const modal = document.getElementById('modalEnviarWhatsapp');

  modal.dataset.idTreinando = idTreinando;
  modal.dataset.idTreinador = idTreinador;
  modal.dataset.nomeTreinando = nomeTreinando;
  modal.dataset.congregacao = congregacao;
  modal.dataset.telefone = telefone;

  modal.classList.remove('oculto');
}

function enviarWhatsappDesignacao() {

  const modal = document.getElementById('modalEnviarWhatsapp');

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;
  const nomeTreinando = modal.dataset.nomeTreinando;
  const congregacao = modal.dataset.congregacao;
  const telefone = modal.dataset.telefone;

  mostrarSpinner();

  const mensagem =
    "*TREINAMENTO PRATICO DO TPE*\n\n" +
    `Prezado(a) participante do TPE! Gostaríamos de contar com sua ajuda para treinar um novo participante do TPE.\n\n` +
    `👤 *Nome do participante:* ${nomeTreinando}\n` +
    `✍️ *Congregação:* ${congregacao}\n\n` +
    `📲 *Telefone:* ${telefone}\n\n` +
    `Por favor, confirme!\n\n` +
    `Depois do treinamento, acesse o aplicativo e conclua o treinamento na seção "Meus Treinamentos".\n\n` +
    `Agradecemos por sua valiosa ajuda desde já!`;

  const mensagemCodificada = encodeURIComponent(mensagem);

  const callback = "cb_whats_" + Date.now();

  window[callback] = function(url) {
    esconderSpinner();
    window.open(url, "_blank");
    fecharModalWhatsapp();
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarNumeroWhatsAppPorIdComMensagem" +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&mensagem=" + mensagemCodificada +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function fecharModalDesignacao() {
  document.getElementById('modalConfirmarDesignacao').classList.add('oculto');
}

function fecharModalWhatsapp() {
  document.getElementById('modalEnviarWhatsapp').classList.add('oculto');
}

function buscarTreinamentosEmAndamento() {

  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(lista) {

    esconderSpinner();

    const container = document.getElementById('resultadoTreinamentosAndamento');

    container.innerHTML = '';

    if (!lista || lista.length === 0) {
      container.innerHTML = '<p>❌ Nenhum treinamento em andamento.</p>';
      delete window[callback];
      return;
    }

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();

    [
      'Candidato',
      'Cong.',
      'Treinador',
      'Ação'
    ].forEach(texto => {

      const th = document.createElement('th');
      th.textContent = texto;
      trHead.appendChild(th);
    });

    const tbody = tabela.createTBody();

    lista.forEach(item => {

      const tr = tbody.insertRow();

      tr.insertCell().textContent = item.nomeTreinando;
      tr.insertCell().textContent = item.congregacao;
      tr.insertCell().textContent = item.nomeTreinador;

      const tdAcao = tr.insertCell();

      const btnAcoes = document.createElement('button');
      btnAcoes.textContent = '✏️Editar';
      btnAcoes.classList.add('btn-acoes-treinamento');

      btnAcoes.dataset.idTreinando = item.idTreinando;
      btnAcoes.dataset.idTreinador = item.idTreinador;
      btnAcoes.dataset.nomeTreinando = item.nomeTreinando;
      btnAcoes.dataset.congregacao = item.congregacao;
      btnAcoes.dataset.telefone = item.telefone;

      tdAcao.appendChild(btnAcoes);
    });

    container.appendChild(tabela);

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal('❌ ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=listarTreinamentosEmAndamento" +
    "&callback=" +
    callback;

  document.body.appendChild(script);
}


/* ================= EVENTOS ================= */

document.getElementById('acaoConcluir').addEventListener('click', function() {

  const modal = document.getElementById('modalAcoesTreinamento');

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;

  mostrarSpinner();

  const callback = "cb_concluir_" + Date.now();

  window[callback] = function() {

    esconderSpinner();
    fecharModalAcoesTreinamento();
    buscarTreinamentosEmAndamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=concluirTreinamento" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&callback=" + callback;

  document.body.appendChild(script);
});


document.getElementById('acaoDesistencia').addEventListener('click', async function() {

  const modal = document.getElementById('modalAcoesTreinamento');

  const nomeTreinando = modal.dataset.nomeTreinando;

  const confirmou = await confirmarDecisao(
    `Confirma registrar a desistência de <b>${nomeTreinando}</b>?`,
    'Sim',
    'Cancelar'
  );

  if (!confirmou) return;

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;

  mostrarSpinner();

  const callback = "cb_desistencia_" + Date.now();

  window[callback] = function() {

    esconderSpinner();
    fecharModalAcoesTreinamento();

    mostrarAlertaGlobal('❌ Desistência registrada.');

    buscarTreinamentosEmAndamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=marcarDesistenciaTreinamento" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&callback=" + callback;

  document.body.appendChild(script);
});


document.getElementById('acaoAlterarTreinador').addEventListener('click', function() {

  const modalAcoes = document.getElementById('modalAcoesTreinamento');
  const modalTreinador = document.getElementById('modalAlterarTreinador');

  modalTreinador.dataset.idTreinando = modalAcoes.dataset.idTreinando;
  modalTreinador.dataset.idTreinadorAtual = modalAcoes.dataset.idTreinador;
  modalTreinador.dataset.nomeTreinando = modalAcoes.dataset.nomeTreinando;
  modalTreinador.dataset.congregacao = modalAcoes.dataset.congregacao;
  modalTreinador.dataset.telefone = modalAcoes.dataset.telefone;

  fecharModalAcoesTreinamento();
  modalTreinador.classList.remove('oculto');
});


document.getElementById('acaoLembrete').addEventListener('click', function() {

  const modal = document.getElementById('modalAcoesTreinamento');

  fecharModalAcoesTreinamento();

  comunicarLembreteTreinador(
    modal.dataset.idTreinador,
    modal.dataset.nomeTreinando,
    modal.dataset.congregacao,
    modal.dataset.telefone
  );
});


document.addEventListener('click', function(e) {

  if (e.target.classList.contains('btn-acoes-treinamento')) {

    const modal = document.getElementById('modalAcoesTreinamento');

    modal.dataset.idTreinando = e.target.dataset.idTreinando;
    modal.dataset.idTreinador = e.target.dataset.idTreinador;
    modal.dataset.nomeTreinando = e.target.dataset.nomeTreinando;
    modal.dataset.congregacao = e.target.dataset.congregacao;
    modal.dataset.telefone = e.target.dataset.telefone;

    modal.classList.remove('oculto');
  }
});


/* ================= MODAIS ================= */

function fecharModalAcoesTreinamento() {
  document.getElementById('modalAcoesTreinamento').classList.add('oculto');
}

function fecharModalAdministrador() {
  document.getElementById('modalComunicarAdministrador').classList.add('oculto');
}

function fecharModalTreinador() {
  document.getElementById('modalAlterarTreinador').classList.add('oculto');
}

function fecharModalComunicacao() {
  const modal = document.getElementById('modalComunicarTreinador');
  modal.classList.add('oculto');

  delete modal.dataset.idNovoTreinador;
  delete modal.dataset.nomeTreinando;
  delete modal.dataset.congregacao;
  delete modal.dataset.telefone;

  buscarTreinamentosEmAndamento();
}


/* ================= FLUXOS ================= */

function confirmarAlteracaoTreinador() {

  mostrarSpinner();

  const modal = document.getElementById('modalAlterarTreinador');

  const idTreinando = modal.dataset.idTreinando;
  const idTreinadorAtual = modal.dataset.idTreinadorAtual;
  const nomeTreinando = modal.dataset.nomeTreinando;
  const congregacao = modal.dataset.congregacao;
  const telefone = modal.dataset.telefone;
  const nomeSelecionado = document.getElementById('listaNomesTrei').value;

  if (!nomeSelecionado) {
    mostrarAlertaGlobal('Selecione um treinador');
    return;
  }

  const callback = "cb_alt_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (!res.sucesso) {
      mostrarAlertaGlobal(res.mensagem);
      delete window[callback];
      return;
    }

    fecharModalTreinador();

    const modalComunicacao = document.getElementById('modalComunicarTreinador');

    modalComunicacao.dataset.idNovoTreinador = res.idNovoTreinador;
    modalComunicacao.dataset.nomeTreinando = nomeTreinando;
    modalComunicacao.dataset.congregacao = congregacao;
    modalComunicacao.dataset.telefone = telefone;

    modalComunicacao.classList.remove('oculto');

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=alterarTreinadorPorNome" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinadorAtual=" + encodeURIComponent(idTreinadorAtual) +
    "&nomeSelecionado=" + encodeURIComponent(nomeSelecionado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function comunicarNovoTreinador() {

  mostrarSpinner();

  const modal = document.getElementById('modalComunicarTreinador');

  const idNovoTreinador = modal.dataset.idNovoTreinador;
  const nomeTreinando = modal.dataset.nomeTreinando;
  const congregacao = modal.dataset.congregacao;
  const telefone = modal.dataset.telefone;

  const mensagem =
    "*TREINAMENTO PRATICO DO TPE*\n\n" +
    `Prezado(a) participante do TPE! Gostaríamos de contar com sua ajuda para treinar um novo participante do TPE.\n\n` +
    `👤 *Novo participante:* ${nomeTreinando}\n` +
    `✍️ *Congregação:* ${congregacao}\n` +
    `📲 *Telefone:* ${telefone}\n\n` +
    `Por favor, confirme!\n\n` +
    `Depois do treinamento, acesse o aplicativo e conclua o treinamento na seção "Meus Treinamentos".\n\n` +
    `Agradecemos por sua valiosa ajuda desde já!`;

  const mensagemCodificada = encodeURIComponent(mensagem);

  const callback = "cb_whats_" + Date.now();

  window[callback] = function(url) {

    esconderSpinner();
    window.open(url, '_blank');
    fecharModalComunicacao();
    buscarTreinamentosEmAndamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarNumeroWhatsAppPorIdComMensagem" +
    "&idTreinador=" + encodeURIComponent(idNovoTreinador) +
    "&mensagem=" + mensagemCodificada +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function comunicarLembreteTreinador(
  idTreinador,
  nomeTreinando,
  congregacao,
  telefone
) {

  mostrarSpinner();

  const mensagem =
    "*LEMBRETE DE TREINAMENTO DO TPE*\n\n" +
    "Olá! Este é um lembrete sobre um treinamento que está em andamento.\n\n" +
    `👤 *Participante:* ${nomeTreinando}\n` +
    `✍️ *Congregação:* ${congregacao}\n` +
    `📲 *Telefone:* ${telefone}\n\n` +
    "Caso o treinamento já tenha sido realizado, por favor acesse o aplicativo e conclua o treinamento na seção *Meus Treinamentos*.\n\n" +
    "Agradecemos por sua ajuda!";

  const mensagemCodificada = encodeURIComponent(mensagem);

  const callback = "cb_lembrete_" + Date.now();

  window[callback] = function(url) {

    esconderSpinner();
    window.open(url, '_blank');
    buscarTreinamentosEmAndamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarNumeroWhatsAppPorIdComMensagem" +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&mensagem=" + mensagemCodificada +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function consultarMeuTreinamento() {

  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    const container = document.getElementById('resultadoMeuTreinamento');

    container.innerHTML = '';

    if (!res.sucesso) {
      mostrarAlertaGlobal(res.mensagem);
      delete window[callback];
      return;
    }

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();

    ['Nome', 'Cong.', 'Contato', 'Ação'].forEach(texto => {

      const th = document.createElement('th');
      th.textContent = texto;
      trHead.appendChild(th);
    });

    const tbody = tabela.createTBody();

    const tr = tbody.insertRow();

    tr.insertCell().textContent = res.nome;
    tr.insertCell().textContent = res.congregacao;
    tr.insertCell().textContent = res.telefone;

    const tdAcao = tr.insertCell();

    const btnAcoes = document.createElement('button');
    btnAcoes.textContent = '✅Concluir';
    btnAcoes.classList.add('concluir-meu-treinamento');
    btnAcoes.style.cursor = 'pointer';

    btnAcoes.dataset.idTreinando = res.idTreinando;
    btnAcoes.dataset.idTreinador = idUsuarioLogado;
    btnAcoes.dataset.nomeTreinando = res.nome;

    tdAcao.appendChild(btnAcoes);

    container.appendChild(tabela);

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal(err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=consultarMeuTreinamento" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


/* ================= CLICK CONCLUIR ================= */

document.addEventListener('click', function(e) {

  if (e.target.classList.contains('concluir-meu-treinamento')) {

    const modal = document.getElementById('modalAcoesTreinador');

    modal.dataset.idTreinando = e.target.dataset.idTreinando;
    modal.dataset.idTreinador = e.target.dataset.idTreinador;
    modal.dataset.nomeTreinando = e.target.dataset.nomeTreinando;

    modal.classList.remove('oculto');
  }

});


document.getElementById('acaoConcluirTreinador').addEventListener('click', async function () {

  const modal = document.getElementById('modalAcoesTreinador');

  const nomeTreinando = modal.dataset.nomeTreinando;

  const confirmou = await confirmarDecisao(
    `Confirmar conclusão do treinamento de <b>${nomeTreinando}</b>?`,
    'Concluir',
    'Cancelar'
  );

  if (!confirmou) return;

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;

  mostrarSpinner();

  const callback = "cb_concluir_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();
    fecharModalAcoesTreinador();

    if (!res.sucesso) {
      mostrarAlertaGlobal(res.mensagem);
      delete window[callback];
      return;
    }

    const modalAdmin = document.getElementById('modalComunicarAdministrador');

    modalAdmin.dataset.tipo = 'CONCLUSAO';
    modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
    modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
    modalAdmin.dataset.dataHora = res.dataHora;

    modalAdmin.classList.remove('oculto');

    consultarMeuTreinamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=concluirTreinamento" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&callback=" + callback;

  document.body.appendChild(script);
});


document.getElementById('acaoDesistenciaTreinador').addEventListener('click', async function () {

  const modal = document.getElementById('modalAcoesTreinador');

  const nomeTreinando = modal.dataset.nomeTreinando;

  const confirmou = await confirmarDecisao(
    `Confirma registrar a desistência de <b>${nomeTreinando}</b>?`,
    'Sim',
    'Cancelar'
  );

  if (!confirmou) return;

  const idTreinando = modal.dataset.idTreinando;
  const idTreinador = modal.dataset.idTreinador;

  mostrarSpinner();

  const callback = "cb_desistencia_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();
    fecharModalAcoesTreinador();

    if (!res.sucesso) {
      mostrarAlertaGlobal(res.mensagem);
      delete window[callback];
      return;
    }

    const modalAdmin = document.getElementById('modalComunicarAdministrador');

    modalAdmin.dataset.tipo = 'DESISTENCIA';
    modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
    modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
    modalAdmin.dataset.dataHora = res.dataHora;

    modalAdmin.classList.remove('oculto');

    consultarMeuTreinamento();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=marcarDesistenciaTreinamento" +
    "&idTreinando=" + encodeURIComponent(idTreinando) +
    "&idTreinador=" + encodeURIComponent(idTreinador) +
    "&callback=" + callback;

  document.body.appendChild(script);
});


function confirmarDecisao(mensagem, textoSim, textoNao) {
  return new Promise((resolve) => {

    const alerta = document.getElementById('confirmacaoGlobal');
    const alertaMensagem = document.getElementById('confirmacaoMensagem');
    const botaoOk = document.getElementById('confirmacaoBotaoOk');
    const botaoCancelar = document.getElementById('confirmacaoBotaoCancelar');

    alertaMensagem.innerHTML = mensagem;

    botaoOk.textContent = textoSim || 'Sim';
    botaoCancelar.textContent = textoNao || 'Não';

    alerta.classList.remove('oculto');

    botaoOk.onclick = () => {
      alerta.classList.add('oculto');
      resolve(true);
    };

    botaoCancelar.onclick = () => {
      alerta.classList.add('oculto');
      resolve(false);
    };
  });
}


/* ================= ADMIN ================= */

function comunicarAdministrador() {

  const modal = document.getElementById('modalComunicarAdministrador');

  const tipo = modal.dataset.tipo;
  const nomeTreinador = modal.dataset.nomeTreinador;
  const nomeTreinando = modal.dataset.nomeTreinando;
  const dataHora = modal.dataset.dataHora;

  let mensagemAdmin = '';

  if (tipo === 'CONCLUSAO') {

    mensagemAdmin =
      "*TREINAMENTO CONCLUÍDO*\n\n" +
      `👨‍🏫 Treinador: ${nomeTreinador}\n` +
      `👤 Candidato: ${nomeTreinando}\n\n` +
      `📅 Data e hora: ${dataHora}\n\n` +
      "O treinamento foi concluído e encerrado no sistema.";

  } else {

    mensagemAdmin =
      "*TREINAMENTO CANCELADO (DESISTÊNCIA)*\n\n" +
      `👨‍🏫 Treinador: ${nomeTreinador}\n` +
      `👤 Candidato: ${nomeTreinando}\n\n` +
      `📅 Data e hora: ${dataHora}\n\n` +
      "O candidato desistiu do treinamento.";
  }

  const callback = "cb_admin_" + Date.now();

  window[callback] = function(url) {
    window.open(url, '_blank');
    fecharModalAdministrador();
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=gerarLinkWhatsAppAdministrador" +
    "&mensagem=" + encodeURIComponent(mensagemAdmin) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


/* ================= VERIFICAÇÃO ================= */

function verificarTreinamentoPendente() {

  const callback = "cb_pend_" + Date.now();

  window[callback] = function(res) {

    if (!res.possuiTreinamento) {
      delete window[callback];
      return;
    }

    mostrarAlertaGlobal(
      '🎓 Você possui um treinamento pendente com o candidato:\n\n' +
      res.nome +
      '\n\nAcesse "Meus Treinamentos" para concluir o processo após realizar o treinamento.'
    );

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=verificarTreinamentoPendente" +
    "&id=" + encodeURIComponent(idUsuarioLogado) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


/* ================= FECHAMENTO ================= */

function fecharModalAcoesTreinador() {
  document.getElementById('modalAcoesTreinador').classList.add('oculto');
}

let irregularesEncontrados = [];

function buscarIrregulares() {

  const resultadoDiv = document.getElementById('resultadoIrregulares');
  const msg = document.getElementById('msgIrregulares') || { textContent: () => {} };

  resultadoDiv.innerHTML = '';

  mostrarSpinner();

  const callback = "cb_" + Date.now();

  window[callback] = function(lista) {

    esconderSpinner();

    irregularesEncontrados = lista;

    if (!lista || lista.length === 0) {
      mostrarAlertaGlobal("❌ Nenhum participante irregular encontrado.");
      delete window[callback];
      return;
    }

    if (msg) msg.textContent = `✅ ${lista.length} irregular(es) encontrado(s).`;

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const thead = tabela.createTHead();
    const trHead = thead.insertRow();

    ['Nome', 'Congregação', 'Telefone', 'Sexo'].forEach(txt => {
      const th = document.createElement('th');
      th.textContent = txt;
      trHead.appendChild(th);
    });

    const tbody = tabela.createTBody();

    lista.forEach(item => {

      const tr = tbody.insertRow();

      const tdNome = tr.insertCell();
      tdNome.textContent = item.nome;

      tdNome.dataset.nome = item.nome || '';
      tdNome.dataset.congregacao = item.congregacao || '';
      tdNome.dataset.telefone = item.telefone || '';
      tdNome.dataset.sexo = item.sexo || '';
      tdNome.dataset.diasTurnos = Array.isArray(item.diasTurnos)
        ? JSON.stringify(item.diasTurnos)
        : JSON.stringify((item.diasTurnos || '').split(',').map(s => s.trim()).filter(Boolean));

      tr.insertCell().textContent = item.congregacao || '';

      const tdTelefone = tr.insertCell();

      const telefoneOriginal = String(item.telefone || '');
      const telefoneLimpo = telefoneOriginal.replace(/\D/g, '');

      if (telefoneLimpo) {

        const nome = item.nome || 'Participante';

        const mensagem =
          "*TPE SBC - Informativo*\n\n" +
          "👤 Olá, " + nome + "\n\n" +
          "📋 Percebemos que você não tem uma designação no TPE, e gostaríamos de informar que é possível apoiar o arranjo em novos pontos com novos turnos de 2 horas, uma ou mais vezes por mês.\n\n" +
          "📲 Para apoiar, acesse o aplicativo do TPE na descrição do grupo dos participantes usando seu email pessoal e a senha 114514.\n\n" +
          "👥 Em caso de email ou senha incorreta, ou se você já tem uma designação no TPE, por favor, entre em contato conosco para atualizar.\n" +
          "*Seus irmãos*,\n" +
          "*Equipe do TPE SBC*";

        const linkWhatsApp =
          "https://wa.me/55" +
          telefoneLimpo +
          "?text=" +
          encodeURIComponent(mensagem);

        const a = document.createElement('a');
        a.href = linkWhatsApp;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = telefoneOriginal;
        a.style.color = 'blue';
        a.classList.add('enviar-whatsapp-irregulares');

        tdTelefone.appendChild(a);

      } else {
        tdTelefone.textContent = telefoneOriginal;
      }

      tr.insertCell().textContent = item.sexo || '';
    });

    resultadoDiv.appendChild(tabela);

    document.getElementById('dadosUsuarioContainerIr').style.display = 'inline-block';
    document.getElementById('enviarEmailIrregularesBtn').style.display = "inline-block";

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal("❌ Erro na busca: " + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=buscarIrregulares" +
    "&callback=" +
    callback;

  document.body.appendChild(script);
}


/* ================= WHATSAPP CLICK ================= */

document.addEventListener('click', function (event) {

  if (event.target && event.target.classList.contains('enviar-whatsapp-irregulares')) {

    event.preventDefault();

    if (perfilUsuario !== 'admin') {
      mostrarAlertaGlobal("⚠️ Permitido apenas consultar quem não tem designação no TPE.");
      return;
    }

    const link = event.target;

    window.open(link.href, '_blank');

    link.classList.remove('enviar-whatsapp-irregulares');
    link.style.color = 'gray';
    link.style.fontStyle = 'italic';

    if (!link.dataset.enviado) {
      link.innerHTML += ' <span title="Mensagem enviada">📤</span>';
      link.dataset.enviado = 'true';
    }
  }
});


/* ================= EMAIL ================= */

document.getElementById('enviarEmailIrregularesBtn').addEventListener('click', function () {

  if (!irregularesEncontrados || irregularesEncontrados.length === 0) {
    mostrarAlertaGlobal("⚠️ Nenhum participante irregular encontrado para envio de e-mail.");
    return;
  }

  const telefone = document.getElementById('telefoneInputUsuarioIr').value.trim();
  const email = document.getElementById('emailInputUsuarioIr').value.trim();
  const nomeUsuarioAtual = document.getElementById('nomeSelectUsuarioIr').value;

  if (!nomeUsuarioAtual || !telefone || !email) {
    mostrarAlertaGlobal(
      "⚠️ Por favor, verifique se os dados do usuário (nome, telefone e e-mail) foram preenchidos corretamente antes de enviar os e-mails."
    );
    return;
  }

  const assunto = "Participante sem designação no TPE";

  const mensagemBase =
    "TPE SBC - Informativo\n\n" +
    "Olá, querido(a) irmão(ã)\n\n" +
    "Percebemos que você não tem uma designação no TPE, e gostaríamos de informar que é possível apoiar o arranjo em novos pontos com novos turnos de 2 horas, uma ou mais vezes por mês.\n\n" +
    "Para apoiar, acesse o aplicativo do TPE na descrição do grupo dos participantes usando seu email pessoal e a senha 114514.\n\n" +
    "Em caso de email ou senha incorretos, ou se você já tem uma designação no TPE, por favor, entre em contato conosco para atualizar.\n\n" +
    "Seus irmãos,\nEquipe do TPE SBC";

  mostrarConfirmacaoGlobal(
    `📧 Deseja enviar e-mail para todos os <strong>${irregularesEncontrados.length}</strong> participantes irregulares encontrados?`,
    () => {

      mostrarSpinner();

      const nomes = irregularesEncontrados.map(p => p.nome);

      const callback = "cb_email_" + Date.now();

      window[callback] = function() {
        esconderSpinner();
        mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");
        delete window[callback];
      };

      const script = document.createElement("script");
      script.src =
        API_URL +
        "?acao=enviarEmailParaIrregularesComUsuario" +
        "&nomes=" + encodeURIComponent(JSON.stringify(nomes)) +
        "&usuario=" + encodeURIComponent(nomeUsuarioAtual) +
        "&assunto=" + encodeURIComponent(assunto) +
        "&mensagem=" + encodeURIComponent(mensagemBase) +
        "&callback=" + callback;

      document.body.appendChild(script);
    }
  );
});


/* ================= CONTATOS ================= */

document.getElementById('nomeInputUsuarioIr').addEventListener('input', function () {

  setTimeout(() => {

    const nomeSelecionado = document.getElementById('nomeSelectUsuarioIr').value;

    if (nomeSelecionado) {
      pegarContatosDoUsuarioIr(nomeSelecionado);
    } else {
      console.warn("⚠️ Nenhum nome selecionado no select após digitar.");
    }

  }, 300);

});


function pegarContatosDoUsuarioIr(nome) {

  mostrarSpinner();

  const callback = "cb_contato_" + Date.now();

  window[callback] = function(contato) {

    esconderSpinner();

    if (contato) {

      const telefoneInput = document.getElementById('telefoneInputUsuarioIr');
      const emailInput = document.getElementById('emailInputUsuarioIr');
      const nomeSelect = document.getElementById('nomeSelectUsuarioIr');

      telefoneInput.value = contato.telefone || '';
      emailInput.value = contato.email || '';

      telefoneInput.disabled = true;
      emailInput.disabled = true;
      nomeSelect.disabled = true;

      const container = document.querySelector('#dadosUsuarioContainerIr > div[style*="display: none"]');

      if (container) {
        container.style.display = 'block';
      }

    } else {
      console.warn("⚠️ Nenhum contato retornado.");
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    console.error("❌ Erro ao buscar contato do usuário:", err.message);
    delete window[callback];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?acao=pegarContatoUsuario" +
    "&nome=" + encodeURIComponent(nome) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

let vagaContexto = {};

function salvarVaga() {

  const ponto = document.getElementById("pontoVaga").value;
  const dia = document.getElementById("diaVaga").value;
  const frequencia = document.getElementById("frequenciaVaga").value;

  if (!ponto || !dia || !frequencia) {
    mostrarAlertaGlobal("⚠️ Preencha todos os campos");
    return;
  }

  mostrarSpinner();

  vagaContexto = { ponto, dia, frequencia };

  const callback = "cb_vaga_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();
    mostrarModalSubstituicao(dados);

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=obterColunaPontoDia" +
    "&ponto=" + encodeURIComponent(ponto) +
    "&dia=" + encodeURIComponent(dia) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function mostrarModalSubstituicao(dados) {

  esconderSpinner();

  const container = document.getElementById("listaSubstituicao");
  container.innerHTML = "";

  dados.forEach((item) => {

    if (!item || item.tipo === "vazio" || (!item.nome && !item.valor)) return;

    if (item.tipo === "vaga") {

      const btn = document.createElement("button");
      btn.textContent = "🪑 " + item.valor;
      btn.classList.add("botao-participante-modal", "botao-vaga-modal");

      btn.onclick = () => {
        mostrarAlertaGlobal("⚠️ Vagas devem ser excluídas diretamente na lista de vagas.");
      };

      container.appendChild(btn);
      return;
    }

    const btn = document.createElement("button");
    btn.classList.add("botao-participante-modal");

    btn.textContent =
      item.tipo === "participante"
        ? "👤 " + item.nome
        : "⚪ vazio";

    btn.dataset.valor = item.valor;
    btn.dataset.nome = item.nome;

    btn.onclick = (e) => {

      const id = e.currentTarget.dataset.valor;
      const nome = e.currentTarget.dataset.nome;

      const { ponto, dia, frequencia } = vagaContexto;

      if (!id) {
        mostrarAlertaGlobal("❌ ID do participante não encontrado.");
        return;
      }

      const mensagem =
        `⚠️ Confirma substituir <b>${nome}</b><br>` +
        `por vaga <b>${frequencia}</b> em <b>${ponto} - ${dia}</b>?`;

      mostrarConfirmacaoGlobal(mensagem, () => {

        mostrarSpinner();

        const callback = "cb_subst_" + Date.now();

        window[callback] = function() {

          esconderSpinner();
          mostrarAlertaGlobal("✅ Vaga criada com sucesso");

          document.getElementById("modalSubstituicao").style.display = "none";

          carregarTodasVagasAbertas();
          google.script.run.atualizarVagasEmAberto();

          delete window[callback];
        };

        const script = document.createElement("script");
        script.src =
          API_URL +
          "?acao=transformarParticipanteEmVaga" +
          "&ponto=" + encodeURIComponent(ponto) +
          "&dia=" + encodeURIComponent(dia) +
          "&frequencia=" + encodeURIComponent(frequencia) +
          "&id=" + encodeURIComponent(id) +
          "&callback=" + callback;

        document.body.appendChild(script);

      });
    };

    container.appendChild(btn);
  });

  document.getElementById("modalSubstituicao").style.display = "block";
}


function confirmarNenhum() {

  const { ponto, dia, frequencia } = vagaContexto;

  const mensagem =
    `⚠️ Tem certeza que quer criar uma vaga "<b>${frequencia}</b>"<br>` +
    `no ponto "<b>${ponto}</b>" dia "<b>${dia}</b>" sem exlcuir nenhum participante?`;

  mostrarConfirmacaoGlobal(mensagem, () => {

    fecharModal();

    mostrarSpinner();

    const callback = "cb_vaganovo_" + Date.now();

    window[callback] = function() {

      esconderSpinner();
      mostrarAlertaGlobal("✅ Vaga criada com sucesso");

      carregarTodasVagasAbertas();
      google.script.run.atualizarVagasEmAberto();

      delete window[callback];
    };

    const script = document.createElement("script");
    script.src =
      API_URL +
      "?acao=cadastrarVaga" +
      "&ponto=" + encodeURIComponent(ponto) +
      "&dia=" + encodeURIComponent(dia) +
      "&frequencia=" + encodeURIComponent(frequencia) +
      "&callback=" + callback;

    document.body.appendChild(script);
  });
}


function fecharModal() {
  document.getElementById("modalSubstituicao").style.display = "none";
}


/* ================= LISTA ================= */

function atualizarParticipantesParaCadastrarVaga() {

  const ponto = document.getElementById("pontoVaga").value;
  const dia = document.getElementById("diaVaga").value;

  if (!ponto || !dia) {
    limparSubstituirQuemsai();
    return;
  }

  mostrarSpinner();

  const callback = "cb_part_" + Date.now();

  window[callback] = function(participantesDesignados) {

    esconderSpinner();

    const select = document.getElementById("substituirQuemsai");
    select.innerHTML = '<option value="">-- Nenhum --</option>';

    (participantesDesignados || []).forEach(participante => {
      const option = document.createElement("option");
      option.value = participante.id;
      option.textContent = participante.nomeCompleto;
      select.appendChild(option);
    });

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    console.error("❌ Erro ao buscar participantes designados:", err.message);
    limparSubstituirQuemsai();
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarParticipantesParaSubstituir" +
    "&ponto=" + encodeURIComponent(ponto) +
    "&dia=" + encodeURIComponent(dia) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function limparSubstituirQuemsai() {
  const select = document.getElementById("substituirQuemsai");
  select.innerHTML = '<option value="">-- Nenhum --</option>';
}


/* ================= VAGAS ================= */

function atualizarContagemVagas(vagas) {
  document.getElementById("totalVagas").textContent = vagas.length;
}


function carregarTodasVagasAbertas() {

  mostrarSpinner();

  const callback = "cb_vagas_" + Date.now();

  window[callback] = function(dados) {

    esconderSpinner();
    mostrarVagasNaTabela(dados);

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=getVagasAbertas" +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function mostrarVagasNaTabela(vagas) {

  atualizarContagemVagas(vagas);

  const tbody = document.querySelector("#tabelaVagasPendentes tbody");
  tbody.innerHTML = "";

  vagas.forEach(vaga => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${vaga.ponto}</td>
      <td>${vaga.dia}</td>
      <td>${vaga.frequencia}</td>
    `;

    tr.style.cursor = "pointer";

    tr.onclick = () => {

      mostrarConfirmacaoGlobal(
        `⚠️ Deseja excluir a vaga <strong>${vaga.frequencia}</strong> de <strong>${vaga.dia}</strong> no ponto <strong>${vaga.ponto}</strong>?`,
        () => {

          mostrarSpinner();

          const callback = "cb_delvaga_" + Date.now();

          window[callback] = function() {

            const cb2 = "cb_upd_" + Date.now();

            window[cb2] = function() {
              esconderSpinner();
              carregarTodasVagasAbertas();
              mostrarAlertaGlobal("✅ Vaga excluída com sucesso.");
              delete window[cb2];
            };

            const script2 = document.createElement("script");
            script2.src =
              API_URL +
              "?acao=atualizarStatusDeVagaExcluida" +
              "&ponto=" + encodeURIComponent(vaga.ponto) +
              "&dia=" + encodeURIComponent(vaga.dia) +
              "&frequencia=" + encodeURIComponent(vaga.frequencia) +
              "&callback=" + cb2;

            document.body.appendChild(script2);

            delete window[callback];
          };

          const script = document.createElement("script");
          script.src =
            API_URL +
            "?acao=excluirVaga" +
            "&ponto=" + encodeURIComponent(vaga.ponto) +
            "&dia=" + encodeURIComponent(vaga.dia) +
            "&frequencia=" + encodeURIComponent(vaga.frequencia) +
            "&callback=" + callback;

          document.body.appendChild(script);

        }
      );
    };

    tbody.appendChild(tr);
  });
}

function pesquisarParticipantesPorCongregacao() {

  const select = document.getElementById('pesqCongregacao');
  const congregacaoSelecionada = select.value;

  const resultadoDiv = document.getElementById('resultadoPesquisaCongregacoes');
  const msg = document.getElementById("msgPesqCongregacoes");

  if (!congregacaoSelecionada) {
    mostrarAlertaGlobal("⚠️ Por favor, selecione uma congregação.");
    return;
  }

  resultadoDiv.textContent = '';
  mostrarSpinner();

  const callback = "cb_cong_" + Date.now();

  window[callback] = function(participantes) {

    esconderSpinner();

    const total = participantes.length;
    if (msg) {
      msg.textContent =
        `✅ ${total} participante${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''} para a congregação selecionada.`;
    }

    if (!participantes || participantes.length === 0) {
      if (msg) msg.textContent = "❌ Nenhum participante encontrado para essa congregação.";
      mostrarAlertaGlobal("❌ Nenhum participante encontrado para essa congregação.");
      delete window[callback];
      return;
    }

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    const colgroup = document.createElement('colgroup');
    const larguras = ['350px', '200px', '100px', '100px', '100px'];

    larguras.forEach(largura => {
      const col = document.createElement('col');
      col.style.width = largura;
      colgroup.appendChild(col);
    });

    tabela.appendChild(colgroup);

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Nome</th>
        <th>Telefone</th>
        <th>Petição</th>
        <th>Sexo</th>
        <th>TCS</th>
      </tr>
    `;
    tabela.appendChild(thead);

    const tbody = document.createElement('tbody');

    participantes.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome || ''}</td>
        <td>${p.telefone || ''}</td>
        <td>${p.peticao || ''}</td>
        <td>${p.sexo || ''}</td>
        <td>${p.tcs || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    tabela.appendChild(tbody);

    resultadoDiv.textContent = '';
    resultadoDiv.appendChild(tabela);

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal("❌ Erro ao buscar participantes: " + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=pesquisarParticipantesPorCongregacao" +
    "&congregacao=" + encodeURIComponent(congregacaoSelecionada) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


/* ================= CONGREGACOES ================= */

function carregarOpcoesCongregacoes() {

  const callback = "cb_lista_cong_" + Date.now();

  window[callback] = function(congregacoes) {

    const sel = document.getElementById('pesqCongregacao');
    sel.innerHTML = '<option value="">-- Selecione Congregação --</option>';

    congregacoes.forEach(item => {
      const o = document.createElement('option');
      o.value = item;
      o.textContent = item;
      sel.appendChild(o);
    });

    delete window[callback];
  };

  window[callback].failure = function(err) {
    mostrarAlertaGlobal('❌ Erro ao carregar congregações: ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarCongregacoesUnicas" +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function exportar() {

  const abaSelecionada = document.getElementById('aba').value;
  const mensagem = document.getElementById('mensagem');

  if (!abaSelecionada) {
    mostrarAlertaGlobal("⚠️ Selecione uma aba.");
    return;
  }

  mensagem.innerHTML = "Gerando link de download...";
  mostrarSpinner();

  const callback = "cb_export_" + Date.now();

  window[callback] = function(linkHTML) {

    mensagem.innerHTML = linkHTML;
    esconderSpinner();

    delete window[callback];
  };

  window[callback].failure = function(erro) {

    mensagem.innerText = "❌ Erro: " + erro.message;
    esconderSpinner();

    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=exportarAbaSelecionada" +
    "&aba=" + encodeURIComponent(abaSelecionada) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function carregarResumo() {

  const callback = "cb_resumo_" + Date.now();

  window[callback] = function(resumo) {

    // Preenche os campos existentes
    for (const chave in resumo) {
      const el = document.getElementById(chave);
      if (el && chave !== 'contagemCircuitos') {
        el.textContent = resumo[chave];
      }
    }

    // Preenche tabela de circuitos
    const tbodyCircuitos = document.getElementById('tbodyCircuitos');

    if (tbodyCircuitos && resumo.contagemCircuitos) {

      tbodyCircuitos.innerHTML = '';

      const circuitos = Object.keys(resumo.contagemCircuitos).sort((a, b) => {
        if (a === 'Desconhecido') return 1;
        if (b === 'Desconhecido') return -1;
        return parseInt(a) - parseInt(b);
      });

      circuitos.forEach(circuito => {

        const quantidade = resumo.contagemCircuitos[circuito];

        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 8px;">${circuito}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${quantidade}</td>
        `;

        tbodyCircuitos.appendChild(tr);
      });
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    console.error("Erro ao carregar resumo:", err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=obterResumoTPEComPlanilha" +
    "&callback=" + callback;

  document.body.appendChild(script);
}

function consultarPerfilAtual() {

  if (!participanteSelecionadoPerfil) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante = participanteSelecionadoPerfil.id;
  const perfilAtual = document.getElementById("perfilAtual");

  mostrarSpinner();

  const callback = "cb_perfil_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (res.sucesso) {
      perfilAtual.value = res.perfil || '';
    } else {
      perfilAtual.value = '';
      mostrarAlertaGlobal(res.mensagem || '❌ Perfil não encontrado.');
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    perfilAtual.value = '';
    mostrarAlertaGlobal('❌ Erro: ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=obterPerfilParticipantePorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function alterarPerfil() {

  const novoPerfil = document.getElementById('tipoDePerfil').value;
  const idParticipante = participanteSelecionadoPerfil.id;

  if (!idParticipante || !novoPerfil) {
    mostrarAlertaGlobal('❌ Selecione participante e perfil.');
    return;
  }

  mostrarSpinner();

  const callback = "cb_alterar_perfil_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (res.sucesso) {

      mostrarAlertaGlobal(
        `✅ Perfil atualizado com sucesso para "${novoPerfil}".`
      );

      consultarPerfilAtual();

    } else {
      mostrarAlertaGlobal(res.mensagem || '❌ Erro ao atualizar perfil.');
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal('❌ Erro de comunicação: ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=atualizarPerfilParticipantePorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&perfil=" + encodeURIComponent(novoPerfil) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

let participanteSelecionadoGA = null;

function consultarDadosAcesso() {

  const idParticipante = participanteSelecionadoAcesso.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const emailAtual = document.getElementById('emailAtual');
  const senhaAtual = document.getElementById('senhaAtual');

  mostrarSpinner();

  const callback = "cb_acesso_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (res.sucesso) {
      emailAtual.value = res.email || '';
      senhaAtual.value = res.senha || '';
    } else {
      emailAtual.value = '';
      senhaAtual.value = '';
      mostrarAlertaGlobal(res.mensagem || '❌ Dados não encontrados.');
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    emailAtual.value = '';
    senhaAtual.value = '';
    mostrarAlertaGlobal('❌ Erro: ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=obterDadosAcessoParticipantePorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + callback;

  document.body.appendChild(script);
}


function alterarDadosAcesso() {

  const novoEmail = document.getElementById('novoEmail').value.trim();
  const novaSenha = document.getElementById('novaSenha').value.trim();
  const idParticipante = participanteSelecionadoAcesso.id;

  if (!idParticipante) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  if (!novoEmail && !novaSenha) {
    mostrarAlertaGlobal('❌ Informe email ou senha.');
    return;
  }

  mostrarSpinner();

  const callback = "cb_alt_acesso_" + Date.now();

  window[callback] = function(res) {

    esconderSpinner();

    if (res.sucesso) {
      mostrarAlertaGlobal('✅ Dados de acesso atualizados com sucesso.');
      consultarDadosAcesso();
    } else {
      mostrarAlertaGlobal(res.mensagem || '❌ Erro ao atualizar.');
    }

    delete window[callback];
  };

  window[callback].failure = function(err) {
    esconderSpinner();
    mostrarAlertaGlobal('❌ Erro: ' + err.message);
    delete window[callback];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=atualizarDadosAcessoParticipantePorId" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&email=" + encodeURIComponent(novoEmail) +
    "&senha=" + encodeURIComponent(novaSenha) +
    "&callback=" + callback;

  document.body.appendChild(script);
}

/* FALTA MUITA COISA DO ÚLTIMO CÓDIGO*/

function carregarOpcoes() {

  const cb = "cb_opcoes_" + Date.now();

  window[cb] = function(opcoes) {

    window.mapaParticipantesPorNome = {};

    (opcoes.participantes || []).forEach(p => {
      window.mapaParticipantesPorNome[p.nome] = p.id;
    });

    const mapa = new Map();
    for (const n of (opcoes.pesquisar || [])) {
      const k = norm(n);
      if (k) mapa.set(k, n);
    }

    window.todosNomesSimples = Array.from(mapa.values())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    ligarFiltroAoSelect(
      'filtroModalParticipantes',
      'selectModalParticipantes',
      window.todosNomesSimples
    );

    ligarFiltroAoSelect(
      'filtroBuscaTrei',
      'listaNomesTrei',
      window.todosNomesSimples
    );

    window.opcoesCongregacoes = opcoes.congregacao || [];

    const sel = document.getElementById('congregacao');
    sel.innerHTML = '<option value="">- Selecione -</option>';

    (opcoes.congregacao || []).forEach(item => {
      const o = document.createElement('option');
      o.value = item;
      o.textContent = item;
      sel.appendChild(o);
    });

    const turnoSelect = document.getElementById("turnoDesignado");
    const diaSelect = document.getElementById("diaDesignado");

    turnoSelect.innerHTML = "<option value=''>- Selecione -</option>";
    diaSelect.innerHTML = "<option value=''>- Selecione -</option>";

    opcoes.turnos.forEach(turno => {
      const option = document.createElement("option");
      option.value = turno;
      option.textContent = turno;
      turnoSelect.appendChild(option);
    });

    opcoes.dias.forEach(dia => {
      const option = document.createElement("option");
      option.value = dia;
      option.textContent = dia;
      diaSelect.appendChild(option);
    });

    const inputCong = document.getElementById('inputCongregacao');
    const selCong = document.getElementById('pesqCongregacao');

    const congregacoes = Array.from(selCong.options)
      .map(opt => opt.value)
      .filter(val => val && val !== "- Selecione -");

    if (inputCong && selCong) {
      inputCong.addEventListener('input', () => {
        renderizarListaPara(
          'inputCongregacao',
          'pesqCongregacao',
          congregacoes
        );
      });

      renderizarListaPara(
        'inputCongregacao',
        'pesqCongregacao',
        congregacoes
      );
    }

    window.opcoesPrivilegios = opcoes.privilegios || {};

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarOpcoesParaForm" +
    "&callback=" + cb;

  document.body.appendChild(script);

  const pontoInput = document.getElementById("ponto");
  const diaInput = document.getElementById("dia");

  if (pontoInput && diaInput) {
    pontoInput.addEventListener("change", atualizarParticipantesParaSubstituir);
    diaInput.addEventListener("change", atualizarParticipantesParaSubstituir);
  }

  carregarDadosDesignacao();

  const pontoInputVaga = document.getElementById("pontoVaga");
  const diaInputVaga = document.getElementById("diaVaga");

  if (pontoInputVaga && diaInputVaga) {
    pontoInputVaga.addEventListener("change", atualizarParticipantesParaCadastrarVaga);
    diaInputVaga.addEventListener("change", atualizarParticipantesParaCadastrarVaga);
  }

  carregarDadosVaga();

  const nomeInputUser = document.getElementById("nomeInputUsuario");
  const nomeSelectUser = document.getElementById("nomeSelectUsuario");

  if (nomeInputUser && nomeSelectUser) {
    nomeInputUser.addEventListener("input", () => {
      renderizarListaUser(nomeInputUser.value);
    });

    renderizarListaUser(nomeInputUser.value);
  }

  const nomeInputUserSb = document.getElementById("nomeInputUsuarioSb");
  const nomeSelectUserSb = document.getElementById("nomeSelectUsuarioSb");

  if (nomeInputUserSb && nomeSelectUserSb) {
    nomeInputUserSb.addEventListener("input", () => {
      renderizarListaUserSb(nomeInputUserSb.value);
    });

    renderizarListaUserSb(nomeInputUserSb.value);
  }

  const nomeInputUserIr = document.getElementById("nomeInputUsuarioIr");
  const nomeSelectUserIr = document.getElementById("nomeSelectUsuarioIr");

  if (nomeInputUserIr && nomeSelectUserIr) {
    nomeInputUserIr.addEventListener("input", () => {
      renderizarListaUserIr(nomeInputUserIr.value);
    });

    renderizarListaUserIr(nomeInputUserIr.value);
  }

  const nomeInputUser2h = document.getElementById("nomeInputUsuario2h");
  const nomeSelectUser2h = document.getElementById("nomeSelectUsuario2h");

  if (nomeInputUser2h && nomeSelectUser2h) {
    nomeInputUser2h.addEventListener("input", () => {
      renderizarListaUser2h(nomeInputUser2h.value);
    });

    renderizarListaUser2h(nomeInputUser2h.value);
  }
}

function carregarOpcoesGenerica(inputId, selectId, metodoScript, listaKey = 'nomesCompletos') {

  const cb = "cb_generica_" + Date.now();

  window[cb] = function(opcoes) {

    const listaObjetos = opcoes[listaKey] || [];

    const mapNomeParaId = new Map();

    listaObjetos.forEach(p => {
      if (typeof p === 'object' && p.nome && p.id) {
        mapNomeParaId.set(p.nome, p.id);
      }
    });

    window.todosNomes = listaObjetos.map(p => p.nome);

    window.todosNomes.sort((a, b) => {
      const norm = s =>
        s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return norm(a).localeCompare(norm(b));
    });

    window.mapNomeParaId = mapNomeParaId;

    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);

    if (input && select) {
      input.addEventListener("input", () => {
        renderizarListaPara(inputId, selectId, window.todosNomes);
      });

      renderizarListaPara(inputId, selectId, window.todosNomes);
    }

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=" + metodoScript +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function enviarPesquisaDireta(sexo, dia, turno) {

  if (!sexo || !dia || !turno) {
    mostrarAlertaGlobal("❌ Dados incompletos para buscar treinadores.");
    return;
  }

  mostrarSpinner();
  document.getElementById('resultadoContainer').innerHTML = '';

  const cb = "cb_treinadores_" + Date.now();

  window[cb] = function(res) {

    esconderSpinner();

    (res.logs || []).forEach(l => console.log(l));

    montarTabela(res.resultados, sexo, dia, turno);

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=listarTreinadoresComFiltroDireto" +
    "&sexo=" + encodeURIComponent(sexo) +
    "&dia=" + encodeURIComponent(dia) +
    "&turno=" + encodeURIComponent(turno) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function carregarAbas() {

  const cb = "cb_abas_" + Date.now();

  window[cb] = function(nomes) {

    const select = document.getElementById('aba');
    select.innerHTML = "";

    const optionDefault = document.createElement('option');
    optionDefault.value = "";
    optionDefault.text = "- Selecione -";
    select.appendChild(optionDefault);

    nomes.forEach(nome => {
      const option = document.createElement('option');
      option.value = nome;
      option.text = nome;
      select.appendChild(option);
    });

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=listarAbas" +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function carregarResumo() {

  const cb = "cb_resumo_" + Date.now();

  window[cb] = function(resumo) {

    for (const chave in resumo) {
      const el = document.getElementById(chave);
      if (el && chave !== 'contagemCircuitos') {
        el.textContent = resumo[chave];
      }
    }

    const tbodyCircuitos = document.getElementById('tbodyCircuitos');

    if (tbodyCircuitos && resumo.contagemCircuitos) {

      tbodyCircuitos.innerHTML = '';

      const circuitos = Object.keys(resumo.contagemCircuitos).sort((a, b) => {
        if (a === 'Desconhecido') return 1;
        if (b === 'Desconhecido') return -1;
        return parseInt(a) - parseInt(b);
      });

      circuitos.forEach(circuito => {
        const quantidade = resumo.contagemCircuitos[circuito];
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 8px;">${circuito}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${quantidade}</td>
        `;

        tbodyCircuitos.appendChild(tr);
      });
    }

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=obterResumoTPEComPlanilha" +
    "&callback=" + cb;

  document.body.appendChild(script);
}

function atualizarCondicaoDisponibilidadeUsuario(idParticipante) {

  mostrarSpinner();

  const cb = "cb_disp_" + Date.now();

  window[cb] = function(dados) {

    esconderSpinner();

    const chk2 = document.getElementById("tipoDisponibilidade2h");
    const chk4 = document.getElementById("tipoDisponibilidade4h");
    const jtd  = document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");
    const ss   = document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

    if (!chk2 || !chk4 || !jtd || !ss) return;

    chk2.checked = false;
    chk4.checked = false;
    jtd.checked = false;
    ss.checked = false;

    switch (dados.condicao) {
      case "Somente substituição":
        ss.checked = true;
        break;

      case "Já possui designação":
        jtd.checked = true;
        break;

      default:
        if (dados.tipo === "2h") chk2.checked = true;
        if (dados.tipo === "4h") chk4.checked = true;
        break;
    }

    sincronizarCardsComSwitch();

    delete window[cb];
  };

  const script = document.createElement("script");
  script.src =
    API_URL +
    "?acao=buscarTipoDisponibilidade" +
    "&id=" + encodeURIComponent(idParticipante) +
    "&callback=" + cb;

  document.body.appendChild(script);
}

