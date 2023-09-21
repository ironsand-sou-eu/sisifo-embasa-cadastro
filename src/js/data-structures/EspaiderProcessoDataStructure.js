import hardcoded from "../hardcodedValues"

class EspaiderProcessoDataStructure
{
    constructor({ numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso, advogadoAdverso,
        valorCausa, natureza, tipoAcao, causaPedir, orgao, juizo, comarca, rito, nucleo, advogado,
        prepostoNucleo, unidade, divisao, responsavelRegressivo, dataCitacao, gerencia, sistema, errorMsgs = [],
        peticionamento = hardcoded.peticionamento, nomeEmbasa = hardcoded.nomeEmbasa,
        cnpjEmbasa = hardcoded.cnpjEmbasa, tipoEmpresaEmbasa = hardcoded.tipoEmpresaEmbasa,
        condicaoEmpresaEmbasa = hardcoded.condicaoEmpresaEmbasa, nomeDesdobramento = hardcoded.nomeDesdobramento,
        fase = hardcoded.fase, classe = hardcoded.classeProcesso })
    {
        Object.assign(this, {
            numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
            advogadoAdverso, valorCausa, natureza, classe, tipoAcao, causaPedir, orgao,
            juizo, comarca, rito, fase, nucleo, advogado, prepostoNucleo, unidade,
            divisao, nomeDesdobramento, responsavelRegressivo, peticionamento, nomeEmbasa,
            cnpjEmbasa, tipoEmpresaEmbasa, condicaoEmpresaEmbasa, gerencia, sistema, errorMsgs,
            dataCitacao: dataCitacao ? new Date(dataCitacao.getTime()) : undefined
        })
    }
}

export default EspaiderProcessoDataStructure