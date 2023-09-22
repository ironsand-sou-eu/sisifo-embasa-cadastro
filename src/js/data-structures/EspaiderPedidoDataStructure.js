import hardcoded from "../hardcodedValues"

class EspaiderPedidoDataStructure
{
    constructor({
        id, numeroProcesso, nome, valor, databaseAtualizacao,
        databaseJuros, riscoOriginal, valorRiscoOriginal, estimativaPagamento,
        riscoBaseadoEm = hardcoded.riscoBaseadoEmPedido,
        indiceAtualizacao = hardcoded.indiceAtualizacaoPedido,
        porcentagemJuros = hardcoded.porcentagemJuros
    }) {
        Object.assign(this, {
            id, nome, valor, riscoOriginal, riscoBaseadoEm, valorRiscoOriginal,
            estimativaPagamento, indiceAtualizacao, porcentagemJuros, numeroProcesso,
            databaseAtualizacao: databaseAtualizacao ? new Date(databaseAtualizacao.getTime()) : undefined,
            databaseJuros: databaseJuros ? new Date(databaseJuros.getTime()) : undefined
        })
    }
}

export default EspaiderPedidoDataStructure