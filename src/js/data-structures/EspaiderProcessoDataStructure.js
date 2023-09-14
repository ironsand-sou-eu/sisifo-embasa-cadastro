import hardcoded from "../hardcodedValues"

class EspaiderProcessoDataStructure
{
    constructor(nucleo, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso, advogadoNucleo,
        prepostoNucleo, valorCausa, unidade, divisao, numeroProcesso, natureza,
        classeProcesso = hardcoded.classeProcesso, tipoAcao, causaPedir, orgao, juizo, comarca, rito,
        fase = hardcoded.fase, advogadoAdverso, nomeDesdobramento = hardcoded.nomeDesdobramento,
        responsavelRegressivo, peticionamento = hardcoded.peticionamento,
        nomeEmbasa = hardcoded.nomeEmbasa, cnpjEmbasa = hardcoded.cnpjEmbasa,
        tipoEmpresaEmbasa = hardcoded.tipoEmpresaEmbasa,
        condicaoEmpresaEmbasa = hardcoded.condicaoEmpresaEmbasa, dataCitacao, gerencia,
        sistema, tribunal, errorMsgs = [])
    {
        Object.assign(this, {
            nucleo, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso, advogadoNucleo,
            prepostoNucleo, valorCausa, unidade, divisao, numeroProcesso, natureza,
            classeProcesso, tipoAcao, causaPedir, orgao, juizo, comarca, rito, fase,
            nomeDesdobramento, advogadoAdverso, responsavelRegressivo, peticionamento,
            nomeEmbasa, cnpjEmbasa, tipoEmpresaEmbasa, condicaoEmpresaEmbasa, gerencia,
            sistema, tribunal, errorMsgs,
            dataCitacao: dataCitacao ? new Date(dataCitacao.getTime()) : undefined
        })
    }
}

export default EspaiderProcessoDataStructure