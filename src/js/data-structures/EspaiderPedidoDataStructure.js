import hardcoded from "../hardcodedValues";

export default class EspaiderPedidoDataStructure {
  constructor({
    id,
    numeroProcesso,
    nome,
    valor,
    databaseAtualizacao,
    databaseJuros,
    riscoOriginal,
    valorRiscoOriginal,
    estimativaPagamento,
    riscoBaseadoEm = hardcoded.riscoBaseadoEmPedido,
    indiceAtualizacao = hardcoded.indiceAtualizacaoPedido,
    porcentagemJuros = hardcoded.porcentagemJuros,
  } = {}) {
    Object.assign(this, {
      id,
      nome,
      valor,
      riscoOriginal,
      riscoBaseadoEm,
      valorRiscoOriginal,
      estimativaPagamento,
      indiceAtualizacao,
      porcentagemJuros,
      numeroProcesso,
      databaseAtualizacao: databaseAtualizacao
        ? new Date(databaseAtualizacao.getTime())
        : undefined,
      databaseJuros: databaseJuros
        ? new Date(databaseJuros.getTime())
        : undefined,
    });
  }
}
