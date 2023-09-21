import hardcoded from "../hardcodedValues"

class EspaiderProvidenciaDataStructure
{
    constructor({
        id, idAndamento, nome, dataFinal, alertar, diasAntecedenciaAlerta, nucleo, responsavel,
        obs, gerarAndamento, numeroDoProcesso, numeroDoDesdobramento, nomeAndamentoParaGerar,
        periodicidade = hardcoded.periodicidadeAlertaProvidencia, 
        codigoDatabaseAndamentoParaGerar = hardcoded.codigoDatabaseAndamentoProvidencia,
        prazo = hardcoded.prazoProvidencia, situacao = hardcoded.situacaoProvidencia
    })
    {
        Object.assign(this, {
            id, idAndamento, nome, prazo, situacao, alertar, diasAntecedenciaAlerta,
            periodicidade, nucleo, responsavel, obs, gerarAndamento, numeroDoProcesso,
            numeroDoDesdobramento, nomeAndamentoParaGerar, codigoDatabaseAndamentoParaGerar,
            dataFinal: dataFinal ? new Date(dataFinal.getTime()) : undefined
        })
    }
}

export default EspaiderProvidenciaDataStructure