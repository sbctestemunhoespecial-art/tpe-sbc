const API_URL = "https://script.google.com/macros/s/AKfycbwrlEvENxytMFmrTmzSWDmXCXcy-0dBU7ve5fWRVf871plhTW5TqvtsS4-9LiwjnXvU/exec";

function apiJSONP(acao, parametros = {}, callback, onError) {

  const callbackName =
    "cb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

  window[callbackName] = function(resposta) {

    //console.log("✅ Callback executado:", resposta);

    if (resposta && resposta.sucesso === false) {
      if (onError) onError(resposta);
    } else {
      callback(resposta);
    }

    delete window[callbackName];
    script.remove();

  };

  const query = new URLSearchParams({
    acao,
    ...parametros,
    callback: callbackName
  });

  const script = document.createElement("script");

  script.onload = function () {
    console.log("📥 Script JSONP carregado.");
  };

  script.onerror = function (e) {
    console.error("❌ Erro ao carregar o script JSONP:", e);
  };

  script.src = API_URL + "?" + query.toString();

  console.log("🌐 URL chamada:", script.src);

  document.body.appendChild(script);

}

function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('active');
}

function mostrarPainel(idPainel) {
  toggleMenu();

  document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));

  const painel = document.getElementById(idPainel);
  if (painel) painel.classList.add('ativo');
}

function mostrarPainelSemMenu(idPainel) {

  document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));

  const painel = document.getElementById(idPainel);
  if (painel) painel.classList.add('ativo');
}

let campoDestinoModal = null;

function sair() {
  toggleMenu();

  localStorage.removeItem("usuarioLogado");
  perfilUsuario = null;
  idUsuarioLogado = null;

  historico.length = 0;
  telaAtual = 'menuCards';

  document.querySelectorAll('.tela').forEach(el => {
      el.classList.remove('aberta');
  });

  document.getElementById('menuCards')
      ?.classList.add('aberta');

  atualizarBotaoVoltar();

  document.getElementById("menuBtn").style.display = "none";
  document.getElementById('conteudoProtegido').style.display = 'none';
  document.getElementById('telaLogin').style.display = 'block';

  mostrarAlertaGlobal("Você saiu da conta.");

}

function abrirModalParticipantes() {
  document.getElementById("modalParticipantes").style.display = "flex";
}

function fecharModalParticipantes(){
  document.getElementById("modalParticipantes").style.display = "none";

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

function enviarCodigo() {
  const email = document.getElementById('emailCodigo').value.trim();
  const msg = document.getElementById('msgSolicitarCodigo');
  msg.textContent = "";

  if (!email) {
    mostrarAlertaGlobal("⚠️ Digite seu e-mail.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "enviarCodigo",
    { email },
    (res) => {
      esconderSpinner();
      msg.textContent = res.mensagem;

      if (res.sucesso) {
        mostrarTela('telaInserirCodigo');
        window.emailRedefinicao = email;
      }
    },
    (err) => {
      esconderSpinner();
      console.error(err);
    }
  );
}

function confirmarCodigo() {
  const inputs = document.querySelectorAll('#inputsCodigo .input-codigo');
  const codigo = Array.from(inputs).map(i => i.value).join('');
  const senha1 = document.getElementById('novaSenhaCodigo').value;
  const senha2 = document.getElementById('novaSenhaConfirma').value;
  const msg = document.getElementById('msgConfirmarCodigo');
  msg.textContent = "";

  if (senha1 === '' || senha2 === '') {
    mostrarAlertaGlobal("⚠️ Preencha a nova senha.");
    return;
  }

  if (senha1 !== senha2) {
    mostrarAlertaGlobal("❌ As senhas não são iguais.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "confirmarCodigoRedefinicao",
    {
      email: window.emailRedefinicao,
      codigo,
      senha: senha1
    },
    (res) => {
      esconderSpinner();
      msg.textContent = res.mensagem;

      if (res.sucesso) {
        mostrarTela('telaLogin');
      }
    },
    (err) => {
      esconderSpinner();
      console.error(err);
    }
  );
}

function autoAvancarCodigo(el) {
  const inputs = document.querySelectorAll('#inputsCodigo .input-codigo');
  const index = Array.from(inputs).indexOf(el);
  
  el.value = el.value.replace(/[^0-9]/g, '');

  if (el.value.length === 1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
  }

  if (Array.from(inputs).every(input => input.value.length === 1)) {
    const codigo = Array.from(inputs).map(i => i.value).join('');
    validarCodigo(codigo);
  } else {
    document.getElementById('inputsSenha').style.display = 'none';
    document.getElementById('msgConfirmarCodigo').textContent = '';
  }
}

function validarCodigo(codigo) {
  mostrarSpinner();

  apiJSONP(
    "validarCodigoRedefinicao",
    {
      email: window.emailRedefinicao,
      codigo
    },
    (res) => {
      esconderSpinner();
      const msg = document.getElementById('msgConfirmarCodigo');

      if (res.sucesso) {
        msg.textContent = '';
        document.getElementById('inputsSenha').style.display = 'block';
      } else {
        msg.textContent = '❌ Código inválido.';
        document.getElementById('inputsSenha').style.display = 'none';
      }
    },
    (err) => {
      esconderSpinner();
      console.error(err);
    }
  );
}

function redefinirSenha() {
  const senha1 = document.getElementById('novaSenhaCodigo').value;
  const senha2 = document.getElementById('novaSenhaConfirma').value;
  const msg = document.getElementById('msgConfirmarCodigo');
  msg.textContent = '';

  if (!senha1 || !senha2) {
    msg.textContent = '⚠️ Preencha ambos os campos de senha.';
    return;
  }

  if (senha1 !== senha2) {
    msg.textContent = '❌ As senhas não coincidem.';
    return;
  }

  const email = window.emailRedefinicao;
  if (!email) {
    msg.textContent = '❌ E-mail não cadastrado. Verifique o email. Se necessário, contate a administração.';
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "redefinirSenha",
    {
      email,
      senha: senha1
    },
    (res) => {
      esconderSpinner();
      msg.textContent = res.mensagem;

      if (res.sucesso) {
        document.getElementById('novaSenhaCodigo').value = '';
        document.getElementById('novaSenhaConfirma').value = '';
        document.getElementById('inputsSenha').style.display = 'none';
        mostrarTela('telaLogin');
      }
    },
    (err) => {
      esconderSpinner();
      console.error(err);
    }
  );
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

  apiJSONP(
    "login",
    {
      email,
      senha
    },
    function(res) {

      perfilUsuario = res.perfil;
      idUsuarioLogado = res.id;

      const saudacaoEl = document.getElementById("saudacaoUsuario");
      const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

      if (saudacaoEl) {
        /*saudacaoEl.textContent = "Bem-vindo(a) 👋";*/
                saudacaoEl.textContent = "";

      }

      if (tipoAcessoEl) {
        /*tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;*/
                tipoAcessoEl.textContent = `Perfil ${perfilUsuario}`;

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

      // Buscar nome do usuário
      apiJSONP(
        "buscarNomeDoUsuario",
        {
          id: idUsuarioLogado
        },
        function(resNome) {

          const saudacaoEl = document.getElementById("saudacaoUsuario");
          const tipoAcessoEl = document.getElementById("tipoAcessoUsuario");

          if (!saudacaoEl) return;

          if (resNome.sucesso && resNome.nome) {
            /*saudacaoEl.textContent = `Bem-vindo(a) ${resNome.nome} 👋`;*/
            saudacaoEl.textContent = `${resNome.nome}`;

          } else {
            saudacaoEl.textContent = "";
          }

          if (tipoAcessoEl) {
            /*tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;*/
                        tipoAcessoEl.textContent = `Perfil ${perfilUsuario}`;

          }

          esconderSpinner();
          verificarTreinamentoPendente();

        },
        function(err) {

          esconderSpinner();

          if (tipoAcessoEl) {
            /*tipoAcessoEl.textContent = `Seu tipo de acesso é ${perfilUsuario}`;*/
                        tipoAcessoEl.textContent = `Perfil ${perfilUsuario}`;

          }

          msgErro.textContent = err.message || "❌ Erro ao buscar nome do usuário.";

        }
      );

    },
    function(err) {

      esconderSpinner();

      msgErro.textContent =
        err.message || "❌ Erro ao fazer login.";

    }
  );

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

/*window.addEventListener("DOMContentLoaded", () => {

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
          //saudacaoEl.textContent = `Bem-vindo(a) ${resNome.nome} 👋`;
                    saudacaoEl.textContent = `${resNome.nome}`;

        } else {
          //saudacaoEl.textContent = `Bem-vindo(a) 👋`;
                    saudacaoEl.textContent = "";

        }
      }

      if (tipoAcessoEl) {

                tipoAcessoEl.textContent = `Perfil ${dados.perfil}`;

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
});*/
window.addEventListener("DOMContentLoaded", () => {

  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  if (usuarioSalvo) {

    const dados = JSON.parse(usuarioSalvo);

    const expirou =
      Date.now() - dados.timestamp > 60 * 60 * 1000;

    if (expirou) {

      localStorage.removeItem("usuarioLogado");

      mostrarAlertaGlobal(
        "⏰ Sua sessão expirou. Faça login novamente."
      );

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

    apiJSONP(
      "buscarNomeDoUsuario",
      {
        id: dados.id
      },
      (resNome) => {

        const saudacaoEl =
          document.getElementById("saudacaoUsuario");

        const tipoAcessoEl =
          document.getElementById("tipoAcessoUsuario");

        if (saudacaoEl) {

          if (resNome.sucesso && resNome.nome) {

            saudacaoEl.textContent = resNome.nome;

          } else {

            saudacaoEl.textContent = "";

          }
        }

        if (tipoAcessoEl) {

          tipoAcessoEl.textContent =
            `Perfil ${dados.perfil}`;

        }

      },
      (err) => {

        console.error(
          "Erro ao buscar nome do usuário:",
          err.mensagem || err.error || err.message
        );

      }
    );

  } else {

    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('conteudoProtegido').style.display = 'none';

  }

});

let participantesSemDisponibilidade = [];
 
function pesquisarParticipantesSemDisponibilidade() {

  mostrarSpinner();

  apiJSONP(
    "buscarParticipantesSemDisponibilidade",
    {},
    function(resultado) {

      esconderSpinner();

      participantesSemDisponibilidade = resultado || [];

      preencherTabelaSemDisponibilidade();

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal("❌ " + err.message);

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

function pesquisarDesignados() {
  const turno = document.getElementById('turnoDesignado').value.trim();
  const dia = document.getElementById('diaDesignado').value.trim();
  const ponto = document.getElementById('pontoDesignado').value.trim();

  if (!turno || !dia || !ponto) {
    mostrarAlertaGlobal('⚠️ Por favor, selecione todos os filtros.');
    return;
  }

  const msg = document.getElementById("msgPesqDesignados");

  mostrarSpinner();

  apiJSONP(
    "filtrarDesignadosNaAbaPontos",
    {
      turno,
      dia,
      ponto
    },
    (res) => {
      esconderSpinner();
      exibirResultados(res);
    },
    (err) => {
      esconderSpinner();
      console.error(err);
    }
  );
}

function exibirResultados(res) {
  const c = document.getElementById('resultadoDesignadosContainer');
  const msg = document.getElementById("msgPesqDesignados");
  esconderSpinner();

  if (!res || res.length === 0) {
    c.innerHTML = '<p>Nenhum designado encontrado.</p>';
    mostrarAlertaGlobal("❌ Nenhum designado encontrado");
    return;
  }

  let html = `<table class="tabela-listagem">;
        <thead>
          <tr>
            <th style="width: 33%;">Nome</th>
            <th style="width: 10%;">Turno</th>
            <th style="width: 15%;">Dia</th>
            <th style="width: 8%;">Ponto</th>
            <th style="width: 15%;">Freq.</th>
            <th style="width: 19%;">Most.</th>
          </tr>
        </thead>
        <tbody>`;

  res.forEach(r => {
    const partes = (r.turno || "").split(" ");
    const pontoNumero = partes[partes.length - 1] || "";
    const turnoPalavra = partes.slice(0, partes.length - 1).join(" ");

    html += `
        <tr class="linha-designacao" 
            data-nome="${r.nome}" 
            data-turno="${turnoPalavra}" 
            data-dia="${r.dia}" 
            data-ponto="${pontoNumero}"
            data-frequencia="${r.frequencia}"
            data-equipamento="${r.equipamento}"
            style="cursor:pointer">
          <td style="width: 33%;">${formatarNomeComNegrito(r.nome)}</td>
          <td style="width: 10%;">${turnoPalavra}</td>
          <td style="width: 15%;">${r.dia}</td>
          <td style="width: 8%;">${pontoNumero}</td>
          <td style="width: 15%;">${r.frequencia}</td>
          <td style="width: 19%;">${r.equipamento}</td>
        </tr>`;
  });

  html += '</tbody></table>';
  c.innerHTML = html;
  msg.textContent = `✅ ${res.length} designado(s) encontrado(s).`;

  c.querySelectorAll('.linha-designacao').forEach(linha => {

    linha.addEventListener('click', () => {
      const selectNome = linha.querySelector('td:first-child select');
      if (selectNome) {
        return;
      }

      const participante = linha.dataset.nome;

      if (participante.trim().toUpperCase().startsWith("VAGA")) {
        mostrarAlertaGlobal(`❌ Vagas não podem ser editadas aqui.`);
        return;
      }

      const turno = linha.dataset.turno;
      const ponto = linha.dataset.ponto;
      const dia = linha.dataset.dia;
      const frequencia = linha.dataset.frequencia;
      const equipamento = linha.dataset.equipamento;

      acionarMenuDesignacao(participante, ponto, dia, turno, frequencia, equipamento, linha);
    });
  });
}

function acionarMenuDesignacao(participante, ponto, dia, turno, frequencia, equipamento, linhaTR) {
    document.querySelectorAll('.menuDesignacao, #confirmBox').forEach(el => el.remove());

    const menuRow = document.createElement('tr');
    menuRow.classList.add('menuDesignacao');

    const td = document.createElement('td');
    td.colSpan = 6;
    td.style.padding = '10px';
    td.style.backgroundColor = '#eef2ff';
    td.style.border = '1px solid #ccc';

    const btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️ Editar';
    btnEditar.className = 'botao editar';
    btnEditar.style.marginRight = '10px';
    btnEditar.style.margin = '0';

    btnEditar.onclick = () => {
      menuRow.remove();
      editarDesignacaoInline(linhaTR);
    };

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️ Excluir';
    btnExcluir.className = 'botao excluir'; // <-- classe cancel
    btnExcluir.style.margin = '0';
    btnExcluir.onclick = () => {
      menuRow.remove();
      mostrarConfirmacaoExclusao(participante, ponto, dia, turno, frequencia, equipamento);
    };

    td.appendChild(btnEditar);
    td.appendChild(btnExcluir);
    menuRow.appendChild(td);

    linhaTR.insertAdjacentElement('afterend', menuRow);
  }


  function mostrarConfirmacaoExclusao(participante, ponto, dia, turno, frequencia, equipamento) {

  mostrarConfirmacaoGlobal(
    `⚠️ Deseja excluir a designação de <strong>${participante}</strong> do ponto <strong>${ponto}</strong> (${dia} - turno ${turno} - ${frequencia} - ${equipamento})?`,
    () => {

      mostrarSpinner();

      let turnoCodigo = "";

      switch (turno) {
        case "Manhã":
          turnoCodigo = "M";
          break;

        case "Tarde":
          turnoCodigo = "T";
          break;

        case "Noite":
          turnoCodigo = "N";
          break;

        case "Matinal":
          turnoCodigo = "A";
          break;

        case "Manhã (9–11h)":
          turnoCodigo = "MA";
          break;

        case "Manhã (11–13h)":
          turnoCodigo = "MB";
          break;

        case "Tarde (13–15h)":
          turnoCodigo = "TA";
          break;

        case "Tarde (15–17h)":
          turnoCodigo = "TB";
          break;

        default:
          esconderSpinner();
          mostrarAlertaGlobal(
            "⚠️ Turno inválido: " + turno
          );
          return;
      }

      apiJSONP(
        "deletarDesignacao",
        {
          participante,
          ponto,
          dia,
          turno: turnoCodigo
        },
        () => {

          esconderSpinner();

          mostrarAlertaGlobal(
            `✅ ${participante} removido com sucesso.`
          );

          pesquisarDesignados();

        },
        (err) => {

          esconderSpinner();

          console.error(err);
          mostrarAlertaGlobal(
            `❌ Erro ao remover: ${err.message || err}`
          );
        }
      );

    }
  );

}

function editarDesignacaoInline(linhaTR) {
  const colunas = linhaTR.querySelectorAll('td');
  const campos = ['nome', 'turno', 'dia', 'ponto', 'frequencia', 'equipamento'];

  const nomeOriginal = linhaTR.dataset.nome;
  const turnoVisivelOriginal = linhaTR.dataset.turno;
  const diaOriginal = linhaTR.dataset.dia;
  const pontoVisivelOriginal = linhaTR.dataset.ponto;
  const frequenciaOriginal = linhaTR.dataset.frequencia;
  const equipamentoOriginal = linhaTR.dataset.equipamento;

  linhaTR.dataset.nomeOriginal = nomeOriginal;

  if (nomeOriginal.trim().toUpperCase().startsWith("VAGA")) {
    mostrarAlertaGlobal("⚠️ Edição de vagas não permitida por aqui.");
    return;
  }

  const selectsOriginais = {
    nome: document.getElementById('participante'),
    frequencia: document.getElementById('frequencia'),
    equipamento: document.getElementById('equipamento')
  };

  for (const [key, sel] of Object.entries(selectsOriginais)) {
    if (!sel) {
      mostrarAlertaGlobal(`⚠️ Select para "${key}" não encontrado.`);
      return;
    }
  }

  campos.forEach((campo, i) => {
    const td = colunas[i];

    if (["nome", "frequencia", "equipamento"].includes(campo)) {
      const selectOriginal = selectsOriginais[campo];
      const selectClone = document.createElement('select');

      function normalizarTexto(str) {
        return str ? str.replace(/\s+/g, '').trim() : '';
      }

      const valorAtual = normalizarTexto(td.textContent);

      for (const option of selectOriginal.options) {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.textContent;
        selectClone.appendChild(opt);

        if (normalizarTexto(option.value) === valorAtual) {
          selectClone.value = option.value;
        }
      }

      if (selectClone.value !== valorAtual) {
        console.warn(`⚠️ Valor '${valorAtual}' não foi selecionado automaticamente!`);
      }

      td.innerHTML = '';
      td.appendChild(selectClone);
    } else {
      td.innerHTML = td.textContent.trim();
    }
  });

  const inputFiltro = document.createElement('input');
  inputFiltro.type = 'text';
  inputFiltro.placeholder = 'Filtrar nome...';
  inputFiltro.style.margin = '10px 0';
  inputFiltro.style.width = '100vw';
  inputFiltro.style.display = 'block';

  linhaTR.insertAdjacentElement('afterend', inputFiltro);

  const menuRow = document.createElement('tr');
  const tdMenu = document.createElement('td');
  tdMenu.colSpan = 6;
  tdMenu.style.paddingTop = '10px';

  const btnSalvar = document.createElement('button');
  btnSalvar.textContent = '💾 Salvar';
  btnSalvar.className = 'botao salvar';
  btnSalvar.style.marginRight = '10px';

  btnSalvar.onclick = () => {

    mostrarSpinner();

    const novosValores = campos.map((campo, i) => {
      const select = colunas[i].querySelector('select');
      return select ? select.value : colunas[i].textContent.trim();
    });

    let [novoNome, novoTurnoVisivel, novoDia, novoPontoVisivel, novaFrequencia, novoEquipamento] = novosValores;

    if (!novaFrequencia || !novaFrequencia.trim()) {
      mostrarAlertaGlobal("⚠️ A frequência não pode estar vazia.");
      return;
    }

    if (!novoEquipamento || !novoEquipamento.trim()) {
      mostrarAlertaGlobal("⚠️ O equipamento não pode estar vazio.");
      return;
    }

    const turnoCodigoMap = {
      "Manhã": "M",
      "Tarde": "T",
      "Noite": "N",
      "Matinal": "A",
      "Manhã (9–11h)": "MA",
      "Manhã (11–13h)": "MB",
      "Tarde (13–15h)": "TA",
      "Tarde (15–17h)": "TB"
    };

    const turnoCodigo = turnoCodigoMap[novoTurnoVisivel];
    if (!turnoCodigo) {
      mostrarAlertaGlobal("⚠️ Turno inválido: " + novoTurnoVisivel);
      return;
    }

    const pontoFinal = turnoCodigo + novoPontoVisivel;

    const nadaMudou =
      nomeOriginal === novoNome &&
      turnoVisivelOriginal === novoTurnoVisivel &&
      diaOriginal === novoDia &&
      pontoVisivelOriginal === novoPontoVisivel &&
      frequenciaOriginal === novaFrequencia &&
      equipamentoOriginal === novoEquipamento;

    if (nadaMudou) {
      mostrarAlertaGlobal("⚠️ Nenhuma alteração foi feita.");
      return;
    }

    apiJSONP(
      "processarEdicaoDesignacao",
      {
        novoNome,
        ponto: pontoFinal,
        dia: novoDia,
        frequencia: novaFrequencia,
        nomeOriginal,
        equipamento: novoEquipamento
      },
      () => {

        esconderSpinner();

        const msg = document.getElementById("msgRemoverDesignados");
        mostrarAlertaGlobal("✅ Designação atualizada com sucesso.");

        pesquisarDesignados();

        apiJSONP(
          "atualizarStatusDaVaga",
          {
            ponto: pontoFinal,
            dia: novoDia,
            frequencia: novaFrequencia
          },
          () => {

            apiJSONP(
              "atualizarVagasEmAberto",
              {},
              () => {
                if (typeof carregarTodasVagasAbertas === 'function') carregarTodasVagasAbertas();
                if (typeof carregarAbas === 'function') carregarAbas();
              },
              (err) => console.error("Erro atualizar vagas em aberto:", err)
            );

          },
          (err) => console.error("Erro atualizar status da vaga:", err)
        );

      },
      (err) => {

        esconderSpinner();

        mostrarAlertaGlobal(`❌ Erro ao atualizar: ${err.message || err}`);
      }
    );

  };

  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = '❌ Cancelar';
  btnCancelar.className = 'botao cancel';
  btnCancelar.onclick = () => {
    pesquisarDesignados();
  };

  tdMenu.appendChild(btnSalvar);
  tdMenu.appendChild(btnCancelar);
  menuRow.appendChild(tdMenu);

  inputFiltro.insertAdjacentElement('afterend', menuRow);

  function norm(str) {
    return str ? str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  }

  inputFiltro.addEventListener('input', () => {
    const filtro = norm(inputFiltro.value);
    const selectNome = colunas[0].querySelector('select');
    if (!selectNome) return;

    const valorSelecionadoAnterior = selectNome.value;

    selectNome.innerHTML = '';

    const com = [], cont = [];
    (window.todosNomes || []).forEach(n => {
      const nn = norm(n);
      if (!filtro || nn.includes(filtro)) {
        if (filtro && nn.startsWith(filtro)) com.push(n);
        else cont.push(n);
      }
    });

    const resultado = com.concat(cont);

    resultado.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      selectNome.appendChild(opt);
    });

    if (resultado.includes(valorSelecionadoAnterior)) {
      selectNome.value = valorSelecionadoAnterior;
    } else if (resultado.length > 0) {
      selectNome.value = resultado[0];
    }
  });

  inputFiltro.dispatchEvent(new Event('input'));
}

function excluirDesignacao(participante, ponto, dia, turno, frequencia, equipamento, linhaTR) {

  mostrarConfirmacaoGlobal(
    `⚠️ Deseja excluir a designação de <strong>${participante}</strong> do ponto <strong>${ponto}</strong> (${dia} - turno ${turno} - ${frequencia} - ${equipamento})?`,
    () => {

      mostrarSpinner();

      apiJSONP(
        "deletarDesignacao",
        {
          participante,
          ponto,
          dia,
          turno
        },
        () => {

          esconderSpinner();

          mostrarAlertaGlobal(
            `✅ ${participante} removido com sucesso.`
          );

          pesquisarDesignados();

        },
        (err) => {

          esconderSpinner();

          console.error(err);
          mostrarAlertaGlobal(
            `❌ Erro ao remover: ${err.message || err}`
          );
        }
      );

    }
  );

}

function carregarDadosDesignacao() {
  apiJSONP(
    "obterDadosFormulario",
    {},
    (res) => {
      popularSelects(res);
    },
    (err) => {
      console.error(err);
    }
  );
}

  function popularSelects(dados) {
    const { pontoCorrigir, pontos = [], participantes = [] } = dados;

    const pontoVcorrigir = document.getElementById('pontoCorrigir');
    const pontoSel = document.getElementById('ponto');
    const partSel = document.getElementById('participanteDesignacao');

    if (!pontoVcorrigir || !pontoSel || !partSel) return;

    // 🧹 Limpa selects
    pontoSel.innerHTML = "<option value=''>- Selecione -</option>";
    pontoVcorrigir.innerHTML = "<option value=''>- Sel Teste Corrigir -</option>";

    const regex = /^([A-Z]+)(\d+)$/i;

    // 🔍 Log para depuração
    console.log("📋 Pontos recebidos:", pontos);

    // ✅ Ordena por número e prefixo
    const pontosOrdenados = pontos.slice().sort((a, b) => {
      const matchA = a.match(regex);
      const matchB = b.match(regex);
      if (!matchA || !matchB) return 0;

      const [, prefixA, numA] = matchA;
      const [, prefixB, numB] = matchB;

      const diffNum = parseInt(numA) - parseInt(numB);
      if (diffNum !== 0) return diffNum;

      const ordemPrefixos = ["A", "M", "MA", "MB", "T", "TA", "TB", "N"];
      const idxA = ordemPrefixos.indexOf(prefixA);
      const idxB = ordemPrefixos.indexOf(prefixB);
      if (idxA === -1 || idxB === -1) return prefixA.localeCompare(prefixB);
      return idxA - idxB;
    });

    console.log("✅ Pontos ordenados:", pontosOrdenados);

    // ✅ Preenche selects com os pontos completos (ex: MA20, MB20)
    pontosOrdenados.forEach(p => {
      const opt1 = document.createElement('option');
      opt1.value = p;
      opt1.textContent = p;
      pontoSel.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = p;
      opt2.textContent = p;
      pontoVcorrigir.appendChild(opt2);
    });

    // ✅ Participantes
    partSel.innerHTML = '<option value="">-- Selecione para designar! --</option>';
    participantes.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      partSel.appendChild(opt);
    });

    // ✅ Popula selects de "Ponto X"
    const selPonto1 = document.getElementById('pontobepp');
    const selPonto2 = document.getElementById('pontoDesignado');
    const selPonto3 = document.getElementById('pontosParaOferecerSelect');
    const selPonto4 = document.getElementById('pontosParaOferecerSelectSub');
    const selPonto5 = document.getElementById('pontoSelectMap2');
    const selPonto6 = document.getElementById('pontosParaOferecerSelect2h');

    if (selPonto1 && selPonto2 && selPonto3 && selPonto4 && selPonto5 && selPonto6) {
      const numerosUnicos = new Set();

      pontosOrdenados.forEach(ponto => {
        const match = ponto.match(regex);
        if (match) {
          const num = parseInt(match[2], 10);
          if (!isNaN(num)) numerosUnicos.add(num);
        } else {
          console.warn("⚠️ Ponto ignorado (regex falhou):", ponto);
        }
      });

      const numerosOrdenados = Array.from(numerosUnicos).sort((a, b) => a - b);
      console.log("📌 Números de ponto:", numerosOrdenados);

      numerosOrdenados.forEach(num => {
        const label = `Ponto ${num}`;
        [selPonto1, selPonto2, selPonto3, selPonto4, selPonto5, selPonto6].forEach(sel => {
          const opt = document.createElement('option');
          opt.value = label;
          opt.textContent = label;
          sel.appendChild(opt);
        });
      });
    }

    console.log("🎯 Selects populados com sucesso.");
  }




function preencherTabelaSemDisponibilidade() {

  const tbody = document.getElementById("tbodySemDisponibilidade");

  tbody.innerHTML = "";

  document.getElementById("totalSemDisponibilidade").textContent =
    "Participantes sem disponibilidade: " +
    participantesSemDisponibilidade.length;

  participantesSemDisponibilidade.forEach(p => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <!--<td>${p.id}</td>-->
      <td>${p.nome}</td>
      <!--<td>${p.email}</td>-->
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

  const condicao =
    jaTenhoDesignacao
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

    frequenciaEl?.classList.add("erro-campo");

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

      mostrarAlertaGlobal(
        "⚠️ Selecione pelo menos um dia e turno disponível."
      );

      valid = false;

    }

  }

  if (!valid) return;

  mostrarSpinner();

  apiJSONP(
    "salvarDisponibilidade2h",
    {
      idParticipante: idUsuarioLogado,
      condicao,
      frequencia,
      diasTurnos: JSON.stringify(diasTurnos)
    },
    function(res) {

      esconderSpinner();

      mostrarAlertaGlobal(
        res.mensagem ||
        "✅ Disponibilidade atualizada com sucesso."
      );

      cancelarModoEdicaoUsuarioLogado2h();

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao registrar disponibilidade: " +
        (err.mensagem || err.message)
      );

    }
  );

}

function pesquisarDisponibilidadeUsuarioLogado2h() {

  //console.log("pesquisarDisponibilidadeUsuarioLogado2h");

  if (!idUsuarioLogado) {

    mostrarAlertaGlobal("❌ Usuário não identificado.");
    return;

  }

  mostrarSpinner();

  apiJSONP(
    "buscarDisponibilidadeIdUsuarioLogado2h",
    {
      idUsuarioLogado: idUsuarioLogado
    },
    function(dados) {

      esconderSpinner();

      carregarDadosDisponibilidadeUsuarioLogado2h(dados);

      // 🔥 SÓ ABRE MODAL SE FOI SOLICITADO
      if (abrirModalDepoisDaPesquisa) {

        abrirModalDepoisDaPesquisa = false;

        abrirModalEditarDisponibilidade(
          entrarModoEdicaoUsuarioLogado2h
        );

      }

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err.mensagem || err.message)
      );

    }
  );

}


function abrirCalendario2h() {
  abrirModalDepoisDaPesquisa = true;
  pesquisarDisponibilidadeUsuarioLogado2h();
}

function carregarDadosDisponibilidadeUsuarioLogado2h(dados) {

  console.log(dados);

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

  const botaoSalvar =
    document.getElementById("btnSalvaDisponibilidadeUsuarioLogado2h");

  botaoSalvar.classList.add("btn-edicao");

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

  const botaoSalvar =
    document.getElementById("btnSalvaDisponibilidadeUsuarioLogado2h");

  botaoSalvar.classList.remove("btn-edicao");

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
    .textContent = "✏️ Editar Disponibilidade";

  pesquisarDisponibilidadeUsuarioLogado2h();
}

//Disponibilidade para o usuario logado 4h
function habilitarCamposDisponibilidadeID() {
  const checkboxes = document.querySelectorAll('.dia-turno-id');
  checkboxes.forEach(cb => cb.disabled = false);

  document.getElementById('frequenciaDisponibilidadeUsuarioLogado4h').disabled = false;
}

function salvarDisponibilidadeIdUsuarioLogado4h() {

  //console.log('Entrou na função salvarDisponibilidadeIdUsuarioLogado4h');

  const jaTenhoDesignacao =
    document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade")?.checked;

  const frequenciaEl =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  const somenteSubstituicao =
    document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade").checked;

  const idUsuario = idUsuarioLogado;

  const condicao =
    jaTenhoDesignacao
      ? "Já possui designação"
      : somenteSubstituicao
        ? "Somente substituição"
        : "Disponível para ponto fixo";

  const frequencia =
    somenteSubstituicao
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

    mostrarAlertaGlobal(
      "⚠️ Informe a frequência, pois ela é obrigatória para ponto fixo."
    );

    frequenciaEl?.classList.add("erro-campo");

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

      mostrarAlertaGlobal(
        "⚠️ Selecione pelo menos um dia e turno disponível."
      );

      valid = false;

    }

  }

  if (!valid) return;

  mostrarSpinner();

  apiJSONP(
    "salvarDisponibilidade4h",
    {
      idParticipante: idUsuario,
      condicao,
      frequencia,
      diasTurnos: JSON.stringify(diasTurnos)
    },
    function(res) {

      esconderSpinner();

      mostrarAlertaGlobal(
        res.mensagem ||
        "✅ Disponibilidade atualizada com sucesso!"
      );

      if (frequenciaEl) {
        frequenciaEl.classList.remove("erro-campo");
      }

      cancelarModoEdicaoUsuarioLogado4h();

      if (jaTenhoDesignacao || somenteSubstituicao) {

        sincronizarCardsComSwitch();

        /*console.log(
          "Chamando a função de sincronizar cards pelo botão somente Substituição!!!"
        );*/

      }

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao registrar a disponibilidade: " +
        (err.mensagem || err.message)
      );

    }
  );

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

  //console.log("pesquisarDisponibilidadeUsuarioLogado4h");

  if (!idUsuarioLogado) {
    mostrarAlertaGlobal("❌ Usuário inválido.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "buscarDisponibilidadeIdUsuarioLogado4h",
    {
      idUsuarioLogado: idUsuarioLogado
    },

    function(dados) {

      esconderSpinner();

      carregarDadosDisponibilidadeUsuarioLogado4h(dados);

      // 🔥 SÓ ABRE MODAL SE FOI SOLICITADO
      if (abrirModalDepoisDaPesquisa) {

        abrirModalDepoisDaPesquisa = false;

        abrirModalEditarDisponibilidade(
          entrarModoEdicaoUsuarioLogado4h
        );

      }

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err?.mensagem || err?.message || err)
      );

    }

  );

}

function abrirCalendario4h() {
  abrirModalDepoisDaPesquisa = true;
  pesquisarDisponibilidadeUsuarioLogado4h();
}

function norm(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function carregarDadosDisponibilidadeUsuarioLogado4h(dados) {

  console.log(dados);

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

  const botaoSalvar = 
    document.getElementById("btnSalvaDisponibilidadeUsuarioLogado4h");

  botaoSalvar.classList.add("btn-edicao");

  const container =
    document.getElementById("disponibilidadeContainerUsuarioLogado4h");

  container
    .querySelectorAll(".dia-turno-id")
    .forEach(cb => cb.disabled = false); //document.querySelectorAll(".dia-turno-id").forEach(cb => cb.disabled = false);

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

  const botaoSalvar = 
    document.getElementById("btnSalvaDisponibilidadeUsuarioLogado4h");

  botaoSalvar.classList.remove("btn-edicao");

  document.querySelectorAll(".dia-turno-id").forEach(cb => cb.disabled = true);

  const frequencia =
    document.getElementById("frequenciaDisponibilidadeUsuarioLogado4h");

  frequencia.disabled = true;
  frequencia.classList.remove("selectEdicao");

  document.getElementById("btnEditarDisponibilidadeUsuarioLogado4h")
    .textContent = "✏️ Editar Disponibilidade";

  pesquisarDisponibilidadeUsuarioLogado4h();
}

function configurarCampoDisponibilidadeID() {

  if (!idUsuarioLogado) return;

  pesquisarDisponibilidadeUsuarioLogado4h();
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

  apiJSONP(
    "salvarDisponibilidade4h",
    {
      idParticipante,
      condicao,
      frequencia,
      diasTurnos: JSON.stringify(diasTurnos)
    },
    function(res) {

      esconderSpinner();

      mostrarAlertaGlobal(
        res.mensagem ||
        `✅ Disponibilidade atualizada com sucesso para ${nome}!`
      );

      modoEdicaoAtivo = true;

      alternarModoEdicao();

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ " + (err.mensagem || err.message)
      );

    }
  );

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

  apiJSONP(
    "buscarDisponibilidade4h",
    {
      idParticipante
    },
    function(dados) {

      esconderSpinner();

      if (!dados) {

        mostrarAlertaGlobal(
          "⚠️ Nenhuma disponibilidade encontrada."
        );

        return;

      }

      if (typeof carregarDadosDisponibilidade === "function") {

        carregarDadosDisponibilidade(dados);

      } else {

        console.error(
          "Função carregarDadosDisponibilidade não encontrada"
        );

      }

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err.mensagem || err.message)
      );

    }
  );

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

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  const nome =
    participanteSelecionadoTreinamentoPratico.nome;

  if (!idParticipante) {

    mostrarAlertaGlobal(
      "❌ ID não encontrado."
    );

    return;
  }

  const diasTurnos = Array.from(
    document.querySelectorAll(
      '.dia-turno-treinamentoPratico'
    )
  )
    .filter(cb => cb.checked)
    .map(cb => `${cb.dataset.diaT} - ${cb.dataset.turnoT}`);

  mostrarSpinner();

  apiJSONP(
    "salvarDisponibilidadeNoSheetTPPorId",
    {
      id: idParticipante,
      diasTurnos: JSON.stringify(diasTurnos)
    },

    function() {

      esconderSpinner();

      mostrarAlertaGlobal(
        `✅ Disponibilidade atualizada com sucesso para ${nome}!`
      );

      modoEdicaoAtivoTP = true;
      alternarModoEdicaoTP();

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao registrar a disponibilidade!" +
        (err?.mensagem ? "\n" + err.mensagem : "")
      );

    }

  );

}

function pesquisarTP() {

  if (!participanteSelecionadoTreinamentoPratico) {

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const idParticipante =
    participanteSelecionadoTreinamentoPratico.id;

  if (!idParticipante) {

    mostrarAlertaGlobal(
      "❌ ID não encontrado."
    );

    return;
  }

  mostrarSpinner();

  apiJSONP(
    "buscarDisponibilidadeNoSheetTPPorId",
    {
      id: idParticipante
    },

    function(dados) {

      esconderSpinner();

      carregarDadosTP(dados);

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err?.mensagem || err?.message || err)
      );

    }

  );

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

function salvarTPPorId() {

  const idParticipante = idUsuarioLogado;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ Usuário inválido.");
    return;
  }

  const diasTurnos = Array.from(
    document.querySelectorAll('.dia-turno-treinamentoPraticoId')
  )
  .filter(cb => cb.checked)
  .map(cb => `${cb.dataset.diaTId} - ${cb.dataset.turnoTId}`);

  mostrarSpinner();

  apiJSONP(
    "salvarDisponibilidadeNoSheetTPPorId",
    {
      id: idParticipante,
      diasTurnos: JSON.stringify(diasTurnos)
    },

    function(res) {

      esconderSpinner();

      mostrarAlertaGlobal(
        res.mensagem || "✅ Disponibilidade atualizada com sucesso!"
      );

      modoEdicaoAtivoTPId = true;
      alternarModoEdicaoTPId();

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao registrar a disponibilidade: " +
        (err?.mensagem || err?.message || err)
      );

    }

  );

}

function pesquisarTPPorId() {

  const idParticipante = idUsuarioLogado;

  if (!idParticipante) {
    mostrarAlertaGlobal("❌ Usuário inválido.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "buscarDisponibilidadeNoSheetTPPorId",
    {
      id: idParticipante
    },

    function(dados) {

      esconderSpinner();

      carregarDadosTPId(dados);

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err?.message || err?.mensagem || err)
      );

    }

  );

}

function carregarDadosTPId(dados) {

  if (!dados) {

    document
      .querySelectorAll('.dia-turno-treinamentoPraticoId')
      .forEach(cb => cb.checked = false);

    document
      .querySelectorAll('.dia-turno-treinamentoPraticoId')
      .forEach(cb => cb.disabled = false);

    return;
  }

  document
    .querySelectorAll('.dia-turno-treinamentoPraticoId')
    .forEach(cb => cb.checked = false);

  if (Array.isArray(dados.diasTurnos)) {

    dados.diasTurnos.forEach(item => {

      const partes = item.split(' - ');

      if (partes.length !== 2) return;

      const diaTId = partes[0];
      const turnoTId = partes[1];

      const checkbox = Array.from(
        document.querySelectorAll('.dia-turno-treinamentoPraticoId')
      ).find(cb => {

        return (
          norm(cb.dataset.diaTId) === norm(diaTId) &&
          norm(cb.dataset.turnoTId) === norm(turnoTId)
        );

      });

      if (checkbox) {
        checkbox.checked = true;
      }

    });

  }

  const checkboxes =
    document.querySelectorAll('.dia-turno-treinamentoPraticoId');

  const algumMarcado =
    Array.from(checkboxes).some(cb => cb.checked);

  const habilitar = !algumMarcado;

  checkboxes.forEach(cb => {
    cb.disabled = !habilitar;
  });
}

let modoEdicaoAtivoTPId = false;

function alternarModoEdicaoTPId() {

  modoEdicaoAtivoTPId = !modoEdicaoAtivoTPId;

  const container =
    document.getElementById("treinamentoPraticoContainerId");

  const checkboxes =
    container.querySelectorAll('.dia-turno-treinamentoPraticoId');

  checkboxes.forEach(cb => {
    cb.disabled = !modoEdicaoAtivoTPId;
  });

  const botao =
    document.getElementById('btnEditarTPId');

  botao.textContent =
    modoEdicaoAtivoTPId
      ? '❌ Cancelar'
      : '✏️ Editar Disponibilidade';

  if (!modoEdicaoAtivoTPId) {
    pesquisarTPPorId();
  }
}





function pesquisarMinhaInfo() {

  if (!idUsuarioLogado) {
    mostrarAlertaGlobal("❌ Usuário não identificado.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "pesquisarMeuCadastro",
    {
      id: idUsuarioLogado
    },
    function(dados) {

      esconderSpinner();

      mostrarResultadosMinhaInfo(dados);

    }
  );

  apiJSONP(
    "pesquisarMinhasDesignacoes",
    {
      id: idUsuarioLogado
    },
    function(resultado) {

      // Se essa função apenas atualiza alguma variável ou tela,
      // coloque aqui o código que antes ficava no SuccessHandler.

      //console.log(resultado);

    }
  );

}

function mostrarResultadosMinhaInfo(dados) {
    const tInfo = document.getElementById('tabelaInfoPessoalMinhaInfo'),
          bInfo = document.getElementById('infoPessoalBodyMinhaInfo'),

          tInfo2 = document.getElementById('tabelaInfoPessoal2MinhaInfo'),
          bInfo2 = document.getElementById('infoPessoalBody2MinhaInfo'),

          tClas = document.getElementById('tabelaClassificacaoMinhaInfo'),
          bClas = document.getElementById('classificacaoBodyMinhaInfo'),

          tDet = document.getElementById('tabelaDetalhesMinhaInfo'),
          bDet = document.getElementById('detalhesBodyMinhaInfo');

    bInfo.innerHTML = '';
    bInfo2.innerHTML = '';
    bClas.innerHTML = '';
    bDet.innerHTML = '';

    if (!dados || (dados.length === 0 && (!dados.participantes || dados.participantes.length === 0))) {
      tInfo.style.display = 'none';
      tInfo2.style.display = 'none';
      tClas.style.display = 'none';
      tDet.style.display = 'none';
      document.getElementById('detalhesDesignacoesMinhaInfo').style.display = 'none';
      document.getElementById('detalhesPrivilegiosMinhaInfo').style.display = 'none';
      return;
    }

    let part = dados.participantes || dados,
        privs = dados.privilegios || [];

    if (Array.isArray(privs) && privs.length === 1 && Array.isArray(privs[0])) privs = privs[0];
    if (privs.length === 1 && typeof privs[0] === 'string' && privs[0].includes(',')) privs = privs[0].split(',').map(p => p.trim());

    part.forEach((linha, idx) => {

      const trInfo = document.createElement('tr'),
            trInfo2 = document.createElement('tr'),
            trClas = document.createElement('tr'),
            trDet = document.createElement('tr');

      trDet.dataset.identificadorOriginal = (linha[14] || '').toString().trim();

      console.log("🧩 trDet:", trDet);
      console.log("🧩 dataset completo:", trDet.dataset);
      console.log("🧩 identificadorOriginal:");
      console.log("🧩 atributo HTML:", trDet.getAttribute("data-identificador-original"));

      linha.slice(0, 2).forEach(v => {
        const td = document.createElement('td');
        td.textContent = v || '';
        trInfo.appendChild(td);
      });

      linha.slice(2, 4).forEach(v => {
        const td = document.createElement('td');
        td.textContent = v || '';
        trInfo2.appendChild(td);
      });

      linha.slice(4, 7).forEach(v => {
        const td = document.createElement('td');
        td.textContent = v || '';
        trClas.appendChild(td);
      });

      linha.slice(7, 8).forEach(v => {
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
      btnE.style.margin = '0';
      btnE.onclick = () => {
      tornarEditavelMinhaInfo([trInfo, trInfo2, trClas, trDet], idx);
      };

      const btnS = document.createElement('button');
      btnS.textContent = '💾 Salvar';
      btnS.className = 'botao salvar';
      btnS.style.display = 'none';
      btnS.style.margin = '0';
      btnS.onclick = () => salvarAlteracoesMinhaInfo([trInfo, trInfo2, trClas, trDet], idx);

      const btnC = document.createElement('button');
      btnC.textContent = '❌ Cancelar';
      btnC.className = 'botao cancel';
      btnC.style.display = 'none';
      btnC.style.margin = '0';
      btnC.onclick = () => cancelarEdicaoMinhaInfo([trInfo, trInfo2, trClas, trDet], idx);

      const btnX = document.createElement('button');
      btnX.textContent = '🗑️ Excluir';
      btnX.className = 'botao excluir'; 
      btnX.style.margin = '0';
      btnX.onclick = () => {
      const msg = document.getElementById("msgExcluirMinhaInfo");
      mostrarAlertaGlobal("❌ Você não tem permissão para excluir participantes.\nPor favor, contate a administração.");
      };

      tdA.appendChild(btnE);
      tdA.appendChild(btnS);
      tdA.appendChild(btnC);
      tdA.appendChild(btnX);
      trDet.appendChild(tdA);

      bInfo.appendChild(trInfo);
      bInfo2.appendChild(trInfo2);
      bClas.appendChild(trClas);
      bDet.appendChild(trDet);
    });

    tInfo.style.display = 'table';
    tInfo2.style.display = 'table';
    tClas.style.display = 'table';
    tDet.style.display = 'table';

    const p0 = part[0];

    if (p0) {

        document.getElementById('campoIdentificacaoMi').textContent = p0[8] || '';

        const designacoes = [
            { id: 'campoDesignacao1Mi', valor: p0[9]  || '' },
            { id: 'campoDesignacao2Mi', valor: p0[10] || '' },
            { id: 'campoDesignacao3Mi', valor: p0[11] || '' },
            { id: 'campoDesignacao4Mi', valor: p0[12] || '' },
            { id: 'campoDesignacao5Mi', valor: p0[13] || '' }
        ];

        designacoes.forEach(({ id, valor }) => {

            const span = document.getElementById(id);
            span.textContent = valor;

            span.closest('.card-info').style.display = valor ? '' : 'none';
        });

        document.getElementById('detalhesDesignacoesMinhaInfo').style.display =
            designacoes.some(d => d.valor) ? 'block' : 'none';

    } else {

        document.getElementById('detalhesDesignacoesMinhaInfo').style.display = 'none';

    }

    document.getElementById('campoPrivOrganizacaoMi').textContent = formatarPrivilegio(privs[0]);
    document.getElementById('campoPrivAACMi').textContent         = formatarPrivilegio(privs[1]);
    document.getElementById('campoPrivEscalasMi').textContent     = formatarPrivilegio(privs[2]);
    document.getElementById('campoPrivEquipesMi').textContent     = formatarPrivilegio(privs[3]);
    document.getElementById('campoPrivTreinadorMi').textContent   = formatarPrivilegio(privs[4]);

    document.getElementById('detalhesPrivilegiosMinhaInfo').style.display = 'block';

    setTimeout(() => {
        marcarUltimaLinhaTabelaMinhaInfo('detalhesBodyMinhaInfo');
    }, 0);

  }

  function formatarPrivilegio(valor) {

      const texto = String(valor || '').trim();

      switch (texto.toLowerCase()) {

          case 'sim':
              return '✅ Sim';

          case 'não':
          case 'nao':
              return '❌ Não';

          default:
              return texto;
      }
  }

  function marcarUltimaLinhaTabelaMinhaInfo(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const linhas = [...tbody.querySelectorAll('tr')];
    if (linhas.length === 0) return;

    // Remove classes antigas
    linhas.forEach(tr => {
      const tds = tr.querySelectorAll('td');
      tds.forEach(td => td.classList.remove('pequena', 'grande'));
    });

    const ultimaLinha = linhas[linhas.length - 1];
    const tds = ultimaLinha.querySelectorAll('td');

    if (tds.length >= 2) {
      tds[0].classList.add('pequena'); // primeira célula
      tds[tds.length - 1].classList.add('grande'); // última célula
    }
  }
  // ✅ Função utilitária para criar <select> com valor original preservado
  function criarSelectComValorAtualMinhaInfo(opcoes = [], valorOriginal = '') {
    const select = document.createElement('select');
    const valor = valorOriginal.trim();
    const valorLower = valor.toLowerCase();

    // Verifica se o valor já está entre as opções (ignorando maiúsculas/minúsculas e espaços)
    const existe = opcoes.some(op => op.trim().toLowerCase() === valorLower);

    // Se não existir, adiciona o valor original como uma opção temporária
    if (!existe && valor !== '') {
      opcoes = [valor, ...opcoes];
    }

    opcoes.forEach(opcao => {
      const opt = document.createElement('option');
      opt.value = opcao;
      opt.textContent = opcao;

      if (opcao.trim().toLowerCase() === valorLower) {
        opt.selected = true;
      }

      select.appendChild(opt);
    });

    select.defaultValue = valor;

    return select;
  }

  // ✅ Função principal
  function tornarEditavelMinhaInfo(trs, idx) {
    if (!window.opcoesPrivilegios || Object.keys(window.opcoesPrivilegios).length === 0) {
      mostrarAlertaGlobal('⚠️ As opções ainda estão sendo carregadas. Tente novamente em alguns segundos.');
      return;
    }

    const [trInfo, trInfo2, trClas, trDet] = trs;

    // 🔷 Linha trInfo
    const tds0 = trInfo.querySelectorAll('td');
    tds0.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      if (index === 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorOriginal;
        input.defaultValue = valorOriginal;
        td.appendChild(input);
      } else if (index === 1) {
        const select = criarSelectComValorAtualMinhaInfo(window.opcoesCongregacoes || [], valorOriginal);
        td.appendChild(select);
      }
    });

    // 🔷 Linha trInfo2
    const tds = trInfo2.querySelectorAll('td');

    tds.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = valorOriginal;
      input.defaultValue = valorOriginal;

      // ✅ Validação para telefone (1º campo)
      if (index === 0) {
        input.placeholder = '(11) 99217-3945';
        //input.title = 'Digite o telefone no formato: (11) 992173945. Parênteses inseridos automaticamente. Sem hífens.';

        input.addEventListener('input', () => {
          let numeros = input.value.replace(/\D/g, '');

          if (numeros.length > 11) numeros = numeros.slice(0, 11);

          let formatado = '';

          if (numeros.length >= 2) {
            formatado = `(${numeros.slice(0, 2)}) `;

            if (numeros.length >= 7) {
              formatado += `${numeros.slice(2, 7)}-${numeros.slice(7)}`;
            } else if (numeros.length > 2) {
              formatado += numeros.slice(2);
            }
          } else {
            formatado = numeros;
          }

          input.value = formatado;
        });
      }

      // ✅ Validação para e-mail (2º campo)
      if (index === 1) {
        input.type = 'email';
        input.placeholder = 'exemplo@email.com';
        input.title = 'Digite um e-mail válido.';
      }

      td.appendChild(input);
    });

    // 🔷 Linha trClas (3 colunas: confirmacao, sexo, situacao)
    const tdsClas = trClas.querySelectorAll('td');
    tdsClas.forEach((td, index) => {
      const valorAtual = td.textContent.trim();
      td.textContent = '';

      const opcoes = (index === 0)
        ? (window.opcoesPrivilegios.confirmacao || [])
        : (index === 1)
          ? (window.opcoesPrivilegios.sexo || [])
          : (index === 2)
            ? (window.opcoesPrivilegios.situacao || [])
            : [];

      const select = criarSelectComValorAtualMinhaInfo(opcoes, valorAtual);
      // Se for a terceira coluna, desabilita o select
      if (index === 2) {
        select.disabled = true;
      }
      td.appendChild(select);
    });

    // 🔷 Linha trDet (campo situação extra)
    const situacaoTd = trDet.querySelector('td');
    const valorSituacao = situacaoTd.textContent.trim();
    const selectSituacao = criarSelectComValorAtualMinhaInfo(window.opcoesPrivilegios.confirmacao || [], valorSituacao);
    selectSituacao.disabled = true; // 🔹 torna o select não editável
    situacaoTd.textContent = '';
    situacaoTd.appendChild(selectSituacao);

    // 🔷 Substituição de spans com ids específicos por selects
    const mapaIdsParaChaves = {
      campoPrivOrganizacaoMi: 'organizacao',
      campoPrivAACMi: 'aac',
      campoPrivEscalasMi: 'escalas',
      campoPrivEquipesMi: 'equipes',
      campoPrivTreinadorMi: 'treinador'
    };

    // 🔷 Botões
    const [btnE, btnS, btnC] = trDet.querySelectorAll('button');
    btnE.style.display = 'none';
    btnS.style.display = 'inline-block';
    btnC.style.display = 'inline-block';
  }
  //nova função para voltar os selects para o texto da tabela
  function cancelarEdicaoMinhaInfo(trs, idx) {
    const [trInfo, trInfo2, trClas, trDet] = trs;
    const infoTds = trInfo.querySelectorAll('td'),
          info2Tds = trInfo2.querySelectorAll('td'),
          clasTds = trClas.querySelectorAll('td'),
          detTds = trDet.querySelectorAll('td');

    // c trInfo (apenas inputs)
    infoTds.forEach(td => {
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 trInfo2 (agora apenas inputs)
    info2Tds.forEach(td => {
      const input = td.querySelector('input');
      td.textContent = input ? input.defaultValue || '' : '';
    });


    // 🔁 trClas (dois selects)
    clasTds.forEach(td => {
      const select = td.querySelector('select');
      if (select) td.textContent = select.defaultValue || '';
    });

    /*// 🔁 trDet (input de situação)
    const input = detTds[0].querySelector('input');
    if (input) detTds[0].textContent = input.defaultValue || '';*/

    detTds.forEach(td => {
    if (td.querySelector('button')) return; // pula o <td> com botões
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 Botões: volta ao estado original (Editar visível, Salvar e Cancelar ocultos)
    const [btnE, btnS, btnC] = trDet.querySelectorAll('button');
    btnE.style.display = 'inline-block';
    btnS.style.display = 'none';
    btnC.style.display = 'none';
  }

function salvarAlteracoesMinhaInfo(trs, idx) {

const [trInfo, trInfo2, trClas, trDet] = trs;

const infoTds = trInfo.querySelectorAll('td'),
      info2Tds = trInfo2.querySelectorAll('td'),
      clasTds = trClas.querySelectorAll('td'),
      detTds = trDet.querySelectorAll('td');

const nd = [];

infoTds.forEach(td => {

  const input = td.querySelector('input');
  const select = td.querySelector('select');

  let valor = '';

  if (input) valor = input.value;
  else if (select) valor = select.value;
  else valor = td.textContent.trim();

  nd.push(valor);
  td.textContent = valor;

});

// 🟩 trInfo2
info2Tds.forEach((td, index) => {

  const input = td.querySelector('input');

  let valor = '';

  if (input) valor = input.value.trim();
  else valor = td.textContent.trim();

  if (input) {

    input.classList.remove('erro-campo');

    input.addEventListener('input', () => {
      input.classList.remove('erro-campo');
    }, { once: true });

  }

  if (index === 0) {

    const telefoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;

    if (!telefoneRegex.test(valor)) {

      mostrarAlertaGlobal(
        '⚠️ Telefone inválido. Use o formato: (11) 99217-3945'
      );

      if (input) {
        input.classList.add('erro-campo');
        input.focus();
      }

      throw new Error('Telefone inválido');
    }
  }

  if (index === 1) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(valor)) {

      mostrarAlertaGlobal('⚠️ E-mail inválido.');

      if (input) {
        input.classList.add('erro-campo');
        input.focus();
      }

      throw new Error('Email inválido');
    }
  }

  nd.push(valor);
  td.textContent = valor;

});

// 🟨 trClas
clasTds.forEach(td => {

  const input = td.querySelector('input');
  const select = td.querySelector('select');

  let valor = '';

  if (input) valor = input.value;
  else if (select) valor = select.value;
  else valor = td.textContent.trim();

  nd.push(valor);
  td.textContent = valor;

});

// 🟥 trDet
const situacaoTd = detTds[0];

const input = situacaoTd.querySelector('input');
const select = situacaoTd.querySelector('select');

let valor = '';

if (input) valor = input.value;
else if (select) valor = select.value;
else valor = situacaoTd.textContent.trim();

nd.push(valor);
situacaoTd.textContent = valor;

// 🧩 Privilégios
const campos = [
  'campoPrivOrganizacaoMi',
  'campoPrivAACMi',
  'campoPrivEscalasMi',
  'campoPrivEquipesMi',
  'campoPrivTreinadorMi'
];

const priv = [];

campos.forEach(id => {

  const el = document.getElementById(id);

  let valorSelecionado = '';

  if (el && el.tagName.toLowerCase() === 'select') {

    valorSelecionado = el.value;

    const span = document.createElement('span');
    span.id = el.id;
    span.textContent = valorSelecionado;

    el.replaceWith(span);

  } else if (el) {

    valorSelecionado = el.textContent.trim();

  }

  priv.push(valorSelecionado);

});

const idOrig = trDet.dataset.identificadorOriginal;

console.log("🧩 trDet:", trDet);
console.log("🧩 dataset completo:", trDet.dataset);
console.log("🧩 identificadorOriginal:", idOrig);
console.log("🧩 atributo HTML:", trDet.getAttribute("data-identificador-original"));

mostrarSpinner();

apiJSONP(
  "atualizarMinhaInfo",
  {
    dados: JSON.stringify({
      primeiros8: nd,
      privilegios: priv,
      identificadorOriginal: idOrig
    })
  },
  function(res) {

    esconderSpinner();

    mostrarAlertaGlobal(
      res.mensagem || '✅ Alterado com sucesso!'
    );

    carregarOpcoes();

    document
      .querySelectorAll('.erro-campo')
      .forEach(el => el.classList.remove('erro-campo'));

  },
  function(err) {

    esconderSpinner();

    mostrarAlertaGlobal(
      '❌ Erro ao salvar: ' + (err.message || err.mensagem)
    );

    document
      .querySelectorAll('.erro-campo')
      .forEach(el => el.classList.remove('erro-campo'));

  }
);

const [btnE, btnS, btnC] = trDet.querySelectorAll('button');

btnE.style.display = 'inline-block';
btnS.style.display = 'none';
btnC.style.display = 'none';

}

  function editarPrivilegiosMinhaInfo() {
    const campos = [
      { id: 'campoPrivOrganizacaoMi', chave: 'organizacao' },
      { id: 'campoPrivAACMi', chave: 'aac' },
      { id: 'campoPrivEscalasMi', chave: 'escalas' },
      { id: 'campoPrivEquipesMi', chave: 'equipes' },
      { id: 'campoPrivTreinadorMi', chave: 'treinador' }
    ];

    campos.forEach(({ id, chave }) => {
      const span = document.getElementById(id);
      if (!span) {
        console.warn(`Elemento com ID ${id} não encontrado`);
        return;
      }

      const valorAtual = span.textContent.trim();
      const select = document.createElement('select');
      select.id = id;

      const optVazio = document.createElement('option');
      optVazio.value = '';
      optVazio.textContent = '- Selecione -';
      select.appendChild(optVazio);

      const opcoes = (window.opcoesPrivilegios?.[chave] || []);
      opcoes.forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao;
        if (opcao === valorAtual) option.selected = true;
        select.appendChild(option);
      });

      span.replaceWith(select);
    });
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

  const idParticipante =
    participanteSelecionado2horas.id;

  const nome =
    participanteSelecionado2horas.nome;

  if (!idParticipante) {

    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;

  }

  // =========================
  // NORMALIZAÇÃO DE ESTADO
  // =========================
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

  // =========================
  // VALIDAÇÃO FREQUÊNCIA
  // =========================
  if (isPontoFixo && !frequencia) {

    mostrarAlertaGlobal(
      "⚠️ Informe a frequência, pois ela é obrigatória para ponto fixo."
    );

    frequenciaEl?.classList.add("erro-campo");

    return;

  }

  // =========================
  // VALIDAÇÃO DIAS / TURNOS
  // =========================
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

  // =========================
  // SALVAR
  // =========================
  mostrarSpinner();

  apiJSONP(
    "salvarDisponibilidade2h",
    {
      idParticipante,
      condicao,
      frequencia,
      diasTurnos: JSON.stringify(diasTurnos)
    },
    function(res) {

      esconderSpinner();

      mostrarAlertaGlobal(
        res.mensagem ||
        `✅ Disponibilidade atualizada com sucesso para ${nome}!`
      );

      frequenciaEl?.classList.remove("erro-campo");

      modoEdicaoAtivoNovoPonto20 = true;

      alternarModoEdicaoNovoPonto20();

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ " + (err.mensagem || err.message)
      );

    }
  );

}

function alternarSomenteSubstituicaoNovoPonto20() {

  const ativo =
    document.getElementById("somenteSubstituicaoNovoPonto20")
      ?.checked;

  document.querySelectorAll(".dia-turno-novoPonto20")
    .forEach(cb => {

      cb.disabled = ativo;

      if (ativo) {
        cb.checked = false;
      }
    });

  const freq =
    document.getElementById(
      "frequenciaDisponibilidadeNovoPonto20"
    );

  if (freq) {

    freq.disabled = ativo;

    if (ativo) {
      freq.value = "";
    }
  }

    if (ativo) {
    salvarDisponibilidade2h();
    }
  }
  function alternarDesignadoNovoPonto20() {

  const ativo =
    document.getElementById("jaTenhoDesignacaoNovoPonto20")
      ?.checked;

  document.querySelectorAll(".dia-turno-novoPonto20")
    .forEach(cb => {

      cb.disabled = ativo;

      if (ativo) {
        cb.checked = false;
      }
    });

  const freq =
    document.getElementById(
      "frequenciaDisponibilidadeNovoPonto20"
    );

  if (freq) {

    freq.disabled = ativo;

    if (ativo) {
      freq.value = "";
    }
  }

    const substituicao2h = document.getElementById("somenteSubstituicaoNovoPonto20");
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

  const idParticipante =
    participanteSelecionado2horas.id;

  if (!idParticipante) {

    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;

  }

  mostrarSpinner();

  apiJSONP(
    "buscarDisponibilidade2h",
    {
      idParticipante
    },
    function(dados) {

      esconderSpinner();

      if (!dados) {

        mostrarAlertaGlobal(
          "⚠️ Nenhuma disponibilidade encontrada."
        );

        return;

      }

      if (typeof carregarDadosDisponibilidadeNovoPonto20 === "function") {

        carregarDadosDisponibilidadeNovoPonto20(dados);

      } else {

        console.error(
          "Função carregarDadosDisponibilidadeNovoPonto20 não encontrada"
        );

      }

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao carregar disponibilidade: " +
        (err.mensagem || err.message)
      );

    }
  );

}

function alternarModoEdicaoNovoPonto20() {

  modoEdicaoAtivoNovoPonto20 = !modoEdicaoAtivoNovoPonto20;

  const container = document.getElementById("disponibilidadeContainerNovoPonto20");

  const checkboxes = container.querySelectorAll('.dia-turno-novoPonto20');
  checkboxes.forEach(cb => cb.disabled = !modoEdicaoAtivoNovoPonto20);

  const selects = [
    document.getElementById('frequenciaDisponibilidadeNovoPonto20')
  ];

  selects.forEach(select => {
    if (select) select.disabled = !modoEdicaoAtivoNovoPonto20;
  });

  const botao = document.getElementById('btnEditarDisponibilidadeNovoPonto20');

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


let map;
let todosOsPontos = [];
let marcadoresFixos = [];
let marcadorDestaque = null;
let infoWindow = null;
let mapScriptLoaded = false;
let mapaIniciado = false;

function initMap() {

  if (mapaIniciado) return; // impede recriação

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -14.2350, lng: -51.9253 },
    zoom: 4,
  });

  mapaIniciado = true;

  // Buscar os pontos via JSONP
  apiJSONP(
    "getTodosOsPontos",
    {},

    function(pontos) {

      todosOsPontos = pontos;

      // Preenche o select
      const select = document.getElementById("pontoSelectMap");
      select.innerHTML = "<option value=''>Selecione</option>";

      pontos.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.nome;
        opt.textContent = p.nome;
        select.appendChild(opt);
      });

      // Exibe todos os marcadores
      renderAllMarkers(todosOsPontos);

    },

    function(err) {

      mostrarAlertaGlobal(
        "❌ Erro ao carregar pontos: " +
        (err?.message || err?.mensagem || err)
      );

    }

  );
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

  const nomeSelecionado =
    document.getElementById("pontoSelectMap2").value;

  if (!nomeSelecionado) {
    mostrarAlertaGlobal("Selecione um ponto.");
    return;
  }

  apiJSONP(
    "buscarDadosDoMapa",
    {
      nome: nomeSelecionado
    },

    function(dados) {

      if (!dados) {
        mostrarAlertaGlobal(
          'Mapa não cadastrado. Preencha os campos e clique em "Cadastrar/Editar Mapa".'
        );
        return;
      }

      // Preencher os campos com os dados retornados
      document.getElementById("novoPonto").value = dados[0] || "";
      document.getElementById("novaLatitude").value = dados[1] || "";
      document.getElementById("novaLongitude").value = dados[2] || "";
      document.getElementById("novoAAC").value = dados[3] || "";
      document.getElementById("novoEndereco").value = dados[4] || "";
      document.getElementById("novoDeposito").value = dados[5] || "";

    },

    function(err) {

      mostrarAlertaGlobal(
        "❌ Erro ao buscar dados do mapa: " +
        (err?.message || err?.mensagem || err)
      );

    }

  );

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

  const dados = { nome, lat, lng, aac, endereco, deposito };

  apiJSONP(
    "cadastrarOuAtualizarMapa",
    {
      dados: JSON.stringify(dados)
    },

    function(mensagem) {

      mostrarAlertaGlobal(
        mensagem?.mensagem || mensagem || "Operação realizada com sucesso!"
      );

    },

    function(err) {

      mostrarAlertaGlobal(
        "❌ Erro ao cadastrar/atualizar mapa: " +
        (err?.message || err?.mensagem || err)
      );

    }

  );

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

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const idParticipante =
    participanteSelecionadoTcs.id;

  if (!idParticipante) {

    mostrarAlertaGlobal(
      "❌ ID não encontrado para este participante."
    );

    return;
  }

  mostrarSpinner();

  apiJSONP(
    "pesquisarEmailTcsPorId",
    {
      id: idParticipante
    },

    function(email) {

      esconderSpinner();

      mostrarResultadoTcs(email);

      mostrarAlertaGlobal(
        "✅ E-mail encontrado."
      );

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao pesquisar participante: " +
        (err?.message || err?.mensagem || err)
      );

    }

  );

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

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const idParticipante =
    window.mapaParticipantesPorNome?.[nome];

  if (!idParticipante) {

    mostrarAlertaGlobal(
      "❌ ID não encontrado."
    );

    return;
  }

  const emailLower =
    novoEmail.toLowerCase();

  if (
    !novoEmail ||
    textosInvalidos.includes(emailLower) ||
    emailLower.includes("@jwpub.org") ||
    !validarEmail(novoEmail)
  ) {

    mostrarAlertaGlobal(
      "⚠️ Por favor, digite um e-mail válido (não pode conter @jwpub.org)."
    );

    return;
  }

  novoEmail = emailLower;

  mostrarSpinner();

  apiJSONP(
    "salvarEmailTcsPorId",
    {
      id: idParticipante,
      email: novoEmail
    },

    function() {

      esconderSpinner();

      mostrarAlertaGlobal(
        "✅ E-mail atualizado com sucesso!"
      );

      document.getElementById("emailTcs").readOnly = true;

      document.getElementById("btnEditartcs").textContent =
        "✏️ Editar e-mail tcs";

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao salvar e-mail!"
      );

      console.error(err);

    }

  );

}

function pesquisarParticipante() {

  if (!participanteSelecionadoEditar) {

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const id =
    participanteSelecionadoEditar.id;

  if (!id) {
    mostrarAlertaGlobal('❌ ID não encontrado para este participante.');
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "pesquisarParticipantesPorId",
    {
      id
    },

    function(dados) {

      esconderSpinner();

      mostrarResultados(dados);

    },

    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        '❌ Erro ao pesquisar participante: ' +
        (err?.message || err?.mensagem || err)
      );

    }

  );

  // segunda chamada (sem callback no original)
  apiJSONP(
    "pesquisarDesignacoesPorParticipanteId",
    {
      id
    },

    function() {
      // intencionalmente vazio (mesmo comportamento do original)
    },

    function(err) {
      console.error("Erro ao buscar designações:", err);
    }

  );

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

  // 🔥 JSONP SAFETY: caso venha string
  if (typeof dados === "string") {
    try {
      dados = JSON.parse(dados);
    } catch (e) {
      console.error("Erro ao parsear JSONP:", e);
      return;
    }
  }

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

  let part = dados.participantes || dados;
  let privs = dados.privilegios || [];

  if (!Array.isArray(part)) part = [];

  // 🔥 proteção JSONP extra
  if (Array.isArray(privs) && privs.length === 1 && Array.isArray(privs[0])) privs = privs[0];
  if (privs.length === 1 && typeof privs[0] === 'string' && privs[0].includes(',')) {
    privs = privs[0].split(',').map(p => p.trim());
  }

  part.forEach((linha, idx) => {

    const trInfo = document.createElement('tr'),
          trInfo1 = document.createElement('tr'),
          trInfo2 = document.createElement('tr'),
          trInfo3 = document.createElement('tr'),
          trClas = document.createElement('tr'),
          trDet = document.createElement('tr');

    trDet.dataset.identificadorOriginal = (linha[17] || '').toString().trim();

    // ===== INFO =====
    linha.slice(0, 2).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trInfo.appendChild(td);
    });

    // email
    const tdEmail = document.createElement('td');
    tdEmail.textContent = linha[2] || '';
    trInfo1.appendChild(tdEmail);

    // contato + petição
    linha.slice(3, 5).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trInfo2.appendChild(td);
    });

    // datas
    const dataNasc = linha[8] || '';
    const dataBat  = linha[9] || '';

    const idade = dataNasc ? calcularIdade(dataNasc) : '';
    const anosBat = dataBat ? calcularAnosBatismo(dataBat) : '';

    trInfo3.innerHTML = `
      <td>${dataNasc}</td>
      <td style="text-align:center">${idade ? idade + ' anos' : ''}</td>
      <td>${dataBat}</td>
      <td style="text-align:center">${anosBat ? anosBat + ' anos' : ''}</td>
    `;

    // classificação
    linha.slice(5, 8).forEach(v => {
      const td = document.createElement('td');
      td.textContent = v || '';
      trClas.appendChild(td);
    });

    // TCS
    const tdTcs = document.createElement('td');
    tdTcs.textContent = linha[10] || '';
    trDet.appendChild(tdTcs);

    // botão container
    const tdA = document.createElement('td');
    tdA.style.display = 'flex';
    tdA.style.justifyContent = 'flex-end';
    tdA.style.gap = '10px';

    const btnE = document.createElement('button');
    btnE.textContent = '✏️ Editar';
    btnE.onclick = () => tornarEditavel([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);

    const btnS = document.createElement('button');
    btnS.textContent = '💾 Salvar';
    btnS.style.display = 'none';
    btnS.onclick = () => salvarAlteracoes([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);

    const btnC = document.createElement('button');
    btnC.textContent = '❌ Cancelar';
    btnC.style.display = 'none';
    btnC.onclick = () => cancelarEdicao([trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet], idx);

    const btnX = document.createElement('button');
    btnX.textContent = '🗑️ Excluir';

    btnX.onclick = () => {

      const nome = linha[0];
      const congregacao = linha[1];
      const telefone = linha[3];

      const nomeConcatenado = `${nome}\n${congregacao}\n${telefone}`;

      mostrarSpinner();

      apiJSONP(
        "validarExclusaoParticipante",
        { nomeConcatenado },
        (resultado) => {

          esconderSpinner();

          if (!resultado.permitido) {
            mostrarAlertaGlobal("❌ " + resultado.motivo);
            return;
          }

          mostrarConfirmacaoGlobal(
            `⚠️ Tem certeza que deseja mesmo excluir <strong>${nome}</strong>?`,
            () => {

              mostrarSpinner();

              apiJSONP(
                "excluirParticipantePorNomeConcatenado",
                { nomeConcatenado },
                () => {
                  esconderSpinner();
                  mostrarAlertaGlobal("✅ Participante excluído com sucesso.");
                },
                (err) => {
                  esconderSpinner();
                  mostrarAlertaGlobal("❌ Erro ao excluir: " + err.mensagem);
                }
              );
            }
          );
        },
        (err) => {
          esconderSpinner();
          mostrarAlertaGlobal("❌ " + err.mensagem);
        }
      );
    };

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

  const p0 = part[0] || {};

  const designacoes = [
    { id: 'campoDesignacao1', valor: p0?.[12] || '' },
    { id: 'campoDesignacao2', valor: p0?.[13] || '' },
    { id: 'campoDesignacao3', valor: p0?.[14] || '' },
    { id: 'campoDesignacao4', valor: p0?.[15] || '' },
    { id: 'campoDesignacao5', valor: p0?.[16] || '' }
  ];

  designacoes.forEach(({ id, valor }) => {
    const span = document.getElementById(id);
    if (!span) return;

    span.textContent = valor;
    span.closest('.card-info').style.display = valor ? '' : 'none';
  });

  document.getElementById('campoIdentificacao').textContent = p0?.[11] || '';

  document.getElementById('detalhesDesignacoes').style.display =
    designacoes.some(d => d.valor) ? 'block' : 'none';

  document.getElementById('campoPrivOrganizacao').textContent = formatarPrivilegio(privs[0]);
  document.getElementById('campoPrivAAC').textContent         = formatarPrivilegio(privs[1]);
  document.getElementById('campoPrivEscalas').textContent     = formatarPrivilegio(privs[2]);
  document.getElementById('campoPrivEquipes').textContent     = formatarPrivilegio(privs[3]);
  document.getElementById('campoPrivTreinador').textContent   = formatarPrivilegio(privs[4]);

  document.getElementById('detalhesPrivilegios').style.display = 'block';

  setTimeout(() => marcarUltimaLinhaTabela('detalhesBody'), 0);
}

function marcarUltimaLinhaTabela(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const linhas = [...tbody.querySelectorAll('tr')];
    if (linhas.length === 0) return;

    // Remove classes antigas
    linhas.forEach(tr => {
      const tds = tr.querySelectorAll('td');
      tds.forEach(td => td.classList.remove('pequena', 'grande'));
    });

    const ultimaLinha = linhas[linhas.length - 1];
    const tds = ultimaLinha.querySelectorAll('td');

    if (tds.length >= 2) {
      tds[0].classList.add('pequena'); // primeira célula
      tds[tds.length - 1].classList.add('grande'); // última célula
    }
  }

function criarSelectComValorAtual(opcoes = [], valorOriginal = '') {
    const select = document.createElement('select');
    const valor = valorOriginal.trim();
    const valorLower = valor.toLowerCase();

    // Verifica se o valor já está entre as opções (ignorando maiúsculas/minúsculas e espaços)
    const existe = opcoes.some(op => op.trim().toLowerCase() === valorLower);

    // Se não existir, adiciona o valor original como uma opção temporária
    if (!existe && valor !== '') {
      opcoes = [valor, ...opcoes];
    }

    opcoes.forEach(opcao => {
      const opt = document.createElement('option');
      opt.value = opcao;
      opt.textContent = opcao;

      if (opcao.trim().toLowerCase() === valorLower) {
        opt.selected = true;
      }

      select.appendChild(opt);
    });

    select.defaultValue = valor;

    return select;
  }

  function aplicarMascaraData(input) {

    input.addEventListener('input', () => {

      // Remove tudo exceto números
      let valor = input.value.replace(/\D/g, '');

      // Limita a 8 dígitos
      if (valor.length > 8) valor = valor.slice(0, 8);

      // Monta a máscara
      if (valor.length > 4) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4);
      } 
      else if (valor.length > 2) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2);
      }

      input.value = valor;

      // Se já tem data completa (10 chars), validar
      if (valor.length === 10) {
        if (!dataValida(valor)) {
          input.style.borderColor = "red";
        } else {
          input.style.borderColor = "";
        }
      } else {
        input.style.borderColor = "";
      }
    });
  }

  function tornarEditavel(trs, idx) {
    if (!window.opcoesPrivilegios || Object.keys(window.opcoesPrivilegios).length === 0) {
      mostrarAlertaGlobal('⚠️ As opções ainda estão sendo carregadas. Tente novamente em alguns segundos.');
      return;
    }

    const [trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet] = trs;

    // 🔷 Linha trInfo
    const tds0 = trInfo.querySelectorAll('td');
    tds0.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      if (index === 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorOriginal;
        input.defaultValue = valorOriginal;
        td.appendChild(input);
      } else if (index === 1) {
        const select = criarSelectComValorAtual(window.opcoesCongregacoes || [], valorOriginal);
        td.appendChild(select);
      }
    });

    // 🔷 Linha trInfo1
    const tds1 = trInfo1.querySelectorAll('td');
    tds1.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      if (index === 0) {
        const input = document.createElement('input');
        input.type = 'email';
        input.placeholder = 'exemplo@email.com';
        input.title = 'Digite um e-mail válido.';
        input.value = valorOriginal;
        input.defaultValue = valorOriginal;

        td.appendChild(input);
      } 
    });

    // 🔷 Linha trInfo2
    const tds = trInfo2.querySelectorAll('td');
    tds.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      if (index === 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorOriginal;
        input.defaultValue = valorOriginal;

        // ✅ Validação para telefone (1º campo)
        if (index === 0) {
          input.placeholder = '(11) 99217-3945';
          
          input.addEventListener('input', () => {
            let numeros = input.value.replace(/\D/g, '');

            if (numeros.length > 11) numeros = numeros.slice(0, 11);

            let formatado = '';

            if (numeros.length >= 2) {
              formatado = `(${numeros.slice(0, 2)}) `;

              if (numeros.length >= 7) {
                formatado += `${numeros.slice(2, 7)}-${numeros.slice(7)}`;
              } else if (numeros.length > 2) {
                formatado += numeros.slice(2);
              }
            } else {
              formatado = numeros;
            }

            input.value = formatado;
          });

        }

        td.appendChild(input);
      } else if (index === 1) {
        const select = criarSelectComValorAtual(window.opcoesPrivilegios.confirmacao || [], valorOriginal);
        td.appendChild(select);
      }
    });

    // 🔷 Linha trInfo3 (Datas / Idade / Anos batismo)
    const tds3 = trInfo3.querySelectorAll('td');
    tds3.forEach((td, index) => {
      const valorOriginal = td.textContent.trim();
      td.textContent = '';

      // --- 0: Data de nascimento ---
      if (index === 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorOriginal;
        input.placeholder = 'dd/mm/aaaa';

        aplicarMascaraData(input);

        input.addEventListener('input', () => {
          const idade = calcularIdade(input.value);
          tds3[1].textContent = idade ? idade + ' anos' : '';
        });

        td.appendChild(input);
      }

      // --- 1: Idade (auto calculado) ---
      if (index === 1) {
        td.textContent = calcularIdade(valorOriginal) + ' anos';
      }

      // --- 2: Data de batismo ---
      if (index === 2) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorOriginal;
        input.placeholder = 'dd/mm/aaaa';

        aplicarMascaraData(input);

        input.addEventListener('input', () => {
          const anosBat = calcularAnosBatismo(input.value);
          tds3[3].textContent = anosBat ? anosBat + ' anos' : '';
        });

        td.appendChild(input);
      }

      // --- 3: Anos batismo (auto calculado) ---
      if (index === 3) {
        td.textContent = calcularAnosBatismo(valorOriginal) + ' anos';
      }
    });

    // 🔷 Linha trClas (3 colunas: confirmacao, sexo, situacao)
    const tdsClas = trClas.querySelectorAll('td');
    tdsClas.forEach((td, index) => {
      const valorAtual = td.textContent.trim();
      td.textContent = '';

      const opcoes = (index === 0)
        ? (window.opcoesPrivilegios.confirmacao || [])
        : (index === 1)
          ? (window.opcoesPrivilegios.sexo || [])
          : (index === 2)
            ? (window.opcoesPrivilegios.situacao || [])
            : [];

      const select = criarSelectComValorAtual(opcoes, valorAtual);
      td.appendChild(select);
    });

    // 🔷 Linha trDet (campo situação extra)
    const situacaoTd = trDet.querySelector('td');
    const valorSituacao = situacaoTd.textContent.trim();
    const selectSituacao = criarSelectComValorAtual(window.opcoesPrivilegios.confirmacao || [], valorSituacao);
    situacaoTd.textContent = '';
    situacaoTd.appendChild(selectSituacao);

    // 🔷 Substituição de spans com ids específicos por selects
    const mapaIdsParaChaves = {
      campoPrivOrganizacao: 'organizacao',
      campoPrivAAC: 'aac',
      campoPrivEscalas: 'escalas',
      campoPrivEquipes: 'equipes',
      campoPrivTreinador: 'treinador'
    };

    Object.keys(mapaIdsParaChaves).forEach(id => {
      const span = document.getElementById(id);
      if (span && span.tagName.toLowerCase() === 'span') {
        const chave = mapaIdsParaChaves[id];
        const opcoes = window.opcoesPrivilegios[chave] || [];
        const valorAtual = span.textContent.trim();

        const select = criarSelectComValorAtual(opcoes, valorAtual);
        select.id = id;

        span.replaceWith(select);
      }
    });

    // 🔷 Botões
    const [btnE, btnS, btnC] = trDet.querySelectorAll('button');
    btnE.style.display = 'none';
    btnS.style.display = 'inline-block';
    btnC.style.display = 'inline-block';
  }

  function cancelarEdicao(trs, idx) {
    const [trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet] = trs;
    const infoTds = trInfo.querySelectorAll('td'),
          info1Tds = trInfo1.querySelectorAll('td'),
          info2Tds = trInfo2.querySelectorAll('td'),
          info3Tds = trInfo3.querySelectorAll('td'),
          clasTds = trClas.querySelectorAll('td'),
          detTds = trDet.querySelectorAll('td');

    // 🔁 trInfo (apenas inputs)
    infoTds.forEach(td => {
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 trInfo1 (apenas inputs)
    info1Tds.forEach(td => {
      const input = td.querySelector('input');
      //const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      //else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 trInfo2 (mistura de input e select)
    info2Tds.forEach(td => {
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 trInfo3 (apenas inputs)
    info3Tds.forEach(td => {
      const input = td.querySelector('input');

      // se tem input → volta ao valor original do input
      if (input) {
        td.textContent = input.defaultValue || '';
        return;
      }

      // se NÃO tem input → apenas mantém o texto que já estava salvo no td
      td.textContent = td.textContent;
    });

    // 🔁 trClas (dois selects)
    clasTds.forEach(td => {
      const select = td.querySelector('select');
      if (select) td.textContent = select.defaultValue || '';
    });

    /*// 🔁 trDet (input de situação)
    const input = detTds[0].querySelector('input');
    if (input) detTds[0].textContent = input.defaultValue || '';*/

    detTds.forEach(td => {
    if (td.querySelector('button')) return; // pula o <td> com botões
      const input = td.querySelector('input');
      const select = td.querySelector('select');
      if (input) td.textContent = input.defaultValue || '';
      else if (select) td.textContent = select.defaultValue || '';
    });

    // 🔁 Campos de privilégios (organizacao, aac, etc.) convertidos de <select> de volta para <span>
    const campos = [
      'campoPrivOrganizacao',
      'campoPrivAAC',
      'campoPrivEscalas',
      'campoPrivEquipes',
      'campoPrivTreinador'
    ];

    campos.forEach(id => {
      const el = document.getElementById(id);

      if (el && el.tagName.toLowerCase() === 'select') {
        const span = document.createElement('span');
        span.id = el.id;
        span.textContent = el.defaultValue || '';
        el.replaceWith(span);
      }
    });

    // 🔁 Botões: volta ao estado original (Editar visível, Salvar e Cancelar ocultos)
    const [btnE, btnS, btnC] = trDet.querySelectorAll('button');
    btnE.style.display = 'inline-block';
    btnS.style.display = 'none';
    btnC.style.display = 'none';

    pesquisarParticipante();
  }

  function cancelarEdicao2() {
    pesquisarParticipante();
  }

function salvarAlteracoes(trs, idx) {

  const [trInfo, trInfo1, trInfo2, trInfo3, trClas, trDet] = trs;

  const getTdValue = (td) => {
    const input = td.querySelector('input');
    const select = td.querySelector('select');
    return input ? input.value :
           select ? select.value :
           td.textContent.trim();
  };

  const infoTds = trInfo.querySelectorAll('td'),
        info1Tds = trInfo1.querySelectorAll('td'),
        info2Tds = trInfo2.querySelectorAll('td'),
        info3Tds = trInfo3.querySelectorAll('td'),
        clasTds = trClas.querySelectorAll('td'),
        detTds = trDet.querySelectorAll('td');

  const nd = [];
  const priv = [];

  // =========================
  // INFO PRINCIPAL
  // =========================
  infoTds.forEach(td => {
    const valor = getTdValue(td);
    nd.push(valor);
    td.textContent = valor;
  });

  // =========================
  // EMAIL
  // =========================
  let emailValido = true;

  info1Tds.forEach(td => {
    const input = td.querySelector('input');
    const valor = input ? input.value : td.textContent.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(valor)) {
      mostrarAlertaGlobal('⚠️ E-mail inválido.');

      if (input) {
        input.classList.add('erro-campo');
        input.focus();
      }

      emailValido = false;
      return;
    }

    nd.push(valor);
    td.textContent = valor;
  });

  if (!emailValido) return;

  // =========================
  // TELEFONE
  // =========================
  let telefoneValido = true;

  info2Tds.forEach(td => {
    const input = td.querySelector('input');
    const valor = getTdValue(td);

    if (input) {
      const telefoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;

      if (!telefoneRegex.test(valor)) {
        mostrarAlertaGlobal('⚠️ Telefone inválido.');

        input.classList.add('erro-campo');
        input.focus();

        telefoneValido = false;
        return;
      }
    }

    nd.push(valor);
    td.textContent = valor;
  });

  if (!telefoneValido) return;

  // =========================
  // DATAS
  // =========================
  const [tdNasc, tdIdade, tdBat, tdAnosBat] = info3Tds;

  const dataNasc = getTdValue(tdNasc);

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNasc)) {
    mostrarAlertaGlobal("⚠️ Data de nascimento inválida.");
    return;
  }

  const idadeCalc = calcularIdade(dataNasc);

  tdNasc.textContent = dataNasc;
  tdIdade.textContent = idadeCalc + " anos";

  nd.push(dataNasc, String(idadeCalc));

  const dataBat = getTdValue(tdBat);

  if (dataBat && !/^\d{2}\/\d{2}\/\d{4}$/.test(dataBat)) {
    mostrarAlertaGlobal("⚠️ Data de batismo inválida.");
    return;
  }

  const anosBatCalc = dataBat ? calcularAnosBatismo(dataBat) : "";

  tdBat.textContent = dataBat;
  tdAnosBat.textContent = anosBatCalc ? anosBatCalc + " anos" : "";

  nd.push(dataBat, String(anosBatCalc));

  // =========================
  // CLASSIFICAÇÃO
  // =========================
  clasTds.forEach(td => {
    const valor = getTdValue(td);
    nd.push(valor);
    td.textContent = valor;
  });

  // =========================
  // SITUAÇÃO
  // =========================
  const situacaoTd = detTds[0];
  const situacao = getTdValue(situacaoTd);

  nd.push(situacao);
  situacaoTd.textContent = situacao;

  // =========================
  // PRIVILÉGIOS
  // =========================
  const campos = [
    'campoPrivOrganizacao',
    'campoPrivAAC',
    'campoPrivEscalas',
    'campoPrivEquipes',
    'campoPrivTreinador'
  ];

  campos.forEach(id => {

    const el = document.getElementById(id);

    if (!el) {
      priv.push("");
      return;
    }

    let valor = "";

    if (el.tagName.toLowerCase() === "select") {
      valor = el.value;

      const span = document.createElement("span");
      span.id = el.id;
      span.textContent = valor;
      el.replaceWith(span);

    } else {
      valor = el.textContent.trim();
    }

    priv.push(valor);
  });

  // =========================
  // API JSONP
  // =========================
  const idOrig = trDet.dataset.identificadorOriginal;

  mostrarSpinner();

  apiJSONP(
    "atualizarParticipanteAdmin",
    {
      primeiros9: JSON.stringify(nd),
      privilegios: JSON.stringify(priv),
      identificadorOriginal: idOrig
    },
    () => {

      esconderSpinner();
      mostrarAlertaGlobal("✅ Alterado com sucesso");
      carregarOpcoes();

      document.querySelectorAll(".erro-campo")
        .forEach(e => e.classList.remove("erro-campo"));
    },
    (erro) => {

      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao salvar: " + (erro?.mensagem || "erro"));
    }
  );

  // =========================
  // BOTÕES
  // =========================
  const [btnE, btnS, btnC] = trDet.querySelectorAll('button');

  btnE.style.display = "inline-block";
  btnS.style.display = "none";
  btnC.style.display = "none";
}

function editarPrivilegios() {
    const campos = [
      { id: 'campoPrivOrganizacao', chave: 'organizacao' },
      { id: 'campoPrivAAC', chave: 'aac' },
      { id: 'campoPrivEscalas', chave: 'escalas' },
      { id: 'campoPrivEquipes', chave: 'equipes' },
      { id: 'campoPrivTreinador', chave: 'treinador' }
    ];

    campos.forEach(({ id, chave }) => {
      const span = document.getElementById(id);
      if (!span) {
        console.warn(`Elemento com ID ${id} não encontrado`);
        return;
      }

      const valorAtual = span.textContent.trim();
      const select = document.createElement('select');
      select.id = id;

      const optVazio = document.createElement('option');
      optVazio.value = '';
      optVazio.textContent = '- Selecione -';
      select.appendChild(optVazio);

      const opcoes = (window.opcoesPrivilegios?.[chave] || []);
      opcoes.forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao;
        if (opcao === valorAtual) option.selected = true;
        select.appendChild(option);
      });

      span.replaceWith(select);
    });
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

  // limpa erros
  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
  });

  // valida campos vazios
  const camposVazios = Object.entries(dados)
    .filter(([_, valor]) => !valor)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Atenção! Preencha todos os campos!");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  // valida telefone
  const telefoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;
  if (!telefoneRegex.test(dados.telefone)) {
    mostrarAlertaGlobal("⚠️ Telefone inválido. Use o formato: (11) 99217-3945");
    campos.telefone.classList.add("erro-campo");
    campos.telefone.focus();
    return;
  }

  // valida email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dados.email)) {
    mostrarAlertaGlobal("⚠️ E-mail inválido.");
    campos.email.classList.add("erro-campo");
    campos.email.focus();
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "salvarCadastroParticipante",
    { dados: JSON.stringify(dados) },

    function (resposta) {

      esconderSpinner();

      mostrarAlertaGlobal("✅ Participante cadastrado com sucesso!");

      document.getElementById("formParticipante").reset();
      carregarOpcoes();

      Object.values(campos).forEach(el =>
        el.classList.remove("erro-campo")
      );
    },

    function (erro) {

      esconderSpinner();

      mostrarAlertaGlobal(
        erro?.mensagem || "❌ Erro ao cadastrar participante."
      );

      console.error("Erro API:", erro);
    }
  );
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

/*function abrirNovoPonto() {

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
}*/
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

  apiJSONP(
    "criarTabelaManual",
    {
      prefixo,
      numero
    },
    (res) => {

      esconderSpinner();

      prefixoInput.classList.remove('erro-campo');
      numeroInput.classList.remove('erro-campo');

      mostrarAlertaGlobal(
        "✅ " + (res.mensagem || "Ponto criado com sucesso.")
      );

    },
    (err) => {

      esconderSpinner();

      prefixoInput.classList.remove('erro-campo');
      numeroInput.classList.remove('erro-campo');

      mostrarAlertaGlobal(
        "❌ " + (err.mensagem || err.error || "Erro desconhecido.")
      );

    }
  );
}

let participantesEncontrados = [];

function buscarParticipantes() {

  const campos = {
    dia: document.getElementById('diasSelect'),
    turno: document.getElementById('turnosSelect'),
    frequencia: document.getElementById('frequenciasSelect')
  };

  const msg = document.getElementById("msgPesqDisponiveis");

  // Remove marcações de erro anteriores
  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
  });

  // Verifica se há campos vazios
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

  apiJSONP(
    "buscarParticipantesPorFiltroAvancado",
    {
      dados: JSON.stringify({
        diasTurnos,
        frequencias
      })
    },
    (participantes) => {

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      participantesEncontrados = participantes;

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

      [
        'Nome Completo',
        'Condição',
        'Frequência',
        'Dias e Turnos Disponíveis'
      ].forEach(text => {
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
            (linhas.length > 1
              ? '<br>' + linhas.slice(1).join('<br>')
              : '');
        } else {
          tdNome.textContent = nome;
        }

        tdNome.dataset.id = p.id || "";

        tdNome.classList.add('clicavel-nome');
        tdNome.style.cursor = 'pointer';
        tdNome.style.color = 'green';
        tdNome.title = 'Clique para interagir';

        tr.insertCell().textContent = p.condicao || '';
        tr.insertCell().textContent = p.frequencia || '';
        tr.insertCell().textContent = (p.diasTurnos || []).join(', ');

      });

      resultadoDiv.appendChild(tabela);

      document.getElementById('dadosUsuarioContainer').style.display = 'inline-block';
      document.getElementById('enviarEmailTodosBtn').style.display = 'inline-block';

    },
    (erro) => {

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro na busca: " +
        (erro?.mensagem || erro?.error || "Erro desconhecido")
      );

      resultadoDiv.textContent = '';

    }
  );
}

// clique em participante
document.addEventListener('click', function (event) {

  const alvo = event.target.closest('.clicavel-nome');
  if (!alvo) return;

  mostrarSpinner();

  const nome = alvo.innerText.trim();
  const id = alvo.dataset.id;

  const campos = {
    dia: document.getElementById('diasSelect'),
    turno: document.getElementById('turnosSelect'),
    frequencia: document.getElementById('frequenciasSelect'),
    ponto: document.getElementById('pontosParaOferecerSelect'),
    equipamento: document.getElementById('equipamentosParaOferecerSelect'),
    necessidade: document.getElementById('necessidade')
  };

  // remove erros + listeners
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
    camposVazios.forEach(c => campos[c].classList.add('erro-campo'));
    return;
  }

  const mensagem =
    "*DESIGNAÇÃO NO TPE*\n\n" +
    "Olá querido(a) irmão(ã). Temos uma designação para você no TPE que está de acordo com sua disponibilidade atual.\n\n" +
    "Informações da designação:\n\n" +
    `🛠️ *Necessidade* ${campos.necessidade.value}\n` +
    `📍 *${campos.ponto.value}*\n` +
    `📆 *Dia:* ${campos.dia.value}\n` +
    `🕒 *Turno:* ${campos.turno.value}\n` +
    `📈 *Frequência:* ${campos.frequencia.value}\n` +
    `📚 *Mostruário:* ${campos.equipamento.value}\n\n` +
    "Aguardamos sua confirmação para esta designação. Se puder aceitar, ficaremos muito gratos e felizes.";

  const mensagemCodificada = encodeURIComponent(mensagem);

  alvo.classList.remove('clicavel-nome');

              console.log("🧩 nome:", nome);
              console.log("🧩 mensagemCodificada:", mensagemCodificada);
              console.log("🧩 mensagem:", mensagem);

  apiJSONP(
    "buscarNumeroWhatsAppPorIdComMensagemDesignar",
    {
      //nome,
      id,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      window.open(url, '_blank');

      alvo.style.color = 'gray';
      alvo.style.fontStyle = 'italic';
      alvo.innerHTML += ' <span title="Mensagem enviada">📤</span>';

    },
    (err) => {

      esconderSpinner();

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      mostrarAlertaGlobal("❌ Erro: " + (err?.mensagem || err?.error || "Erro desconhecido"));

      alvo.classList.add('clicavel-nome');
    }
  );
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
    camposVazios.forEach(c => campos[c].classList.add('erro-campo'));
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

      apiJSONP(
        "buscarEmailsPorNomesEEnviarMensagem",
        {
          dados: JSON.stringify({
            nomes,
            nomeUsuarioAtual,
            assunto,
            mensagem,
            necessidade
          })
        },
        () => {

          esconderSpinner();

          Object.values(campos)
            .forEach(el => el.classList.remove('erro-campo'));

          document.getElementById('dadosUsuarioContainer').style.display = 'none';
          document.getElementById('enviarEmailTodosBtn').style.display = 'none';

          mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");

        },
        (err) => {

          esconderSpinner();

          Object.values(campos)
            .forEach(el => el.classList.remove('erro-campo'));

          mostrarAlertaGlobal(
            "❌ Erro ao enviar e-mails: " +
            (err?.mensagem || err?.error || "Erro desconhecido")
          );

        }
      );

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

  apiJSONP(
    "pegarContatoUsuario",
    { nome },
    (contato) => {

      esconderSpinner();

      if (!contato) {
        console.warn("⚠️ Nenhum contato retornado.");
        return;
      }

      const telefoneInput = document.getElementById('telefoneInputUsuario');
      const emailInput = document.getElementById('emailInputUsuario');
      const nomeSelect = document.getElementById('nomeSelectUsuario');

      telefoneInput.value = contato.telefone || '';
      emailInput.value = contato.email || '';

      telefoneInput.disabled = true;
      emailInput.disabled = true;
      nomeSelect.disabled = true;

      const container = document.querySelector('#dadosUsuarioContainer > div[style*="display: none"]');

      if (container) {
        container.style.display = 'block';
      }

    },
    (erro) => {

      esconderSpinner();

      console.error(
        "❌ Erro ao buscar contato do usuário:",
        erro?.mensagem || erro?.error || erro?.message || erro
      );
    }
  );
}

let participantesEncontrados2h = [];

function buscarParticipantes2h() {

  const campos = {
    dia: document.getElementById('diasSelect2h'),
    turno: document.getElementById('turnosSelect2h'),
    frequencia: document.getElementById('frequenciasSelect2h')
  };

  const msg = document.getElementById("msgPesqDisponiveis2h");

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

  const diasTurnos = [`${campos.dia.value} - ${campos.turno.value}`];
  const frequencias = [campos.frequencia.value];

  const resultadoDiv = document.getElementById('resultadoBusca2h');
  resultadoDiv.textContent = '';

  mostrarSpinner();

  apiJSONP(
    "buscarParticipantesPorFiltroAvancado2h",
    {
      dados: JSON.stringify({
        diasTurnos,
        frequencias
      })
    },
    (participantes) => {

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

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
          tdNome.innerHTML =
            `<strong>${linhas[0]}</strong>` +
            (linhas.length > 1
              ? '<br>' + linhas.slice(1).join('<br>')
              : '');
        } else {
          tdNome.textContent = nome;
        }

        tdNome.dataset.id = p.id || "";

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

    },
    (err) => {

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro na busca: " +
        (err?.mensagem || err?.error || "Erro desconhecido")
      );

      resultadoDiv.textContent = '';
    }
  );
}

document.addEventListener('click', function (event) {

  const alvo = event.target.closest('.clicavel-nome2h');
  if (!alvo) return;

  mostrarSpinner();

  const nome = alvo.innerText.trim();

  const id = alvo.dataset.id;

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
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
  });

  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    esconderSpinner();
    mostrarAlertaGlobal("⚠️ Por favor, preencha todos os campos antes de enviar a mensagem.");
    camposVazios.forEach(c => campos[c].classList.add('erro-campo'));
    return;
  }

  const mensagem =
    "*DESIGNAÇÃO NO TPE*\n\n" +
    "Olá querido(a) irmão(ã). Temos uma designação para você no TPE que está de acordo com sua disponibilidade atual.\n\n" +
    "Informações da designação:\n\n" +
    `🛠️ *Necessidade* ${campos.necessidade.value}\n` +
    `📍 *${campos.ponto.value}*\n` +
    `📆 *Dia:* ${campos.dia.value}\n` +
    `🕒 *Turno:* ${campos.turno.value}\n` +
    `📈 *Frequência:* ${campos.frequencia.value}\n` +
    `📚 *Mostruário:* ${campos.equipamento.value}\n\n` +
    "Aguardamos sua confirmação para esta designação. Se puder aceitar, ficaremos muito gratos e felizes.";

  const mensagemCodificada = encodeURIComponent(mensagem);

  alvo.classList.remove('clicavel-nome2h');

  apiJSONP(
    "buscarNumeroWhatsAppPorIdComMensagemDesignar",
    {
      //nome,
      id,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      window.open(url, '_blank');

      alvo.style.color = 'gray';
      alvo.style.fontStyle = 'italic';
      alvo.innerHTML += ' <span title="Mensagem enviada">📤</span>';

    },
    (err) => {

      esconderSpinner();

      Object.values(campos).forEach(el =>
        el.classList.remove('erro-campo')
      );

      mostrarAlertaGlobal(
        "❌ Erro: " +
        (err?.mensagem || err?.error || err?.message || "Erro desconhecido")
      );

      alvo.classList.add('clicavel-nome2h');
    }
  );
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
    `📧 Deseja enviar e-mail para aqueles dentre os <strong>${participantesEncontrados2h.length}</strong> disponíveis encontrados cujo sexo combine com a necessidade?`,
    () => {

      mostrarSpinner();

      const nomes = participantesEncontrados2h.map(p => p.nomeCompleto);

      apiJSONP(
        "buscarEmailsPorNomesEEnviarMensagem",
        {
          nomes: JSON.stringify(nomes),
          nomeUsuarioAtual,
          assunto,
          mensagem,
          necessidade
        },
        () => {

          esconderSpinner();

          Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

          document.getElementById('dadosUsuarioContainer2h').style.display = 'none';
          document.getElementById('enviarEmailTodosBtn2h').style.display = 'none';

          mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");

        },
        (err) => {

          esconderSpinner();

          Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

          mostrarAlertaGlobal("❌ Erro ao enviar e-mails: " + (err?.mensagem || err?.message || err));

        }
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
    turno: document.getElementById('turnosSelectSub')
  };

  const msg = document.getElementById("msgPesqDisponiveisSub");
  const data = document.getElementById('dataSelectSub').value;
  const resultadoDiv = document.getElementById('resultadoBuscaSub');

  // remove erros antigos
  Object.values(campos).forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
    el.addEventListener('change', () => el.classList.remove('erro-campo'), { once: true });
  });

  // valida campos
  const camposVazios = Object.entries(campos)
    .filter(([_, el]) => !el.value)
    .map(([chave]) => chave);

  if (camposVazios.length > 0) {
    mostrarAlertaGlobal("⚠️ Por favor, selecione dia e turno.");
    camposVazios.forEach(campo => campos[campo].classList.add('erro-campo'));
    return;
  }

  const dia = campos.dia.value;
  const turno = campos.turno.value;

  const diasTurnos = [`${dia} - ${turno}`];
  const datas = [data];

  resultadoDiv.textContent = '';
  mostrarSpinner();

  apiJSONP(
    "buscarParticipantesPorFiltroAvancadoSub",
    {
      diasTurnos: JSON.stringify(diasTurnos),
      datas: JSON.stringify(datas)
    },
    (participantes) => {

      esconderSpinner();

      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

      substitutosEncontrados = participantes;

      if (!participantes || participantes.length === 0) {
        mostrarAlertaGlobal("❌ Nenhum participante encontrado.");
        resultadoDiv.textContent = '';
        return;
      }

      msg.textContent = `✅ ${participantes.length} substituto(s) encontrado(s).`;

      const tabela = document.createElement('table');
      tabela.classList.add('tabela-listagem');

      const thead = tabela.createTHead();
      const trHead = thead.insertRow();

      ['Nome Completo', 'Condição', 'Dias e Turnos Disponíveis']
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

    },
    (err) => {

      esconderSpinner();
      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

      mostrarAlertaGlobal("❌ Erro na busca: " + (err?.mensagem || err?.message || err));
      resultadoDiv.textContent = '';
    }
  );
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

  apiJSONP(
    "buscarNumeroWhatsAppPorNomeComMensagemSub",
    {
      nome,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

      window.open(url, '_blank');

      alvo.style.color = 'gray';
      alvo.style.fontStyle = 'italic';
      alvo.innerHTML += ' <span title="Mensagem enviada">📤</span>';

    },
    (error) => {

      esconderSpinner();

      Object.values(campos).forEach(el => el.classList.remove('erro-campo'));

      mostrarAlertaGlobal("❌ Erro: " + (error?.mensagem || error?.message || error));

      alvo.classList.add('clicavel-nomeSub');
    }
  );

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
  const telefone = campos.telefone.value.trim();
  const email = campos.email.value.trim();

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

      apiJSONP(
        "buscarEmailsPorNomesEEnviarMensagemSub",
        {
          nomes: JSON.stringify(nomes),
          nomeUsuarioAtual,
          assunto,
          mensagem,
          necessidade
        },
        () => {

          esconderSpinner();

          Object.values(campos)
            .forEach(el => el.classList.remove('erro-campo'));

          document.getElementById('dadosUsuarioContainerSb').style.display = 'none';
          document.getElementById('enviarEmailSbTodosBtn').style.display = 'none';

          mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");
        },
        (err) => {

          esconderSpinner();

          Object.values(campos)
            .forEach(el => el.classList.remove('erro-campo'));

          mostrarAlertaGlobal(`❌ Erro ao enviar e-mails: ${err?.mensagem || err.message || "erro"}`);
        }
      );

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

  apiJSONP(
    "pegarContatoUsuarioSub",
    { nome },
    (contato) => {

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
        if (container) {
          container.style.display = 'block';
        }

      } else {
        console.warn("⚠️ Nenhum contato retornado.");
      }
    },
    (erro) => {

      esconderSpinner();
      console.error("❌ Erro ao buscar contato do usuário:", erro?.mensagem || erro?.message || erro);
    }
  );
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

                  const modais = document.querySelectorAll('[id^="modal"]');

                  const abertos = [];

                  modais.forEach(modal => {
                    const estilo = window.getComputedStyle(modal);

                    if (estilo.display !== "none" && estilo.visibility !== "hidden") {
                      abertos.push(modal.id);
                    }
                  });

                  if (abertos.length > 0) {
                    console.log("🚨 Modais abertos na inicialização:", abertos);
                  } else {
                    console.log("✅ Nenhum modal aberto na inicialização.");
                  }



  });

  document.getElementById("btnAddTurno").addEventListener("click", () => {
    adicionarTurno();
  });

  // LISTAR EVENTOS
  document.getElementById('btnListarEventos').addEventListener('click', () => {

  mostrarSpinner();

  const dataHistorico =
    document.getElementById('dataHistoricoDeEventos').value;

  apiJSONP(
    "listarEventosAdm",
    { dataHistorico },
    (eventos) => {

      const lista = document.getElementById("listaEventos");
      lista.innerHTML = "";

      eventos.forEach(ev => {

        const partes = ev.data.split("/");
        const dataCurta =
          `${partes[0]}/${partes[1]}/${partes[2].slice(-2)}`;

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

        card.querySelector(".copiarBtn").onclick =
          () => copiarMensagemEvento(ev.id);

        lista.appendChild(card);
      });

      const idsEventos = eventos.map(ev => ev.id);

      apiJSONP(
        "obterMetricasEventosAdm",
        { idsEventos: JSON.stringify(idsEventos) },
        (metricas) => {

          Object.keys(metricas).forEach(id => {

            const card = document.querySelector(
              `[data-evento-id="${id}"]`
            );

            if (!card) return;

            card.querySelector(".designacoes").textContent =
              metricas[id].designacoesRealizadas;

            card.querySelector(".vagas").textContent =
              metricas[id].vagasEmAberto;

            card.querySelector(".carrinhos").textContent =
              metricas[id].carrinhosUnicos;

            card.querySelector(".pessoas").textContent =
              metricas[id].pessoasUnicas;

          });

          esconderSpinner();
        },
        (err) => {
          esconderSpinner();
          mostrarAlertaGlobal("❌ Erro ao carregar métricas: " + (err?.mensagem || err.message));
        }
      );

    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao listar eventos: " + (err?.mensagem || err.message));
    }
  );
});

function copiarMensagemEvento(eventoId) {

  mostrarSpinner();

  apiJSONP(
    "gerarMensagemVagasAdm",
    { eventoId },
    async (mensagem) => {

      esconderSpinner();

      try {

        await navigator.clipboard.writeText(mensagem);

        mostrarAlertaGlobal(
          "✅ Mensagem copiada para a área de transferência."
        );

      } catch (erro) {

        mostrarAlertaGlobal(
          "❌ Não foi possível copiar a mensagem."
        );
      }
    },
    (erro) => {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ " + (erro?.mensagem || erro?.message || erro)
      );
    }
  );
}

  document.getElementById('btnCadastrarEvento').addEventListener('click', () => {

  const descricaoEl = document.getElementById('descricaoEvento');
  const ruaEl = document.getElementById('ruaEv');
  const numeroEl = document.getElementById('numeroEv');
  const bairroEl = document.getElementById('bairroEv');
  const carr = document.getElementById('carrCadEv');
  const msg = document.getElementById('msgCadEv');

  const descricao = descricaoEl.value.trim();
  const rua = ruaEl.value.trim();
  const numero = numeroEl.value.trim();
  const bairro = bairroEl.value.trim();

  [descricaoEl, ruaEl].forEach(el => {
    el.classList.remove('erro-campo');
    el.addEventListener('input', () => el.classList.remove('erro-campo'), { once: true });
  });

  if (!descricao) {
    mostrarAlertaGlobal("⚠️ Atenção! Informe a descrição do evento.");
    descricaoEl.classList.add('erro-campo');
    descricaoEl.focus();
    esconderSpinner();
    return;
  }

  if (!rua) {
    mostrarAlertaGlobal("⚠️ Atenção! Informe o endereço do evento.");
    ruaEl.classList.add('erro-campo');
    ruaEl.focus();
    esconderSpinner();
    return;
  }

  const container = document.getElementById('containerTables');
  const tabelas = container.querySelectorAll('table');
  let turnos = [];

  for (const tabela of tabelas) {

    let dataInput = tabela.querySelector('input[type="date"]');

    if (!dataInput) {
      dataInput = tabela.closest('.tabela-turno')?.querySelector('input[type="date"]');
    }

    if (!dataInput) continue;

    dataInput.classList.remove('erro-campo');
    dataInput.addEventListener('input', () => dataInput.classList.remove('erro-campo'), { once: true });

    if (!dataInput.value) {
      mostrarAlertaGlobal("⚠️ Atenção! Informe a data do evento.");
      dataInput.classList.add('erro-campo');
      esconderSpinner();
      return;
    }

    const dataFormatada = formatarDataBR(dataInput.value);

    const linhas = tabela.querySelectorAll('tbody tr');

    linhas.forEach((linha, idxTurno) => {

      const inicio = linha.querySelector('input[name="inicio"]')?.value;
      const fim = linha.querySelector('input[name="fim"]')?.value;
      const vagas = linha.querySelector('input[name="vagas"]')?.value;

      if (inicio && fim && vagas !== "") {
        turnos.push({
          data: dataFormatada,
          numero: idxTurno + 1,
          inicio,
          fim,
          vagas
        });
      }
    });
  }

  if (turnos.length === 0) {
    mostrarAlertaGlobal("⚠️ Atenção! Informe pelo menos um turno com vagas.");
    esconderSpinner();
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "cadastrarEventoNaPlanilhaAdm",
    {
      descricao,
      turnos: JSON.stringify(turnos),
      rua,
      numero,
      bairro
    },
    () => {

      mostrarAlertaGlobal("✅ Evento cadastrado com sucesso!");
      esconderSpinner();

      carregarEventosNoSelect();
      carregarEventosNoSelectUsuario();

      [descricaoEl, ruaEl].forEach(el => el.classList.remove('erro-campo'));

      const inputsData = container.querySelectorAll('input[type="date"]');
      inputsData.forEach(el => el.classList.remove('erro-campo'));
    },
    (err) => {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ Erro ao cadastrar evento: " + (err?.mensagem || err.message || "erro")
      );

      [descricaoEl, ruaEl].forEach(el => el.classList.remove('erro-campo'));
    }
  );

});

 document.getElementById('btnAddTable').addEventListener('click', () => {
    const container = document.getElementById('containerTables');
    const tabelaOriginal = document.getElementById('tabela1');
    const novaTabela = tabelaOriginal.cloneNode(true);

    const numTabelas = container.querySelectorAll('table').length + 1;
    novaTabela.id = 'tabela' + numTabelas;

    function atualizaIds(element) {
      if (element.hasAttribute('id')) {
        const idAtual = element.getAttribute('id');
        const novoId = idAtual.replace(/\d+$/, '') + numTabelas;
        element.setAttribute('id', novoId);
      }
      if (element.hasAttribute('for')) {
        const forAtual = element.getAttribute('for');
        const novoFor = forAtual.replace(/\d+$/, '') + numTabelas;
        element.setAttribute('for', novoFor);
      }
      if (element.tagName === 'INPUT') {
        element.value = '';
      }
      element.childNodes.forEach(child => {
        if (child.nodeType === 1) atualizaIds(child);
      });
    }
    atualizaIds(novaTabela);

    const tbody = novaTabela.querySelector("tbody");
    tbody.innerHTML = "";
    const primeiraLinha = document.createElement("tr");
    primeiraLinha.innerHTML = `
      <td class="turno-label">Turno 1</td>
      <td><input type="time" name="inicio" required></td>
      <td><input type="time" name="fim" required></td>
      <td><input type="number" name="vagas" min="0" placeholder="0"></td>
      <td><button type="button" class="btnRemoverTurno">🗑️</button></td>
    `;
    tbody.appendChild(primeiraLinha);

    const tfoot = novaTabela.querySelector("tfoot");
    tfoot.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button type="button" class="btnAddTurno">➕ Adicionar Turno</button>
            <button type="button" class="btnRemoverTabela">🗑 Remover Tabela</button>
          </div>
        </td>
      </tr>
    `;

    container.appendChild(novaTabela);
  });

function gerarMensagemEvento() {
    const descricao = document.getElementById('descricaoEvento').value.trim();
    if (!descricao) {
      mostrarAlertaGlobal("⚠️ Por favor, informe a descrição do evento.");
      return null;
    }

    const rua = document.getElementById('ruaEv')?.value.trim();
    const numero = document.getElementById('numeroEv')?.value.trim();
    const bairro = document.getElementById('bairroEv')?.value.trim();

    const container = document.getElementById('containerTables');
    const tabelas = container.querySelectorAll('table');

    let mensagem = `Evento: ${descricao}\n`;

    if (rua) {
      mensagem += `Endereço: ${rua}`;
      if (numero) mensagem += `, ${numero}`;
      if (bairro) mensagem += ` - ${bairro}`;
      mensagem += `\n`; 
    }

    tabelas.forEach(tabela => {
      const dataInput = tabela.querySelector('input[type="date"]');
      if (!dataInput || !dataInput.value) return;

      const dataFormatada = formatarDataBR(dataInput.value);
      mensagem += `\nData: ${dataFormatada}\n`;

      const linhas = tabela.querySelectorAll('tbody tr');
      linhas.forEach((linha, idx) => {
        const inicio = linha.querySelector('input[name="inicio"]')?.value;
        const fim = linha.querySelector('input[name="fim"]')?.value;

        if (inicio && fim) {
          mensagem += `Turno ${idx + 1}: ${inicio} - ${fim}\n`;
        }
      });
    });

    return mensagem;
  }

function agruparTurnosPorData(turnos) {
    const agrupados = {};

    turnos.forEach(t => {
      if (!agrupados[t.data]) {
        agrupados[t.data] = [];
      }
      agrupados[t.data].push(t);
    });

    return agrupados;
  }

function criarNovaTabela() {

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-listagem');

    tabela.innerHTML = `
      <thead>
        <tr>
          <th colspan="5">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label style="color: white;">Data:</label>
              <input type="date" required>
            </div>
          </th>
        </tr>
        <tr>
          <th>Turno</th>
          <th>Início</th>
          <th>Fim</th>
          <th>Vagas</th>
          <th>Remover</th>
        </tr>
      </thead>
      <tbody></tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align: center;">
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button type="button" class="btnAddTurno">➕ Adicionar Turno</button>
              <button type="button" class="btnRemoverTabela">🗑 Remover Tabela</button>
            </div>
          </td>
        </tr>
      </tfoot>
    `;
    return tabela;
  }

 function popularTurnosNaTabela(tabela, data, turnos) {
    let inputData = tabela.querySelector('input[type="date"]');
    if (!inputData) {
      inputData = document.createElement('input');
      inputData.type = 'date';
      inputData.style.marginBottom = '10px';
      tabela.insertBefore(inputData, tabela.firstChild);
    }
    
    function converterParaISO(dataStr) {
      if (!dataStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;

      const partes = dataStr.split('/');
      if (partes.length === 3) {
        const [dd, mm, yyyy] = partes;
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
      return dataStr;
    }
    
    inputData.value = converterParaISO(data);

    const tbody = tabela.querySelector('tbody');
    tbody.innerHTML = '';

    turnos.forEach((turno, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="turno-label">Turno ${i + 1}</td>
        <td><input type="time" name="inicio" value="${turno.inicio}" required></td>
        <td><input type="time" name="fim" value="${turno.fim}" required></td>
        <td><input type="number" name="vagas" min="0" value="${turno.vagas}" placeholder="0"></td>
        <td><button type="button" class="btnRemoverTurno">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    });
    atualizarNumeracaoTurnosTabela(tabela);
  }

function atualizarNumeracaoTurnosTabela(tabela) {
    const linhas = tabela.querySelectorAll("tbody tr");
    linhas.forEach((linha, index) => {
      const label = linha.querySelector(".turno-label");
      if (label) {
        label.textContent = `Turno ${index + 1}`;
      }
    });
  }

function editarEvento(id) {

  mostrarSpinner();

  apiJSONP(
    "obterEventoPorIdAdm",
    { id },
    (evento) => {

      document.getElementById('descricaoEvento').value = evento.nome;
      document.getElementById('nomeOriginal').value = evento.nome;

      document.getElementById('ruaEv').value = evento.rua || '';
      document.getElementById('numeroEv').value = evento.numero || '';
      document.getElementById('bairroEv').value = evento.bairro || '';

      document.getElementById('ruaOriginal').value = evento.rua || '';
      document.getElementById('numeroOriginal').value = evento.numero || '';
      document.getElementById('bairroOriginal').value = evento.bairro || '';

      document.getElementById('dataOriginal').value = evento.turnos[0].data;

      document.getElementById('btnCadastrarEvento').style.display = 'none';
      document.getElementById('btnSalvarEdicaoEvento').style.display = 'inline-block';

      const agrupadosPorData = agruparTurnosPorData(evento.turnos);
      const container = document.getElementById('containerTables');

      container.querySelectorAll('.tabela-turnos:not(#tabela1)')
        .forEach(tabela => tabela.remove());

      const datas = Object.keys(agrupadosPorData);

      datas.forEach((data, index) => {
        let tabela;

        if (index === 0) {
          tabela = document.getElementById('tabela1');
          tabela.querySelector('tbody').innerHTML = '';
        } else {
          tabela = criarNovaTabela(index + 1);
          container.appendChild(tabela);
        }

        tabela.querySelector('input[type="date"]').value = data;

        const tbody = tabela.querySelector('tbody');

        agrupadosPorData[data].forEach((turno, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="turno-label">Turno ${idx + 1}</td>
            <td><input type="time" name="inicio" value="${turno.inicio}" required></td>
            <td><input type="time" name="fim" value="${turno.fim}" required></td>
            <td><input type="number" name="vagas" value="${turno.vagas}" min="0"></td>
            <td><button type="button" class="btnRemoverTurno">🗑️</button></td>
          `;
          tbody.appendChild(tr);
        });
      });

      esconderSpinner();
    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao carregar evento: " + (err?.mensagem || err.message));
    }
  );
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

  if (!descricao || !nomeOriginal || !dataOriginal) {
    mostrarAlertaGlobal("⚠️ Atenção! Dados incompletos para salvar edição.");
    return;
  }

  const turnos = extrairTurnosDoFormulario();
  if (turnos.length === 0) {
    mostrarAlertaGlobal("⚠️ Atenção! Informe pelo menos um turno com vagas.");
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "salvarEdicoesDeEventoNaPlanilhaAdm",
    {
      descricao,
      turnos: JSON.stringify(turnos),
      nomeOriginal,
      dataOriginal,
      ruaOriginal,
      numeroOriginal,
      bairroOriginal,
      rua,
      numero,
      bairro
    },
    () => {

      esconderSpinner();
      mostrarAlertaGlobal("✅ Evento alterado com sucesso!");

      carregarEventosNoSelect();
      carregarEventosNoSelectUsuario();

      document.getElementById('btnCadastrarEvento').style.display = 'inline-block';
      document.getElementById('btnSalvarEdicaoEvento').style.display = 'none';

      document.getElementById('nomeOriginal').value = '';
      document.getElementById('dataOriginal').value = '';
      document.getElementById('ruaOriginal').value = '';
      document.getElementById('numeroOriginal').value = '';
      document.getElementById('bairroOriginal').value = '';

    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao salvar alterações: " + (err?.mensagem || err.message));
    }
  );

});

function extrairTurnosDoFormulario() {
    const container = document.getElementById('containerTables');
    const tabelas = container.querySelectorAll('table');
    let turnos = [];

    tabelas.forEach((tabela, idxTabela) => {
      let dataInput = tabela.querySelector('input[type="date"]');
      if (!dataInput) {
        dataInput = tabela.closest('.tabela-turno')?.querySelector('input[type="date"]');
      }

      if (!dataInput || !dataInput.value) return;

      const dataFormatada = formatarDataBR(dataInput.value);

      const linhas = tabela.querySelectorAll('tbody tr');
      linhas.forEach((linha, idxTurno) => {
        const inicio = linha.querySelector('input[name="inicio"]')?.value;
        const fim = linha.querySelector('input[name="fim"]')?.value;
        const vagas = linha.querySelector('input[name="vagas"]')?.value;

        if (inicio && fim && vagas !== "") {
          turnos.push({
            data: dataFormatada,
            numero: idxTurno + 1,
            inicio,
            fim,
            vagas
          });
        }
      });
    });

    return turnos;
  }

function criarMensagemWhatsApp() {
    const descricao = document.getElementById('descricaoEvento').value.trim();
    if (!descricao) {
      mostrarAlertaGlobal("⚠️ Por favor, informe a descrição do evento.");
      return null;
    }

    const rua = document.getElementById('ruaEv')?.value.trim();
    const numero = document.getElementById('numeroEv')?.value.trim();
    const bairro = document.getElementById('bairroEv')?.value.trim();

    const container = document.getElementById('containerTables');
    const tabelas = container.querySelectorAll('table');
    if (tabelas.length === 0) {
      mostrarAlertaGlobal("❌ Nenhuma tabela de turnos encontrada.");
      return null;
    }

    let mensagem = `📢 Queridos(as) irmãos(ãs),

    Temos o prazer de informar que o TPE vai cobrir mais um evento na cidade.

    📌 *Evento:* ${descricao}
    `;

    if (rua) {
      mensagem += `📍 *Endereço:* ${rua}`;
      if (numero) mensagem += `, ${numero}`;
      if (bairro) mensagem += ` - ${bairro}`;
      mensagem += `\n`;
    }

    tabelas.forEach(tabela => {
      const dataInput = tabela.querySelector('input[type="date"]');
      if (!dataInput || !dataInput.value) return;

      const data = dataInput.value.split('-');
      const dataFormatada = data.length === 3 ? `${data[2]}/${data[1]}/${data[0]}` : dataInput.value;

      mensagem += `\n📅 *Data:* ${dataFormatada}\n`;

      const linhas = tabela.querySelectorAll('tbody tr');
      linhas.forEach((linha, idx) => {
        const inicio = linha.querySelector('input[name="inicio"]')?.value;
        const fim = linha.querySelector('input[name="fim"]')?.value;
        const vagas = linha.querySelector('input[name="vagas"]')?.value;

        if (inicio && fim) {
          mensagem += `🕒 Turno ${idx + 1}: ${inicio} às ${fim} — Vagas: ${vagas || '0'}\n`;
        }
      });
    });

    mensagem += `

    📝 Para se inscrever, acesse o aplicativo do TPE na descrição do grupo de WhatsApp. Clique na aba "Eventos"! Selecione o evento, o turno, e clique em "Fazer inscrição". Depois disso, é só esperar a confirmação da equipe de eventos.

    *Atenciosamente,*
    Equipe de Eventos do TPE SBC`;

    return mensagem;
  }

document.getElementById('btnGerarMensagemWhatsApp').addEventListener('click', () => {
  const mensagem = criarMensagemWhatsApp();
  if (!mensagem) return;

  const container = document.getElementById('mensagemWhatsAppContainer');
  const textarea = document.getElementById('mensagemWhatsApp');

  textarea.value = mensagem;
  container.style.display = 'block';
});

document.getElementById('btnCopiarMensagemWhatsApp').addEventListener('click', async () => {
  const textarea = document.getElementById('mensagemWhatsApp');
  const texto = textarea.value;

  try {
    await navigator.clipboard.writeText(texto);
    mostrarAlertaGlobal("✅ Mensagem copiada com sucesso! Agora cole no grupo do WhatsApp.");
  } catch (err) {
    console.error("Erro ao copiar:", err);
    mostrarAlertaGlobal("❌ Não foi possível copiar a mensagem. Tente manualmente.");
  }
});

function enviarEmailInformativo() {

  const descricaoInput = document.getElementById('descricaoEvento');
  if (!descricaoInput) {
    mostrarAlertaGlobal("❌ Campo de descrição do evento não encontrado.");
    return;
  }

  const descricao = descricaoInput.value.trim();
  if (!descricao) {
    mostrarAlertaGlobal("⚠️ Atenção! Informe a descrição do evento.");
    return;
  }

  mostrarSpinner();

  const assunto = `Evento do TPE - ${descricao}`;
  const mensagemBase = gerarMensagemEvento();
  if (!mensagemBase) {
    esconderSpinner();
    return;
  }

  apiJSONP(
    "enviarEmailInformativoEventoAdm",
    {
      assunto,
      mensagem: mensagemBase
    },
    (res) => {

      esconderSpinner();

      const emails = res?.emailsEnviados || [];
      mostrarAlertaGlobal(`✅ ${emails.length} email(s) enviados com sucesso.`);

    },
    (err) => {

      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao enviar emails: " + (err?.mensagem || err.message));

    }
  );

}

   // Carrega eventos no select de designados ao carregar a página
function carregarEventosDesignados() {

  apiJSONP(
    "listarEventos",
    {},
    (eventos) => {

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

    },
    (err) => {
      console.error("❌ Erro ao carregar eventos:", err);
      mostrarAlertaGlobal("❌ Erro ao carregar eventos.");
    }
  );

}

  // Função para popular turnos baseado no evento selecionado
function eventoMudouDesignados() {

  const selEv = document.getElementById("eventoSelectDesignados");
  const eventoId = selEv.value;

  const selTurno = document.getElementById("turnoSelectDesignados");
  selTurno.innerHTML = "<option value=''>- Selecione turno -</option>";
  selTurno.disabled = true;

  document.getElementById("grupoTurnoDesignados").style.display = "none";
  document.getElementById("resultadoDesignadosContainerEv").innerHTML = "";

  mostrarSpinner();

  if (!eventoId) {
    esconderSpinner();
    return;
  }

  apiJSONP(
    "listarTurnosDoEvento",
    { eventoId },
    (turnos) => {

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

    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao carregar turnos: " + (err?.mensagem || err.message));
    }
  );
}

function mostrarConfirmacaoRegistrar() {

  const mensagemEl = document.getElementById("mensagemRegistro");

  mostrarConfirmacaoGlobal(
    "⚠️ Atenção! Você está criando a Escala do Evento. Você poderá atualizá-la se precisar. Deseja continuar?",
    () => {

      if (mensagemEl) {
        mensagemEl.textContent = "";
      }

      mostrarSpinner();

      if (mensagemEl) {
        mensagemEl.style.color = "blue";
        mensagemEl.textContent = "🔁 Registrando...";
      }

      const eventoId = document.getElementById("eventoSelectDesignados").value;
      const turno = document.getElementById("turnoSelectDesignados").value;

      if (!eventoId) {
        esconderSpinner();

        if (mensagemEl) {
          mensagemEl.textContent = "";
        }

        mostrarAlertaGlobal("⚠️ Por favor, selecione um evento antes de registrar.");
        return;
      }

      apiJSONP(
        "registrarTodosDesignadosNoEvento",
        {
          eventoId,
          turno
        },
        () => {

          esconderSpinner();

          if (mensagemEl) {
            mensagemEl.textContent = "";
          }

          mostrarAlertaGlobal(
            "✅ Designações do evento registradas com sucesso. Para imprimir o PDF, use a aba Relatórios!"
          );

        },
        (err) => {

          esconderSpinner();

          if (mensagemEl) {
            mensagemEl.textContent = "";
          }

          mostrarAlertaGlobal(
            "❌ Erro ao registrar designados: " + (err?.mensagem || err.message)
          );

        }
      );

    }
  );

}

function mostrarConfirmacaoRegistrarInscritos() {

  const mensagemEl = document.getElementById("mensagemRegistroInscritos");

  mostrarConfirmacaoGlobal(
    "⚠️ Atenção! Você está criando a lista de inscritos do evento. Você poderá atualizá-la posteriormente. Deseja continuar?",
    () => {

      if (mensagemEl) {
        mensagemEl.textContent = "";
      }

      mostrarSpinner();

      const eventoId = document.getElementById("eventoSelectInscritos").value;

      if (!eventoId) {
        esconderSpinner();

        mostrarAlertaGlobal(
          "⚠️ Por favor, selecione um evento antes de registrar."
        );

        return;
      }

      apiJSONP(
        "registrarTodosInscritosNoEvento",
        { eventoId },
        () => {

          esconderSpinner();

          mostrarAlertaGlobal(
            "✅ Lista de inscritos registrada com sucesso. Consulte a nova aba criada na planilha."
          );

        },
        (err) => {

          esconderSpinner();

          mostrarAlertaGlobal(
            "❌ Erro ao registrar inscritos: " + (err?.mensagem || err.message)
          );

        }
      );

    }
  );

}
//*********************************************************** */
// Configurar listeners após o DOM carregar
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

    apiJSONP(
      "listarDesignadosDoEvento",
      { eventoId, turno },
      function(designados) {

        esconderSpinner();

        if (!designados || (Array.isArray(designados) && designados.length === 0)) {
          container.innerHTML = "<p>❌ Nenhum designado encontrado para esse turno.</p>";
        } else if (typeof designados === "string") {
          container.innerHTML = `<p style="color: gray;">${designados}</p>`;
        } else {

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

          designados.forEach(function(d, idx) {

            var telefoneLimpo = String(d.telefone || "").replace(/\D/g, "");
            var nome = d.nome || "participante";

            var selEv = document.getElementById("eventoSelectDesignados");
            var evento = selEv.options[selEv.selectedIndex].text;

            var selectTurno = document.getElementById("turnoSelectDesignados");
            var turnoTxt = selectTurno.options[selectTurno.selectedIndex]?.textContent || "Turno";

            var mensagem =
              "*Evento do TPE - Confirmação de Participação*\n\n" +
              "👤 Olá,\n" + nome + "\n\n" +
              "✍️ Você foi designado para o evento *" + evento + "*, para o dia *" + turnoTxt + "*.\n\n" +
              "📲 Por favor, confirme sua participação respondendo esta mensagem.\n\n" +
              "*Equipe de Eventos do TPE SBC*";

            var linkWhatsapp = telefoneLimpo
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

          container.querySelectorAll(".carrinho-editavel").forEach(td => {
            td.style.color = "blue";
            td.style.cursor = "pointer";
            td.addEventListener("click", () => transformarCarrinhoEmSelect(td));
          });

          document.getElementById("areaBotoes").style.display = "block";

          document.getElementById("btnEnviarTodos").addEventListener("click", () => {
            const container = document.getElementById("resultadoDesignadosContainerEv");
            enviarEmailParaTodos(container);
          });

          document.getElementById("btnEnviarDaAba").addEventListener("click", () => {
            enviarEmailParaTodosDaAba();
          });

          container.querySelectorAll(".nome-editavel").forEach(td => {
            td.style.color = "blue";
            td.style.cursor = "pointer";
            td.addEventListener("click", () => {
              mostrarSpinner();
              transformarNomeEmSelect(td);
            });
          });

        }
      },
      function(err) {
        esconderSpinner();
        mostrarAlertaGlobal("❌ Erro: " + err.message);
      }
    );
  });

  const btnRegistrarInscritos = document.getElementById("btnRegistrarInscritos");
  btnRegistrarInscritos.replaceWith(btnRegistrarInscritos.cloneNode(true));
  document.getElementById("btnRegistrarInscritos")
    .addEventListener("click", mostrarConfirmacaoRegistrarInscritos);

  const btnRegistrarDesignados = document.getElementById("btnRegistrarDesignados");
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

    apiJSONP(
      "listarInscritosPorTurno",
      { eventoId, data, turno },
      function(res) {

        esconderSpinner();
        mostrarInscritos(res);
        document.getElementById("areaBotoesInscritos").style.display = "block";

      },
      function(err) {

        esconderSpinner();

        console.error("Erro backend:", err);

        mostrarAlertaGlobal("❌ Erro: " + err.message);

      }
    );

  });

});


/***************************** */
function carregarEventosInscritos() {

  apiJSONP(
    "listarEventosAdm",
    {},
    function(eventos) {

      const sel =
        document.getElementById("eventoSelectInscritos");

      sel.innerHTML =
        "<option value=''>- Selecione -</option>";

      eventos.forEach(evt => {

        const opt =
          document.createElement("option");

        opt.value = evt.id;

        const ano =
          evt.data
            ? evt.data.split("/")[2]
            : "";

        opt.textContent =
          `${evt.nome} - ${ano}`;

        sel.appendChild(opt);

      });

      document.getElementById(
        "turnoSelectInscritos"
      ).disabled = true;

    },
    function(err) {
      console.error("Erro:", err);
    }
  );

}



function eventoMudouInscritos() {

  const eventoId =
    document.getElementById("eventoSelectInscritos").value;

  const selTurno =
    document.getElementById("turnoSelectInscritos");

  selTurno.innerHTML =
    "<option value=''>- Selecione turno -</option>";

  selTurno.disabled = true;

  document.getElementById(
    "grupoTurnoInscritos"
  ).style.display = "none";

  mostrarSpinner();

  if (!eventoId) return;

  apiJSONP(
    "listarTurnosDoEventoAdm",
    { eventoId },
    function(turnos) {

      esconderSpinner();

      turnos.forEach(t => {

        const opt =
          document.createElement("option");

        opt.value =
          `${t.data}|${t.label}`;

        opt.textContent =
          `${t.data} - ${t.label}`;

        selTurno.appendChild(opt);

      });

      selTurno.disabled = false;

      document.getElementById(
        "grupoTurnoInscritos"
      ).style.display = "flex";

      esconderSpinner();

    },
    function(err) {
      esconderSpinner();
      console.error("Erro:", err);
    }
  );

}

function mostrarInscritos(inscritos) {

    esconderSpinner();

    const container =
      document.getElementById(
        "resultadoInscritosContainer"
      );

    if (!inscritos || inscritos.length === 0) {

      container.innerHTML =
        "<p>❌ Nenhum inscrito encontrado.</p>";

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
            <button
              onclick="confirmarExclusao(
                '${i.participanteId}'
              )">
              Excluir
            </button>
          </td>
        </tr>
      `;

    });

    html += `
        </tbody>
      </table>
    `;

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

  const [data, turno] =
    valorSelecionado.split("|");

  mostrarConfirmacaoGlobal(
    "⚠️ Deseja realmente excluir esta inscrição?",
    () => {

      mostrarSpinner();

      apiJSONP(
        "excluirInscricaoAdm",
        { eventoId, data, turno, participanteId },
        function() {

          esconderSpinner();

          mostrarAlertaGlobal("✅ Inscrição excluída.");

          document
            .getElementById("btnMostrarInscritos")
            .click();

        },
        function(err) {

          esconderSpinner();

          mostrarAlertaGlobal("❌ " + err.message);

        }
      );

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
      if (email && validateEmail(email)) {
        emails.push(email);
      }
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
    <p>⚠️ Atenção! Enviando confirmação para os designados do turno selecionado. Envie a Escala para TODOS os designados pelo botão "Enviar Escalas". 📧 Deseja enviar email para o(s) <strong>${emails.length}</strong> designado(s) que tem email cadastrado?</p>
    <div class="confirm-buttons">
      <button id="confirmarEnvioEmailBtn" class="confirm">✅ Confirmar</button>
      <button id="cancelarEnvioEmailBtn" class="cancel">❌ Cancelar</button>
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
      `Você se inscreveu para o evento abaxo e foi designado(a) para participar:\n\n` +
      `${eventoSelecionado}\n` +
      `Turno: ${turnoSelecionado}\n\n` +
      `Voce será adicionado ao grupo de whatsapp do evento, onde receberá mais informações.\n` +
      `Em caso de imprevistos ou outra necessidade, por favor, fique à vontade para falar com os administradores do grupo.\n\n` +
      `Atenciosamente,\n` +
      `Equipe TPE`;

    apiJSONP(
      "enviarEmailParaDesignadosEventoAdm",
      { emails: JSON.stringify(emails), assunto, mensagem },
      function() {
        confirmDiv.innerHTML = `<div style="color: green;">✅ Emails enviados com sucesso!</div>`;
      },
      function(err) {
        confirmDiv.innerHTML = `<div style="color: red;">❌ Erro ao enviar emails: ${err.message}</div>`;
      }
    );

  });

  confirmDiv.querySelector("#cancelarEnvioEmailBtn").addEventListener("click", () => {
    confirmDiv.remove();
  });
}


// Função simples para validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function transformarNomeEmSelect(td) {
  const eventoId = document.getElementById("eventoSelectDesignados").value;
  const selectTurno = document.getElementById("turnoSelectDesignados");
  const turnoCompleto = selectTurno.options[selectTurno.selectedIndex]?.textContent || "";

  const nomeAtual = td.dataset.nome;
  const idAtual = td.dataset.id || "";

  if (!eventoId || !turnoCompleto) {
    mostrarAlertaGlobal("❌ Evento ou turno não selecionado");
    return;
  }

  if (td.cellIndex === 0) return;
  if (td.querySelector("select")) return;

  const tr = td.parentElement;
  tr.classList.add("linha-em-edicao");

  const tds = tr.children;

  apiJSONP(
    "listarCadastroReservaAdm",
    { eventoId, turnoCompleto },
    function(nomesReserva) {

      const candidatos = nomesReserva.candidatos;

      const selectNome = document.createElement("select");
      selectNome.style.fontSize = "25px";

      const optVaga = document.createElement("option");
      optVaga.value = "VAGA";
      optVaga.textContent = "VAGA";
      optVaga.dataset.sexo = "";
      optVaga.dataset.telefone = "";
      optVaga.dataset.email = "";
      optVaga.dataset.nome = "VAGA";
      if (nomeAtual === "VAGA") optVaga.selected = true;
      selectNome.appendChild(optVaga);

      candidatos.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.nome;
        opt.dataset.sexo = item.sexo || "";
        opt.dataset.telefone = item.telefone || "";
        opt.dataset.email = item.email || "";
        opt.dataset.nome = item.nome || "";
        if (item.id === idAtual) opt.selected = true;
        selectNome.appendChild(opt);
      });

      td.innerHTML = "";
      td.appendChild(selectNome);

      esconderSpinner();

      const valorOriginal = selectNome.value;

      setTimeout(() => {
        function cliqueFora(event) {
          const clicouDentroDoTd = td.contains(event.target);
          if (!clicouDentroDoTd) {
            const novoValor = selectNome.value;
            if (novoValor === valorOriginal) {
              document.getElementById("btnMostrarDesignados").click();
              document.removeEventListener("click", cliqueFora);
              return;
            }
            tr.classList.remove("linha-em-edicao");
            document.removeEventListener("click", cliqueFora);
          }
        }
        document.addEventListener("click", cliqueFora);
      }, 0);

      selectNome.addEventListener("change", () => {
        const novoId = selectNome.value;
        const optSelecionada = selectNome.options[selectNome.selectedIndex];
        const novoNome = optSelecionada.dataset.nome;
        const novoSexo = optSelecionada.dataset.sexo;
        const novoTelefone = optSelecionada.dataset.telefone;
        const novoEmail = optSelecionada.dataset.email;

        const tdCarrinho = tds[0];
        const carrinhoSelecionado = tdCarrinho.textContent.trim();

        td.innerHTML = novoNome;
        td.dataset.id = novoId;
        td.dataset.nome = novoNome;
        td.dataset.sexo = novoSexo;

        td.style.color = "blue";
        td.style.cursor = "pointer";
        td.addEventListener("click", () => {
          mostrarSpinner();
          transformarNomeEmSelect(td);
        });

        tds[2].textContent = novoSexo;

        const selectEvento = document.getElementById("eventoSelectDesignados");
        const eventoSelecionado = selectEvento.options[selectEvento.selectedIndex]?.textContent || "Evento";

        const partesTurno = turnoCompleto.split(" - ");
        const dataTurno = partesTurno[0]?.trim() || "";
        const turnoPadronizado = partesTurno[1]?.trim() || "";

        const tdTelefone = tds[3];
        const telefoneLimpo = (novoTelefone || "").replace(/\D/g, "");

        const mensagemWhatsapp =
          "*Evento do TPE - Confirmação de Participação*\n\n" +
          "👤 Olá,\n" + novoNome + "\n\n" +
          "✍️ Você foi designado para o evento *" + eventoSelecionado + "*, no turno *" + turnoPadronizado + "*.\n" +
          "📲 Por favor, confirme sua participação respondendo esta mensagem.\n\n" +
          "*Equipe de Eventos do TPE SBC*";

        tdTelefone.innerHTML = telefoneLimpo
          ? `<a href="https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagemWhatsapp)}" target="_blank" rel="noopener noreferrer">${novoTelefone}</a>`
          : "";

        tds[4].textContent = novoEmail;

        mostrarSpinner();

        apiJSONP(
          "salvarAlteracaoDesignadoAdm",
          {
            eventoId,
            turnoCompleto,
            idAtual,
            novoId,
            carrinhoSelecionado
          },
          function() {
            esconderSpinner();
            //console.log("Alteração salva automaticamente.");
          },
          function(err) {
            esconderSpinner();
            mostrarAlertaGlobal("❌ Erro ao salvar alteração: " + err.message);
          }
        );

      });

    },
    function(err) {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao buscar cadastro reserva: " + err.message);
    }
  );
}

function transformarCarrinhoEmSelect(td) {
  let carrinhoAtual = td.dataset.carrinho;
  if (!carrinhoAtual) {
    const texto = td.textContent.trim();
    carrinhoAtual = texto === "Carrinho do Evento" ? "" : texto;
  }

  const tr = td.parentElement;

  tr.classList.add("linha-em-edicao");

  const tds = tr.children;

  if (td.querySelector("select")) return;

  const select = document.createElement("select");
  select.style.fontSize = "25px";

  const optInicial = document.createElement("option");
  optInicial.value = "";
  optInicial.textContent = "Selecione";
  optInicial.disabled = true;
  optInicial.selected = true;
  select.appendChild(optInicial);

  for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = `Carrinho ${i}`;
    opt.textContent = `Carrinho ${i}`;
    if (opt.value === carrinhoAtual) opt.selected = true;
    select.appendChild(opt);
  }

  td.innerHTML = "";
  td.appendChild(select);
  select.focus();

  esconderSpinner();

  const valorOriginal = carrinhoAtual;

  setTimeout(() => {
    function cliqueFora(event) {
      const clicouDentro = td.contains(event.target);

      if (!clicouDentro) {
        const novoValor = select.value;

        if (novoValor === valorOriginal || novoValor === "") {
          td.textContent = valorOriginal || "Carrinho do Evento";
          td.dataset.carrinho = valorOriginal;
          td.style.color = "blue";
          td.style.cursor = "pointer";
          td.addEventListener("click", () => transformarCarrinhoEmSelect(td));
        }

        tr.classList.remove("linha-em-edicao");
        document.removeEventListener("click", cliqueFora);
      }
    }

    document.addEventListener("click", cliqueFora);
  }, 0);

  select.addEventListener("change", () => {
    const novoCarrinho = select.value;

    td.textContent = novoCarrinho;
    td.dataset.carrinho = novoCarrinho;
    td.style.color = "blue";
    td.style.cursor = "pointer";

    tr.classList.remove("linha-em-edicao");

    td.addEventListener("click", () => transformarCarrinhoEmSelect(td));

    const eventoId =
      document.getElementById("eventoSelectDesignados").value;

    const selectTurno =
      document.getElementById("turnoSelectDesignados");

    const turnoCompleto =
      selectTurno.options[selectTurno.selectedIndex]?.textContent || "";

    const id =
      tds[1]?.dataset.id || tds[1]?.textContent.trim() || "";

    mostrarSpinner();

    apiJSONP(
      "salvarAlteracaoDesignadoAdm",
      {
        eventoId,
        turnoCompleto,
        idAtual: id,
        novoId: id,
        carrinhoSelecionado: novoCarrinho
      },
      function() {
        esconderSpinner();
      },
      function(err) {
        esconderSpinner();
        mostrarAlertaGlobal("❌ Erro ao salvar carrinho: " + err.message);
      }
    );
  });

  select.addEventListener("blur", () => {
    td.textContent = carrinhoAtual || "Carrinho do Evento";
    td.dataset.carrinho = carrinhoAtual;
    td.style.color = "blue";
    td.style.cursor = "pointer";
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

  container.innerHTML = "";

  apiJSONP(
    "listarEmailsDesignados",
    { eventoId },
    function(emails) {

      container.innerHTML = "";

      if (!emails || emails.length === 0) {
        container.innerHTML = "<p style='color:red;'>Nenhum email válido encontrado para enviar.</p>";
        mostrarAlertaGlobal("❌ Nenhum email válido encontrado para enviar.");
        return;
      }

      let confirmDiv = document.createElement("div");
      confirmDiv.id = "confirmEmailContainer";
      confirmDiv.classList.add("confirm-box");
      container.appendChild(confirmDiv);

      confirmDiv.innerHTML = `
        <p>📧 Atenção! Você já finalizou <strong>TODAS</strong> as designações? Só envie a Escala, depois de finalizar <strong>TODAS</strong> as designações e clicar no botão <strong>"Registrar Designações"</strong>. Deseja enviar a Escala Geral por email para os <strong>${emails.length}</strong> designado(s) que tem email cadastrado?</p>
        <div class="confirm-buttons">
          <button id="confirmarEnvioEmailBtn" class="confirm">✅ Confirmar</button>
          <button id="cancelarEnvioEmailBtn" class="cancel">❌ Cancelar</button>
        </div>
      `;

      confirmDiv.querySelector("#confirmarEnvioEmailBtn").addEventListener("click", () => {
        confirmDiv.innerHTML = "Enviando emails...";

        const eventoSelecionado =
          selectEvento.options[selectEvento.selectedIndex]?.textContent || "Evento";

        const assunto = "Designação Evento do TPE";

        const mensagem =
          `Olá querido(a) irmão(ã),\n\n` +
          `Você se inscreveu e foi selecionado(a) para participar do TPE no evento abaxo:\n\n` +
          `${eventoSelecionado}\n\n` +
          `Para mais informações sobre o dia e turno de sua participação,\n` +
          `aguarde o contato do pessoal da equipe organizadora.\n\n` +
          `Você será incluído(a) no grupo de WhatsApp do evento,\n` +
          `onde receberá mais informações sobre seu ponto e companheiro(a).\n\n` +
          `Caso tenha qualquer dúvida ou imprevisto, por favor,\n` +
          `fique à vontade para contatar os administradores do grupo\n` +
          `de mensagens.\n\n` +
          `Atenciosamente,\n` +
          `Equipe TPE`;

        apiJSONP(
          "enviarEmailParaDesignadosEvento",
          { emails: JSON.stringify(emails), assunto, mensagem },
          function() {
            mostrarAlertaGlobal("✅ Emails enviados com sucesso!");
          },
          function(err) {
            mostrarAlertaGlobal(`❌ Erro ao enviar emails: ${err.message}`);
          }
        );
      });

      confirmDiv.querySelector("#cancelarEnvioEmailBtn").addEventListener("click", () => {
        confirmDiv.remove();
      });

    },
    function(err) {
      container.innerHTML = "<p style='color:red;'>Erro: " + err.message + "</p>";
      mostrarAlertaGlobal("❌ Erro: " + err.message);
    }
  );
}

/******************* */
function carregarEventosNoSelectUsuario() {
  apiJSONP(
    "listarEventos",
    {},
    function(eventos) {

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

        const ano = ev.data
          ? ev.data.split("/")[2]
          : "";

        opt.textContent = `${ev.nome} - ${ano}`;

        select.appendChild(opt);

      });

    },
    function(err) {
      console.error("Erro:", err);
    }
  );
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

    apiJSONP(
      "listarTurnosDoEventoUser",
      { eventoId },
      function(turnos) {

        esconderSpinner();

        turnoSelect.innerHTML =
          '<option value="">Selecione um turno</option>';

        if (!turnos || turnos.length === 0) {
          turnoSelect.disabled = true;
          return;
        }

        turnos.forEach(t => {

          const opt = document.createElement("option");

          opt.value =
            `${t.data} - ${t.label}`;

          opt.textContent =
            `${t.data} - ${t.label}`;

          turnoSelect.appendChild(opt);

        });

        apenasMost.style.display = "block";

        turnoSelect.disabled = false;

      },
      function(err) {

        esconderSpinner();

        turnoSelect.disabled = true;

        mostrarAlertaGlobal(
          "❌ Erro ao buscar turnos: " +
          err.message
        );

      }
    );

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

      apiJSONP(
        "inscreverParticipanteUser",
        {
          eventoIdSelecionado,
          turnoSelecionado,
          campoExtra: "",
          idUsuario
        },
        function(res) {

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

        },
        function(err) {

          esconderSpinner();

          document.getElementById("resultadoMinhaInscricao").innerHTML =
            "Erro: " + err.message;

          mostrarAlertaGlobal(
            "❌ " + (err.message || "Erro ao realizar inscrição.")
          );

        }
      );

    }
  );
}

function carregarEventosNoSelect() {
  apiJSONP(
    "listarEventos",
    {},
    function(eventos) {

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

    },
    function(err) {
      console.error("Erro:", err);
    }
  );
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

  apiJSONP(
    "listarTurnosDoEventoUser",
    { eventoId },
    function(turnos) {

      esconderSpinner();

      turnoSelect.innerHTML = '<option value="">Selecione um turno</option>';

      if (!turnos || turnos.length === 0) {
        turnoSelect.disabled = true;
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

    },
    function(err) {

      esconderSpinner();
      turnoSelect.disabled = true;
      mostrarAlertaGlobal("❌ Erro ao buscar turnos: " + err.message);

    }
  );

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

    mostrarAlertaGlobal(
      "⚠️ Selecione um participante."
    );

    return;
  }

  const nomeUsuario =
    participanteSelecionadoInscreverOutro.nome;

  const idUsuario =
    participanteSelecionadoInscreverOutro.id;

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

      apiJSONP(
        "inscreverParticipanteAdm",
        {
          eventoIdSelecionado,
          turnoSelecionado,
          nomeUsuario,
          idUsuario
        },
        function(res) {

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

        },
        function(err) {

          esconderSpinner();

          document.getElementById("resultadoInscricao").innerHTML =
            "Erro: " + err.message;

          mostrarAlertaGlobal("❌ " + err.message);

        }
      );

    }
  );
}


function carregarAbasEv() {

  apiJSONP(
    "listarAbasEv",
    {},
    function(nomes) {

      const select = document.getElementById("abaEv");
      select.innerHTML = "";

      const optionDefault = document.createElement("option");
      optionDefault.value = "";
      optionDefault.text = "- Selecione -";
      select.appendChild(optionDefault);

      nomes.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        option.text = nome;
        select.appendChild(option);
      });

    },
    function(err) {
      console.error("Erro:", err);
    }
  );

}

function exportarEscalaEv() {

  const abaSelecionada = document.getElementById("abaEv").value;
  const mensagem = document.getElementById("mensagemEv");

  mensagem.innerHTML = "Gerando link de download...";
  mostrarSpinner();

  apiJSONP(
    "exportarAbaSelecionadaAdm",
    { abaSelecionada },
    function(linkHTML) {

      mensagem.innerHTML = linkHTML;
      esconderSpinner();

    },
    function(erro) {

      mensagem.innerText = "❌ Erro: " + erro.message;
      esconderSpinner();

    }
  );

}

function carregarEventosConversor() {

  apiJSONP(
    "listarEventosConversor",
    {},
    function(eventos) {

      const sel = document.getElementById("eventoSelectConversor");

      sel.innerHTML = "<option value=''>- Selecione -</option>";

      eventos.forEach(evt => {

        const opt = document.createElement("option");

        opt.value = evt.id;

        const ano = evt.data ? evt.data.split("/")[2] : "";

        opt.textContent = `${evt.nome} - ${ano}`;

        sel.appendChild(opt);

      });

    },
    function(err) {
      console.error("Erro:", err);
    }
  );

}

function converterTeste() {

  const eventoId = document.getElementById("eventoSelectConversor").value;
  const status = document.getElementById("status");

  if (!eventoId) {
    status.textContent = "❗ Selecione um evento primeiro.";
    return;
  }

  status.textContent = "⏳ Convertendo... aguarde...";

  apiJSONP(
    "converterDesignadosDosEventosParaIDsTeste",
    {
      eventoIds: JSON.stringify([eventoId])
    },
    function(resultado) {

      status.innerHTML = `<p>${resultado.mensagem}</p>`;

      if (resultado.naoEncontrados && resultado.naoEncontrados.length > 0) {

        const lista = document.createElement("ul");

        resultado.naoEncontrados.forEach(item => {
          const li = document.createElement("li");
          li.textContent = `Linha ${item.linha} | Turno: ${item.turno} | Valor: ${item.id}`;
          lista.appendChild(li);
        });

        const titulo = document.createElement("p");
        titulo.textContent = "❌ Não encontrados:";

        status.appendChild(titulo);
        status.appendChild(lista);
      }

    },
    function(err) {
      status.textContent = "Erro: " + err.message;
    }
  );

}

  carregarEventosConversor();


  /**************** */
  function carregarAbasEv() {

  apiJSONP(
    "listarAbasEv",
    {},
    function(nomes) {

      const select = document.getElementById('abaEv');
      select.innerHTML = "";

      const optionDefault = document.createElement('option');
      optionDefault.value = "";
      optionDefault.text = "- Selecione -";
      select.appendChild(optionDefault);

      (nomes || []).forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        option.text = nome;
        select.appendChild(option);
      });

    },
    err => {
      mostrarAlertaGlobal("❌ Erro ao carregar abas EV: " + err.message);
    }
  );

}

function exportarEscalaEv() {

  const abaSelecionada = document.getElementById('abaEv').value;
  const mensagem = document.getElementById('mensagemEv');

  mensagem.innerHTML = "Gerando link de download...";
  mostrarSpinner();

  apiJSONP(
    "exportarAbaSelecionada",
    { aba: abaSelecionada },
    function(linkHTML) {

      mensagem.innerHTML = linkHTML;
      esconderSpinner();

    },
    err => {

      mensagem.innerText = "❌ Erro: " + err.message;
      esconderSpinner();

    }
  );

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

  apiJSONP(
    "listarDesignacoesDoPonto",
    {
      ponto
    },
    (res) => {
      esconderSpinner();

      if (!res || res.length === 0) {
        mostrarAlertaGlobal("❌ Nenhuma designação encontrada para esse ponto.");
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
    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao buscar designações: " + (err.message || err));
    }
  );
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

  apiJSONP(
    "gerarPdfDesignacoesDoPonto",
    {
      ponto
    },
    (link) => {
      esconderSpinner();
      msg.innerHTML = `✅ PDF pronto: <a href="${link}" target="_blank">Clique para baixar</a>`;
    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro: " + (err.message || err));
    }
  );
}
  
async function salvarDesignacao() {

  const ponto = document.getElementById("ponto").value;
  const dia = document.getElementById("dia").value;

  if (!participanteSelecionadoDesignacao) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const nomeParticipante =
    participanteSelecionadoDesignacao.nome;

  const idParticipante =
    participanteSelecionadoDesignacao.id;

  mostrarSpinner();

  const substituto =
    await selecionarSubstituicaoDesignados(ponto, dia);

  const substituirQuem =
    substituto ? substituto.id : "";

  const frequencia = document.getElementById("frequencia").value;
  const equipamento = document.getElementById("equipamento").value;

  if (!ponto || !dia || !idParticipante || !frequencia || !equipamento) {
    mostrarAlertaGlobal("⚠️ Preencha todos os campos obrigatórios.");
    esconderSpinner();
    return;
  }

  const mensagem = substituto
    ? `Confirma a designação de <b>${nomeParticipante}</b> para o ponto <b>${ponto}</b>, substituindo <b>${substituto.nome}</b>?`
    : `Confirma a designação de <b>${nomeParticipante}</b> para o ponto <b>${ponto}</b>?`;

  mostrarConfirmacaoGlobal(mensagem, () => {

    mostrarSpinner();

    apiJSONP(
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

        if (retorno && retorno.startsWith && retorno.startsWith("🚫")) {
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
      (err) => {

        esconderSpinner();
        mostrarAlertaGlobal("❌ Erro ao salvar designação");
        console.error(err);
      }
    );

  });
}

function converterDesignacoesParaIDs() {
  const pontoSelecionado = document.getElementById('pontoCorrigir').value;
  const msg = document.getElementById("msgCorrigir");
  const tabelaContainer = document.getElementById("tabelaNaoEncontradosContainer");

  msg.textContent = `🔄 Convertendo designações por nome para ID no ponto ${pontoSelecionado}...`;
  tabelaContainer.innerHTML = "";
  mostrarSpinner();

  apiJSONP(
    "converterDesignacoesParaIDsTeste",
    {
      ponto: pontoSelecionado
    },
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
      esconderSpinner();
      mostrarAlertaGlobal("Erro: " + (erro.message || erro));
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

  apiJSONP(
    "corrigirDesignacoesPontosComIDTeste",
    {
      ponto: pontoSelecionado
    },
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
      esconderSpinner();
      mostrarAlertaGlobal("Erro: " + (erro.message || erro));
    }
  );
}

function buscarTreinando() {
  const resultadoDiv = document.getElementById('resultadoTreinando');
  const msg = document.getElementById('msgTreinando') || { textContent: () => {} };

  resultadoDiv.innerHTML = '';

  mostrarSpinner();

  apiJSONP(
    "buscarTreinandoCompacto",
    {},
    (lista) => {

      esconderSpinner();

      if (!lista || lista.length === 0) {
        mostrarAlertaGlobal("❌ Nenhum participante em treinamento encontrado.");
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

          const linkWhatsApp = "https://wa.me/55" + telefoneLimpo + "?text=" + encodeURIComponent(mensagem);

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
    },
    (err) => {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro na busca: " + (err.message || err));
    }
  );
}

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

  const modal =
    document.getElementById(
      'modalConfirmarDesignacao'
    );

  const idTreinando =
    modal.dataset.idTreinando;

  const idTreinador =
    modal.dataset.idTreinador;

  const nomeTreinando =
    modal.dataset.nomeTreinando;

  const congregacao =
    modal.dataset.congregacao;

  const telefone =
    modal.dataset.telefone;

  mostrarSpinner();

  apiJSONP(
    "registrarDesignacaoTreinamento",
    {
      idTreinando,
      idTreinador
    },
    () => {

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

    },
    /*(err) => {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ " + (err.message || err)
      );

    }*/
    (err) => {

      esconderSpinner();

      console.error(err);

      const mensagem =
        err?.mensagem ||
        err?.message ||
        "Erro inesperado.";

      mostrarAlertaGlobal("❌ " + mensagem);

    }
  );
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

  const modal =
    document.getElementById('modalEnviarWhatsapp');

  const idTreinando =
    modal.dataset.idTreinando;

  const idTreinador =
    modal.dataset.idTreinador;

  const nomeTreinando =
    modal.dataset.nomeTreinando;

  const congregacao =
    modal.dataset.congregacao;

  const telefone =
    modal.dataset.telefone;

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

  const mensagemCodificada =
    encodeURIComponent(mensagem);

  apiJSONP(
    "buscarNumeroWhatsAppPorIdComMensagemTreinadorUm",
    {
      idTreinador,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      window.open(url, "_blank");

      fecharModalWhatsapp();

    },
    /*(err) => {

      esconderSpinner();

      mostrarAlertaGlobal(
        "❌ " + (err.message || err)
      );
      

    }*/
    (err) => {

      esconderSpinner();

      console.error(err);
      console.log(JSON.stringify(err, null, 2));

      mostrarAlertaGlobal(
        "❌ " + (err.message || JSON.stringify(err))
      );

    }
  );
}

function fecharModalDesignacao() {
  document.getElementById('modalConfirmarDesignacao').classList.add('oculto');
}

function fecharModalWhatsapp() {
  document.getElementById('modalEnviarWhatsapp').classList.add('oculto');
}

function buscarTreinamentosEmAndamento() {

  mostrarSpinner();

  apiJSONP(
    "listarTreinamentosEmAndamento",
    {},
    (lista) => {

      esconderSpinner();

      const container = document.getElementById('resultadoTreinamentosAndamento');

      container.innerHTML = '';

      if (!lista || lista.length === 0) {
        container.innerHTML =
          '<p>❌ Nenhum treinamento em andamento.</p>';
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
    },
    (err) => {

      esconderSpinner();

      mostrarAlertaGlobal('❌ ' + (err.message || err));
    }
  );
}

document
  .getElementById('acaoConcluir')
  .addEventListener('click', function () {

    const modal =
      document.getElementById(
        'modalAcoesTreinamento'
      );

    const idTreinando =
      modal.dataset.idTreinando;

    const idTreinador =
      modal.dataset.idTreinador;

    mostrarSpinner();

    apiJSONP(
      "concluirTreinamento",
      {
        idTreinando,
        idTreinador
      },
      () => {

        esconderSpinner();

        fecharModalAcoesTreinamento();

        buscarTreinamentosEmAndamento();

      },
      (err) => {

        esconderSpinner();

        mostrarAlertaGlobal(
          '❌ ' + (err.message || err)
        );

      }
    );

  });

document
  .getElementById('acaoDesistencia')
  .addEventListener('click', async function () {

    const modal =
      document.getElementById(
        'modalAcoesTreinamento'
      );

    const nomeTreinando =
      modal.dataset.nomeTreinando;

    const confirmou =
      await confirmarDecisao(
        `Confirma registrar a desistência de <b>${nomeTreinando}</b>?`,
        'Sim',
        'Cancelar'
      );

    if (!confirmou) {
      return;
    }

    const idTreinando =
      modal.dataset.idTreinando;

    const idTreinador =
      modal.dataset.idTreinador;

    mostrarSpinner();

    apiJSONP(
      "marcarDesistenciaTreinamento",
      {
        idTreinando,
        idTreinador
      },
      () => {

        esconderSpinner();

        fecharModalAcoesTreinamento();

        mostrarAlertaGlobal(
          '❌ Desistência registrada.'
        );

        buscarTreinamentosEmAndamento();

      },
      (err) => {

        esconderSpinner();

        mostrarAlertaGlobal(
          '❌ ' + (err.message || err)
        );

      }
    );

  });

document
.getElementById('acaoAlterarTreinador')
.addEventListener('click', function() {

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

document
.getElementById('acaoLembrete')
.addEventListener('click', function() {

  const modal = document.getElementById('modalAcoesTreinamento');

  fecharModalAcoesTreinamento();

  comunicarLembreteTreinador(
    modal.dataset.idTreinador,
    modal.dataset.nomeTreinando,
    modal.dataset.congregacao,
    modal.dataset.telefone
  );
});

document
.addEventListener('click', function(e) {

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
    esconderSpinner();
    return;
  }

  apiJSONP(
    "alterarTreinadorPorNome",
    {
      idTreinando,
      idTreinadorAtual,
      nomeSelecionado
    },
    (res) => {

      esconderSpinner();

      if (!res || !res.sucesso) {
        mostrarAlertaGlobal(res?.mensagem || "Erro ao alterar treinador");
        return;
      }

      fecharModalTreinador();

      const modalComunicacao = document.getElementById('modalComunicarTreinador');

      modalComunicacao.dataset.idNovoTreinador = res.idNovoTreinador;
      modalComunicacao.dataset.nomeTreinando = nomeTreinando;
      modalComunicacao.dataset.congregacao = congregacao;
      modalComunicacao.dataset.telefone = telefone;

      modalComunicacao.classList.remove('oculto');

    },
    (err) => {

      esconderSpinner();
      mostrarAlertaGlobal('❌ ' + (err.message || err));

    }
  );
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

  const mensagemCodificada =
    encodeURIComponent(mensagem);

  apiJSONP(
    "buscarNumeroWhatsAppPorIdComMensagem",
    {
      idNovoTreinador,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      window.open(url, '_blank');

      fecharModalComunicacao();

      buscarTreinamentosEmAndamento();

    },
    (err) => {

      esconderSpinner();

      mostrarAlertaGlobal('❌ ' + (err.message || err));

    }
  );
}

function comunicarLembreteTreinador(idTreinador, nomeTreinando, congregacao, telefone) {

  mostrarSpinner();

  const mensagem =
    "*LEMBRETE DE TREINAMENTO DO TPE*\n\n" +
    "Olá! Este é um lembrete sobre um treinamento que está em andamento.\n\n" +
    `👤 *Participante:* ${nomeTreinando}\n` +
    `✍️ *Congregação:* ${congregacao}\n` +
    `📲 *Telefone:* ${telefone}\n\n` +
    "Caso o treinamento já tenha sido realizado, por favor acesse o aplicativo e conclua o treinamento na seção *Meus Treinamentos*.\n\n" +
    "Agradecemos por sua ajuda!";

  const mensagemCodificada =
    encodeURIComponent(mensagem);

  apiJSONP(
    "buscarNumeroWhatsAppPorIdComMensagem",
    {
      idTreinador,
      mensagem: mensagemCodificada
    },
    (url) => {

      esconderSpinner();

      window.open(url, '_blank');

      buscarTreinamentosEmAndamento();

    },
    (err) => {

      esconderSpinner();

      mostrarAlertaGlobal('❌ ' + (err.message || err));

    }
  );
}

document.addEventListener('click', function(e) {

  if (e.target.classList.contains('concluir-meu-treinamento')) {

    const modal = document.getElementById('modalAcoesTreinador');

    modal.dataset.idTreinando = e.target.dataset.idTreinando;
    modal.dataset.idTreinador = e.target.dataset.idTreinador;
    modal.dataset.nomeTreinando = e.target.dataset.nomeTreinando;

    modal.classList.remove('oculto');
  }

});

/*document.getElementById('acaoConcluirTreinador').addEventListener('click', async function () {

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
});*/
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

  apiJSONP(
    "concluirTreinamento",
    {
      idTreinando,
      idTreinador
    },
    (res) => {

      esconderSpinner();

      fecharModalAcoesTreinador();

      const modalAdmin =
        document.getElementById('modalComunicarAdministrador');

      modalAdmin.dataset.tipo = 'CONCLUSAO';
      modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
      modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
      modalAdmin.dataset.dataHora = res.dataHora;

      modalAdmin.classList.remove('oculto');

      consultarMeuTreinamento();

    },
    (err) => {

      esconderSpinner();

      fecharModalAcoesTreinador();

      mostrarAlertaGlobal(
        err.mensagem || err.error || "Erro desconhecido."
      );

    }
  );

});

/*document.getElementById('acaoDesistenciaTreinador').addEventListener('click', async function () {

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
});*/
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

  apiJSONP(
    "marcarDesistenciaTreinamento",
    {
      idTreinando,
      idTreinador
    },
    (res) => {

      esconderSpinner();

      fecharModalAcoesTreinador();

      const modalAdmin =
        document.getElementById('modalComunicarAdministrador');

      modalAdmin.dataset.tipo = 'DESISTENCIA';
      modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
      modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
      modalAdmin.dataset.dataHora = res.dataHora;

      modalAdmin.classList.remove('oculto');

      consultarMeuTreinamento();

    },
    (err) => {

      esconderSpinner();

      fecharModalAcoesTreinador();

      mostrarAlertaGlobal(
        err.mensagem || err.error || "Erro desconhecido."
      );

    }
  );

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

      apiJSONP(
        "enviarEmailParaIrregularesComUsuario",
        {
          nomes: JSON.stringify(nomes),
          usuario: nomeUsuarioAtual,
          assunto,
          mensagem: mensagemBase
        },
        () => {

          esconderSpinner();

          mostrarAlertaGlobal("✅ E-mails enviados com sucesso!");

        },
        (err) => {

          esconderSpinner();

          mostrarAlertaGlobal(
            "❌ " + (err?.mensagem || err?.error || "Erro ao enviar e-mails.")
          );

        }
      );

    }
  );
});

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

/*function pegarContatosDoUsuarioIr(nome) {

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
}*/
function pegarContatosDoUsuarioIr(nome) {

  mostrarSpinner();

  apiJSONP(
    "pegarContatoUsuario",
    {
      nome
    },
    (contato) => {

      esconderSpinner();

      if (contato) {

        const telefoneInput =
          document.getElementById('telefoneInputUsuarioIr');

        const emailInput =
          document.getElementById('emailInputUsuarioIr');

        const nomeSelect =
          document.getElementById('nomeSelectUsuarioIr');

        telefoneInput.value = contato.telefone || '';
        emailInput.value = contato.email || '';

        telefoneInput.disabled = true;
        emailInput.disabled = true;
        nomeSelect.disabled = true;

        const container = document.querySelector(
          '#dadosUsuarioContainerIr > div[style*="display: none"]'
        );

        if (container) {
          container.style.display = 'block';
        }

      } else {

        console.warn("⚠️ Nenhum contato retornado.");

      }

    },
    (err) => {

      esconderSpinner();

      console.error(
        "❌ Erro ao buscar contato do usuário:",
        err.mensagem || err.error || err.message
      );

    }
  );

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

  apiJSONP(
    "obterColunaPontoDia",
    {
      ponto,
      dia
    },
    function(res) {

      mostrarModalSubstituicao(res);

    },
    function(err) {

      esconderSpinner();
      mostrarAlertaGlobal("Erro ao carregar dados do ponto");

    }
  );

  // guarda contexto global
  window.vagaContexto = { ponto, dia, frequencia };
}

function mostrarModalSubstituicao(dados) {

  esconderSpinner();

  const container = document.getElementById("listaSubstituicao");
  container.innerHTML = "";

  dados.forEach((item, index) => {

    if (
      !item ||
      item.tipo === "vazio" ||
      (!item.nome && !item.valor)
    ) return;

    if (item.tipo === "vaga") {

      const btn = document.createElement("button");

      btn.textContent = "🪑 " + item.valor;
      btn.classList.add(
        "botao-participante-modal",
        "botao-vaga-modal"
      );

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

      const { ponto, dia, frequencia } = window.vagaContexto;

      if (!id) {
        mostrarAlertaGlobal("❌ ID do participante não encontrado.");
        return;
      }

      const mensagem =
        `⚠️ Confirma substituir <b>${nome}</b><br>` +
        `por vaga <b>${frequencia}</b> em <b>${ponto} - ${dia}</b>?`;

      mostrarConfirmacaoGlobal(mensagem, () => {

        mostrarSpinner();

        apiJSONP(
          "transformarParticipanteEmVaga",
          {
            ponto,
            dia,
            frequencia,
            id
          },
          function() {

            esconderSpinner();

            mostrarAlertaGlobal("✅ Vaga criada com sucesso");

            setTimeout(() => {
              document.getElementById("modalSubstituicao").style.display = "none";
            }, 50);

            carregarTodasVagasAbertas();

            apiJSONP("atualizarVagasEmAberto", {}, function(){});

          },
          function(err) {

            esconderSpinner();
            mostrarAlertaGlobal("❌ " + err.message);

          }
        );

      });
    };

    container.appendChild(btn);
  });

  document.getElementById("modalSubstituicao").style.display = "block";
}

function confirmarNenhum() {

  const { ponto, dia, frequencia } = window.vagaContexto;

  const mensagem =
    `⚠️ Tem certeza que quer criar uma vaga "<b>${frequencia}</b>"<br>` +
    `no ponto "<b>${ponto}</b>" dia "<b>${dia}</b>" sem exlcuir nenhum participante?`;

  mostrarConfirmacaoGlobal(mensagem, () => {

    fecharModal(); // só fecha depois da confirmação

    mostrarSpinner();

    apiJSONP(
      "cadastrarVaga",
      {
        ponto,
        dia,
        frequencia
      },
      function() {

        esconderSpinner();

        mostrarAlertaGlobal("✅ Vaga criada com sucesso");

        carregarTodasVagasAbertas();

        apiJSONP("atualizarVagasEmAberto", {}, function(){});

      },
      function(err) {

        esconderSpinner();
        mostrarAlertaGlobal("❌ " + err.message);

      }
    );

  });
}

function fecharModal() {
  document.getElementById("modalSubstituicao").style.display = "none";
}

async function atualizarParticipantesParaCadastrarVaga() {

  const ponto = document.getElementById("pontoVaga").value;
  const dia = document.getElementById("diaVaga").value;

  if (!ponto || !dia) {
    limparSubstituirQuemsai();
    return;
  }

  apiJSONP(
    "buscarParticipantesParaSubstituir",
    {
      ponto,
      dia
    },
    function(participantesDesignados) {

      const select = document.getElementById("substituirQuemsai");
      select.innerHTML = '<option value="">-- Nenhum --</option>';

      (participantesDesignados || []).forEach(participante => {
        const option = document.createElement("option");
        option.value = participante.id;
        option.textContent = participante.nomeCompleto;
        select.appendChild(option);
      });

    },
    function(err) {

      console.error("❌ Erro ao buscar participantes designados:", err.message);
      limparSubstituirQuemsai();

    }
  );

}

function limparSubstituirQuemsai() {
  const select = document.getElementById("substituirQuemsai");
  select.innerHTML = '<option value="">-- Nenhum --</option>';
}

function atualizarContagemVagas(vagas) {
  const total = vagas.length;
  document.getElementById("totalVagas").textContent = total;
}

function preencherFormularioDesignacao(vaga) {
  document.getElementById("ponto").value = vaga.ponto;
  document.getElementById("dia").value = vaga.dia;
  document.getElementById("frequencia").value = vaga.frequencia;
  document.getElementById("substituirQuem").value = vaga.quemSai;

}

function carregarTodasVagasAbertas() {

  mostrarSpinner();

  // 1. Primeiro atualiza
  apiJSONP(
    "atualizarVagasEmAberto",
    {},
    function() {

      // 2. Depois busca as vagas
      apiJSONP(
        "getVagasAbertas",
        {},
        function(dados) {

          esconderSpinner();
          mostrarVagasNaTabela(dados);

        },
        function(err) {

          mostrarAlertaGlobal("❌ Erro ao buscar vagas: " + err.message);
          esconderSpinner();

        }
      );

    },
    function(err) {

      mostrarAlertaGlobal("❌ Erro ao atualizar vagas: " + err.message);
      esconderSpinner();

    }
  );
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

          apiJSONP(
            "excluirVaga",
            {
              ponto: vaga.ponto,
              dia: vaga.dia,
              frequencia: vaga.frequencia
            },
            function() {

              apiJSONP(
                "atualizarStatusDeVagaExcluida",
                {
                  ponto: vaga.ponto,
                  dia: vaga.dia,
                  frequencia: vaga.frequencia
                },
                function() {

                  esconderSpinner();
                  carregarTodasVagasAbertas();
                  mostrarAlertaGlobal("✅ Vaga excluída com sucesso.");

                },
                function(err) {

                  esconderSpinner();
                  mostrarAlertaGlobal(
                    "❌ Erro ao atualizar status da vaga excluída: " +
                    err.message
                  );

                }
              );

            },
            function(err) {

              esconderSpinner();
              mostrarAlertaGlobal(
                "❌ Erro ao excluir vaga: " + err.message
              );

            }
          );

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

  mostrarSpinner();

  if (!congregacaoSelecionada) {
    mostrarAlertaGlobal("⚠️ Por favor, selecione uma congregação.");
    esconderSpinner();
    return;
  }

  resultadoDiv.textContent = '';
  mostrarSpinner();

  apiJSONP(
    "pesquisarParticipantesPorCongregacao",
    { congregacaoSelecionada },
    function(participantes) {

      const total = participantes.length;
      msg.textContent = `✅ ${total} participante${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''} para a congregação selecionada.`;

      esconderSpinner();

      if (!participantes || participantes.length === 0) {
        msg.textContent = "❌ Nenhum participante encontrado para essa congregação.";
        mostrarAlertaGlobal("❌ Nenhum participante encontrado para essa congregação.");
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

    },
    function(err) {
      esconderSpinner();
      mostrarAlertaGlobal("❌ Erro ao buscar participantes: " + err.message);
    }
  );
}

function carregarOpcoesCongregacoes() {

  apiJSONP(
    "buscarCongregacoesUnicas",
    {},
    function(congregacoes) {

      const sel = document.getElementById('pesqCongregacao');
      sel.innerHTML = '<option value="">-- Selecione Congregação --</option>';

      congregacoes.forEach(item => {
        const o = document.createElement('option');
        o.value = item;
        o.textContent = item;
        sel.appendChild(o);
      });

    },
    function(err) {
      mostrarAlertaGlobal('❌ Erro ao carregar congregações: ' + err.message);
    }
  );

}

function exportar() {

  const abaSelecionada = document.getElementById("aba").value;
  const mensagem = document.getElementById("mensagem");

  mensagem.innerHTML = "Gerando link de download...";
  mostrarSpinner();

  apiJSONP(
    "exportarAbaSelecionadaExportar",
    { abaSelecionada },
    function(linkHTML) {

      mensagem.innerHTML = linkHTML;
      esconderSpinner();

    },
    function(erro) {

      mensagem.innerText = "❌ Erro: " + erro.message;
      esconderSpinner();

    }
  );

}

function consultarPerfilAtual() {

  if (!participanteSelecionadoPerfil) {

    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const idParticipante =
    participanteSelecionadoPerfil.id;

  const perfilAtual =
    document.getElementById("perfilAtual");

  mostrarSpinner();

  apiJSONP(
    "obterPerfilParticipantePorId",
    {
      idParticipante
    },
    function(res) {

      esconderSpinner();

      if (res.sucesso) {
        perfilAtual.value = res.perfil || '';
      } else {
        perfilAtual.value = '';
        mostrarAlertaGlobal(res.mensagem || '❌ Perfil não encontrado.');
      }

    },
    function(err) {

      esconderSpinner();
      perfilAtual.value = '';
      mostrarAlertaGlobal('❌ Erro: ' + err.message);

    }
  );
}

function alterarPerfil() {

  const novoPerfil =
    document.getElementById('tipoDePerfil').value;

  const idParticipante =
    participanteSelecionadoPerfil.id;

  if (!idParticipante || !novoPerfil) {
    mostrarAlertaGlobal('❌ Selecione participante e perfil.');
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "atualizarPerfilParticipantePorId",
    {
      idParticipante,
      novoPerfil
    },
    function(res) {

      esconderSpinner();

      if (res.sucesso) {

        mostrarAlertaGlobal(
          `✅ Perfil atualizado com sucesso para "${novoPerfil}".`
        );

        consultarPerfilAtual();

      } else {
        mostrarAlertaGlobal(res.mensagem || '❌ Erro ao atualizar perfil.');
      }

    },
    function(err) {

      esconderSpinner();
      mostrarAlertaGlobal('❌ Erro de comunicação: ' + err.message);

    }
  );
}

let participanteSelecionadoGA = null;

function consultarDadosAcesso() {

  const idParticipante =
    participanteSelecionadoAcesso.id;

  if (!idParticipante) {

    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const emailAtual =
    document.getElementById('emailAtual');

  const senhaAtual =
    document.getElementById('senhaAtual');

  mostrarSpinner();

  apiJSONP(
    "obterDadosAcessoParticipantePorId",
    {
      idParticipante
    },
    function(res) {

      esconderSpinner();

      if (res.sucesso) {

        emailAtual.value = res.email || '';
        senhaAtual.value = res.senha || '';

      } else {

        emailAtual.value = '';
        senhaAtual.value = '';
        mostrarAlertaGlobal(res.mensagem || '❌ Dados não encontrados.');
      }

    },
    function(err) {

      esconderSpinner();

      emailAtual.value = '';
      senhaAtual.value = '';

      mostrarAlertaGlobal('❌ Erro: ' + err.message);
    }
  );
}

function alterarDadosAcesso() {

  const novoEmail =
    document.getElementById('novoEmail').value.trim();

  const novaSenha =
    document.getElementById('novaSenha').value.trim();

  const idParticipante =
    participanteSelecionadoAcesso.id;

  if (!idParticipante) {

    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  if (!novoEmail && !novaSenha) {
    mostrarAlertaGlobal('❌ Informe email ou senha.');
    return;
  }

  mostrarSpinner();

  apiJSONP(
    "atualizarDadosAcessoParticipantePorId",
    {
      idParticipante,
      novoEmail,
      novaSenha
    },
    function(res) {

      esconderSpinner();

      if (res.sucesso) {

        mostrarAlertaGlobal('✅ Dados de acesso atualizados com sucesso.');

        consultarDadosAcesso();

      } else {
        mostrarAlertaGlobal(res.mensagem || '❌ Erro ao atualizar.');
      }

    },
    function(err) {

      esconderSpinner();
      mostrarAlertaGlobal('❌ Erro: ' + err.message);

    }
  );
}

/* FALTA MUITA COISA DO ÚLTIMO CÓDIGO*/








/* FALTA MUITA COISA DO ÚLTIMO CÓDIGO*/


function norm(s) {
  return (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

  window.todosNomesSimples = [];
  window.todosNomes = [];

function carregarOpcoes() {

  console.log("carregarOpcoes iniciou");

  apiJSONP("buscarOpcoesParaForm", {}, function(opcoes) {

    //console.log(opcoes);
    //console.log(opcoes.privilegios);

    window.mapaParticipantesPorNome = {};

    (opcoes.participantes || []).forEach(p => {
      window.mapaParticipantesPorNome[p.nome] = p.id;
    });

    const mapa = new Map();
    for (const n of (opcoes.pesquisar || [])) {
      const k = norm(n);
      if (k) mapa.set(k, n);
    }

    window.todosNomesSimples =
      Array.from(mapa.values()).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      );

    ligarFiltroAoSelect('filtroModalParticipantes', 'selectModalParticipantes', window.todosNomesSimples);
    ligarFiltroAoSelect('filtroBuscaTrei', 'listaNomesTrei', window.todosNomesSimples);

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

    window.opcoesPrivilegios = opcoes.privilegios || {};

  });

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

function carregarDadosDesignacao() {

  apiJSONP(
    "obterDadosFormulario",
    {},
    popularSelects,
    (err) => {
      mostrarAlertaGlobal("❌ Erro ao carregar dados: " + err.message);
    }
  );

}

function popularSelects(dados) {
  const { pontoCorrigir, pontos = [], participantes = [] } = dados;

  const pontoVcorrigir = document.getElementById('pontoCorrigir');
  const pontoSel = document.getElementById('ponto');
  const partSel = document.getElementById('participanteDesignacao');

  if (!pontoVcorrigir || !pontoSel || !partSel) return;

  // 🧹 Limpa selects
  pontoSel.innerHTML = "<option value=''>- Selecione -</option>";
  pontoVcorrigir.innerHTML = "<option value=''>- Sel Teste Corrigir -</option>";

  const regex = /^([A-Z]+)(\d+)$/i;

  // 🔍 Log para depuração
  //console.log("📋 Pontos recebidos:", pontos);

  // ✅ Ordena por número e prefixo
  const pontosOrdenados = pontos.slice().sort((a, b) => {
    const matchA = a.match(regex);
    const matchB = b.match(regex);
    if (!matchA || !matchB) return 0;

    const [, prefixA, numA] = matchA;
    const [, prefixB, numB] = matchB;

    const diffNum = parseInt(numA) - parseInt(numB);
    if (diffNum !== 0) return diffNum;

    const ordemPrefixos = ["A", "M", "MA", "MB", "T", "TA", "TB", "N"];
    const idxA = ordemPrefixos.indexOf(prefixA);
    const idxB = ordemPrefixos.indexOf(prefixB);
    if (idxA === -1 || idxB === -1) return prefixA.localeCompare(prefixB);
    return idxA - idxB;
  });

  //console.log("✅ Pontos ordenados:", pontosOrdenados);

  // ✅ Preenche selects com os pontos completos (ex: MA20, MB20)
  pontosOrdenados.forEach(p => {
    const opt1 = document.createElement('option');
    opt1.value = p;
    opt1.textContent = p;
    pontoSel.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = p;
    opt2.textContent = p;
    pontoVcorrigir.appendChild(opt2);
  });

  // ✅ Participantes
  partSel.innerHTML = '<option value="">-- Selecione para designar! --</option>';
  participantes.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    partSel.appendChild(opt);
  });

  // ✅ Popula selects de "Ponto X"
  const selPonto1 = document.getElementById('pontobepp');
  const selPonto2 = document.getElementById('pontoDesignado');
  const selPonto3 = document.getElementById('pontosParaOferecerSelect');
  const selPonto4 = document.getElementById('pontosParaOferecerSelectSub');
  const selPonto5 = document.getElementById('pontoSelectMap2');
  const selPonto6 = document.getElementById('pontosParaOferecerSelect2h');

  if (selPonto1 && selPonto2 && selPonto3 && selPonto4 && selPonto5 && selPonto6) {
    const numerosUnicos = new Set();

    pontosOrdenados.forEach(ponto => {
      const match = ponto.match(regex);
      if (match) {
        const num = parseInt(match[2], 10);
        if (!isNaN(num)) numerosUnicos.add(num);
      } else {
        console.warn("⚠️ Ponto ignorado (regex falhou):", ponto);
      }
    });

    const numerosOrdenados = Array.from(numerosUnicos).sort((a, b) => a - b);
    //console.log("📌 Números de ponto:", numerosOrdenados);

    numerosOrdenados.forEach(num => {
      const label = `Ponto ${num}`;
      [selPonto1, selPonto2, selPonto3, selPonto4, selPonto5, selPonto6].forEach(sel => {
        const opt = document.createElement('option');
        opt.value = label;
        opt.textContent = label;
        sel.appendChild(opt);
      });
    });
  }

  //console.log("🎯 Selects populados com sucesso.");
}

 async function atualizarParticipantesParaSubstituir() {

  const ponto = document.getElementById("ponto").value;
  const dia = document.getElementById("dia").value;

  if (!ponto || !dia) {
    limparSubstituirQuem();
    return;
  }

  apiJSONP(
    "buscarParticipantesParaSubstituir",
    {
      ponto,
      dia
    },
    function(participantesDesignados) {

      const select = document.getElementById("substituirQuem");
      select.innerHTML = '<option value="">-- Nenhum --</option>';

      (participantesDesignados || []).forEach(participante => {
        const option = document.createElement("option");
        option.value = participante.id;
        option.textContent = participante.nomeCompleto;
        select.appendChild(option);
      });

    },
    function(err) {

      console.error("❌ Erro ao buscar participantes designados:", err.message);

      limparSubstituirQuem();

    }
  );

}

function limparSubstituirQuem() {
  const select = document.getElementById("substituirQuem");
  select.innerHTML = '<option value="">-- Nenhum --</option>';
}

function carregarDadosVaga() {

  apiJSONP(
    "obterDadosFormulario",
    {},
    popularSelectsVaga,
    (err) => {
      mostrarAlertaGlobal("❌ Erro ao carregar dados: " + err.message);
    }
  );

}

function popularSelectsVaga(dados) {
  const { pontos, participantes } = dados;
  const pontoSel = document.getElementById('pontoVaga');
  if (!pontoSel) return;

  // ✅ Limpar o select e adicionar a primeira opção
  pontoSel.innerHTML = "<option value=''>- Selecione -</option>";

  // ✅ Ordenar os pontos no padrão desejado
  const pontosOrdenados = pontos.slice().sort((a, b) => {
    const regex = /^([A-Z]+)(\d+)$/i;
    const [, letraA, numA] = a.match(regex) || [];
    const [, letraB, numB] = b.match(regex) || [];

    const diffNum = parseInt(numA) - parseInt(numB);
    if (diffNum !== 0) return diffNum;

    return letraA.localeCompare(letraB, 'pt-BR');
  });

  // ✅ Adicionar os pontos ao select
  pontosOrdenados.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    pontoSel.appendChild(opt);
  });
}

function carregarOpcoesGenerica(inputId, selectId, metodoScript, listaKey = 'nomesCompletos') {

  apiJSONP(
    metodoScript,
    {},
    function(opcoes) {

      const listaObjetos = opcoes[listaKey] || [];

      const mapNomeParaId = new Map();

      listaObjetos.forEach(p => {
        if (typeof p === 'object' && p.nome && p.id) {
          mapNomeParaId.set(p.nome, p.id);
        }
      });

      window.todosNomes = listaObjetos.map(p => p.nome);

      window.todosNomes.sort((a, b) => {
        const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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

    },
    function(err) {

      mostrarAlertaGlobal(
        '❌ Erro ao carregar opções para participantes: ' + err.message
      );

    }
  );

}

function enviarPesquisaDireta(sexo, dia, turno) {

  if (!sexo || !dia || !turno) {
    mostrarAlertaGlobal("❌ Dados incompletos para buscar treinadores.");
    return;
  }

  mostrarSpinner();
  document.getElementById('resultadoContainer').innerHTML = '';

  apiJSONP(
    "listarTreinadoresComFiltroDireto",
    {
      sexo,
      dia,
      turno
    },
    function(res) {

      esconderSpinner();

      (res.logs || []).forEach(l => console.log(l));

      montarTabela(res.resultados, sexo, dia, turno);

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal("❌ Erro ao buscar treinadores: " + err.message);

    }
  );

}

function carregarAbas() {

  apiJSONP(
    "listarAbas",
    {},
    function(nomes) {

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

    },
    function(err) {

      mostrarAlertaGlobal("❌ Erro ao carregar abas: " + err.message);

    }
  );

}

function carregarResumo() {

  apiJSONP(
    "obterResumoTPEComPlanilha",
    {},
    function(resumo) {

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

    },
    function(err) {
      mostrarAlertaGlobal("❌ Erro ao carregar resumo: " + err.message);
    }
  );
}

function selecionarSubstituicaoDesignados(ponto, dia) {

  return new Promise((resolve) => {

    participanteSubstituido = null;
    window._resolveSubstituicao = resolve;

    apiJSONP(
      "buscarDesignadosNoPonto",
      {
        ponto,
        dia
      },
      function(lista) {

        esconderSpinner();

        renderizarDesignados(lista);

        document.getElementById("modalDesignados").style.display = "block";

      },
      function(err) {

        esconderSpinner();

        mostrarAlertaGlobal(err.message);

        resolve(null);

      }
    );

  });

}

function atualizarCondicaoDisponibilidadeUsuario(idParticipante) {

  mostrarSpinner();

  apiJSONP(
    "buscarTipoDisponibilidade",
    {
      //idParticipante
      id: idUsuarioLogado
    },
    function(dados) {

      esconderSpinner();

      const chk2 =
        document.getElementById("tipoDisponibilidade2h");

      const chk4 =
        document.getElementById("tipoDisponibilidade4h");

      const jtd =
        document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");

      const ss =
        document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");

      if (!chk2 || !chk4 || !jtd || !ss) return;

      // Limpa tudo
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

          if (dados.tipo === "2h") {
            chk2.checked = true;
          }

          if (dados.tipo === "4h") {
            chk4.checked = true;
          }

          break;
      }

      sincronizarCardsComSwitch();

    },
    function(err) {

      esconderSpinner();

      console.error(err);

    }
  );

}

  window.addEventListener('DOMContentLoaded', () => {
  const participante = document.getElementById('participante');
    if (participante) {
      const originalAppendChild = participante.appendChild;
      participante.appendChild = function(child) {
        return originalAppendChild.call(this, child);
      };
    }

    document.getElementById('ponto').addEventListener('change', atualizarParticipantesParaSubstituir);
    document.getElementById('dia').addEventListener('change', atualizarParticipantesParaSubstituir);
    document.getElementById('pontoVaga').addEventListener('change', atualizarParticipantesParaCadastrarVaga);
    document.getElementById('diaVaga').addEventListener('change', atualizarParticipantesParaCadastrarVaga);
    atualizarParticipantesParaCadastrarVaga();
    carregarTodasVagasAbertas();
    atualizarParticipantesParaSubstituir();
    carregarOpcoes();
    carregarOpcoesGenerica("filtroBusca1", "participante", "buscarOpcoesParaForm");
    carregarAbas();
    carregarAbasEv();
    carregarResumo();
    carregarOpcoesCongregacoes();

  });

  function criarOpcaoSelecione() {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '- Selecione -';
    return opt;
  }

  function renderizarListaGenerica(selectId, filtro, listaDeNomes) {
    const sel = document.getElementById(selectId);
    if (!sel) {

      return;
    }

    sel.innerHTML = '';

    const alvo = norm(filtro), com = [], cont = [];

    listaDeNomes.forEach(n => {
      const nn = norm(n);
      if (!alvo || nn.includes(alvo)) {
        if (alvo && nn.startsWith(alvo)) com.push(n);
        else cont.push(n);
      }
    });

    const res = com.concat(cont);

    if (!alvo || res.length === 0) {
      sel.appendChild(criarOpcaoSelecione());
      sel.value = '';
      return;
    }

    res.forEach(n => {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n;
      sel.appendChild(o);
    });

    sel.value = res[0];
  }

  function ligarFiltroAoSelect(inputId, selectId, lista) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    if (input && select) {
      input.addEventListener("input", () => {
        renderizarListaGenerica(selectId, input.value, lista);
      });
      renderizarListaGenerica(selectId, input.value, lista);
    }
  }

  function renderizarListaPara(inputId, selectId, listaDeNomes) {
    const input = document.getElementById(inputId);
    const sel = document.getElementById(selectId);

    sel.innerHTML = '';

    const filtro = norm(input.value);
    const com = [], cont = [];

    listaDeNomes.forEach(n => {
      const nn = norm(n);
      if (!filtro || nn.includes(filtro)) {
        if (filtro && nn.startsWith(filtro)) com.push(n);
        else cont.push(n);
      }
    });

    const resultado = com.concat(cont);

    if (!filtro) {
      sel.appendChild(criarOpcaoSelecione());
      resultado.forEach(n => {
        const o = document.createElement('option');
        o.value = n;
        o.textContent = n;
        sel.appendChild(o);
      });
      sel.value = '';

      if (selectId === 'participante') {
        valorSelecionadoParticipante = '';

      }
    }
    else if (resultado.length === 0) {
      sel.appendChild(criarOpcaoSelecione());
      sel.value = '';

      if (selectId === 'participante') {
        valorSelecionadoParticipante = '';

      }
    }
    else {
      resultado.forEach(n => {
        const o = document.createElement('option');
        o.value = n;
        o.textContent = n;
        sel.appendChild(o);
      });

      sel.value = resultado[0];

      if (selectId === 'participante') {
        valorSelecionadoParticipante = resultado[0];

      }
    }
  }

  function renderizarListaUser2h(filtro) {
    renderizarListaGenerica('nomeSelectUsuario2h', filtro, window.todosNomesSimples);
  }

  function renderizarListaUserIr(filtro) {
    renderizarListaGenerica('nomeSelectUsuarioIr', filtro, window.todosNomesSimples);
  }

  function renderizarListaUserSb(filtro) {
    renderizarListaGenerica('nomeSelectUsuarioSb', filtro, window.todosNomesSimples);
  }

  function renderizarListaUser(filtro) {
    renderizarListaGenerica('nomeSelectUsuario', filtro, window.todosNomesSimples);
  }
  
  function renderizarListaTrei(filtro) {
    renderizarListaGenerica('listaNomesTrei', filtro, window.todosNomesSimples);
  }

  function renderizarListaModal(filtro) {
    renderizarListaGenerica('selectModalParticipantes', filtro, window.todosNomesSimples);
  }

  function formatarDataBR(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function mostrarAlertaGlobal(mensagem) {
    const alerta = document.getElementById('alertaGlobal');
    const alertaMensagem = document.getElementById('alertaMensagem');
    const botaoOk = document.getElementById('alertaBotaoOk');

    alertaMensagem.textContent = mensagem;
    alerta.classList.remove('oculto');

    botaoOk.onclick = () => {
      alerta.classList.add('oculto');
    };
  }

  function mostrarConfirmacaoGlobal(mensagem, onConfirmar) {
    const alerta = document.getElementById('confirmacaoGlobal');
    const alertaMensagem = document.getElementById('confirmacaoMensagem');
    const botaoOk = document.getElementById('confirmacaoBotaoOk');
    const botaoCancelar = document.getElementById('confirmacaoBotaoCancelar');

    alertaMensagem.innerHTML = mensagem;

    botaoOk.textContent = 'Confirmar';
    botaoCancelar.textContent = 'Cancelar';

    botaoOk.style.display = 'inline-block';
    botaoCancelar.style.display = 'inline-block';

    alerta.classList.remove('oculto');

    botaoOk.onclick = () => {
      alerta.classList.add('oculto');
      botaoOk.textContent = 'Confirmar';
      botaoCancelar.textContent = 'Cancelar';
      onConfirmar();
    };

    botaoCancelar.onclick = () => {
      alerta.classList.add('oculto');
      botaoOk.textContent = 'Confirmar';
      botaoCancelar.textContent = 'Cancelar';
    };
  }

  function mostrarSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'flex';
  }

  function esconderSpinner() {
    document.getElementById('spinnerGlobal').style.display = 'none';
  }

  window.onload=function(){
  };

  function formatarNomeComNegrito(nome) {
    if (!nome) return "";
    const linhas = nome.split('\n');
    const primeira = `<strong>${linhas[0]}</strong>`;
    const restante = linhas.slice(1).join('<br>');
    return restante ? `${primeira}<br>${restante}` : primeira;
  }

function abrirCadastroEvento() {

    document.querySelector(
      '[onclick*="abrirTela(\'eventos\'"]'
    )?.click();
}

function exibirVoltar() {
    document.getElementById('menuCards').classList.add('oculto');
    document.getElementById('btnVoltarMenu').classList.remove('oculto');
}

const historico = [];
let telaAtual = 'menuCards';

function abrirTela(idTela, card = null) {

    if (telaAtual) {
        historico.push(telaAtual);
    }

    document.querySelectorAll('.tela').forEach(el => {
        el.classList.remove('aberta');
    });

    document.getElementById(idTela)
        ?.classList.add('aberta');

    telaAtual = idTela;

    document.querySelectorAll('.card-menu')
        .forEach(c => c.classList.remove('ativo'));

        switch (telaAtual) {

          case "telaUsuarioLogado":
            atualizarCondicaoDisponibilidadeUsuario(idUsuarioLogado)
            break;

          case "disponibilidadeContainerUsuarioLogado2h":
            abrirCalendario2h();
            break;

          case "disponibilidadeContainerUsuarioLogado4h":
            abrirCalendario4h();
            break;

        }

    atualizarBotaoVoltar();

}

function voltar() {

    if (historico.length === 0) return;

    document.querySelectorAll('.tela').forEach(el => {
        el.classList.remove('aberta');
    });

    telaAtual = historico.pop();

    [
        "tipoDisponibilidade2h",
        "tipoDisponibilidade4h"
    ].forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.checked = false;
        }

    });

    //console.log("Tela recuperada:", telaAtual);

    document.getElementById(telaAtual)
        ?.classList.add('aberta');

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

function restaurarCamposPerfil() {

    [
        //"listaNomesDisponibilidade",
        //"listaNomesDisponibilidadeNovoPonto20",
        //"listaNomesEv"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "";
    });

    [
        //"filtroBuscaDisponibilidade",
        //"filtroBuscaDisponibilidadeNovoPonto20",
        //"filtroBuscaEv"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "";
    });

    [
        "btnPesqMinhaInfo",
        "btnPesqDisp",
        "btnPesqDispNovoPonto20"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "";
    });
}

function limparCamposUsuario() {

    document.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="password"]').forEach(el => {
        el.value = '';
    });

    document.querySelectorAll('textarea').forEach(el => {
        el.value = '';
    });

    [
        //'listaNomesDisponibilidade',
        //'listaNomesDisponibilidadeNovoPonto20',
        //'listaNomesEv'
    ].forEach(id => {

        const select = document.getElementById(id);

        if (select) {
            select.innerHTML = '<option value="">- Selecione -</option>';
        }

    });

    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        el.checked = false;
    });

    document.querySelectorAll('input[type="radio"]').forEach(el => {
        el.checked = false;
    });

    document.querySelectorAll('.mensagem-verde, .mensagem-vermelha').forEach(el => {
        el.textContent = '';
    });
}

window.contextoModalParticipantes = "";

function abrirSelecao2horas() {

  window.destinoModalParticipantes = "duasHoras";
   
  abrirModalParticipantes();
}

function abrirSelecao4horas() {

  window.destinoModalParticipantes = "quatroHoras";

  abrirModalParticipantes();
}

function abrirSelecaoInscreverOutro() {

  window.destinoModalParticipantes = "inscreverOutro";

  abrirModalParticipantes();
}

function abrirSelecaoCandidatoTreinamentoPratico() {

  window.destinoModalParticipantes = "candidatosTreinamentoPratico";

  abrirModalParticipantes();
}

function abrirSelecaoParticipante() {

  window.destinoModalParticipantes = "pesqPartc";
   
  abrirModalParticipantes();
}

function abrirSelecaoTcs() {

  window.destinoModalParticipantes = "selecaoTcs";
   
  abrirModalParticipantes();
}

function abrirSelecaoPerfil() {

  window.destinoModalParticipantes = "selecaoPerfil";
   
  abrirModalParticipantes();
}

function abrirSelecaoAcesso() {

  window.destinoModalParticipantes = "selecaoAcesso";
   
  abrirModalParticipantes();
}

function abrirSelecaoDesignacao() {

  window.destinoModalParticipantes = "designacao";

  abrirModalParticipantes();
}

function abrirSelecaoTrocaDesignacao() {

  window.destinoModalParticipantes = "trocaDesignacao";

  abrirModalParticipantes();
}

function confirmarSelecaoParticipante() {

  const nome =
    document.getElementById("selectModalParticipantes")?.value;

  if (!nome) {
    mostrarAlertaGlobal("⚠️ Selecione um participante.");
    return;
  }

  const id =
    window.mapaParticipantesPorNome?.[nome];

  if (!id) {
    mostrarAlertaGlobal("❌ ID não encontrado.");
    return;
  }

  switch (window.destinoModalParticipantes) {

    case "selecaoPerfil":

      participanteSelecionadoPerfil = {
        nome,
        id
      };

      document.getElementById("nomeSelecionadoPerfil").value = nome;

      consultarPerfilAtual();

      break;

    case "selecaoAcesso":

      participanteSelecionadoAcesso = {
        nome,
        id
      };

      document.getElementById("nomeSelecionadoAcesso").value = nome;

      consultarDadosAcesso();

      break;

    case "selecaoTcs":

      participanteSelecionadoTcs = {
        nome,
        id
      };

      document.getElementById("participanteTcs").textContent = nome;

      pesquisarTcs();

      break;

    case "duasHoras":

      participanteSelecionado2horas = {
        nome,
        id
      };

      document.getElementById("duasHoras").textContent = nome;

      pesquisarDisponibilidadeNovoPonto20();

      break;

    case "quatroHoras":

      participanteSelecionado4horas = {
        nome,
        id
      };

      document.getElementById("quatroHoras").textContent = nome;

      pesquisarDisponibilidade();

      break;

    case "inscreverOutro":

      participanteSelecionadoInscreverOutro = {
        nome,
        id
      };

      document.getElementById("candidatoEvSelecionado").textContent = nome;

      inscreverParticipanteAdmin();

      break;

    case "candidatosTreinamentoPratico":

      participanteSelecionadoTreinamentoPratico = {
        nome,
        id
      };

      document.getElementById("candidatoTreinamentoPratico").textContent = nome;

      pesquisarTP();

      break;

    case "pesqPartc":

      participanteSelecionadoEditar = {
        nome,
        id
      };

      document.getElementById("pesqPart").textContent = nome;

      pesquisarParticipante();

      break;

      case "designacao":

      participanteSelecionadoDesignacao = {
        nome,
        id
      };

      document.getElementById("participanteDesignacao").value = nome;

      break;

      case "trocarDesignacao":

      participanteSelecionadoTrocaDesignacao = {
        nome,
        id
      };

      document.getElementById("troca").value = nome;

      break;
  }

  fecharModalParticipantes();
}

let participanteSelecionadoEditar = null;
let participanteSelecionadoTreinamentoPratico = null;
let participanteSelecionadoInscreverOutro = null;
let participanteSelecionado2horas = null;
let participanteSelecionado4horas = null;
let participanteSelecionadoTcs = null;
let participanteSelecionado = null;
let participanteSelecionadoPerfil = null;
let participanteSubstituido = null;
let participanteSelecionadoDesignacao = null;
let modalSubstituicaoResolvido = false;
let participanteSelecionadoGP = null;
let acaoModalEditarDisponibilidade = null;
let abrirModalDepoisDaPesquisa = false;

function renderizarDesignados(lista) {

  const div = document.getElementById("listaDesignados");
  div.innerHTML = "";

  lista.forEach(p => {

    const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = p.nome;
      botao.classList.add("botao-participante-modal");

      botao.onclick = () => {

          participanteSubstituido = p;

          document.getElementById("nomeSubstituido").value = p.nome;

          fecharModalDesignados();

          if (window._resolveSubstituicao) {
              window._resolveSubstituicao(p);
          }
      };

      div.appendChild(botao);
  });
}

function confirmarNenhumDesignados() {

  participanteSubstituido = null;

  document.getElementById("nomeSubstituido").value = "";

  fecharModalDesignados();

  if (window._resolveSubstituicao) {
    window._resolveSubstituicao(null);
  }
}

function fecharModalDesignados(){

    document.getElementById(
        "modalDesignados"
    ).style.display = "none";

}

function possuiDisponibilidadeCadastrada(dados) {

  if (!dados) return false;

  const condicao =
    String(dados.condicao || "").trim();

  const frequencia =
    String(dados.frequencia || "").trim();

  const diasTurnos =
    Array.isArray(dados.diasTurnos)
      ? dados.diasTurnos
      : [];

  return (
    condicao !== "" ||
    frequencia !== "" ||
    diasTurnos.length > 0
  );
}

function selecionarModoDisponibilidade(origem) {

    const jtd = document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");
    const ss  = document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");
    const h2  = document.getElementById("tipoDisponibilidade2h");
    const h4  = document.getElementById("tipoDisponibilidade4h");

    jtd.checked = false;
    ss.checked  = false;
    h2.checked  = false;
    h4.checked  = false;

    origem.checked = true;

    sincronizarCardsComSwitch();
}

function sincronizarCardsComSwitch() {

    const jtd = document.getElementById("jaTenhoDesignacaoIDnaTelaInicialMinhaDisponibilidade");
    const ss  = document.getElementById("somenteSubstituicaoIDnaTelaInicialMinhaDisponibilidade");
    const h2  = document.getElementById("tipoDisponibilidade2h");
    const h4  = document.getElementById("tipoDisponibilidade4h");

    const card2h = document.getElementById("card2h");
    const card4h = document.getElementById("card4h");

    card2h.classList.remove("card-habilitado","card-desabilitado", "card-ativo-azul");
    card4h.classList.remove("card-habilitado","card-desabilitado", "card-ativo-roxo");

    if (jtd.checked) {

        card2h.classList.add("card-desabilitado");
        card4h.classList.add("card-desabilitado");
        card2h.classList.remove("card-ativo-azul");
        card4h.classList.remove("card-ativo-roxo");
        return;
    }

    if (ss.checked) {

        card2h.classList.add("card-desabilitado");
        card4h.classList.add("card-desabilitado");
        card2h.classList.remove("card-ativo-azul");
        card4h.classList.remove("card-ativo-roxo");
        return;
    }

    if (h2.checked) {

        card2h.classList.add("card-habilitado");
        card4h.classList.add("card-desabilitado");
        card2h.classList.add("card-ativo-azul");
        card4h.classList.remove("card-ativo-roxo");
        return;
    }

    if (h4.checked) {

        card2h.classList.add("card-desabilitado");
        card4h.classList.add("card-habilitado");
        card2h.classList.remove("card-ativo-azul");
        card4h.classList.add("card-ativo-roxo");
        return;
    }

    card2h.classList.add("card-desabilitado");
    card4h.classList.add("card-desabilitado");
    card2h.classList.remove("card-ativo-azul");
    card4h.classList.remove("card-ativo-roxo");
}

function renderizarDisponibilidade(dados, cfg) {

  /*console.log("condição:", dados.condicao);
  console.log("frequência:", dados.frequencia);
  console.log("dias:", dados.diasTurnos);*/

  const chkSubstituicao =
    document.getElementById(cfg.chkSubstituicao);

  const chkDesignado =
    document.getElementById(cfg.chkDesignado);

  const frequencia =
    document.getElementById(cfg.frequencia);

  const checkboxes =
    document.querySelectorAll(cfg.checkboxes);

  if (!chkSubstituicao || !chkDesignado) return;

  chkSubstituicao.checked = false;
  chkDesignado.checked = false;

  if (frequencia) {
    frequencia.value = dados.frequencia || "";
    frequencia.disabled = possuiDisponibilidadeCadastrada(dados);
  }

  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.disabled = true;
  });

  if (!possuiDisponibilidadeCadastrada(dados)) {
    return;
  }

  const condicao =
    String(dados.condicao || "")
      .trim()
      .toLowerCase();

  if (condicao === "somente substituição") {
    chkSubstituicao.checked = true;
    return;
  }

  if (condicao === "já possui designação") {
    chkDesignado.checked = true;
    return;
  }

  if (Array.isArray(dados.diasTurnos)) {

    dados.diasTurnos.forEach(item => {

      console.log("--------------------------------");
      console.log("Item recebido:", item);

      const partes = item.split(" - ");
      if (partes.length !== 2) {
        console.warn("Formato inválido:", item);
        return;
      }

      const dia = partes[0];
      const turno = partes[1];

      console.log("Procurando checkbox:");
      console.log("Dia:", dia);
      console.log("Turno:", turno);

      console.log("Checkboxes encontrados:");

      checkboxes.forEach(cb => {
        console.log({
          id: cb.id,
          value: cb.value,
          dataDia: cb.dataset.diaU,
          dataTurno: cb.dataset.turnoU,
          classe: cb.className
        });
      });

      const checkbox = Array.from(checkboxes).find(cb =>
        norm(cb.dataset.diaU ?? cb.dataset.diaId) === norm(dia) &&
        norm(cb.dataset.turnoU ?? cb.dataset.turnoId) === norm(turno)
      );

      console.log("Checkbox encontrado:", checkbox);

      if (checkbox) {
        checkbox.checked = true;
        console.log("✅ Marcado:", checkbox.id);
      } else {
        console.warn(
          `❌ Nenhum checkbox encontrado para Dia="${dia}" Turno="${turno}"`
        );
      }

    });

  }

}

function renderizarDisponibilidadeBase(dados, cfg) {

  /*console.log("condição:", dados.condicao);
  console.log("frequência:", dados.frequencia);
  console.log("dias:", dados.diasTurnos);*/

  const chkSubstituicao =
    document.getElementById(cfg.chkSubstituicao);

  const chkDesignado =
    document.getElementById(cfg.chkDesignado);

  const frequencia =
    document.getElementById(cfg.frequencia);

  const checkboxes =
    document.querySelectorAll(cfg.checkboxes);

  if (chkSubstituicao) chkSubstituicao.checked = false;
  if (chkDesignado) chkDesignado.checked = false;

  if (frequencia) {
    frequencia.value = dados.frequencia || "";

    frequencia.disabled = possuiDisponibilidadeCadastrada(dados);
  }

  checkboxes.forEach(cb => {
    cb.checked = false;
    cb.disabled = true;
  });

  if (!possuiDisponibilidadeCadastrada(dados)) {
    return;
  }

  const condicao =
    String(dados.condicao || "")
      .trim()
      .toLowerCase();

  if (condicao === "somente substituição") {
    if (chkSubstituicao) chkSubstituicao.checked = true;
    return;
  }

  if (condicao === "já possui designação") {
    if (chkDesignado) chkDesignado.checked = true;
    return;
  }

  if (frequencia) {
    frequencia.value = dados.frequencia || "";

    frequencia.disabled = possuiDisponibilidadeCadastrada(dados);
  }

  if (Array.isArray(dados.diasTurnos)) {

    dados.diasTurnos.forEach(item => {

      const partes = item.split(" - ");
      if (partes.length !== 2) return;

      const dia = partes[0];
      const turno = partes[1];

      const checkbox = Array.from(checkboxes).find(cb =>
        norm(cb.dataset.dia ?? cb.dataset.diaN) === norm(dia) &&
        norm(cb.dataset.turno ?? cb.dataset.turnoN) === norm(turno)
      );

      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }
}

function abrirModalEditarDisponibilidade(funcao) {

    acaoModalEditarDisponibilidade = funcao;

    document
        .getElementById("modalEditarDisponibilidade")
        .classList.add("aberto");
}

function fecharModalEditarDisponibilidade() {

    document
        .getElementById("modalEditarDisponibilidade")
        .classList.remove("aberto");
}

function executarAcaoModalEditarDisponibilidade() {

    fecharModalEditarDisponibilidade();

    if (typeof acaoModalEditarDisponibilidade === "function") {
        acaoModalEditarDisponibilidade();
    }
}

//MEU TREINAMENTO PRÁTICO x
function consultarMeuTreinamento() {

  //console.log("🔥 consultarMeuTreinamento INICIOU");

  mostrarSpinner();

  apiJSONP(
    "consultarMeuTreinamento",
    {
      id: idUsuarioLogado
    },

    function(res) {
      
      //console.log("🔥 RESPOSTA CHEGOU:", res);

      esconderSpinner();

      if (!res || res.sucesso === false) {
        mostrarAlertaGlobal(res?.mensagem || "Sem dados");
        return;
      }

      const container =
        document.getElementById(
          'resultadoMeuTreinamento'
        );

      container.innerHTML = '';

      if (!res.sucesso) {

        mostrarAlertaGlobal(
          res.mensagem
        );

        return;
      }

      const tabela = document.createElement('table');
      tabela.classList.add('tabela-listagem');

      const thead =
        tabela.createTHead();

      const trHead =
        thead.insertRow();

      [
        'Nome',
        'Cong.',
        'Contato',
        'Ação'
      ].forEach(texto => {

        const th =
          document.createElement('th');

        th.textContent = texto;

        trHead.appendChild(th);

      });

      const tbody =
        tabela.createTBody();

      const tr =
        tbody.insertRow();

      tr.insertCell().textContent =
        res.nome;

      tr.insertCell().textContent =
        res.congregacao;

      tr.insertCell().textContent =
        res.telefone;

      const tdAcao =
        tr.insertCell();

      const btnAcoes =
        document.createElement('button');

      btnAcoes.textContent =
        '✅Concluir';

      btnAcoes.classList.add(
        'concluir-meu-treinamento'
      );

      btnAcoes.style.cursor =
        'pointer';

      btnAcoes.dataset.idTreinando =
        res.idTreinando;

      btnAcoes.dataset.idTreinador =
        idUsuarioLogado;

      btnAcoes.dataset.nomeTreinando =
        res.nome;

      tdAcao.appendChild(btnAcoes);

      container.appendChild(
        tabela
      );

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal(
        err.message
      );

    }
  );

}
document.addEventListener('click', function(e) {

  if (e.target.classList.contains('concluir-meu-treinamento')) {

    const modal =
      document.getElementById('modalAcoesTreinador');

    modal.dataset.idTreinando =
      e.target.dataset.idTreinando;

    modal.dataset.idTreinador =
      e.target.dataset.idTreinador;

    modal.dataset.nomeTreinando =
      e.target.dataset.nomeTreinando;

    modal.classList.remove('oculto');
  }

});

document
  .getElementById('acaoConcluirTreinador')
  .addEventListener('click', async function () {

    const modal =
      document.getElementById('modalAcoesTreinador');

    const nomeTreinando =
      modal.dataset.nomeTreinando;

    const confirmou =
      await confirmarDecisao(
        `Confirmar conclusão do treinamento de <b>${nomeTreinando}</b>?`,
        'Concluir',
        'Cancelar'
      );

    if (!confirmou) return;

    const idTreinando =
      modal.dataset.idTreinando;

    const idTreinador =
      modal.dataset.idTreinador;

    mostrarSpinner();

    apiJSONP(
      "concluirTreinamento",
      {
        idTreinando,
        idTreinador
      },
      function(res) {

        esconderSpinner();

        fecharModalAcoesTreinador();

        if (!res.sucesso) {
          mostrarAlertaGlobal(res.mensagem);
          return;
        }

        const modalAdmin =
          document.getElementById(
            'modalComunicarAdministrador'
          );

        modalAdmin.dataset.tipo = 'CONCLUSAO';
        modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
        modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
        modalAdmin.dataset.dataHora = res.dataHora;

        modalAdmin.classList.remove('oculto');

        consultarMeuTreinamento();

      },
      function(err) {

        esconderSpinner();

        mostrarAlertaGlobal('❌ ' + err.message);

      }
    );

  });

  document
  .getElementById('acaoDesistenciaTreinador')
  .addEventListener('click', async function () {

    const modal =
      document.getElementById('modalAcoesTreinador');

    const nomeTreinando =
      modal.dataset.nomeTreinando;

    const confirmou =
      await confirmarDecisao(
        `Confirma registrar a desistência de <b>${nomeTreinando}</b>?`,
        'Sim',
        'Cancelar'
      );

    if (!confirmou) return;

    const idTreinando =
      modal.dataset.idTreinando;

    const idTreinador =
      modal.dataset.idTreinador;

    mostrarSpinner();

    apiJSONP(
      "marcarDesistenciaTreinamento",
      {
        idTreinando,
        idTreinador
      },
      function(res) {

        esconderSpinner();

        fecharModalAcoesTreinador();

        if (!res.sucesso) {
          mostrarAlertaGlobal(res.mensagem);
          return;
        }

        const modalAdmin =
          document.getElementById(
            'modalComunicarAdministrador'
          );

        modalAdmin.dataset.tipo = 'DESISTENCIA';
        modalAdmin.dataset.nomeTreinador = res.nomeTreinador;
        modalAdmin.dataset.nomeTreinando = res.nomeTreinando;
        modalAdmin.dataset.dataHora = res.dataHora;

        modalAdmin.classList.remove('oculto');

        consultarMeuTreinamento();

      },
      function(err) {

        esconderSpinner();

        mostrarAlertaGlobal('❌ ' + err.message);

      }
    );

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

function comunicarAdministrador() {

  const modal =
    document.getElementById(
      'modalComunicarAdministrador'
    );

  const tipo =
    modal.dataset.tipo;

  const nomeTreinador =
    modal.dataset.nomeTreinador;

  const nomeTreinando =
    modal.dataset.nomeTreinando;

  const dataHora =
    modal.dataset.dataHora;

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

  apiJSONP(
    "gerarLinkWhatsAppAdministrador",
    {
      mensagem: mensagemAdmin
    },
    function(url) {

      window.open(url, '_blank');

      fecharModalAdministrador();

    },
    function(err) {

      mostrarAlertaGlobal(err.message);

    }
  );

}

function verificarTreinamentoPendente() {

  apiJSONP(
    "verificarTreinamentoPendente",
    {
      idUsuarioLogado
    },
    function(res) {

      if (!res.possuiTreinamento) {
        return;
      }

      mostrarAlertaGlobal(

        '🎓 Você possui um treinamento pendente com o candidato:\n\n' +

        res.nome +

        '\n\nAcesse "Meus Treinamentos" para concluir o processo após realizar o treinamento.'

      );

    },
    function(err) {

      console.error(err);

    }
  );

}

function fecharModalAcoesTreinador() {
  document
    .getElementById('modalAcoesTreinador')
    .classList.add('oculto');
}

let irregularesEncontrados = [];

function buscarIrregulares() {

  const resultadoDiv =
    document.getElementById('resultadoIrregulares');

  const msg =
    document.getElementById('msgIrregulares') || { textContent: () => {} };

  resultadoDiv.innerHTML = '';

  mostrarSpinner();

  apiJSONP(
    "buscarIrregulares",
    {},
    function(lista) {

      esconderSpinner();

      irregularesEncontrados = lista;

      if (!lista || lista.length === 0) {
        mostrarAlertaGlobal("❌ Nenhum participante irregular encontrado.");
        return;
      }

      if (msg) {
        msg.textContent = `✅ ${lista.length} irregular(es) encontrado(s).`;
      }

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
          : JSON.stringify(
              (item.diasTurnos || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            );

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

      document.getElementById('dadosUsuarioContainerIr')
        .style.display = 'inline-block';

      document.getElementById('enviarEmailIrregularesBtn')
        .style.display = "inline-block";

    },
    function(err) {

      esconderSpinner();

      mostrarAlertaGlobal("❌ Erro na busca: " + err.message);

    }
  );

}

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

  document
  .getElementById('enviarEmailIrregularesBtn')
  .addEventListener('click', function () {

    if (!irregularesEncontrados || irregularesEncontrados.length === 0) {
      mostrarAlertaGlobal(
        "⚠️ Nenhum participante irregular encontrado para envio de e-mail."
      );
      return;
    }

    const telefone =
      document.getElementById('telefoneInputUsuarioIr').value.trim();

    const email =
      document.getElementById('emailInputUsuarioIr').value.trim();

    const nomeUsuarioAtual =
      document.getElementById('nomeSelectUsuarioIr').value;

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

        const nomes =
          irregularesEncontrados.map(p => p.nome);

        apiJSONP(
          "enviarEmailParaIrregularesComUsuario",
          {
            nomes,
            nomeUsuarioAtual,
            assunto,
            mensagemBase
          },
          function () {

            esconderSpinner();

            mostrarAlertaGlobal(
              "✅ E-mails enviados com sucesso!"
            );

          },
          function (err) {

            esconderSpinner();

            mostrarAlertaGlobal(
              `❌ Erro ao enviar e-mails: ${err.message}`
            );

          }
        );

      }
    );

  });

  document.getElementById('nomeInputUsuarioIr').addEventListener('input', function () {

    setTimeout(() => {
      const nomeSelecionado = document.getElementById('nomeSelectUsuarioIr').value;

      if (nomeSelecionado) {
        pegarContatosDoUsuarioIr(nomeSelecionado);
      } else {
        console.warn("⚠️ Nenhum nome selecionado no select após digitar.");
      }
    }, 300); // 300ms costuma ser suficiente
  });

  function pegarContatosDoUsuarioIr(nome) {

  mostrarSpinner();

  apiJSONP(
    "pegarContatoUsuario",
    {
      nome
    },
    function(contato) {

      esconderSpinner();

      if (contato) {

        const telefoneInput =
          document.getElementById('telefoneInputUsuarioIr');

        const emailInput =
          document.getElementById('emailInputUsuarioIr');

        const nomeSelect =
          document.getElementById('nomeSelectUsuarioIr');

        telefoneInput.value = contato.telefone || '';
        emailInput.value = contato.email || '';

        telefoneInput.disabled = true;
        emailInput.disabled = true;
        nomeSelect.disabled = true;

        const container =
          document.querySelector('#dadosUsuarioContainerIr > div[style*="display: none"]');

        if (container) {
          container.style.display = 'block';
        } else {
          esconderSpinner();
        }

      } else {

        esconderSpinner();
        console.warn("⚠️ Nenhum contato retornado.");

      }

    },
    function(erro) {

      esconderSpinner();
      console.error("❌ Erro ao buscar contato do usuário:", erro.message);

    }
  );

}

