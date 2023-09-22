import { operators } from "../../../enums";
import ProcessoAlreadyExistsException from "../../../exceptions/ProcessoAlreadyExistsException";
import { useGoogleSheets } from "../connectors/useGoogleSheets";

export default function useExporter(msgSetter) {
    const { getFileId, createSheet, loadSheetRange } = useGoogleSheets()
    async function createAll({
        espaiderProcesso, espaiderMatricula, espaiderPartes, espaiderAndamentos, espaiderProvidencias, espaiderPedidos }
    ) {
        console.log({espaiderProcesso, espaiderMatricula, espaiderPartes, espaiderAndamentos, espaiderPedidos, espaiderProvidencias})
        const sheetId = await getSheetIdCreatingIfNeeded()
        if (await processoAlreadyExists(sheetId, espaiderProcesso.numeroProcesso)) {
            throw new ProcessoAlreadyExistsException(espaiderProcesso.numeroProcesso, msgSetter)
        }
        await writeProcessoToSheet(espaiderProcesso)
        await writeMatriculasToSheet(espaiderMatricula)
        await writeLitisconsortesToSheet(espaiderPartes)
        await writeAndamentosToSheet(espaiderAndamentos)
        await writeTarefasToSheet(espaiderProvidencias)
        await writePedidosToSheet(espaiderPedidos)
        msgSetter.clear({ type: "processing" })
    }

    async function getSheetIdCreatingIfNeeded() {
        msgSetter.setSingleProcessingMsg("Identificando planilha no Google Sheets..." )
        const sheetFileName = generateSheetName()
        let sheetId = await getFileId(sheetFileName)
        if (!sheetId) sheetId = createSheet(sheetFileName)
        return sheetId
    }

    function generateSheetName() {
        const dt = new Date()
        const year = dt.getFullYear()
        const month = String(dt.getMonth()).padStart(2, "0")
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

    async function writeProcessoToSheet(espaiderProcesso) {
        const params = {
            entitiesArray: [espaiderProcesso],
            checkSuccessfulCreation: responseJson => responseJson === true,
            getName: envolvido => envolvido.pessoaEnvolvido.valor,
            msgs: {
                update: "Vinculando pessoas como partes",
                success: "pessoas vinculadas como partes no processo.",
                failStart: "Erro ao vincular a pessoa",
                failEnd: "como parte no processo. Por favor, faça a vinculação manualmente."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeMatriculasToSheet(espaiderMatricula) {

    }

    async function writeLitisconsortesToSheet(espaiderPartes) {

    }

    async function writeAndamentosToSheet(espaiderAndamentos) {

    }

    async function writeTarefasToSheet(espaiderProvidencias) {

    }

    async function writePedidosToSheet(espaiderPedidos) {

    }

    async function writeEntitiesToSheet(creationParams) {
        const { entitiesArray, endpoint, checkSuccessfulCreation, getName, msgs } = creationParams
        const qtd = entitiesArray.length
        msgSetter.setSingleProcessingMsg(`${msgs.update}: 0 de ${qtd}`)

        let i = 0
        const intervalMs = 300
        const responses = await Promise.all(entitiesArray.map(async (entity, index) => {
            const body = JSON.stringify(entity)
            await new Promise(resolve => setTimeout(resolve, i += intervalMs))
            msgSetter.setSingleProcessingMsg(`${msgs.update}: ${index + 1} de ${qtd}`)
            return makeProjurisPost(endpoint, body)
        }))

        responses.forEach(async (response, index) => {       
            const requestSuccessful = (response.status && response.status >=200 && response.status < 300 )
            const createdSuccessful = checkSuccessfulCreation(await response.json())
            if (!(requestSuccessful && createdSuccessful)) {
                const msg = msgs.failStart + " " + getName(entitiesArray[index]) + " "  + msg.failEnd
                msgSetter.addMsg({ type: "fail", msg })
                return
            }
        })

        msgSetter.clear({ type: "processing" })
        msgSetter.addMsg({ type: "success", msg: `${qtd} ${msgs.success}` })
    }

    return { createAll }
}