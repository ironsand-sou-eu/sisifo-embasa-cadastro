import hardcoded from "../hardcodedValues"

class EspaiderPedidoDataStructure
{
    constructor(id, nome, valor, databaseAtualizacao, riscoOriginal,
        riscoBaseadoEm = hardcoded.riscoBaseadoEmPedido, valorRiscoOriginal,
        estimativaPagamento, indiceAtualizacao = hardcoded.indiceAtualizacaoPedido,
        databaseJuros, porcentagemJuros = hardcoded.porcentagemJuros, numeroDoProcesso) {
        Object.assign(this, {
            id, nome, valor, riscoOriginal, riscoBaseadoEm, valorRiscoOriginal,
            estimativaPagamento, indiceAtualizacao, porcentagemJuros, numeroDoProcesso,
            databaseAtualizacao: databaseAtualizacao ? new Date(databaseAtualizacao.getTime()) : undefined,
            databaseJuros: databaseJuros ? new Date(databaseJuros.getTime()) : undefined
        })
    }
}

export default EspaiderPedidoDataStructure