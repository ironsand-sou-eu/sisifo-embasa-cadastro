import hardcoded from "../hardcodedValues"

class EspaiderMatriculaDataStructure
{
    constructor({
        matricula, numeroProcesso, negativacao, cobranca,
        pegarHistorico = hardcoded.pegarHistoricoMatricula
    }) {
        Object.assign(this, {
            matricula, numeroProcesso, negativacao, cobranca, pegarHistorico
        })
    }


}

export default EspaiderMatriculaDataStructure