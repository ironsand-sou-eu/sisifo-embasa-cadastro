import { gerencias, planilhaProvidenciasPorGerencia,
    planilhaResponsaveisPorGerencia, responsavelType, sistemas } from "../../enums"
import hardcoded from "../../hardcodedValues"
import { useGoogleSheets } from "./connectors/useGoogleSheets"

export default function useUpdateCausaPedir(confirmedData, setLoading) {
    const { loadSheetRange } = useGoogleSheets()

    async function updateCausaPedir(causaPedir, setFormData) {
        if (!confirmedData) return
        setFormData(causaPedir, "causaPedir")
        setLoading({ scrapping: true, creating: false })

        const [ naturezaGerenciaFoundEntries, pedidosFoundEntries, allPedidosFoundEntries ] =
            await makeCausaPedirAndIndependentFetches(causaPedir)
            
        const { natureza, gerencia } = getNaturezaGerenciaByCausaPedir(naturezaGerenciaFoundEntries)
        setFormData(natureza, "natureza")
        setFormData(gerencia, "gerencia")

        const pedidos = getStandardPedidos(pedidosFoundEntries, allPedidosFoundEntries)
        setFormData(pedidos, "pedidos")

        const providenciasParams = await getProvidenciasParams(gerencia, causaPedir)
        setFormData(providenciasParams, "providenciasParams")

        const { nucleo, responsavelInfo } = await getNucleoResp(responsavelType.advogado, gerencia, causaPedir, providenciasParams.dates.contestar)
        setFormData(nucleo, "nucleo")
        setFormData(responsavelInfo, "advogadoInfo")
        setFormData(responsavelInfo.nome, "advogado")
        setLoading({ scrapping: false, creating: false })
    }

    async function makeCausaPedirAndIndependentFetches(causaPedir) {
        const naturezaGerenciaFoundValues = loadSheetRange(hardcoded.listaCausasPedirSheet,
            null, { operator: "insensitiveStrictEquality", val: causaPedir}, false, false)
        const foundEntries = loadSheetRange(hardcoded.causasDePedirPedidosSheet,
            null, { operator: "insensitiveStrictEquality", val: causaPedir}, false, false)
        const allPedidosCodesAndNames = loadSheetRange(hardcoded.pedidosSheet, null, null, false, false)
        return await Promise.all([ naturezaGerenciaFoundValues, foundEntries, allPedidosCodesAndNames ])
    }

    function getNaturezaGerenciaByCausaPedir(foundEntries) {
        let [, natureza, gerencia] = foundEntries.length > 0 ? foundEntries[0] : [null, null, null]
        if (confirmedData.sistema === sistemas.projudiTjba) gerencia = gerencias.ppjcm
        return { natureza, gerencia }
    }
    
    function getStandardPedidos(foundEntries, allPedidosCodesAndNames) {
        return foundEntries.map(entry => {
            const [, pedidoCodName, estimativaTipo, valorProvisionado] = entry
            const [ nome, idComponent ] = getPedidosNameAndIdComponentByCode(pedidoCodName, allPedidosCodesAndNames)
            return { nome, idComponent, estimativaTipo, valorProvisionado }
        })
    }
    
    function getPedidosNameAndIdComponentByCode(pedidoCodename, allPedidosCodesAndNames) {
        const found = allPedidosCodesAndNames.filter(entry => entry[0] === pedidoCodename)
        return found.length > 0 ? [ found[0][1], found[0][2] ] : null
    }

    async function getProvidenciasParams(gerencia, causaPedir) {
        const foundEntries = await loadSheetRange(planilhaProvidenciasPorGerencia[String(gerencia).toLowerCase()],
            null, { operator: "insensitiveStrictEquality", val: [confirmedData.comarca, "geral"]}, false, false)
        const values = await Promise.all(foundEntries.map(async sheetRow => {
            const [ , nomeProvidencia, tipoResponsavel, referencialDateType, daysFromReferencialDate, alertar,
                diasAntecedenciaAlerta, gerarAndamento, nomeAndamentoParaGerar ] = sheetRow
            const dataFinal = calculateDataFinal(referencialDateType, daysFromReferencialDate)
            return {
                numeroProcesso: confirmedData.numeroProcesso,
                numeroDesdobramento: confirmedData.numeroProcesso,
                nome: nomeProvidencia,
                dataFinal, tipoResponsavel, referencialDateType,
                daysFromReferencialDate, alertar, diasAntecedenciaAlerta,
                gerarAndamento, nomeAndamentoParaGerar
            }
        }))
        const provContestar = values.find(providencia => providencia.nome.toLowerCase() === "contestar - virtual")
        const provSubsidios = values.find(providencia => providencia.nome.toLowerCase() === "levantar subsídios")
        const dates = {
            contestar: provContestar.dataFinal,
            subsidios: provSubsidios.dataFinal
        }
        return { dates, values }
    }
    
    function calculateDataFinal(referencialDateType, daysFromReferencialDate) {
        let dataAndamento
        switch (referencialDateType.toLowerCase()) {
            case "audiência":
            case "audiencia":
                dataAndamento = new Date(confirmedData.dataAndamento)
                break;
        
            case "cadastro":
                dataAndamento = new Date()
                break;
        }
        return new Date(dataAndamento.getTime() + Number(daysFromReferencialDate) * 24 * 60 * 60 * 1000 )
    }

    async function getNucleoResp(responsavelKind, gerencia, causaPedir, providenciaDate, unidade, el) {
        const sheet = planilhaResponsaveisPorGerencia[gerencia.toLowerCase()][responsavelKind]
        const searchParam = getSearchParam(responsavelKind, unidade, el)
        const foundEntriesByGerencia = await loadSheetRange(sheet, null,
            { operator: "insensitiveStrictEquality", val: [ ...searchParam, "geral" ]}, false, false)
        if (foundEntriesByGerencia.length === 0) return null
        const matchingCausaPedirEntry = foundEntriesByGerencia.find(entry => {
            return String(entry[1]).toLowerCase() === causaPedir.toLowerCase()
                || String(entry[1]).toLowerCase() === "geral"
        })
        if (!matchingCausaPedirEntry) return null
        const nucleo = matchingCausaPedirEntry[2]
        const responsavelInfo = await getResponsavelInfo(matchingCausaPedirEntry[3], providenciaDate)
        return { nucleo, responsavelInfo }
    }

    function getSearchParam(responsavelKind, unidade, el = "") {
        switch (responsavelKind) {
        case responsavelType.advogado:
            return [ confirmedData.comarca ]            
        case responsavelType.preposto:
            let unidadeElString = unidade
            unidadeElString += (el != false) ? '-' + el : ""
            return  [ unidade, unidadeElString ]
        }
    }

    async function getResponsavelInfo(responsavelString, date) {
        const dateStr = new Date(date).toLocaleDateString("pt-BR")
        if (!(responsavelString.startsWith("grpadv") || responsavelString.startsWith("grpprep")) ) return responsavelString
        const foundRows = await loadSheetRange(responsavelString, null,
            { operator: "insensitiveStrictEquality", val: ["responsáveis", "% de carga", "% do total de providências", "total", dateStr] },
            false, false)
        if (foundRows.length <= 4) return null
        foundRows.forEach(row => row.shift())
        const [ responsaveisRow, intendedAbsolutePercentualLoads, intendedRelativePercentualLoads, individualTotals, dailyRow ] = foundRows
        const dailyGrandTotalLoad = (dailyRow.at(-1) == 0) ? 1 : dailyRow.at(-1)
        const responsaveis = responsaveisRow.map((responsavel, index) => {
            return {
                responsavel: responsaveisRow[index],
                intendedAbsolutePercentualLoad: Number.parseFloat(intendedAbsolutePercentualLoads[index]),
                intendedRelativePercentualLoad: Number.parseFloat(intendedRelativePercentualLoads[index]),
                individualTotal: individualTotals[index],
                dailyLoad: dailyRow[index],
                dailyGrandTotalLoad,
                sheetColumnIndex: index + 1
            }
        })
        let smallestResponsaveis = getSmallestResponsaveis(responsaveis, "dailyLoad", "dailyGrandTotalLoad",
            "intendedRelativePercentualLoad")
        if (smallestResponsaveis.length > 1) {
            smallestResponsaveis = getSmallestResponsaveis(smallestResponsaveis, "individualTotal",
                "intendedAbsolutePercentualLoad", "intendedAbsolutePercentualLoad")
        }
        if (smallestResponsaveis.length > 1) {
            const randomIndex = Math.floor(Math.random() * smallestResponsaveis.length)
            smallestResponsaveis = [ smallestResponsaveis[randomIndex] ]
        }
        return {
            nome: smallestResponsaveis[0].responsavel,
            sheetColumnIndex: smallestResponsaveis[0].sheetColumnIndex
        }
    }

    function getSmallestResponsaveis(responsaveis, partialParam, totalParam, intendedParam) {
        responsaveis.forEach(resp => {
            const percentualLoad = resp[partialParam] / resp[totalParam] * 100
            resp.difference = percentualLoad - resp[intendedParam]
        })
        responsaveis = responsaveis.sort((a, b) => a.difference - b.difference)
        const smallerDifference = responsaveis[0].difference
        return responsaveis.filter(responsavel => responsavel.difference === smallerDifference)
    }

    return { updateCausaPedir, getNucleoResp }
}