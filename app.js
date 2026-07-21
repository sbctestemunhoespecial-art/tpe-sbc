let idVagaNotificacao = null;
let campoDestinoModal = null;
let listaModalAtual = [];

window.LISTAS_MODAL = {

    dias: [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo"
    ],

    turnos: [
        "Matinal",
        "Manhã",
        "Tarde",
        "Noite"
    ],

    frequencias: [
        "Semanal",
        "Quinzenal",
        "Mensal"
    ],

    necessidades: [
        "Um irmão",
        "Uma irmã",
        "Uma dupla"
    ],

    equipamentos: [
        "Carrinho 1",
        "Carrinho 2",
        "Display"
    ]

};

window.LISTAS_MODAL.turnos2h = [
    "Manhã (9-11h)",
    "Manhã (11-13h)",
    "Tarde (13-15h)",
    "Tarde (15-17h)"
];

const DESCRICOES_TURNOS = {

  A: {
    descricao: "Matinal",
    periodo: ""
  },

  M: {
    descricao: "Manhã",
    periodo: ""
  },

  MA: {
    descricao: "Manhã",
    periodo: "1º período"
  },

  MB: {
    descricao: "Manhã",
    periodo: "2º período"
  },

  T: {
    descricao: "Tarde",
    periodo: ""
  },

  TA: {
    descricao: "Tarde",
    periodo: "1º período"
  },

  TB: {
    descricao: "Tarde",
    periodo: "2º período"
  },

  N: {
    descricao: "Noite",
    periodo: ""
  }

};

/*console.log(
  "DESCRICOES_TURNOS carregado:",
  DESCRICOES_TURNOS
);*/

// =====================================
// Estado Global dos Campos da Interface
// =====================================

window.camposSelecionados = {};
window.opcoesDias = [];

window.modalSelecaoAtual = null;

function obterAbaPonto(ponto, turno) {

    if (!window.pontosSistema) {
        console.warn(
            "Catálogo de pontos ainda não carregado"
        );
        return null;
    }


    const dadosPonto =
        window.pontosSistema[ponto];


    if (!dadosPonto) {

        console.warn(
            "Ponto não encontrado:",
            ponto
        );

        return null;

    }


    const dadosTurno =
        dadosPonto.turnos[turno];


    if (!dadosTurno) {

        console.warn(
            "Turno não encontrado:",
            ponto,
            turno
        );

        return null;

    }


    return dadosTurno.aba;

}

function listarTurnosDoPonto(ponto) {


    if (!window.pontosSistema) {

        return [];

    }


    const dadosPonto =
        window.pontosSistema[ponto];


    if (!dadosPonto) {

        return [];

    }


    return Object.values(dadosPonto.turnos)

        .map(turno => {


            let texto =
                turno.descricao;


            if (turno.periodo) {

                texto +=
                    " - " + turno.periodo;

            }


            return {

                valor: turno.codigo,

                texto

            };


        });


}
