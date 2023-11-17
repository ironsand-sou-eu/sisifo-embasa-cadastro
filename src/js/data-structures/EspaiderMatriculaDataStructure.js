import hardcoded from "../hardcodedValues";

export default class EspaiderMatriculaDataStructure {
  constructor({
    matricula,
    numeroProcesso,
    negativacao,
    cobranca,
    pegarHistorico = hardcoded.pegarHistoricoMatricula,
  } = {}) {
    Object.assign(this, {
      matricula,
      numeroProcesso,
      negativacao,
      cobranca,
      pegarHistorico,
    });
  }
}
