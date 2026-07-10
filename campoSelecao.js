// =======================================
// Componente CampoSelecao
// Substitui gradualmente os <select>
// =======================================

/*const CampoSelecao = (() => {


  function criar(idCampo, configuracao = {}) {

    const elemento =
      document.getElementById(idCampo);


    if (!elemento) {

      console.warn(
        "CampoSelecao: elemento não encontrado:",
        idCampo
      );

      return;

    }


    elemento.classList.add(
      "campo-selecao"
    );


    elemento.innerHTML = `

      <div class="campo-label">

        ${configuracao.label || ""}

      </div>


      <div class="campo-box">

        <div class="campo-conteudo">

          <div class="campo-titulo">

            ${configuracao.placeholder || "Selecione..."}

          </div>


          <div class="campo-subtitulo">

          </div>

        </div>


        <div class="campo-icone">

          ▼

        </div>

      </div>

    `;


    elemento.onclick = function() {


      if (
        configuracao.abrir
        &&
        typeof configuracao.abrir === "function"
      ) {

        configuracao.abrir();

      }


    };


  }



  function atualizar(idCampo, objeto) {


    const elemento =
      document.getElementById(idCampo);


    if (!elemento) return;


    const titulo =
      elemento.querySelector(
        ".campo-titulo"
      );


    const subtitulo =
      elemento.querySelector(
        ".campo-subtitulo"
      );


    if (!objeto) {


      if (titulo) {

        titulo.textContent =
          "Selecione...";

      }


      if (subtitulo) {

        subtitulo.textContent =
          "";

      }


      return;

    }


    if (titulo) {


      titulo.textContent =
        objeto.descricao ||
        objeto.nome ||
        objeto.valor ||
        "";


    }


    if (subtitulo) {


      subtitulo.textContent =
        objeto.subtitulo || "";


    }


  }



  function obterValor(idCampo) {


    const estado =
      UIState.getCampo(
        idCampo
      );


    return estado;

  }



  return {


    criar,

    atualizar,

    obterValor


  };


})();*/
const CampoSelecao = {

    criar(idCampo, configuracao = {}) {


        const elemento =
            document.getElementById(idCampo);


        if (!elemento) {

            console.warn(
                "Campo não encontrado:",
                idCampo
            );

            return;

        }


        elemento.className =
            "campo-selecao";


        elemento.innerHTML = `

            <div class="campo-box">

                <span class="campo-texto">
                    ${configuracao.placeholder || "Selecione"}
                </span>

                <span>
                    ▼
                </span>

            </div>

        `;


        elemento.onclick = () => {


            if(configuracao.abrir){

                configuracao.abrir();

            }


        };


    },


    atualizar(idCampo, texto){


        const elemento =
            document.getElementById(idCampo);


        if(!elemento) return;


        const campo =
            elemento.querySelector(
                ".campo-texto"
            );


        if(campo){

            campo.textContent =
                texto ||
                "Selecione";

        }


    }

};