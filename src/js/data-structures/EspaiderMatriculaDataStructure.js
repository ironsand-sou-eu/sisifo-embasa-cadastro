import hardcoded from "../hardcodedValues"

class EspaiderMatriculaDataStructure
{
    constructor({
        matricula, numeroProcesso, negativacao, cobrança,
        pegarHistorico = hardcoded.pegarHistoricoMatricula
    }) {
        Object.assign(this, {
            matricula, numeroProcesso, negativacao, cobrança, pegarHistorico
        })
    }


}

export default EspaiderMatriculaDataStructure