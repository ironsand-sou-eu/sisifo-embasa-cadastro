import { loadOptionsInSheetRange } from "../../connectors/google-sheets"
import EspaiderProvidenciaDataStructure from "../../data-structures/EspaiderProvidenciaDataStructure"
import EspaiderProcessoDataStructure from "../../data-structures/EspaiderProcessoDataStructure"
import EspaiderAndamentoDataStructure from "../../data-structures/EspaiderAndamentoDataStructure"
import EspaiderParteDataStructure from "../../data-structures/EspaiderParteDataStructure"
import EspaiderPedidoDataStructure from "../../data-structures/EspaiderPedidoDataStructure"
import EspaiderMatriculaDataStructure from "../../data-structures/EspaiderMatriculaDataStructure"
import { impedirCobrancaMatricula, impedirNegativacaoMatricula, planilhaBloquearMatricula, planilhaUnidadesELs, responsavelType } from "../../enums"
import Exception from "../../exceptions/Exception"
import generateErrMsg from "../../exceptions/error-message-generator"
import hardcoded from "../../hardcodedValues"
import useUpdateCausaPedir from "./useUpdateCausaPedir.jsx"
import useIdGenerator from "./useIdGenerator.jsx"
import Drafter from "../../adapters/drafter"
import { isNumber, parteEhEmbasa } from "../../utils/utils"

export default function usePostConfirmationAdapter(scrappedInfo, confirmedInfo, msgSetter) {
    const { getNucleoResp } = useUpdateCausaPedir(confirmedInfo)
    const { generateAndamentoId, generateProvidenciaId, generatePedidoId } = useIdGenerator()
    
    async function finalizeProcessoInfo() {
        const { espaiderProcessoMerged, espaiderPartesMerged, espaiderAndamentosMerged, espaiderPedidosMerged,
            providenciasParams } = mergeConfirmedInfo(scrappedInfo, confirmedInfo)
        
        const espaiderProcesso = await finalAdaptProcesso(espaiderProcessoMerged, providenciasParams.dates.subsidios)
        const espaiderAndamentos = finalAdaptAndamentos(espaiderAndamentosMerged, confirmedInfo.numeroProcesso)
        const espaiderProvidencias = await finalAdaptProvidencias(providenciasParams.values, confirmedInfo.nucleo,
            confirmedInfo.advogado, espaiderProcesso.prepostoNucleo, espaiderAndamentos[0].id)
        const espaiderPartes = finalAdaptPartes(espaiderPartesMerged)
        const espaiderPedidos = finalAdaptPedidos(espaiderPedidosMerged, confirmedInfo.numeroProcesso, espaiderProcesso.dataCitacao)
        const espaiderMatricula = await adaptMatricula(confirmedInfo.matricula, confirmedInfo.numeroProcesso,
            espaiderProcesso.comarca, espaiderProcesso.gerencia)
        
        // if (Drafter.hasErrors([espaiderProvidencias])) throw new Exception(espaiderProvidencias.errorMsgs, msgSetter)
        
        console.log({ espaiderProcesso, espaiderMatricula, espaiderPartes, espaiderAndamentos, espaiderPedidos, espaiderProvidencias }, msgSetter)
        // createAll({ espaiderProcesso, espaiderMatricula, espaiderPartes, espaiderAndamentos, espaiderPedidos, espaiderProvidencias }, msgSetter)
    }

    function mergeConfirmedInfo(scrappedInfo, confirmedInfo) {
        const { espaiderProcesso, espaiderPartes, espaiderAndamentos, espaiderPedidos } = scrappedInfo
        const espaiderProcessoMerge = {
            nucleo: confirmedInfo.nucleo,
            advogado: confirmedInfo.advogado,
            causaPedir: confirmedInfo.causaPedir,
            comarca: confirmedInfo.comarca,
            dataCitacao: confirmedInfo.dataCitacao,
            gerencia: confirmedInfo.gerencia,
            natureza: confirmedInfo.natureza,
            numeroProcesso: confirmedInfo.numeroProcesso,
            rito: confirmedInfo.rito,
            tipoAcao: confirmedInfo.tipoAcao,
        }
        const espaiderPartesMerge = {
            partesRequerentes: confirmedInfo.partesRequerentes,
            partesRequeridas: confirmedInfo.partesRequeridas
        }

        const espaiderProcessoMerged = { ...espaiderProcesso, ...espaiderProcessoMerge }
        const espaiderPartesMerged = { ...espaiderPartes, ...espaiderPartesMerge }
        const espaiderPedidosMerged = [ ...espaiderPedidos, ...confirmedInfo.pedidos ]
        const espaiderAndamentosMerged = espaiderAndamentos
        espaiderAndamentosMerged[0].nome = confirmedInfo.nomeAndamento
        espaiderAndamentosMerged[0].data = confirmedInfo.dataAndamento

        const allEspaiderPartes = {
            clientRole: espaiderPartesMerged.clientRole,
            values: [
            ...espaiderPartesMerged.partesRequerentes,
            ...espaiderPartesMerged.partesRequeridas,
            ...espaiderPartesMerged.terceiros
            ]
        }
        return {
            espaiderProcessoMerged,
            espaiderPartesMerged: allEspaiderPartes,
            espaiderPedidosMerged,
            espaiderAndamentosMerged,
            providenciasParams: confirmedInfo.providenciasParams
        }
    }

    async function finalAdaptProcesso({ numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
        advogadoAdverso, valorCausa, natureza, tipoAcao, causaPedir, orgao, juizo, comarca, rito, nucleo, advogado,
        responsavelRegressivo, dataCitacao, gerencia, sistema, errorMsgs }, providenciaSubsidiosDate) {
        const { unidade, divisao } = await getUnidadeDivisaoFromLocalidadeCode()
        const siglaUnidade = unidade.split(" - ")[0]
        const prepostoNucleo = await getNucleoResp(responsavelType.preposto, gerencia, causaPedir, providenciaSubsidiosDate, siglaUnidade, divisao)
        
        return new EspaiderProcessoDataStructure({ numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso,
            condicaoAdverso, advogadoAdverso, valorCausa, natureza, tipoAcao, causaPedir, unidade, divisao,
            orgao, juizo, comarca, rito, nucleo, advogado, prepostoNucleo, responsavelRegressivo, dataCitacao: new Date(dataCitacao),
            gerencia, sistema, errorMsgs })
    }

    async function getUnidadeDivisaoFromLocalidadeCode() {
        const sheetName = planilhaUnidadesELs
        const operator = isNumber(confirmedInfo.localidadeCode) ? "numericEquality" : "insensitiveStrictEquality"
        const foundEntries = await loadOptionsInSheetRange(sheetName, null,
            { operator, val: confirmedInfo.localidadeCode}, false, false)
        if (foundEntries < 1) return null
        const [ , , unidade, , divisao ] = foundEntries[0]
        return { unidade, divisao }
    }

    function finalAdaptAndamentos(espaiderAndamentos, numeroDoProcesso) {
        return espaiderAndamentos.map(andamento => {
            const nome = andamento.nome
            const obs = andamento.obs
            const data = new Date(andamento.data)
            const id = generateAndamentoId(numeroDoProcesso, andamento.id)
            const numeroDoDesdobramento = numeroDoProcesso
            return new EspaiderAndamentoDataStructure({ nome, obs, data, id, numeroDoProcesso, numeroDoDesdobramento })
        })
    }

    async function finalAdaptProvidencias(providenciasParams, nucleo, advogado, preposto, idAndamento) {
        return providenciasParams.map((providParamsValues, index) => {
            const responsavel = providParamsValues.tipoResponsavel === "advogado" ? advogado : preposto
            const numeroDoProcesso = providParamsValues.numeroDoProcesso
            const numeroDoDesdobramento = providParamsValues.numeroDoDesdobramento
            const nome = providParamsValues.nome
            const dataFinal = new Date(providParamsValues.dataFinal)
            const alertar = providParamsValues.alertar
            const diasAntecedenciaAlerta = providParamsValues.diasAntecedenciaAlerta
            const gerarAndamento = providParamsValues.gerarAndamento
            const nomeAndamentoParaGerar = providParamsValues.nomeAndamentoParaGerar
            const obs = providParamsValues.obs
            const id = generateProvidenciaId(numeroDoProcesso, dataFinal, index)
            return new EspaiderProvidenciaDataStructure({
                id, idAndamento, nome, dataFinal, alertar, diasAntecedenciaAlerta, nucleo, responsavel,
                obs, gerarAndamento, numeroDoProcesso, numeroDoDesdobramento, nomeAndamentoParaGerar
            })
        })
    }

    function finalAdaptPartes(espaiderPartes) {
        const values = espaiderPartes.values
        deleteFirstParte(values)
        const litisconsortes = stripPartesEmbasa(values)
        return litisconsortes.map(litisconsorte => {
            const nome = litisconsorte.nome
            const cpfCnpj = litisconsorte.cpfCnpj
            const tipo = litisconsorte.tipo
            const condicao = litisconsorte.condicao
            const classe = litisconsorte.classe
            const semCpfCnpj = litisconsorte.semCpfCnpj
            return new EspaiderParteDataStructure({ nome, cpfCnpj, tipo, condicao, classe, semCpfCnpj })
        })
    }

    function deleteFirstParte(partes) {
        partes.shift()
    }

    function stripPartesEmbasa(partes) {
        return partes.filter(({nome}) => !parteEhEmbasa(nome))
    }

    function finalAdaptPedidos(espaiderPedidos, numeroDoProcesso, dataCitacao) {
        return espaiderPedidos.map(pedido => {
            const id = generatePedidoId(numeroDoProcesso, pedido.idComponent)
            const nome = pedido.nome
            const valor = pedido.valorPedido
            const databaseAtualizacao = dataCitacao
            const databaseJuros = dataCitacao
            const riscoOriginal = pedido.estimativaTipo
            const valorRiscoOriginal = pedido.valorProvisionado
            const estimativaPagamento = new Date(dataCitacao.getTime() + 365 * 24 * 60 * 60 * 1000)
            return new EspaiderPedidoDataStructure({
                id, numeroDoProcesso, nome, valor, databaseAtualizacao, databaseJuros,
                riscoOriginal, valorRiscoOriginal, estimativaPagamento
            })
        })
    }

    async function adaptMatricula(matricula, numeroDoProcesso, comarca, gerencia) {
        const bloqueioParams = {
            sim: { negativacao: impedirNegativacaoMatricula.sim, cobrança: impedirCobrancaMatricula.sim },
            nao: { negativacao: impedirNegativacaoMatricula.nao, cobrança: impedirCobrancaMatricula.nao }
        }
        const shouldBlock = await bloquearMatricula(comarca, gerencia)
        const res = bloqueioParams[shouldBlock]
        const { negativacao, cobrança } = bloqueioParams[shouldBlock]
        return new EspaiderMatriculaDataStructure({ matricula, numeroDoProcesso, negativacao, cobrança })
    }

    async function bloquearMatricula(comarca, gerencia) {
        const sheetName = planilhaBloquearMatricula
        const foundEntries = await loadOptionsInSheetRange(sheetName, null,
            { operator: "insensitiveStrictEquality", val: comarca}, false, false)
        if (foundEntries.length < 1) return null
        const [ , ppjcm, ppjce ] = foundEntries[0]
        const switchObj = { ppjcm, ppjce }
        const resultado = switchObj[gerencia.toLowerCase()].toLowerCase()
        return resultado === "não" ? "nao" : resultado
    }

    return { finalizeProcessoInfo }
}