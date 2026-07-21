// =======================================
// Componente CampoSelecao
// Substitui gradualmente os <select>
// =======================================

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