// ============================================================
// INVENTÁRIO — TIPOS DE EQUIPAMENTOS
// ============================================================
/*function novoTipoEquipamentoFrontend() {

  limparFormularioTipoEquipamento();

  document
    .getElementById(
      "formularioTipoEquipamento"
    )
    .style.display = "block";


  document
    .getElementById(
      "tituloFormularioTipoEquipamento"
    )
    .textContent =
      "➕ Novo tipo de equipamento";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Cadastrar";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .focus();

}*/
function novoTipoEquipamentoFrontend() {

  abrirModalFormularioInventario(
    "➕ Novo tipo de equipamento",
    obterHTMLFormularioTipoEquipamento()
  );


  document
    .getElementById(
      "tipoEquipamento"
    )
    .focus();

}

// ============================================================
// NOVO EQUIPAMENTO
// ============================================================
function novoEquipamentoFrontend() {

  abrirModalFormularioInventario(
    "➕ Novo equipamento",
    obterHTMLFormularioEquipamento()
  );


  carregarTiposParaCadastroEquipamentoFrontend();

  carregarDepositosParaCadastroEquipamentoFrontend();

}

function carregarTiposParaCadastroEquipamentoFrontend() {

  const select =
    document.getElementById(
      "idTipoEquipamentoCadastro"
    );

  if (!select) {
    return;
  }


  apiJSONP(
    "listarTiposEquipamento",
    {
      idParticipante:
        idUsuarioLogado,

      incluirInativos:
        false
    },

    function(res) {

      if (!res || !res.sucesso) {

        select.innerHTML =
          '<option value="">Erro ao carregar tipos</option>';

        return;
      }


      select.innerHTML =
        '<option value="">- Selecione -</option>';


      (res.tipos || []).forEach(
        function(tipo) {

          const option =
            document.createElement("option");

          option.value =
            tipo.idTipo;

          option.textContent =
            tipo.tipo;

          select.appendChild(option);

        }
      );

    },

    function(erro) {

      console.error(
        "Erro ao carregar tipos:",
        erro
      );

      select.innerHTML =
        '<option value="">Erro ao carregar tipos</option>';

    }
  );

}

function carregarDepositosParaCadastroEquipamentoFrontend() {

  const select =
    document.getElementById(
      "depositoEquipamento"
    );

  if (!select) {
    return;
  }


  apiJSONP(
    "listarDepositos",
    {
      idUsuarioLogado:
        idUsuarioLogado,

      incluirInativos:
        false
    },

    function(res) {

      if (!res || !res.sucesso) {

        select.innerHTML =
          '<option value="">Erro ao carregar depósitos</option>';

        return;
      }


      select.innerHTML =
        '<option value="">- Selecione -</option>';


      (res.depositos || []).forEach(
        function(deposito) {

          const option =
            document.createElement("option");

          option.value =
            deposito.idDeposito;

          option.textContent =
            deposito.nome;

          select.appendChild(option);

        }
      );

    },

    function(erro) {

      console.error(
        "Erro ao carregar depósitos:",
        erro
      );

      select.innerHTML =
        '<option value="">Erro ao carregar depósitos</option>';

    }
  );

}

function salvarEquipamentoFrontend() {

  const idTipo =
    document
      .getElementById(
        "idTipoEquipamentoCadastro"
      )
      .value
      .trim();


  const descricao =
    document
      .getElementById(
        "descricaoEquipamento"
      )
      .value
      .trim();


  const idDeposito =
    document
      .getElementById(
        "depositoEquipamento"
      )
      .value
      .trim();


  const observacoes =
    document
      .getElementById(
        "observacoesEquipamento"
      )
      .value
      .trim();


  if (!idTipo) {

    mostrarAlertaGlobal(
      "⚠️ Selecione o tipo de equipamento."
    );

    return;
  }


  if (!idDeposito) {

    mostrarAlertaGlobal(
      "⚠️ Selecione o depósito."
    );

    return;
  }


  mostrarSpinner();


  apiJSONP(
    "cadastrarEquipamento",
    {

      idUsuarioLogado:
        idUsuarioLogado,

      idTipo:
        idTipo,

      descricao:
        descricao,

      idDeposito:
        idDeposito,

      observacoes:
        observacoes

    },

    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível cadastrar o equipamento."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Equipamento cadastrado com sucesso."
      );


      fecharModalFormularioInventario();


      // Se já existir uma função para
      // atualizar a lista de equipamentos,
      // chamaremos aqui.

    },

    function(erro) {

      esconderSpinner();


      console.error(
        "Erro ao cadastrar equipamento:",
        erro
      );


      mostrarAlertaGlobal(
        "⚠️ Erro ao cadastrar o equipamento."
      );

    }
  );

}




// ============================================================
// CARREGAR TIPOS
// ============================================================

function carregarTiposEquipamentosFrontend() {

  mostrarSpinner();

  const container =
    document.getElementById(
      "listaTiposEquipamentos"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    '<div class="aviso-inventario">Carregando...</div>';


  apiJSONP(
    "listarTiposEquipamento",
    {
      idParticipante: idUsuarioLogado,
      incluirInativos: "true"
    },
    function(res) {

      esconderSpinner();

      if (!res || !res.sucesso) {

        container.innerHTML =
          '<div class="aviso-inventario">⚠️ ' +
          (res?.mensagem ||
            "Não foi possível carregar os tipos.") +
          '</div>';

        return;
      }


      renderizarTiposEquipamentos(
        res.tipos || []
      );

    },
    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao listar tipos de equipamentos:",
        erro
      );

      container.innerHTML =
        '<div class="aviso-inventario">' +
        '⚠️ Erro ao carregar os tipos de equipamentos.' +
        '</div>';
    }
  );
}


// ============================================================
// RENDERIZA LISTA
// ============================================================

function renderizarTiposEquipamentos(
  tipos
) {

  const container =
    document.getElementById(
      "listaTiposEquipamentos"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!tipos.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhum tipo de equipamento cadastrado.' +
      '</div>';

    return;
  }


  tipos.forEach(function(tipo) {

    const card =
      document.createElement("div");

    card.className =
      "card-tipo-equipamento";


    const ativo =
      String(tipo.ativo || "")
        .trim()
        .toUpperCase();


    card.innerHTML = `

      <div class="card-tipo-equipamento-topo">

        <div>

          <div class="nome-tipo-equipamento">
            ${escaparHTML(tipo.tipo || "")}
          </div>

          <div class="id-tipo-equipamento">
            ${escaparHTML(tipo.idTipo || "")}
          </div>

        </div>

        <div class="status-tipo-equipamento">
          ${ativo === "SIM" ? "● ATIVO" : "○ INATIVO"}
        </div>

      </div>


      <div class="descricao-tipo-equipamento">

        ${escaparHTML(
          tipo.descricao || "Sem descrição."
        )}

      </div>


      ${
        tipo.observacoes
          ? `
            <div class="observacoes-tipo-equipamento">
              ${escaparHTML(tipo.observacoes)}
            </div>
          `
          : ""
      }


      <div class="acoes-tipo-equipamento">

        <button
          type="button"
          onclick='editarTipoEquipamentoFrontend(
            ${JSON.stringify(tipo)}
          )'
        >
          ✏️ Editar
        </button>

      </div>

    `;


    container.appendChild(card);

  });
}


// ============================================================
// SALVAR / ALTERAR
// ============================================================
/*function salvarTipoEquipamentoFrontend() {

  const idTipo =
    document
      .getElementById(
        "idTipoEquipamento"
      )
      .value
      .trim();


  const tipo =
    document
      .getElementById(
        "tipoEquipamento"
      )
      .value
      .trim();


  const descricao =
    document
      .getElementById(
        "descricaoTipoEquipamento"
      )
      .value
      .trim();


  const observacoes =
    document
      .getElementById(
        "observacoesTipoEquipamento"
      )
      .value
      .trim();


  if (!tipo) {

    mostrarAlertaGlobal(
      "⚠️ Informe o tipo de equipamento."
    );

    return;
  }


  if (!descricao) {

    mostrarAlertaGlobal(
      "⚠️ Informe a descrição do equipamento."
    );

    return;
  }


  mostrarSpinner();


  // ----------------------------------------------------------
  // ALTERAÇÃO
  // ----------------------------------------------------------

  if (idTipo) {

    apiJSONP(
      "alterarTipoEquipamento",
      {

        idParticipante:
          idUsuarioLogado,

        idTipo:
          idTipo,

        tipo:
          tipo,

        descricao:
          descricao,

        observacoes:
          observacoes

      },
      function(res) {

        esconderSpinner();


        if (!res || !res.sucesso) {

          mostrarAlertaGlobal(
            "⚠️ " +
            (
              res?.mensagem ||
              "Não foi possível alterar o tipo."
            )
          );

          return;
        }


        mostrarAlertaGlobal(
          "✅ Tipo de equipamento alterado com sucesso."
        );


        limparFormularioTipoEquipamento();


        carregarTiposEquipamentosFrontend();

      },
      function(erro) {

        esconderSpinner();

        console.error(
          "Erro ao alterar tipo:",
          erro
        );

        mostrarAlertaGlobal(
          "⚠️ Erro ao alterar o tipo de equipamento."
        );

      }
    );

    return;
  }


  // ----------------------------------------------------------
  // CADASTRO
  // ----------------------------------------------------------

  apiJSONP(
    "cadastrarTipoEquipamento",
    {

      idParticipante:
        idUsuarioLogado,

      tipo:
        tipo,

      descricao:
        descricao,

      observacoes:
        observacoes

    },
    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível cadastrar o tipo."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Tipo de equipamento cadastrado com sucesso."
      );


      limparFormularioTipoEquipamento();


      carregarTiposEquipamentosFrontend();

    },
    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao cadastrar tipo:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao cadastrar o tipo de equipamento."
      );

    }
  );
}*/
function salvarTipoEquipamentoFrontend() {

  const idTipo =
    document
      .getElementById(
        "idTipoEquipamento"
      )
      .value
      .trim();


  const tipo =
    document
      .getElementById(
        "tipoEquipamento"
      )
      .value
      .trim();


  const descricao =
    document
      .getElementById(
        "descricaoTipoEquipamento"
      )
      .value
      .trim();


  const observacoes =
    document
      .getElementById(
        "observacoesTipoEquipamento"
      )
      .value
      .trim();


  if (!tipo) {

    mostrarAlertaGlobal(
      "⚠️ Informe o tipo de equipamento."
    );

    return;
  }


  if (!descricao) {

    mostrarAlertaGlobal(
      "⚠️ Informe a descrição do equipamento."
    );

    return;
  }


  mostrarSpinner();


  // ----------------------------------------------------------
  // ALTERAÇÃO
  // ----------------------------------------------------------

  if (idTipo) {

    apiJSONP(
      "alterarTipoEquipamento",
      {

        idParticipante:
          idUsuarioLogado,

        idTipo:
          idTipo,

        tipo:
          tipo,

        descricao:
          descricao,

        observacoes:
          observacoes

      },
      function(res) {

        esconderSpinner();


        if (!res || !res.sucesso) {

          mostrarAlertaGlobal(
            "⚠️ " +
            (
              res?.mensagem ||
              "Não foi possível alterar o tipo."
            )
          );

          return;
        }


        mostrarAlertaGlobal(
          "✅ Tipo de equipamento alterado com sucesso."
        );


        //limparFormularioTipoEquipamento();
        fecharModalFormularioInventario();


        carregarTiposEquipamentosFrontend();

      },
      function(erro) {

        esconderSpinner();

        console.error(
          "Erro ao alterar tipo:",
          erro
        );

        mostrarAlertaGlobal(
          "⚠️ Erro ao alterar o tipo de equipamento."
        );

      }
    );

    return;
  }


  // ----------------------------------------------------------
  // CADASTRO
  // ----------------------------------------------------------

  apiJSONP(
    "cadastrarTipoEquipamento",
    {

      idParticipante:
        idUsuarioLogado,

      tipo:
        tipo,

      descricao:
        descricao,

      observacoes:
        observacoes

    },
    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível cadastrar o tipo."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Tipo de equipamento cadastrado com sucesso."
      );


      //limparFormularioTipoEquipamento();
      fecharModalFormularioInventario();


      carregarTiposEquipamentosFrontend();

    },
    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao cadastrar tipo:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao cadastrar o tipo de equipamento."
      );

    }
  );
}

// ============================================================
// EDITAR
// ============================================================

/*function editarTipoEquipamentoFrontend(
  tipo
) {

  document
    .getElementById(
      "idTipoEquipamento"
    )
    .value =
      tipo.idTipo || "";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .value =
      tipo.tipo || "";


  document
    .getElementById(
      "descricaoTipoEquipamento"
    )
    .value =
      tipo.descricao || "";


  document
    .getElementById(
      "observacoesTipoEquipamento"
    )
    .value =
      tipo.observacoes || "";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Salvar alterações";


  document
    .getElementById(
      "btnCancelarEdicaoTipoEquipamento"
    )
    .style.display =
      "inline-block";
}*/
/*function editarTipoEquipamentoFrontend(
  tipo
) {

  document
    .getElementById(
      "formularioTipoEquipamento"
    )
    .style.display = "block";


  document
    .getElementById(
      "idTipoEquipamento"
    )
    .value =
      tipo.idTipo || "";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .value =
      tipo.tipo || "";


  document
    .getElementById(
      "descricaoTipoEquipamento"
    )
    .value =
      tipo.descricao || "";


  document
    .getElementById(
      "observacoesTipoEquipamento"
    )
    .value =
      tipo.observacoes || "";


  document
    .getElementById(
      "tituloFormularioTipoEquipamento"
    )
    .textContent =
      "✏️ Editar tipo de equipamento";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Salvar alterações";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .focus();

}*/
function editarTipoEquipamentoFrontend(
  tipo
) {

  abrirModalFormularioInventario(
    "✏️ Editar tipo de equipamento",
    obterHTMLFormularioTipoEquipamento()
  );


  document
    .getElementById(
      "idTipoEquipamento"
    )
    .value =
      tipo.idTipo || "";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .value =
      tipo.tipo || "";


  document
    .getElementById(
      "descricaoTipoEquipamento"
    )
    .value =
      tipo.descricao || "";


  document
    .getElementById(
      "observacoesTipoEquipamento"
    )
    .value =
      tipo.observacoes || "";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Salvar alterações";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .focus();

}

// ============================================================
// CANCELAR EDIÇÃO
// ============================================================

function cancelarEdicaoTipoEquipamento() {

  limparFormularioTipoEquipamento();

}


// ============================================================
// LIMPAR FORMULÁRIO
// ============================================================

/*function limparFormularioTipoEquipamento() {

  document
    .getElementById(
      "idTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "descricaoTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "observacoesTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Salvar";


  document
    .getElementById(
      "btnCancelarEdicaoTipoEquipamento"
    )
    .style.display =
      "none";
}*/
function limparFormularioTipoEquipamento() {

  document
    .getElementById(
      "idTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "tipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "descricaoTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "observacoesTipoEquipamento"
    )
    .value = "";


  document
    .getElementById(
      "tituloFormularioTipoEquipamento"
    )
    .textContent =
      "➕ Novo tipo de equipamento";


  document
    .getElementById(
      "btnSalvarTipoEquipamento"
    )
    .textContent =
      "💾 Cadastrar";


  document
    .getElementById(
      "formularioTipoEquipamento"
    )
    .style.display = "none";

}

// ============================================================
// ESCAPA HTML
// ============================================================

function escaparHTML(valor) {

  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// INVENTÁRIO — EQUIPAMENTOS
// ============================================================

// ============================================================
// CARREGAR EQUIPAMENTOS
// ============================================================
/*function carregarEquipamentosFrontend() {

  mostrarSpinner();

  const container =
    document.getElementById(
      "listaEquipamentosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    '<div class="aviso-inventario">Carregando...</div>';


  apiJSONP(
    "listarEquipamentos",
    {

      idParticipante:
        idUsuarioLogado

    },

    function(res) {

      esconderSpinner();

      if (!res || !res.sucesso) {

        container.innerHTML =
          '<div class="aviso-inventario">⚠️ ' +
          (
            res?.mensagem ||
            "Não foi possível carregar os equipamentos."
          ) +
          '</div>';

        return;
      }


      renderizarEquipamentosInventario(
        res.equipamentos || []
      );

    },

    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao listar equipamentos:",
        erro
      );


      container.innerHTML =
        '<div class="aviso-inventario">' +
        '⚠️ Erro ao carregar os equipamentos.' +
        '</div>';

    }
  );

}*/
function carregarEquipamentosFrontend() {

  mostrarSpinner();

  const container =
    document.getElementById(
      "listaEquipamentosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    '<div class="aviso-inventario">Carregando...</div>';


  apiJSONP(
    "listarEquipamentos",
    {

      idParticipante:
        idUsuarioLogado

    },

    function(res) {

      esconderSpinner();

      if (!res || !res.sucesso) {

        container.innerHTML =
          '<div class="aviso-inventario">⚠️ ' +
          (
            res?.mensagem ||
            "Não foi possível carregar os equipamentos."
          ) +
          '</div>';

        return;
      }


      carregarMapaDepositosFrontend(
        function(mapaCarregado) {

          renderizarEquipamentosInventario(
            res.equipamentos || []
          );

        }
      );

    },

    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao listar equipamentos:",
        erro
      );


      container.innerHTML =
        '<div class="aviso-inventario">' +
        '⚠️ Erro ao carregar os equipamentos.' +
        '</div>';

    }
  );

}

// ============================================================
// RENDERIZAR EQUIPAMENTOS
// ============================================================

/*function renderizarEquipamentosInventario(
  equipamentos
) {

  const container =
    document.getElementById(
      "listaEquipamentosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!equipamentos.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhum equipamento cadastrado.' +
      '</div>';

    return;
  }


  equipamentos.forEach(function(equipamento) {

    const ativo =
      String(equipamento.ativo || "")
        .trim()
        .toUpperCase();


    const situacao =
      String(equipamento.situacao || "")
        .trim()
        .toUpperCase();


    const card =
      document.createElement("div");


    const nomeResponsavel =
      equipamento.responsavelAtual
        ? (
            window.mapaParticipantesPorId[
              equipamento.responsavelAtual
            ] ||
            equipamento.responsavelAtual
          )
        : "";


    card.className =
      "card-equipamento-inventario";


    card.innerHTML = `

      <div class="card-equipamento-topo">

        <div>

          <div class="nome-equipamento-inventario">

            ${escaparHTML(
              equipamento.descricao ||
              "Equipamento"
            )}

          </div>


          <div class="id-equipamento-inventario">

            ${escaparHTML(
              equipamento.idEquipamento || ""
            )}

            ${
              equipamento.numeroPatrimonio
                ? " • " +
                  escaparHTML(
                    equipamento.numeroPatrimonio
                  )
                : ""
            }

          </div>

        </div>


        <div class="status-equipamento-inventario">

          ${
            ativo === "SIM"
              ? "● ATIVO"
              : "○ INATIVO"
          }

        </div>

      </div>


      <div class="card-equipamento-infos">

        <div>

          📦

          ${escaparHTML(
            equipamento.idTipo || ""
          )}

        </div>


        <div>

          ${
            situacao === "COM_PESSOA"
              ? "👤 COM PESSOA"
              : "🏢 NO DEPÓSITO"
          }

        </div>

      </div>


      ${
        equipamento.responsavelAtual
          ? `
            <div class="responsavel-equipamento-inventario">

              👤 Responsável:

              <strong>
                ${escaparHTML(nomeResponsavel)}
              </strong>

            </div>
          `
          : ""
      }


      ${
        equipamento.observacoes
          ? `
            <div class="observacoes-equipamento-inventario">

              ${escaparHTML(
                equipamento.observacoes
              )}

            </div>
          `
          : ""
      }


      <div class="acoes-equipamento-inventario">

        <!--<button
          type="button"
          onclick='abrirMovimentacaoEquipamentoFrontend(
            ${JSON.stringify(equipamento)}
          )'
        >
          🔄 Movimentar
        </button>-->

        <button
          type="button"
          onclick='abrirMovimentacaoEquipamentoFrontend(${JSON.stringify(equipamento)})'
        >
          🔄 Movimentar
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}*/
function renderizarEquipamentosInventario(
  equipamentos
) {

  const container =
    document.getElementById(
      "listaEquipamentosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!equipamentos.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhum equipamento cadastrado.' +
      '</div>';

    return;
  }


  equipamentos.forEach(function(equipamento) {

    const ativo =
      String(equipamento.ativo || "")
        .trim()
        .toUpperCase();


    const situacao =
      String(equipamento.situacao || "")
        .trim()
        .toUpperCase();


    const card =
      document.createElement("div");


    const nomeResponsavel =
      equipamento.responsavelAtual
        ? (
            window.mapaParticipantesPorId[
              equipamento.responsavelAtual
            ] ||
            equipamento.responsavelAtual
          )
        : "";


    card.className =
      "card-equipamento-inventario";


    card.innerHTML = `

      <div class="card-equipamento-topo">

        <div>

          <div class="nome-equipamento-inventario">

            ${escaparHTML(
              equipamento.descricao ||
              "Equipamento"
            )}

          </div>


          <div class="id-equipamento-inventario">

            ${escaparHTML(
              equipamento.idEquipamento || ""
            )}

            ${
              equipamento.numeroPatrimonio
                ? " • " +
                  escaparHTML(
                    equipamento.numeroPatrimonio
                  )
                : ""
            }

          </div>

        </div>


        <div class="status-equipamento-inventario">

          ${
            ativo === "SIM"
              ? "● ATIVO"
              : "○ INATIVO"
          }

        </div>

      </div>


      <div class="card-equipamento-infos">

        <div>

          🏢

          ${escaparHTML(
            mapaDepositosPorId[
              equipamento.idDeposito
            ] ||
            equipamento.idDeposito ||
            "Sem depósito"
          )}

        </div>


        <div>

          ${
            situacao === "COM_PESSOA"
              ? "👤 COM PESSOA"
              : "🏢 NO DEPÓSITO"
          }

        </div>

      </div>


      ${
        equipamento.responsavelAtual
          ? `
            <div class="responsavel-equipamento-inventario">

              👤 Responsável:

              <strong>
                ${escaparHTML(nomeResponsavel)}
              </strong>

            </div>
          `
          : ""
      }


      ${
        equipamento.observacoes
          ? `
            <div class="observacoes-equipamento-inventario">

              ${escaparHTML(
                equipamento.observacoes
              )}

            </div>
          `
          : ""
      }


      <div class="acoes-equipamento-inventario">

        <!--<button
          type="button"
          onclick='abrirMovimentacaoEquipamentoFrontend(
            ${JSON.stringify(equipamento)}
          )'
        >
          🔄 Movimentar
        </button>-->

        <button
          type="button"
          onclick='abrirMovimentacaoEquipamentoFrontend(${JSON.stringify(equipamento)})'
        >
          🔄 Movimentar
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}

// ============================================================
// ABRIR MOVIMENTAÇÃO
// ============================================================

/*function abrirMovimentacaoEquipamentoFrontend(
  equipamento
) {

  participanteSelecionadoEquipamento = null;


  document
    .getElementById(
      "idEquipamentoMovimentacao"
    )
    .value =
      equipamento.idEquipamento || "";


  document
    .getElementById(
      "descricaoEquipamentoMovimentacao"
    )
    .value =
      equipamento.descricao || "";


  document
    .getElementById(
      "patrimonioEquipamentoMovimentacao"
    )
    .value =
      equipamento.numeroPatrimonio || "";


  document
    .getElementById(
      "situacaoEquipamentoMovimentacao"
    )
    .value =
      equipamento.situacao || "";


  document
    .getElementById(
      "responsavelEquipamentoMovimentacao"
    )
    .value = "";


  document
    .getElementById(
      "observacoesMovimentacaoEquipamento"
    )
    .value =
      equipamento.observacoes || "";


  atualizarResponsavelEquipamentoMovimentacao();


  document
    .getElementById(
      "areaMovimentacaoEquipamento"
    )
    .style.display =
      "block";

}*/

// ============================================================
// ATUALIZAR RESPONSÁVEL
// ============================================================

function atualizarResponsavelEquipamentoMovimentacao() {

  const situacao =
    document
      .getElementById(
        "situacaoEquipamentoMovimentacao"
      )
      .value;


  const campo =
    document
      .getElementById(
        "responsavelEquipamentoMovimentacao"
      );


  if (situacao === "NO_DEPOSITO") {

    participanteSelecionadoEquipamento =
      null;

    campo.value = "";

    campo.disabled = true;

    return;

  }


  campo.disabled = false;

}

// ============================================================
// SALVAR MOVIMENTAÇÃO
// ============================================================

/*function salvarMovimentacaoEquipamentoFrontend() {

  const idEquipamento =
    document
      .getElementById(
        "idEquipamentoMovimentacao"
      )
      .value
      .trim();


  const situacao =
    document
      .getElementById(
        "situacaoEquipamentoMovimentacao"
      )
      .value
      .trim()
      .toUpperCase();


  const observacoes =
    document
      .getElementById(
        "observacoesMovimentacaoEquipamento"
      )
      .value
      .trim();


  if (!idEquipamento) {

    mostrarAlertaGlobal(
      "⚠️ Equipamento não identificado."
    );

    return;

  }


  if (!situacao) {

    mostrarAlertaGlobal(
      "⚠️ Selecione a nova situação."
    );

    return;

  }


  let novoResponsavel = "";


  if (situacao === "COM_PESSOA") {

    if (
      !participanteSelecionadoEquipamento ||
      !participanteSelecionadoEquipamento.id
    ) {

      mostrarAlertaGlobal(
        "⚠️ Selecione o responsável pelo equipamento."
      );

      return;

    }


    novoResponsavel =
      participanteSelecionadoEquipamento.id;

  }


  mostrarSpinner();


  apiJSONP(
    "movimentarEquipamento",
    {

      idOperador:
        idUsuarioLogado,

      idEquipamento:
        idEquipamento,

      novoResponsavel:
        novoResponsavel,

      novaSituacao:
        situacao,

      observacoes:
        observacoes

    },

    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível movimentar o equipamento."
          )
        );

        return;

      }


      mostrarAlertaGlobal(
        "✅ Equipamento movimentado com sucesso."
      );


      //cancelarMovimentacaoEquipamentoFrontend();
      fecharModalFormularioInventario();


      carregarEquipamentosFrontend();

    },

    function(erro) {

      esconderSpinner();


      console.error(
        "Erro ao movimentar equipamento:",
        erro
      );


      mostrarAlertaGlobal(
        "⚠️ Erro ao movimentar o equipamento."
      );

    }

  );

}*/
function salvarMovimentacaoEquipamentoFrontend() {

const idEquipamento =
document
.getElementById(
"idEquipamentoMovimentacao"
)
.value
.trim();

const situacao =
document
.getElementById(
"situacaoEquipamentoMovimentacao"
)
.value
.trim()
.toUpperCase();

const observacoes =
document
.getElementById(
"observacoesMovimentacaoEquipamento"
)
.value
.trim();

if (!idEquipamento) {

mostrarAlertaGlobal(
  "⚠️ Equipamento não identificado."
);

return;

}

if (!situacao) {

mostrarAlertaGlobal(
  "⚠️ Selecione a nova situação."
);

return;

}

let novoResponsavel = "";
let idDepositoNovo = "";

// ==========================================================
// COM PESSOA
// ==========================================================

if (situacao === "COM_PESSOA") {

if (
  !participanteSelecionadoEquipamento ||
  !participanteSelecionadoEquipamento.id
) {

  mostrarAlertaGlobal(
    "⚠️ Selecione o responsável pelo equipamento."
  );

  return;
}


novoResponsavel =
  participanteSelecionadoEquipamento.id;

}

// ==========================================================
// NO DEPÓSITO
// ==========================================================

if (situacao === "NO_DEPOSITO") {

const selectDeposito =
  document.getElementById(
    "depositoEquipamentoMovimentacao"
  );


if (!selectDeposito) {

  mostrarAlertaGlobal(
    "⚠️ Campo de depósito não encontrado."
  );

  return;
}


idDepositoNovo =
  selectDeposito.value
    .trim()
    .toUpperCase();


if (!idDepositoNovo) {

  mostrarAlertaGlobal(
    "⚠️ Selecione o depósito."
  );

  return;
}

}

mostrarSpinner();

apiJSONP(
"movimentarEquipamento",
{

  idOperador:
    idUsuarioLogado,

  idEquipamento:
    idEquipamento,

  novoResponsavel:
    novoResponsavel,

  novaSituacao:
    situacao,

  idDepositoNovo:
    idDepositoNovo,

  observacoes:
    observacoes

},

function(res) {

  esconderSpinner();


  if (!res || !res.sucesso) {

    mostrarAlertaGlobal(
      "⚠️ " +
      (
        res?.mensagem ||
        "Não foi possível movimentar o equipamento."
      )
    );

    return;
  }


  mostrarAlertaGlobal(
    "✅ Equipamento movimentado com sucesso."
  );


  participanteSelecionadoEquipamento =
    null;


  window.equipamentoSelecionadoMovimentacao =
    null;


  fecharModalFormularioInventario();


  carregarEquipamentosFrontend();

},

function(erro) {

  esconderSpinner();


  console.error(
    "Erro ao movimentar equipamento:",
    erro
  );


  mostrarAlertaGlobal(
    "⚠️ Erro ao movimentar o equipamento."
  );

}

);

}




// ============================================================
// CANCELAR MOVIMENTAÇÃO
// ============================================================

function cancelarMovimentacaoEquipamentoFrontend() {

  participanteSelecionadoEquipamento =
    null;


  document
    .getElementById(
      "areaMovimentacaoEquipamento"
    )
    .style.display =
      "none";


  document
    .getElementById(
      "idEquipamentoMovimentacao"
    )
    .value = "";


  document
    .getElementById(
      "descricaoEquipamentoMovimentacao"
    )
    .value = "";


  document
    .getElementById(
      "patrimonioEquipamentoMovimentacao"
    )
    .value = "";


  document
    .getElementById(
      "situacaoEquipamentoMovimentacao"
    )
    .value = "";


  const campo =
    document
      .getElementById(
        "responsavelEquipamentoMovimentacao"
      );


  campo.value = "";

  campo.disabled = false;


  document
    .getElementById(
      "observacoesMovimentacaoEquipamento"
    )
    .value = "";

}







// ============================================================
// INVENTÁRIO
// ============================================================


// ============================================================
// DEPÓSITOS
// ============================================================


// ============================================================
// CARREGAR DEPÓSITOS
// ============================================================

function carregarDepositosFrontend() {

  const container =
    document.getElementById(
      "listaDepositosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    '<div class="aviso-inventario">Carregando...</div>';

  mostrarSpinner();

  apiJSONP(
    "listarDepositos",
    {
        idUsuarioLogado: idUsuarioLogado
    },
    function(res) {
        esconderSpinner();

      if (!res || !res.sucesso) {

        container.innerHTML =
          '<div class="aviso-inventario">⚠️ ' +
          (
            res?.mensagem ||
            "Não foi possível carregar os depósitos."
          ) +
          '</div>';

        return;
      }


      renderizarDepositosFrontend(
        res.depositos || []
      );

    },
    function(erro) {

        esconderSpinner();

      console.error(
        "Erro ao listar depósitos:",
        erro
      );

      container.innerHTML =
        '<div class="aviso-inventario">' +
        '⚠️ Erro ao carregar os depósitos.' +
        '</div>';

    }
  );
}


// ============================================================
// RENDERIZAR DEPÓSITOS
// ============================================================

function renderizarDepositosFrontend(
  depositos
) {

  const container =
    document.getElementById(
      "listaDepositosInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!depositos.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhum depósito cadastrado.' +
      '</div>';

    return;
  }


  depositos.forEach(function(deposito) {

    const card =
      document.createElement("div");

    card.className =
      "card-deposito-inventario";


    const ativo =
      String(deposito.ativo || "")
        .trim()
        .toUpperCase();


    card.innerHTML = `

      <div class="card-deposito-topo">

        <div>

          <div class="nome-deposito-inventario">
            ${escaparHTML(
              deposito.nome || ""
            )}
          </div>

          <div class="id-deposito-inventario">
            ${escaparHTML(
              deposito.idDeposito || ""
            )}
          </div>

        </div>


        <div class="status-deposito-inventario">

          ${
            ativo === "SIM"
              ? "● ATIVO"
              : "○ INATIVO"
          }

        </div>

      </div>


      <div class="localizacao-deposito-inventario">

        📍
        ${escaparHTML(
          deposito.localizacao ||
          "Localização não informada."
        )}

      </div>


      <div class="responsavel-deposito-inventario">

        👤 Responsável:

        ${
          deposito.nomeResponsavel
            ? escaparHTML(
                deposito.nomeResponsavel
              )
            : (
                deposito.responsavel
                  ? escaparHTML(
                      deposito.responsavel
                    )
                  : "Não informado"
              )
        }

      </div>


      ${
        deposito.congregacaoResponsavel
          ? `
            <div class="congregacao-deposito-inventario">
              ${escaparHTML(
                deposito.congregacaoResponsavel
              )}
            </div>
          `
          : ""
      }


      ${
        deposito.observacoes
          ? `
            <div class="observacoes-deposito-inventario">
              ${escaparHTML(
                deposito.observacoes
              )}
            </div>
          `
          : ""
      }


      <div class="acoes-deposito-inventario">

        <button
          type="button"
          onclick='editarDepositoFrontend(
            ${JSON.stringify(deposito)}
          )'
        >
          ✏️ Editar
        </button>

      </div>

    `;


    container.appendChild(card);

  });
}


// ============================================================
// SALVAR / ALTERAR DEPÓSITO
// ============================================================

function salvarDepositoFrontend() {

  const idDeposito =
    document
      .getElementById(
        "idDepositoInventario"
      )
      .value
      .trim();


  const ativo =
  document
    .getElementById(
      "ativoDepositoInventario"
    )
    .value
    .trim()
    .toUpperCase();


  const nome =
    document
      .getElementById(
        "nomeDepositoInventario"
      )
      .value
      .trim();


  const localizacao =
    document
      .getElementById(
        "localizacaoDepositoInventario"
      )
      .value
      .trim();


  const responsavel =
    document
      .getElementById(
        "responsavelDepositoInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const observacoes =
    document
      .getElementById(
        "observacoesDepositoInventario"
      )
      .value
      .trim();


  if (!nome) {

    mostrarAlertaGlobal(
      "⚠️ Informe o nome do depósito."
    );

    return;
  }


  if (!localizacao) {

    mostrarAlertaGlobal(
      "⚠️ Informe a localização do depósito."
    );

    return;
  }


  if (!responsavel) {

    mostrarAlertaGlobal(
      "⚠️ Informe o responsável pelo depósito."
    );

    return;
  }


  mostrarSpinner();


  // ==========================================================
  // ALTERAÇÃO
  // ==========================================================

  if (idDeposito) {

    apiJSONP(
      "alterarDeposito",
      {

        idUsuarioLogado: idUsuarioLogado,
            idDeposito: idDeposito,
            nome: nome,
            localizacao: localizacao,
            responsavel: responsavel,
            ativo: ativo,
            observacoes: observacoes

      },
      function(res) {

        esconderSpinner();


        if (!res || !res.sucesso) {

          mostrarAlertaGlobal(
            "⚠️ " +
            (
              res?.mensagem ||
              "Não foi possível alterar o depósito."
            )
          );

          return;
        }


        mostrarAlertaGlobal(
          "✅ Depósito alterado com sucesso."
        );


        limparFormularioDepositoFrontend();
        fecharModalFormularioInventario();
        carregarDepositosFrontend();

      },
      function(erro) {

        esconderSpinner();

        console.error(
          "Erro ao alterar depósito:",
          erro
        );

        mostrarAlertaGlobal(
          "⚠️ Erro ao alterar o depósito."
        );

      }
    );

    return;
  }


  // ==========================================================
  // CADASTRO
  // ==========================================================

  apiJSONP(
    "cadastrarDeposito",
    {

      idUsuarioLogado: idUsuarioLogado,
        nome: nome,
        localizacao: localizacao,
        responsavel: responsavel,
        observacoes: observacoes

    },
    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível cadastrar o depósito."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Depósito cadastrado com sucesso."
      );

      limparFormularioDepositoFrontend();
      fecharModalFormularioInventario();
      carregarDepositosFrontend();

    },
    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao cadastrar depósito:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao cadastrar o depósito."
      );

    }
  );
}


// ============================================================
// EDITAR DEPÓSITO
// ============================================================

/*function editarDepositoFrontend(
  deposito
) {

  document
    .getElementById(
      "idDepositoInventario"
    )
    .value =
      deposito.idDeposito || "";


  document
    .getElementById(
        "ativoDepositoInventario"
    )
    .value =
        deposito.ativo || "SIM";


  document
    .getElementById(
      "nomeDepositoInventario"
    )
    .value =
      deposito.nome || "";


  document
    .getElementById(
      "localizacaoDepositoInventario"
    )
    .value =
      deposito.localizacao || "";


  document
    .getElementById(
      "responsavelDepositoInventario"
    )
    .value =
      deposito.responsavel || "";


  document
    .getElementById(
        "responsavelDepositoNomeInventario"
    )
    .value =
        deposito.nomeResponsavel || "";


  document
    .getElementById(
      "observacoesDepositoInventario"
    )
    .value =
      deposito.observacoes || "";


  document
    .getElementById(
      "btnSalvarDepositoInventario"
    )
    .textContent =
      "💾 Salvar alterações";


  document
    .getElementById(
      "btnCancelarEdicaoDepositoInventario"
    )
    .style.display =
      "inline-block";
}*/
function editarDepositoFrontend(deposito) {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "✏️ Editar Depósito";


  conteudo.innerHTML = `

    <div class="area-formulario-inventario">

      <input
        type="hidden"
        id="idDepositoInventario"
        value="${escaparHTML(
          deposito.idDeposito || ""
        )}"
      >

      <input
        type="hidden"
        id="ativoDepositoInventario"
        value="${escaparHTML(
          deposito.ativo || "SIM"
        )}"
      >


      <div class="campo-inventario">

        <label for="nomeDepositoInventario">
          Nome do depósito
        </label>

        <input
          type="text"
          id="nomeDepositoInventario"
          value="${escaparHTML(
            deposito.nome || ""
          )}"
          placeholder="Ex.: Depósito Principal"
        >

      </div>


      <div class="campo-inventario">

        <label for="localizacaoDepositoInventario">
          Localização
        </label>

        <input
          type="text"
          id="localizacaoDepositoInventario"
          value="${escaparHTML(
            deposito.localizacao || ""
          )}"
          placeholder="Ex.: Sala de equipamentos"
        >

      </div>


      <div class="campo-inventario">

        <label for="responsavelDepositoNomeInventario">
          Responsável
        </label>

        <input
          type="text"
          id="responsavelDepositoNomeInventario"
          value="${escaparHTML(
            deposito.nomeResponsavel ||
            mapaParticipantesPorId[
              deposito.responsavel
            ] ||
            ""
          )}"
          readonly
          onclick="abrirSelecaoDepositos()"
          placeholder="Clique para selecionar"
        >

        <input
          type="hidden"
          id="responsavelDepositoInventario"
          value="${escaparHTML(
            deposito.responsavel || ""
          )}"
        >

      </div>


      <div class="campo-inventario">

        <label for="observacoesDepositoInventario">
          Observações
        </label>

        <textarea
          id="observacoesDepositoInventario"
          rows="3"
          placeholder="Observações opcionais"
        >${escaparHTML(
          deposito.observacoes || ""
        )}</textarea>

      </div>


      <div class="acoes-formulario-inventario">

        <button
          type="button"
          id="btnSalvarDepositoInventario"
          onclick="salvarDepositoFrontend()"
        >
          💾 Salvar alterações
        </button>


        <button
          type="button"
          id="btnCancelarEdicaoDepositoInventario"
          onclick="cancelarEdicaoDepositoFrontend()"
        >
          ✖️ Cancelar
        </button>

      </div>

    </div>

  `;


  participanteSelecionadoDepositos = {

    nome:
      deposito.nomeResponsavel ||
      mapaParticipantesPorId[
        deposito.responsavel
      ] ||
      "",

    id:
      deposito.responsavel || ""

  };


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}

// ============================================================
// CANCELAR EDIÇÃO
// ============================================================

function cancelarEdicaoDepositoFrontend() {

  limparFormularioDepositoFrontend();

}


// ============================================================
// LIMPAR FORMULÁRIO
// ============================================================

/*function limparFormularioDepositoFrontend() {

  document
    .getElementById(
      "idDepositoInventario"
    )
    .value = "";


  document
    .getElementById(
      "nomeDepositoInventario"
    )
    .value = "";


  document
    .getElementById(
      "localizacaoDepositoInventario"
    )
    .value = "";


  document
    .getElementById(
        "responsavelDepositoNomeInventario"
    )
    .value = "";


  document
    .getElementById(
      "responsavelDepositoInventario"
    )
    .value = "";


  document
    .getElementById(
      "observacoesDepositoInventario"
    )
    .value = "";


  document
    .getElementById(
      "btnSalvarDepositoInventario"
    )
    .textContent =
      "💾 Salvar";


  document
    .getElementById(
      "btnCancelarEdicaoDepositoInventario"
    )
    .style.display =
      "none";
}*/
function limparFormularioDepositoFrontend() {

  const ids = [
    "idDepositoInventario",
    "ativoDepositoInventario",
    "nomeDepositoInventario",
    "localizacaoDepositoInventario",
    "responsavelDepositoNomeInventario",
    "responsavelDepositoInventario",
    "observacoesDepositoInventario"
  ];


  ids.forEach(function(id) {

    const elemento =
      document.getElementById(id);

    if (elemento) {
      elemento.value = "";
    }

  });


  const ativo =
    document.getElementById(
      "ativoDepositoInventario"
    );

  if (ativo) {
    ativo.value = "SIM";
  }


  const btnSalvar =
    document.getElementById(
      "btnSalvarDepositoInventario"
    );

  if (btnSalvar) {
    btnSalvar.textContent =
      "💾 Salvar";
  }


  const btnCancelar =
    document.getElementById(
      "btnCancelarEdicaoDepositoInventario"
    );

  if (btnCancelar) {
    btnCancelar.style.display =
      "none";
  }


  participanteSelecionadoDepositos =
    null;

}

// ============================================================
// CHAVES
// ============================================================


// ============================================================
// CARREGAR DEPÓSITOS NO SELECT DE CHAVES
// ============================================================

function carregarDepositosParaChavesFrontend() {

    mostrarSpinner();

  const select =
    document.getElementById(
      "depositoChavesInventario"
    );

  if (!select) {
    return;
  }


  select.innerHTML =
    '<option value="">Carregando...</option>';


  apiJSONP(
    "listarDepositos",
    {
      idUsuarioLogado:
        idUsuarioLogado
    },
    function(res) {

        esconderSpinner();

      if (!res || !res.sucesso) {

        select.innerHTML =
          '<option value="">Erro ao carregar depósitos</option>';

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível carregar os depósitos."
          )
        );

        return;
      }


      select.innerHTML =
        '<option value="">Selecione um depósito</option>';


      (res.depositos || []).forEach(
        function(deposito) {

          const option =
            document.createElement("option");

          option.value =
            deposito.idDeposito;

          option.textContent =
            deposito.nome +
            " — " +
            deposito.localizacao;

          select.appendChild(option);

        }
      );

    },
    function(erro) {

        esconderSpinner();

      console.error(
        "Erro ao carregar depósitos para chaves:",
        erro
      );

      select.innerHTML =
        '<option value="">Erro ao carregar depósitos</option>';

    }
  );
}


// ============================================================
// CARREGAR CHAVES DO DEPÓSITO
// ============================================================

function carregarChavesDoDepositoFrontend() {

    mostrarSpinner();

  const select =
    document.getElementById(
      "depositoChavesInventario"
    );

  const container =
    document.getElementById(
      "listaChavesInventario"
    );


  if (!select || !container) {
    return;
  }


  const idDeposito =
    select.value.trim();


  if (!idDeposito) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Selecione um depósito.' +
      '</div>';

    return;
  }


  container.innerHTML =
    '<div class="aviso-inventario">' +
    'Carregando chaves...' +
    '</div>';


  apiJSONP(
    "listarChavesDoDeposito",
    {
      idParticipante:
        idUsuarioLogado,

      idDeposito:
        idDeposito,

      incluirInativas:
        "false"
    },
    function(res) {

        esconderSpinner();

      if (!res || !res.sucesso) {

        container.innerHTML =
          '<div class="aviso-inventario">' +
          '⚠️ ' +
          (
            res?.mensagem ||
            "Não foi possível carregar as chaves."
          ) +
          '</div>';

        return;
      }


      renderizarChavesInventario(
        res.chaves || []
      );

    },
    function(erro) {

        esconderSpinner();

      console.error(
        "Erro ao listar chaves:",
        erro
      );

      container.innerHTML =
        '<div class="aviso-inventario">' +
        '⚠️ Erro ao carregar as chaves.' +
        '</div>';

    }
  );
}


// ============================================================
// RENDERIZAR CHAVES
// ============================================================

/*function renderizarChavesInventario(chaves) {

  const container =
    document.getElementById(
      "listaChavesInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!chaves.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhuma chave cadastrada neste depósito.' +
      '</div>';

    return;
  }


  chaves.forEach(function(chave) {

    const card =
      document.createElement("div");

    card.className =
      "card-chave-inventario";


    const situacao =
      String(chave.situacao || "")
        .trim()
        .toUpperCase();


    let situacaoHTML = "";


    if (situacao === "COM_PESSOA") {

      situacaoHTML = `

        <div class="situacao-chave-com-pessoa">

          👤 Com:

          <strong>
            ${escaparHTML(
              chave.responsavelAtual ||
              "Responsável não informado"
            )}
          </strong>

        </div>

      `;

    } else {

      situacaoHTML = `

        <div class="situacao-chave-no-deposito">

          🏢 No depósito

        </div>

      `;

    }


    card.innerHTML = `

      <div class="card-chave-topo">

        <div>

          <div class="id-chave-inventario">

            🔑
            ${escaparHTML(
              chave.idChave || ""
            )}

          </div>

          <div class="descricao-chave-inventario">

            ${escaparHTML(
              chave.descricao ||
              "Chave"
            )}

          </div>

        </div>


        <div class="status-chave-inventario">

          ${
            situacao === "COM_PESSOA"
              ? "● COM PESSOA"
              : "● NO DEPÓSITO"
          }

        </div>

      </div>


      ${situacaoHTML}


      ${
        chave.observacoes
          ? `
            <div class="observacoes-chave-inventario">

              ${escaparHTML(
                chave.observacoes
              )}

            </div>
          `
          : ""
      }


      <div class="acoes-chave-inventario">

        <button
          type="button"
          onclick='abrirMovimentacaoChaveFrontend(
            ${JSON.stringify(chave)}
          )'
        >
          🔄 Movimentar
        </button>

      </div>

    `;


    container.appendChild(card);

  });
}*/
function renderizarChavesInventario(chaves) {

  const container =
    document.getElementById(
      "listaChavesInventario"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!chaves.length) {

    container.innerHTML =
      '<div class="aviso-inventario">' +
      'Nenhuma chave cadastrada neste depósito.' +
      '</div>';

    return;
  }


  chaves.forEach(function(chave) {

    // ========================================================
    // RESPONSÁVEL DA CHAVE
    // ========================================================

    const idResponsavel =
      chave.responsavelAtual || "";

    const nomeResponsavel =
      window.mapaParticipantesPorId?.[
        idResponsavel
      ] || idResponsavel;




    const card =
      document.createElement("div");

    card.className =
      "card-chave-inventario";


    const situacao =
      String(chave.situacao || "")
        .trim()
        .toUpperCase();


    let situacaoHTML = "";


    if (situacao === "COM_PESSOA") {

      situacaoHTML = `

        <div class="situacao-chave-com-pessoa">

          👤 Com:

          <strong>
           ${escaparHTML(nomeResponsavel)}
          </strong>

        </div>

      `;

    } else {

      situacaoHTML = `

        <div class="situacao-chave-no-deposito">

          🏢 No depósito

        </div>

      `;

    }


    card.innerHTML = `

      <div class="card-chave-topo">

        <div>

          <div class="id-chave-inventario">

            🔑
            ${escaparHTML(
              chave.idChave || ""
            )}

          </div>

          <div class="descricao-chave-inventario">

            ${escaparHTML(
              chave.descricao ||
              "Chave"
            )}

          </div>

        </div>


        <div class="status-chave-inventario">

          ${
            situacao === "COM_PESSOA"
              ? "● COM PESSOA"
              : "● NO DEPÓSITO"
          }

        </div>

      </div>


      ${situacaoHTML}


      ${
        chave.observacoes
          ? `
            <div class="observacoes-chave-inventario">

              ${escaparHTML(
                chave.observacoes
              )}

            </div>
          `
          : ""
      }


      <div class="acoes-chave-inventario">

        <button
          type="button"
          onclick='abrirMovimentacaoChaveFrontend(
            ${JSON.stringify(chave)}
          )'
        >
          🔄 Movimentar
        </button>

      </div>

    `;


    container.appendChild(card);

  });
}

// ============================================================
// CADASTRAR CHAVE
// ============================================================

function cadastrarChaveFrontend() {

  const select =
    document.getElementById(
      "depositoChavesInventario"
    );

  const campoDescricao =
    document.getElementById(
      "descricaoChaveInventario"
    );

  const campoObservacoes =
    document.getElementById(
      "observacoesChaveInventario"
    );


  if (!select || !campoDescricao || !campoObservacoes) {
    return;
  }


  const idDeposito =
    select.value.trim();


  const descricao =
    campoDescricao.value.trim();


  const observacoes =
    campoObservacoes.value.trim();


  if (!idDeposito) {

    mostrarAlertaGlobal(
      "⚠️ Selecione um depósito."
    );

    return;
  }


  if (!descricao) {

    mostrarAlertaGlobal(
      "⚠️ Informe a descrição da chave."
    );

    return;
  }


  mostrarSpinner();


  apiJSONP(
    "cadastrarChave",
    {
      idAdministrador:
        idUsuarioLogado,

      idDeposito:
        idDeposito,

      descricao:
        descricao,

      observacoes:
        observacoes

    },
    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível cadastrar a chave."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Chave cadastrada com sucesso."
      );


      campoDescricao.value = "";

      campoObservacoes.value = "";


      fecharModalFormularioInventario();
      carregarChavesDoDepositoFrontend();

    },
    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao cadastrar chave:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao cadastrar a chave."
      );

    }
  );
}


let chaveSelecionadaMovimentacao = null;


function abrirMovimentacaoChaveFrontend(chave) {

  chaveSelecionadaMovimentacao = chave;

  const idChave =
    document.getElementById(
      "idChaveMovimentacaoInventario"
    );

  const descricao =
    document.getElementById(
      "descricaoChaveMovimentacaoInventario"
    );

  if (idChave) {
    idChave.value =
      chave.idChave || "";
  }

  if (descricao) {
    descricao.value =
      chave.descricao || "";
  }


  // Limpa seleção anterior
  document
    .getElementById(
      "responsavelChaveNomeInventario"
    )
    .value = "";

  document
    .getElementById(
      "responsavelChaveInventario"
    )
    .value = "";


  // Situação inicial
  const situacao =
    document.getElementById(
      "situacaoChaveInventario"
    );

  if (situacao) {

    situacao.value =
      chave.situacao || "";

  }


  // Se a chave já estiver com alguém,
  // mostra essa pessoa no formulário
  if (
    chave.situacao === "COM_PESSOA" &&
    chave.responsavelAtual
  ) {

    const id =
      chave.responsavelAtual;

    const nome =
      window.mapaParticipantesPorId?.[
        id
      ] || id;


    document
      .getElementById(
        "responsavelChaveNomeInventario"
      )
      .value = nome;


    document
      .getElementById(
        "responsavelChaveInventario"
      )
      .value = id;

  }


  // Aqui entra a abertura da sua tela/modal
  abrirTela(
    "telaMovimentarChaveInventario"
  );

  atualizarResponsavelChaveFrontend();

}

function atualizarResponsavelChaveFrontend() {

  const situacao =
    document.getElementById(
      "situacaoChaveInventario"
    );

  const campoNome =
    document.getElementById(
      "responsavelChaveNomeInventario"
    );

  const campoId =
    document.getElementById(
      "responsavelChaveInventario"
    );


  if (!situacao || !campoNome || !campoId) {
    return;
  }


  if (situacao.value === "NO_DEPOSITO") {

    campoNome.value = "";
    campoId.value = "";

    campoNome.disabled = true;

  } else {

    campoNome.disabled = false;

  }

}

// ============================================================
// SALVAR MOVIMENTAÇÃO DA CHAVE
// ============================================================

/*function salvarMovimentacaoChaveFrontend() {

  const idChave =
    document
      .getElementById(
        "idChaveMovimentacaoInventario"
      )
      .value
      .trim();


  const novaSituacao =
    document
      .getElementById(
        "situacaoChaveInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const novoResponsavel =
    document
      .getElementById(
        "responsavelChaveInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const observacoes =
    document
      .getElementById(
        "observacoesMovimentacaoChaveInventario"
      )
      .value
      .trim();


  // ==========================================================
  // VALIDAÇÕES
  // ==========================================================

  if (!idChave) {

    mostrarAlertaGlobal(
      "⚠️ Chave não identificada."
    );

    return;
  }


  if (
    novaSituacao !== "NO_DEPOSITO" &&
    novaSituacao !== "COM_PESSOA"
  ) {

    mostrarAlertaGlobal(
      "⚠️ Selecione uma situação válida."
    );

    return;
  }


  if (
    novaSituacao === "COM_PESSOA" &&
    !novoResponsavel
  ) {

    mostrarAlertaGlobal(
      "⚠️ Selecione o responsável pela chave."
    );

    return;
  }


  // Se a chave vai para o depósito,
  // não deve permanecer nenhum responsável.
  const responsavelFinal =
    novaSituacao === "NO_DEPOSITO"
      ? ""
      : novoResponsavel;


  mostrarSpinner();


  // ==========================================================
  // MOVIMENTAÇÃO
  // ==========================================================

  apiJSONP(
    "movimentarChave",
    {

      idOperador:
        idUsuarioLogado,

      idChave:
        idChave,

      novoResponsavel:
        responsavelFinal,

      novaSituacao:
        novaSituacao,

      observacoes:
        observacoes

    },

    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível movimentar a chave."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Chave movimentada com sucesso."
      );


      // ======================================================
      // LIMPA OS DADOS DA MOVIMENTAÇÃO
      // ======================================================

      chaveSelecionadaMovimentacao =
        null;


      document
        .getElementById(
          "responsavelChaveNomeInventario"
        )
        .value = "";

      document
        .getElementById(
          "responsavelChaveInventario"
        )
        .value = "";

      document
        .getElementById(
          "observacoesMovimentacaoChaveInventario"
        )
        .value = "";


      // ======================================================
      // FECHA A TELA
      // ======================================================

      //fecharTelaMovimentacaoChaveInventario();


      // ======================================================
      // RECARREGA AS CHAVES
      // ======================================================

      carregarChavesDoDepositoFrontend();

    },

    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao movimentar chave:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao movimentar a chave."
      );

    }
  );

}*/
function salvarMovimentacaoChaveFrontend() {

  const idChave =
    document
      .getElementById(
        "idChaveMovimentacaoInventario"
      )
      .value
      .trim();


  const novaSituacao =
    document
      .getElementById(
        "situacaoChaveInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const novoResponsavel =
    document
      .getElementById(
        "responsavelChaveInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const observacoes =
    document
      .getElementById(
        "observacoesMovimentacaoChaveInventario"
      )
      .value
      .trim();


  // ==========================================================
  // VALIDAÇÕES
  // ==========================================================

  if (!idChave) {

    mostrarAlertaGlobal(
      "⚠️ Chave não identificada."
    );

    return;
  }


  if (
    novaSituacao !== "NO_DEPOSITO" &&
    novaSituacao !== "COM_PESSOA"
  ) {

    mostrarAlertaGlobal(
      "⚠️ Selecione uma situação válida."
    );

    return;
  }


  if (
    novaSituacao === "COM_PESSOA" &&
    !novoResponsavel
  ) {

    mostrarAlertaGlobal(
      "⚠️ Selecione o responsável pela chave."
    );

    return;
  }


  // Se a chave vai para o depósito,
  // não deve permanecer nenhum responsável.
  const responsavelFinal =
    novaSituacao === "NO_DEPOSITO"
      ? ""
      : novoResponsavel;


  mostrarSpinner();


  // ==========================================================
  // MOVIMENTAÇÃO
  // ==========================================================

  apiJSONP(
    "movimentarChave",
    {

      idOperador:
        idUsuarioLogado,

      idChave:
        idChave,

      novoResponsavel:
        responsavelFinal,

      novaSituacao:
        novaSituacao,

      observacoes:
        observacoes

    },

    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível movimentar a chave."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ Chave movimentada com sucesso."
      );

      chaveSelecionadaMovimentacao =
        null;

      fecharModalFormularioInventario();
      carregarChavesDoDepositoFrontend();

    },

    function(erro) {

      esconderSpinner();

      console.error(
        "Erro ao movimentar chave:",
        erro
      );

      mostrarAlertaGlobal(
        "⚠️ Erro ao movimentar a chave."
      );

    }
  );

}

// ============================================================
// MODAL UNIVERSAL — INVENTÁRIO
// ============================================================

function abrirModalFormularioInventario(
  titulo,
  conteudo
) {

  const modal =
    document.getElementById(
      "modalFormularioInventario"
    );

  const tituloModal =
    document.getElementById(
      "tituloModalFormularioInventario"
    );

  const conteudoModal =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );


  if (!modal || !tituloModal || !conteudoModal) {

    console.error(
      "Modal universal do inventário não encontrado."
    );

    return;
  }


  tituloModal.textContent =
    titulo || "";


  conteudoModal.innerHTML =
    conteudo || "";


  modal.style.display =
    "flex";

}


// ============================================================
// FECHAR MODAL
// ============================================================

function fecharModalFormularioInventario() {

  const modal =
    document.getElementById(
      "modalFormularioInventario"
    );


  if (!modal) {
    return;
  }


  modal.style.display =
    "none";


  const conteudoModal =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );


  if (conteudoModal) {

    conteudoModal.innerHTML =
      "";

  }

}

function obterHTMLFormularioTipoEquipamento() {

  return `

    <div class="area-formulario-inventario">

      <input
        type="hidden"
        id="idTipoEquipamento"
      >


      <div class="campo-inventario">

        <label for="tipoEquipamento">
          Tipo
        </label>

        <input
          type="text"
          id="tipoEquipamento"
          placeholder="Ex.: Carrinho de Publicações"
        >

      </div>


      <div class="campo-inventario">

        <label for="descricaoTipoEquipamento">
          Descrição
        </label>

        <input
          type="text"
          id="descricaoTipoEquipamento"
          placeholder="Descrição do tipo de equipamento"
        >

      </div>


      <div class="campo-inventario">

        <label for="observacoesTipoEquipamento">
          Observações
        </label>

        <textarea
          id="observacoesTipoEquipamento"
          rows="3"
          placeholder="Observações opcionais"
        ></textarea>

      </div>


      <div class="acoes-formulario-inventario">

        <button
          type="button"
          id="btnSalvarTipoEquipamento"
          onclick="salvarTipoEquipamentoFrontend()"
        >
          💾 Cadastrar
        </button>

        <button
          type="button"
          onclick="fecharModalFormularioInventario()"
        >
          ✖️ Cancelar
        </button>

      </div>

    </div>

  `;
}

// ============================================================
// HTML — FORMULÁRIO DE NOVO EQUIPAMENTO
// ============================================================
function obterHTMLFormularioEquipamento() {

  return `

    <div class="area-formulario-inventario">

      <div class="campo-inventario">

        <label for="idTipoEquipamentoCadastro">
          Tipo de equipamento
        </label>

        <select
          id="idTipoEquipamentoCadastro"
        >

          <option value="">
            - Carregando tipos... -
          </option>

        </select>

      </div>


      <div class="campo-inventario">

        <label for="descricaoEquipamento">
          Descrição
        </label>

        <input
          type="text"
          id="descricaoEquipamento"
          placeholder="Descrição do equipamento"
        >

      </div>


      <div class="campo-inventario">

        <label for="depositoEquipamento">
          Depósito
        </label>

        <select
          id="depositoEquipamento"
        >

          <option value="">
            - Carregando depósitos... -
          </option>

        </select>

      </div>


      <div class="campo-inventario">

        <label for="observacoesEquipamento">
          Observações
        </label>

        <textarea
          id="observacoesEquipamento"
          rows="3"
          placeholder="Observações opcionais"
        ></textarea>

      </div>


      <div class="acoes-formulario-inventario">

        <button
          type="button"
          onclick="salvarEquipamentoFrontend()"
        >
          💾 Cadastrar
        </button>


        <button
          type="button"
          onclick="fecharModalFormularioInventario()"
        >
          ✖️ Cancelar
        </button>

      </div>

    </div>

  `;
}

/*function abrirModalMovimentarEquipamento(equipamento) {

  document.getElementById(
    "idEquipamentoMovimentacao"
  ).value =
    equipamento.idEquipamento || "";

  document.getElementById(
    "equipamentoMovimentacao"
  ).value =
    equipamento.numeroPatrimonio +
    " — " +
    (equipamento.descricao || equipamento.idEquipamento);

  document.getElementById(
    "responsavelAtualMovimentacao"
  ).value =
    mapaParticipantesPorId[
      equipamento.responsavelAtual
    ] ||
    equipamento.responsavelAtual ||
    "Sem responsável";

  document.getElementById(
    "novoResponsavelEquipamento"
  ).value = "";

  document.getElementById(
    "novaSituacaoEquipamento"
  ).value = "";

  document.getElementById(
    "observacoesMovimentacaoEquipamento"
  ).value = "";

  abrirModalInventario(
    "modalMovimentarEquipamento"
  );
}*/
/*function abrirMovimentacaoEquipamentoFrontend(equipamento) {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {
    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔄 Movimentar Equipamento";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idEquipamentoMovimentacao"
      value="${escaparHTML(
        equipamento.idEquipamento || ""
      )}"
    >


    <div class="campo-inventario">

      <label>
        Equipamento
      </label>

      <input
        type="text"
        value="${escaparHTML(
          equipamento.idEquipamento || ""
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label>
        Responsável atual
      </label>

      <input
        type="text"
        value="${escaparHTML(
          mapaParticipantesPorId[
            equipamento.responsavelAtual
          ] ||
          equipamento.responsavelAtual ||
          "Sem responsável"
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label for="novoResponsavelEquipamento">
        Novo responsável
      </label>

      <input
        type="text"
        id="novoResponsavelEquipamento"
        placeholder="Clique para selecionar"
        readonly
        onclick="abrirSelecaoResponsavelEquipamento()"
      >

    </div>


    <div class="campo-inventario">

      <label for="novaSituacaoEquipamento">
        Nova situação
      </label>

      <select id="novaSituacaoEquipamento">

        <option value="">
          - Selecione -
        </option>

        <option value="NO_DEPOSITO">
          No depósito
        </option>

        <option value="EM_USO">
          Em uso
        </option>

        <option value="MANUTENCAO">
          Em manutenção
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="observacoesMovimentacaoEquipamento">
        Observações
      </label>

      <textarea
        id="observacoesMovimentacaoEquipamento"
        rows="3"
        placeholder="Observações da movimentação"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarMovimentacaoEquipamentoFrontend()"
      >
        🔄 Movimentar
      </button>

      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  // Guarda o equipamento que está sendo movimentado
  window.equipamentoSelecionadoMovimentacao =
    equipamento;


  // Abre o MODAL UNIVERSAL
  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}*/
/*function abrirMovimentacaoEquipamentoFrontend(equipamento) {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔄 Movimentar Equipamento";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idEquipamentoMovimentacao"
      value="${escaparHTML(
        equipamento.idEquipamento || ""
      )}"
    >


    <div class="campo-inventario">

      <label>
        Equipamento
      </label>

      <input
        type="text"
        value="${escaparHTML(
          equipamento.idEquipamento || ""
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label>
        Responsável atual
      </label>

      <input
        type="text"
        value="${escaparHTML(
          mapaParticipantesPorId[
            equipamento.responsavelAtual
          ] ||
          equipamento.responsavelAtual ||
          "Sem responsável"
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label for="situacaoEquipamentoMovimentacao">
        Nova situação
      </label>

      <select
        id="situacaoEquipamentoMovimentacao"
      >

        <option value="">
          - Selecione -
        </option>

        <option value="NO_DEPOSITO">
          📦 No depósito
        </option>

        <option value="COM_PESSOA">
          👤 Com pessoa
        </option>

        <option value="MANUTENCAO">
          🔧 Em manutenção
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="responsavelEquipamentoMovimentacao">
        Novo responsável
      </label>

      <input
        type="text"
        id="responsavelEquipamentoMovimentacao"
        placeholder="Selecione primeiro COM PESSOA"
        readonly
        onclick="abrirSelecaoResponsavelEquipamento()"
      >

    </div>


    <div class="campo-inventario">

      <label for="observacoesMovimentacaoEquipamento">
        Observações
      </label>

      <textarea
        id="observacoesMovimentacaoEquipamento"
        rows="3"
        placeholder="Observações da movimentação"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarMovimentacaoEquipamentoFrontend()"
      >
        🔄 Movimentar
      </button>

      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  window.equipamentoSelecionadoMovimentacao =
    equipamento;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}*/
function abrirMovimentacaoEquipamentoFrontend(equipamento) {

const conteudo =
document.getElementById(
"conteudoModalFormularioInventario"
);

const titulo =
document.getElementById(
"tituloModalFormularioInventario"
);

if (!conteudo || !titulo) {

console.error(
  "Modal universal de inventário não encontrado."
);

return;

}

titulo.textContent =
"🔄 Movimentar Equipamento";

conteudo.innerHTML = `

<input
  type="hidden"
  id="idEquipamentoMovimentacao"
  value="${escaparHTML(
    equipamento.idEquipamento || ""
  )}"
>


<div class="campo-inventario">

  <label>
    Equipamento
  </label>

  <input
    type="text"
    value="${escaparHTML(
      equipamento.idEquipamento || ""
    )}"
    readonly
  >

</div>


<div class="campo-inventario">

  <label>
    Responsável atual
  </label>

  <input
    type="text"
    value="${escaparHTML(
      mapaParticipantesPorId[
        equipamento.responsavelAtual
      ] ||
      equipamento.responsavelAtual ||
      "Sem responsável"
    )}"
    readonly
  >

</div>


<div class="campo-inventario">

  <label for="situacaoEquipamentoMovimentacao">
    Nova situação
  </label>

  <select
    id="situacaoEquipamentoMovimentacao"
    onchange="alterarCamposMovimentacaoEquipamentoFrontend()"
  >

    <option value="">
      - Selecione -
    </option>

    <option value="NO_DEPOSITO">
      📦 No depósito
    </option>

    <option value="COM_PESSOA">
      👤 Com pessoa
    </option>

    <option value="MANUTENCAO">
      🔧 Em manutenção
    </option>

  </select>

</div>


<div
  class="campo-inventario"
  id="campoDepositoEquipamentoMovimentacao"
  style="display:none;"
>

  <label for="depositoEquipamentoMovimentacao">
    Depósito
  </label>

  <select
    id="depositoEquipamentoMovimentacao"
  >

    <option value="">
      Carregando depósitos...
    </option>

  </select>

</div>


<div
  class="campo-inventario"
  id="campoResponsavelEquipamentoMovimentacao"
  style="display:none;"
>

  <label for="responsavelEquipamentoMovimentacao">
    Novo responsável
  </label>

  <input
    type="text"
    id="responsavelEquipamentoMovimentacao"
    placeholder="Clique para selecionar"
    readonly
    onclick="abrirSelecaoResponsavelEquipamento()"
  >

</div>


<div class="campo-inventario">

  <label for="observacoesMovimentacaoEquipamento">
    Observações
  </label>

  <textarea
    id="observacoesMovimentacaoEquipamento"
    rows="3"
    placeholder="Observações da movimentação"
  ></textarea>

</div>


<div class="acoes-formulario-inventario">

  <button
    type="button"
    onclick="salvarMovimentacaoEquipamentoFrontend()"
  >
    🔄 Movimentar
  </button>


  <button
    type="button"
    onclick="fecharModalFormularioInventario()"
  >
    ✖️ Cancelar
  </button>

</div>

`;

window.equipamentoSelecionadoMovimentacao =
equipamento;

window.participanteSelecionadoEquipamento =
null;

document
.getElementById(
"modalFormularioInventario"
)
.style.display = "flex";

carregarDepositosParaMovimentacaoEquipamentoFrontend();

}

function alterarCamposMovimentacaoEquipamentoFrontend() {

const situacao =
document
.getElementById(
"situacaoEquipamentoMovimentacao"
)
.value;

const campoDeposito =
document.getElementById(
"campoDepositoEquipamentoMovimentacao"
);

const campoResponsavel =
document.getElementById(
"campoResponsavelEquipamentoMovimentacao"
);

if (!campoDeposito || !campoResponsavel) {
return;
}

campoDeposito.style.display =
situacao === "NO_DEPOSITO"
? "block"
: "none";

campoResponsavel.style.display =
situacao === "COM_PESSOA"
? "block"
: "none";

if (situacao !== "COM_PESSOA") {

window.participanteSelecionadoEquipamento =
  null;

const campo =
  document.getElementById(
    "responsavelEquipamentoMovimentacao"
  );

if (campo) {
  campo.value = "";
}

}

}

function carregarMapaDepositosFrontend(callback) {

  apiJSONP(
    "listarDepositos",
    {
      idUsuarioLogado:
        idUsuarioLogado,

      incluirInativos:
        false
    },

    function(res) {

      if (!res || !res.sucesso) {

        console.error(
          "Não foi possível carregar o mapa de depósitos:",
          res?.mensagem
        );

        window.mapaDepositosPorId = {};

        if (callback) {
          callback(false);
        }

        return;
      }


      window.mapaDepositosPorId = {};


      (res.depositos || []).forEach(
        function(deposito) {

          window.mapaDepositosPorId[
            deposito.idDeposito
          ] = deposito.nome;

        }
      );


      if (callback) {
        callback(true);
      }

    },

    function(erro) {

      console.error(
        "Erro ao carregar mapa de depósitos:",
        erro
      );

      window.mapaDepositosPorId = {};

      if (callback) {
        callback(false);
      }

    }
  );

}

function carregarDepositosParaMovimentacaoEquipamentoFrontend() {

const select =
document.getElementById(
"depositoEquipamentoMovimentacao"
);

if (!select) {
return;
}

apiJSONP(
"listarDepositos",
{
idUsuarioLogado:
idUsuarioLogado,

  incluirInativos:
    false
},

function(res) {

  if (!res || !res.sucesso) {

    select.innerHTML =
      '<option value="">Erro ao carregar depósitos</option>';

    return;
  }

  /*//CRIANDO MAPA DE DEPOSITOS PARA USAR O NOME CO CARREGAMENTO DOS CARDS DE EQUIPAMENTOS. O QUE FAZER SE ISSO FOR PRECISO TAMBÉM EM DEPÓSITOS E CAHVES?
  window.mapaDepositosPorId = {};

  (res.depositos || []).forEach(
    function(deposito) {

      window.mapaDepositosPorId[
        deposito.idDeposito
      ] = deposito.nome;

    }
  );*/


  select.innerHTML =
    '<option value="">- Selecione -</option>';


  (res.depositos || []).forEach(
    function(deposito) {

      const option =
        document.createElement("option");

      option.value =
        deposito.idDeposito;

      option.textContent =
        deposito.nome;

      select.appendChild(option);

    }
  );

},

function(erro) {

  console.error(
    "Erro ao carregar depósitos:",
    erro
  );

  select.innerHTML =
    '<option value="">Erro ao carregar depósitos</option>';

}

);

}




/*function abrirCadastroDepositoFrontend() {


  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🏢 Cadastrar Depósito";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idDepositoInventario"
    >


    <div class="campo-inventario">

      <label for="nomeDepositoInventario">
        Nome do depósito
      </label>

      <input
        type="text"
        id="nomeDepositoInventario"
        placeholder="Nome do depósito"
      >

    </div>


    <div class="campo-inventario">

      <label for="localizacaoDepositoInventario">
        Localização
      </label>

      <input
        type="text"
        id="localizacaoDepositoInventario"
        placeholder="Localização do depósito"
      >

    </div>


    <div class="campo-inventario">

      <label for="responsavelDepositoInventario">
        Responsável
      </label>

      <input
        type="text"
        id="responsavelDepositoInventario"
        placeholder="Clique para selecionar"
        readonly
        onclick="abrirSelecaoDepositos()"
      >

    </div>


    <div class="campo-inventario">

      <label for="ativoDepositoInventario">
        Ativo
      </label>

      <select
        id="ativoDepositoInventario"
      >

        <option value="SIM">
          SIM
        </option>

        <option value="NÃO">
          NÃO
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="observacoesDepositoInventario">
        Observações
      </label>

      <textarea
        id="observacoesDepositoInventario"
        rows="3"
        placeholder="Observações opcionais"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarDepositoFrontend()"
      >
        💾 Salvar
      </button>

      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}*/
function abrirCadastroDepositoFrontend() {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🏢 Cadastrar Depósito";


  conteudo.innerHTML = `

    <div class="area-formulario-inventario">

      <input
        type="hidden"
        id="idDepositoInventario"
      >

      <input
        type="hidden"
        id="ativoDepositoInventario"
        value="SIM"
      >


      <div class="campo-inventario">

        <label for="nomeDepositoInventario">
          Nome do depósito
        </label>

        <input
          type="text"
          id="nomeDepositoInventario"
          placeholder="Ex.: Depósito Principal"
        >

      </div>


      <div class="campo-inventario">

        <label for="localizacaoDepositoInventario">
          Localização
        </label>

        <input
          type="text"
          id="localizacaoDepositoInventario"
          placeholder="Ex.: Sala de equipamentos"
        >

      </div>


      <div class="campo-inventario">

        <label for="responsavelDepositoNomeInventario">
          Responsável
        </label>

        <input
          type="text"
          id="responsavelDepositoNomeInventario"
          readonly
          onclick="abrirSelecaoDepositos()"
          placeholder="Clique para selecionar"
        >

        <input
          type="hidden"
          id="responsavelDepositoInventario"
        >

      </div>


      <div class="campo-inventario">

        <label for="observacoesDepositoInventario">
          Observações
        </label>

        <textarea
          id="observacoesDepositoInventario"
          rows="3"
          placeholder="Observações opcionais"
        ></textarea>

      </div>


      <div class="acoes-formulario-inventario">

        <button
          type="button"
          id="btnSalvarDepositoInventario"
          onclick="salvarDepositoFrontend()"
        >
          💾 Salvar
        </button>


        <button
          type="button"
          id="btnCancelarEdicaoDepositoInventario"
          onclick="cancelarEdicaoDepositoFrontend()"
          style="display:none;"
        >
          ✖️ Cancelar
        </button>

      </div>

    </div>

  `;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}

function abrirCadastroChaveFrontend() {

  const deposito =
    document.getElementById(
      "depositoChavesInventario"
    ).value.trim();


  if (!deposito) {

    mostrarAlertaGlobal(
      "⚠️ Selecione primeiro um depósito."
    );

    return;
  }


  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔑 Cadastrar nova chave";


  conteudo.innerHTML = `

    <div class="area-formulario-inventario">

      <div class="campo-inventario">

        <label>
          Depósito
        </label>

        <input
          type="text"
          value="${escaparHTML(
            document
              .getElementById(
                "depositoChavesInventario"
              )
              .selectedOptions[0]
              ?.textContent || ""
          )}"
          readonly
        >

      </div>


      <div class="campo-inventario">

        <label for="descricaoChaveInventario">
          Descrição
        </label>

        <input
          type="text"
          id="descricaoChaveInventario"
          placeholder="Ex.: Chave do depósito"
        >

      </div>


      <div class="campo-inventario">

        <label for="observacoesChaveInventario">
          Observações
        </label>

        <textarea
          id="observacoesChaveInventario"
          rows="3"
          placeholder="Observações opcionais"
        ></textarea>

      </div>


      <div class="acoes-formulario-inventario">

        <button
          type="button"
          onclick="cadastrarChaveFrontend()"
        >
          🔑 Cadastrar chave
        </button>


        <button
          type="button"
          onclick="fecharModalFormularioInventario()"
        >
          ✖️ Cancelar
        </button>

      </div>

    </div>

  `;


  window.depositoSelecionadoParaChave =
    deposito;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}

/*function abrirMovimentacaoChaveFrontend(chave) {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔑 Movimentar Chave";


  const responsavelAtual =
    mapaParticipantesPorId[
      chave.responsavelAtual
    ] ||
    chave.responsavelAtual ||
    "Sem responsável";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idChaveMovimentacao"
      value="${escaparHTML(
        chave.idChave || ""
      )}"
    >


    <div class="campo-inventario">

      <label>
        Chave
      </label>

      <input
        type="text"
        value="${escaparHTML(
          chave.idChave || ""
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label>
        Responsável atual
      </label>

      <input
        type="text"
        value="${escaparHTML(
          responsavelAtual
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label for="responsavelChaveNomeInventario">
        Novo responsável
      </label>

      <input
        type="text"
        id="responsavelChaveNomeInventario"
        placeholder="Clique para selecionar"
        readonly
        onclick="abrirSelecaoResponsavelChave()"
      >

      <input
        type="hidden"
        id="responsavelChaveInventario"
      >

    </div>


    <div class="campo-inventario">

      <label for="situacaoChaveInventario">
        Nova situação
      </label>

      <select
        id="situacaoChaveInventario"
      >

        <option value="">
          - Selecione -
        </option>

        <option value="NO_DEPOSITO">
          📦 No depósito
        </option>

        <option value="COM_PESSOA">
          👤 Com pessoa
        </option>

        <option value="INATIVA">
          ○ Inativa
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="observacoesMovimentacaoChave">
        Observações
      </label>

      <textarea
        id="observacoesMovimentacaoChave"
        rows="3"
        placeholder="Observações da movimentação"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarMovimentacaoChaveFrontend()"
      >
        🔄 Movimentar
      </button>


      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  window.chaveSelecionadaMovimentacao =
    chave;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}*/
function abrirMovimentacaoChaveFrontend(chave) {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔑 Movimentar Chave";


  const responsavelAtual =
    mapaParticipantesPorId[
      chave.responsavelAtual
    ] ||
    chave.responsavelAtual ||
    "Sem responsável";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idChaveMovimentacaoInventario"
      value="${escaparHTML(
        chave.idChave || ""
      )}"
    >


    <div class="campo-inventario">

      <label>
        Chave
      </label>

      <input
        type="text"
        value="${escaparHTML(
          chave.idChave || ""
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label>
        Responsável atual
      </label>

      <input
        type="text"
        value="${escaparHTML(
          responsavelAtual
        )}"
        readonly
      >

    </div>


    <div class="campo-inventario">

      <label for="responsavelChaveNomeInventario">
        Novo responsável
      </label>

      <input
        type="text"
        id="responsavelChaveNomeInventario"
        placeholder="Clique para selecionar"
        readonly
        onclick="abrirSelecaoResponsavelChave()"
      >

      <input
        type="hidden"
        id="responsavelChaveInventario"
      >

    </div>


    <div class="campo-inventario">

      <label for="situacaoChaveInventario">
        Nova situação
      </label>

      <select
        id="situacaoChaveInventario"
      >

        <option value="">
          - Selecione -
        </option>

        <option value="NO_DEPOSITO">
          📦 No depósito
        </option>

        <option value="COM_PESSOA">
          👤 Com pessoa
        </option>

        <option value="INATIVA">
          ○ Inativa
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="observacoesMovimentacaoChaveInventario">
        Observações
      </label>

      <textarea
        id="observacoesMovimentacaoChaveInventario"
        rows="3"
        placeholder="Observações da movimentação"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarMovimentacaoChaveFrontend()"
      >
        🔄 Movimentar
      </button>


      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  window.chaveSelecionadaMovimentacao =
    chave;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}

function abrirCadastroPermissaoInventarioFrontend() {

  const conteudo =
    document.getElementById(
      "conteudoModalFormularioInventario"
    );

  const titulo =
    document.getElementById(
      "tituloModalFormularioInventario"
    );


  if (!conteudo || !titulo) {

    console.error(
      "Modal universal de inventário não encontrado."
    );

    return;
  }


  titulo.textContent =
    "🔐 Permissão de Inventário";


  conteudo.innerHTML = `

    <input
      type="hidden"
      id="idParticipantePermissaoInventario"
    >


    <div class="campo-inventario">

      <label for="nomeParticipantePermissaoInventario">
        Participante
      </label>

      <input
        type="text"
        id="nomeParticipantePermissaoInventario"
        placeholder="Clique para selecionar"
        readonly
        onclick="abrirSelecaoPermissaoInventario()"
      >

    </div>


    <div class="campo-inventario">

      <label for="permissaoInventario">
        Permissão
      </label>

      <select id="permissaoInventario">

        <option value="">
          - Selecione -
        </option>

        <option value="ADMIN">
          Administrador
        </option>

        <option value="OPERADOR">
          Operador
        </option>

        <option value="MANUTENCAO">
          Manutenção
        </option>

        <option value="CONSULTA">
          Consulta
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="ativoPermissaoInventario">
        Ativo
      </label>

      <select id="ativoPermissaoInventario">

        <option value="SIM">
          SIM
        </option>

        <option value="NÃO">
          NÃO
        </option>

      </select>

    </div>


    <div class="campo-inventario">

      <label for="observacoesPermissaoInventario">
        Observações
      </label>

      <textarea
        id="observacoesPermissaoInventario"
        rows="3"
        placeholder="Observações opcionais"
      ></textarea>

    </div>


    <div class="acoes-formulario-inventario">

      <button
        type="button"
        onclick="salvarPermissaoInventarioFrontend()"
      >
        💾 Salvar permissão
      </button>


      <button
        type="button"
        onclick="fecharModalFormularioInventario()"
      >
        ✖️ Cancelar
      </button>

    </div>

  `;


  document
    .getElementById(
      "modalFormularioInventario"
    )
    .style.display = "flex";

}

function salvarPermissaoInventarioFrontend() {

  const idParticipante =
    document
      .getElementById(
        "idParticipantePermissaoInventario"
      )
      .value
      .trim();


  const permissao =
    document
      .getElementById(
        "permissaoInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const ativo =
    document
      .getElementById(
        "ativoPermissaoInventario"
      )
      .value
      .trim()
      .toUpperCase();


  const observacoes =
    document
      .getElementById(
        "observacoesPermissaoInventario"
      )
      .value
      .trim();


  if (!idParticipante) {

    mostrarAlertaGlobal(
      "⚠️ Selecione o participante."
    );

    return;
  }


  if (!permissao) {

    mostrarAlertaGlobal(
      "⚠️ Selecione a permissão."
    );

    return;
  }


  mostrarSpinner();


  apiJSONP(
    "salvarPermissaoInventario",
    {

      idAdministrador:
        idUsuarioLogado,

      idParticipante:
        idParticipante,

      permissao:
        permissao,

      ativo:
        ativo,

      observacoes:
        observacoes

    },

    function(res) {

      esconderSpinner();


      if (!res || !res.sucesso) {

        mostrarAlertaGlobal(
          "⚠️ " +
          (
            res?.mensagem ||
            "Não foi possível salvar a permissão."
          )
        );

        return;
      }


      mostrarAlertaGlobal(
        "✅ " +
        (
          res.mensagem ||
          "Permissão salva com sucesso."
        )
      );


      fecharModalFormularioInventario();
      //carregarPermissoesInventarioFrontend();

    },

    function(erro) {

      esconderSpinner();


      console.error(
        "Erro ao salvar permissão:",
        erro
      );


      mostrarAlertaGlobal(
        "⚠️ Erro ao salvar a permissão."
      );

    }

  );

}

