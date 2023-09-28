import { operators } from "../../../enums";
import { googleUrls } from "../../../envVars";
import ProcessoAlreadyExistsException from "../../../exceptions/ProcessoAlreadyExistsException";
import hardcoded from "../../../hardcodedValues";
import { toBrDateString } from "../../../utils/utils";
import { useGoogleSheets } from "../connectors/useGoogleSheets";

export default function useExporter(msgSetter) {
    const { fetchGoogleToken, getFileId, createSheet, fetchGoogleSheetData, loadSheetRange, appendToSheet, writeToRange } = useGoogleSheets()
    async function createAll({
        espaiderProcesso, espaiderMatricula, espaiderPartesComCpfCnpj, espaiderPartesSemCpfCnpj,
        espaiderAndamentos, espaiderProvidencias, espaiderPedidos
    }) {
        const token = await fetchGoogleToken()
        const sheetId = await getSheetIdCreatingIfNeeded(token)
        if (await processoAlreadyExists(sheetId, espaiderProcesso.numeroProcesso)) {
            throw new ProcessoAlreadyExistsException(espaiderProcesso.numeroProcesso, msgSetter)
        }
        await writeProcessoToSheet(espaiderProcesso, sheetId, token)
        await writeMatriculaToSheet(espaiderMatricula, sheetId, token)
        await writeLitisconsortesToSheet(espaiderPartesComCpfCnpj, true, sheetId, token)
        await writeLitisconsortesToSheet(espaiderPartesSemCpfCnpj, false, sheetId, token)
        await writeAndamentosToSheet(espaiderAndamentos, sheetId, token)
        await writeProvidenciasToSheet(espaiderProvidencias.values, sheetId, token)
        registerProvidenciasInGroups(espaiderProvidencias.dataToPutOnSheets, token)
        await writePedidosToSheet(espaiderPedidos, sheetId, token)
        msgSetter.clear({ type: "processing" })
    }

    async function getSheetIdCreatingIfNeeded(token) {
        msgSetter.setSingleProcessingMsg("Identificando planilha no Google Sheets..." )
        const sheetFileName = generateSheetName()
        let sheetId = await getFileId(sheetFileName, token)
        if (!sheetId) sheetId = createSheet(sheetFileName, token)
        return sheetId
    }

    function generateSheetName() {
        const dt = new Date()
        const year = dt.getFullYear()
        const month = String(dt.getMonth() + 1).padStart(2, "0")
        const day = String(dt.getDate()).padStart(2, "0")
        const hour = String(dt.getHours()).padStart(2, "0")
        new Date().toLocaleTimeString("pt-BR").substring(0, 2)
        const turno = hour <= 12 ? "manha" : "tarde"
        let dateString = `${year}.${month}.${day} ${turno}`
        return `Sisifo - Processos - ${dateString}`
    }

    async function processoAlreadyExists(workbookId, numeroProcesso) {
        msgSetter.setSingleProcessingMsg("Verificando se o processo já está cadastrado..." )
        const matchingRows = await loadSheetRange("processos", null,
            { operator: operators.insensitiveStrictEquality, val: numeroProcesso }, false, false, workbookId)
        if (matchingRows.length === 0) return false
        else return true
    }

    async function writeProcessoToSheet(
        { numeroProcesso, cpfCnpjAdverso, nomeAdverso, tipoAdverso, condicaoAdverso,
        advogadoAdverso, nucleo, advogado, unidade, divisao, classe, natureza, tipoAcao, causaPedir, valorCausa,
        nomeDesdobramento, orgao, juizo, comarca, cnpjEmbasa, nomeEmbasa, tipoEmpresaEmbasa, condicaoEmpresaEmbasa,
        fase, responsavelRegressivo, rito, peticionamento, dataCitacao }, sheetId, token
    ) {
        const dataCitacaoString = toBrDateString(dataCitacao)
        const values = [
            numeroProcesso, numeroProcesso, numeroProcesso, cpfCnpjAdverso, nomeAdverso, tipoAdverso,
            condicaoAdverso, advogadoAdverso, nucleo, nucleo, advogado, unidade, unidade, divisao ?? "",
            classe, natureza, natureza, tipoAcao, causaPedir, valorCausa, nomeDesdobramento, orgao, orgao,
            juizo, comarca, cnpjEmbasa, nomeEmbasa, tipoEmpresaEmbasa, condicaoEmpresaEmbasa, fase,
            fase, responsavelRegressivo ?? "", rito, peticionamento, dataCitacaoString
        ]
        const params = {
            entitiesArray: [ values ],
            sheetId,
            token,
            sheetName: hardcoded.cadastroProcessos,
            msgs: {
                update: "Inserindo processo",
                success: "processo(s) inserido(s).",
                failStart: "Erro ao adicionar processo.",
                failEnd: "criado(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeMatriculaToSheet(espaiderMatricula, sheetId, token) {
        const values = espaiderMatricula.map(({ numeroProcesso, matricula, negativacao, cobranca, pegarHistorico }) => [
            numeroProcesso, matricula, negativacao, cobranca, pegarHistorico
        ])
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroMatriculas,
            msgs: {
                update: "Inserindo matrícula",
                success: "matrícula(s) inserida(s).",
                failStart: "Erro ao adicionar matrículas.",
                failEnd: "criada(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeLitisconsortesToSheet(espaiderPartes, hasCpfCnpj, sheetId, token) {
        const values = espaiderPartes.map(({
            numeroProcesso, numeroDesdobramento, cpfCnpj, nome, tipo, condicao, classe
        }) => [ numeroProcesso, numeroDesdobramento, cpfCnpj, cpfCnpj, nome, nome, tipo, condicao, classe ])
        const comSem = hasCpfCnpj ? "com" : "sem"
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hasCpfCnpj ? hardcoded.cadastroLitisconsortes : hardcoded.cadastroLitisconsortesSemCpf,
            msgs: {
                update: `Inserindo litisconsorte ${comSem} CPF/CNPJ`,
                success: `litisconsorte(s) ${comSem} CPF/CNPJ inserido(s).`,
                failStart: `Erro ao adicionar litisconsortes ${comSem} CPF/CNPJ.`,
                failEnd: "criado(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeAndamentosToSheet(espaiderAndamentos, sheetId, token) {
        const values = espaiderAndamentos.map(({ id, numeroProcesso, numeroDesdobramento, nome, data, obs }) => {
            const dataString = toBrDateString(data, true)
            return [ id, numeroProcesso, numeroDesdobramento, nome, dataString, obs ]
        })
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroAndamentos,
            msgs: {
                update: "Inserindo andamento",
                success: "andamento(s) inserido(s).",
                failStart: "Erro ao adicionar andamentos.",
                failEnd: "criado(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeProvidenciasToSheet(espaiderProvidencias, sheetId, token) {
        const values = espaiderProvidencias.map(({
            id, numeroProcesso, numeroDesdobramento, idAndamento, nome, dataFinal, prazo, situacao,
            alertar, diasAntecedenciaAlerta, periodicidade, nucleo, responsavel, obs, gerarAndamento,
            codigoDatabaseAndamentoParaGerar, nomeAndamentoParaGerar
        }) => {
            const dataFinalString = toBrDateString(dataFinal)
            return [
                id, numeroProcesso, numeroDesdobramento, idAndamento, nome, dataFinalString, prazo, situacao,
                alertar, diasAntecedenciaAlerta, periodicidade, nucleo, responsavel, obs, gerarAndamento,
                codigoDatabaseAndamentoParaGerar, nomeAndamentoParaGerar
            ]
        })
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroProvidencias,
            msgs: {
                update: "Inserindo providência",
                success: "providência(s) inserida(s).",
                failStart: "Erro ao adicionar providências.",
                failEnd: "criada(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    function registerProvidenciasInGroups(relevantProvidenciasData, token) {
        const registerableProvidencias = relevantProvidenciasData.filter(providencia => !!providencia.sheetName)
        registerableProvidencias.forEach(async providenciaData => {
            const { sheetName, responsavelName, date } = providenciaData
            const fullSheetDataJson = await fetchGoogleSheetData(sheetName)
            const { cellInA1Notation, value } = getCellAndValue(date, responsavelName, fullSheetDataJson.values)
            const rangeName = `${sheetName}!${cellInA1Notation}`
            const valueToWrite = [[ value + 1 ]]
            await writeToRange(googleUrls.configSheetId, rangeName, valueToWrite, token, false)
        })
    }

    function getCellAndValue(date, responsavelName, sheetData) {
        const responsaveisRowData = sheetData.filter(row => String(row[0]).toLowerCase() === "responsáveis")
        const columnIndex = responsaveisRowData[0].findIndex(entry => entry === responsavelName)
        const dateStr = new Date(date).toLocaleDateString("pt-BR")
        const rowIndex = sheetData.findIndex(row => String(row[0]).toLowerCase() === dateStr)
        const value = parseInt(sheetData[rowIndex][columnIndex])
        const cellInA1Notation = getA1Notation(rowIndex, columnIndex)
        return { cellInA1Notation, value }
    }

    function getA1Notation(rowIndex, columnIndex) {
        const columnNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        return `${columnNames[columnIndex]}${rowIndex + 1}`
    }

    async function writePedidosToSheet(espaiderPedidos, sheetId, token) {
        const values = espaiderPedidos.map(({
            id, numeroProcesso, nome, valor, databaseAtualizacao, riscoOriginal, riscoBaseadoEm,
            valorRiscoOriginal, estimativaPagamento, indiceAtualizacao, databaseJuros, porcentagemJuros
        }) => {
            const databaseAtualizacaoString = toBrDateString(databaseAtualizacao)
            const estimativaPagamentoString = toBrDateString(estimativaPagamento)
            const databaseJurosString = toBrDateString(databaseJuros)
            return [
                id, numeroProcesso, nome, valor, databaseAtualizacaoString, riscoOriginal, riscoBaseadoEm,
                valorRiscoOriginal, estimativaPagamentoString, indiceAtualizacao, databaseJurosString, porcentagemJuros
            ]
        })
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroPedidos,
            msgs: {
                update: "Inserindo pedido",
                success: "pedido(s) inserido(s).",
                failStart: "Erro ao adicionar pedidos.",
                failEnd: "criado(s)."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeEntitiesToSheet(creationParams) {
        const { entitiesArray, sheetId, token, sheetName, msgs } = creationParams
        const qtd = entitiesArray.length
        msgSetter.setSingleProcessingMsg(`${msgs.update} (${qtd})...`)
        const jSonResponse = await appendToSheet(sheetId, sheetName, entitiesArray, token)
        // const requestSuccessful = (jSonResponse.status && jSonResponse.status >=200 && jSonResponse.status < 300 )
        const createdRowsAmount = jSonResponse.updates.updatedRows ?? 0
        const creationSuccessful = createdRowsAmount === qtd
        if (!creationSuccessful) { //(requestSuccessful && creationSuccessful)) {
            const msg = `${msgs.failStart} ${createdRowsAmount}/${qtd} ${msgs.failEnd}`
            msgSetter.clear({ type: "processing" })
            msgSetter.addMsg({ type: "fail", msg })
            return
        }
        msgSetter.addMsg({ type: "success", msg: `${createdRowsAmount}/${qtd} ${msgs.success}` })
    }

    return { createAll }
}