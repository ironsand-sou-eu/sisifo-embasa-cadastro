import hardcoded from "../hardcodedValues"

class EspaiderProcessoDataStructure
{
    constructor(numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
        advogadoAdverso, valorCausa, natureza, classe = hardcoded.classeProcesso, tipoAcao,
        causaPedir, orgao, juizo, comarca, rito, fase = hardcoded.fase, nucleo, advogadoNucleo,
        prepostoNucleo, unidade, divisao, nomeDesdobramento = hardcoded.nomeDesdobramento,
        responsavelRegressivo, peticionamento = hardcoded.peticionamento,
        nomeEmbasa = hardcoded.nomeEmbasa, cnpjEmbasa = hardcoded.cnpjEmbasa,
        tipoEmpresaEmbasa = hardcoded.tipoEmpresaEmbasa,
        condicaoEmpresaEmbasa = hardcoded.condicaoEmpresaEmbasa, dataCitacao, gerencia,
        sistema, errorMsgs = [])
    {
        Object.assign(this, {
            numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
            advogadoAdverso, valorCausa, natureza, classe, tipoAcao, causaPedir, orgao,
            juizo, comarca, rito, fase, nucleo, advogadoNucleo, prepostoNucleo, unidade,
            divisao, nomeDesdobramento, responsavelRegressivo, peticionamento, nomeEmbasa,
            cnpjEmbasa, tipoEmpresaEmbasa, condicaoEmpresaEmbasa, gerencia, sistema, errorMsgs,
            dataCitacao: dataCitacao ? new Date(dataCitacao.getTime()) : undefined
        })
    }
}

export default EspaiderProcessoDataStructure