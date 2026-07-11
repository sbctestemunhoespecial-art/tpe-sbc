/*window.pontosSistema = null;

function construirCatalogoPontos(pontos) {

    const regex = /^([A-Z]+)(\d+)$/i;

    window.pontosSistema = {};

    pontos.forEach(nomeAba => {

        const match = nomeAba.match(regex);

        if (!match) return;

        const prefixo = match[1];
        const numero = Number(match[2]);

        const descricao = `Ponto ${numero}`;

        if (!window.pontosSistema[descricao]) {

            window.pontosSistema[descricao] = {

                numero,
                descricao,
                turnos: {}

            };

        }

        const infoTurno =
            DESCRICOES_TURNOS[prefixo] || {

                descricao: prefixo,
                periodo: ""

            };

        window.pontosSistema[descricao]
            .turnos[prefixo] = {

            codigo: prefixo,
            aba: nomeAba,
            descricao: infoTurno.descricao,
            periodo: infoTurno.periodo

        };

    });

}

async function garantirCatalogoPontos() {

    if (window.pontosSistema) {
        return;
    }

    return new Promise((resolve, reject) => {

        apiJSONP(

            "obterDadosFormulario",

            {},

            function(res){

                construirCatalogoPontos(
                    res.pontos || []
                );

                resolve();

            },

            function(err){

                reject(err);

            }

        );

    });

}*/


