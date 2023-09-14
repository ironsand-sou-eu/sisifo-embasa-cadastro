import hardcoded from "../hardcodedValues"

class EspaiderProvidenciaDataStructure
{
    constructor(
        id, idAndamento, nome, dataFinal, prazo = hardcoded.prazoProvidencia,
        situacao = hardcoded.situacaoProvidencia, alertar = hardcoded.alertarProvidencia,
        diasAntecedenciaAlerta = hardcoded.antecedenciaAlertaProvidencia,
        periodicidade = hardcoded.periodicidadeAlertaProvidencia, dataAlerta,
        nucleo, responsavel, obs, gerarAndamento = hardcoded.gerarAndamentoProvidenciaContestar,
        numeroDoProcesso, numeroDoDesdobramento, nomeAndamentoParaGerar = hardcoded.nomeAndamentoParaGerarNaProvidencia,
        codigoDatabaseAndamentoParaGerar = hardcoded.codigoDatabaseAndamentoProvidencia
    )
    {
        Object.assign(this, {
            id, idAndamento, nome, prazo, situacao, alertar, diasAntecedenciaAlerta,
            periodicidade, nucleo, responsavel, obs, gerarAndamento, numeroDoProcesso,
            numeroDoDesdobramento, nomeAndamentoParaGerar, codigoDatabaseAndamentoParaGerar,
            dataFinal: dataFinal ? new Date(dataFinal.getTime()) : undefined,
            dataAlerta: dataAlerta ? new Date(dataAlerta.getTime()) : undefined,
        })
    }
}

export default EspaiderProvidenciaDataStructure