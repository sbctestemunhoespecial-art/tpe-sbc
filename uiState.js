// uiState.js

/*const UIState = (() => {

  const campos = {};

  function setCampo(idCampo, objeto) {

    campos[idCampo] = objeto;

    // Atualiza o componente visual, se existir
    if (window.CampoSelecao) {
      CampoSelecao.atualizar(idCampo, objeto);
      return;
    }

    // Compatibilidade com inputs antigos
    const el = document.getElementById(idCampo);

    if (el) {
      el.value =
        objeto?.descricao ||
        objeto?.nome ||
        objeto?.valor ||
        "";
    }

  }

  function getCampo(idCampo) {

    return campos[idCampo] || null;

  }

  function clearCampo(idCampo) {

    delete campos[idCampo];

    if (window.CampoSelecao) {
      CampoSelecao.atualizar(idCampo, null);
      return;
    }

    const el = document.getElementById(idCampo);

    if (el) {
      el.value = "";
    }

  }

  function existeCampo(idCampo) {

    return idCampo in campos;

  }

  function limparTudo() {

    Object.keys(campos).forEach(clearCampo);

  }

  function dump() {

    return structuredClone(campos);

  }

  return {

    setCampo,
    getCampo,
    clearCampo,
    existeCampo,
    limparTudo,
    dump

  };

})();*/
const UIState = (() => {

  const campos = {};

  function atualizarCampoAntigo(idCampo, objeto) {

    const el = document.getElementById(idCampo);

    if (!el) return;

    // Compatibilidade com INPUT/SELECT existentes
    if ("value" in el) {

      el.value =
        objeto?.descricao ??
        objeto?.nome ??
        objeto?.valor ??
        "";

    }

  }

  function setCampo(idCampo, objeto) {

    campos[idCampo] = objeto;

    // Se o novo componente existir,
    // deixa ele cuidar da atualização visual.

    if (
      window.CampoSelecao &&
      typeof CampoSelecao.atualizar === "function"
    ) {

      CampoSelecao.atualizar(
        idCampo,
        objeto
      );

      return;

    }

    atualizarCampoAntigo(
      idCampo,
      objeto
    );

  }

  function getCampo(idCampo) {

    return campos[idCampo] || null;

  }

  function clearCampo(idCampo) {

    delete campos[idCampo];

    if (
      window.CampoSelecao &&
      typeof CampoSelecao.atualizar === "function"
    ) {

      CampoSelecao.atualizar(
        idCampo,
        null
      );

      return;

    }

    atualizarCampoAntigo(
      idCampo,
      null
    );

  }

  function existeCampo(idCampo) {

    return idCampo in campos;

  }

  function limparTudo() {

    Object.keys(campos).forEach(clearCampo);

  }

  function dump() {

    return structuredClone(campos);

  }

  return {

    setCampo,

    getCampo,

    clearCampo,

    existeCampo,

    limparTudo,

    dump

  };

})();