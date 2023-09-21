import hardcoded from "../hardcodedValues"

class EspaiderMatriculaDataStructure
{
    constructor({
        matricula, numeroDoProcesso, negativacao, cobrança,
        pegarHistorico = hardcoded.pegarHistoricoMatricula
    }) {
        Object.assign(this, {
            matricula, numeroDoProcesso, negativacao, cobrança, pegarHistorico
        })
    }


}

export default EspaiderMatriculaDataStructure