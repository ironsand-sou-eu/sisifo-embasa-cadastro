import hardcoded from "../hardcodedValues"

class EspaiderMatriculaDataStructure
{
    constructor(
        matricula, negativacao, cobrança,
        pegarHistorico = hardcoded.pegarHistoricoMatricula, numeroDoProcesso
    ) {
        Object.assign(this, {
            matricula, negativacao, cobrança, pegarHistorico, numeroDoProcesso
        })
    }


}

export default EspaiderMatriculaDataStructure