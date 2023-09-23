import { operators } from "../../../enums";
import ProcessoAlreadyExistsException from "../../../exceptions/ProcessoAlreadyExistsException";
import hardcoded from "../../../hardcodedValues";
import { toBrDateString } from "../../../utils/utils";
import { useGoogleSheets } from "../connectors/useGoogleSheets";

export default function useExporter(msgSetter) {
    const { fetchGoogleToken, getFileId, createSheet, loadSheetRange, writeToSheet } = useGoogleSheets()
    async function createAll({
        espaiderProcesso, espaiderMatricula, espaiderPartesComCpfCnpj, espaiderPartesSemCpfCnpj,
        espaiderAndamentos, espaiderProvidencias, espaiderPedidos }
    ) {
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
        await writeProvidenciasToSheet(espaiderProvidencias, sheetId, token)
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
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: "Inserindo processo",
                success: "processo(s) inserido(s).",
                failStart: "Erro ao adicionar processo",
                failEnd: "."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeMatriculaToSheet(espaiderMatricula, sheetId, token) {
        const values = [espaiderMatricula].map(({ numeroProcesso, matricula, negativacao, cobranca, pegarHistorico }) => [
            numeroProcesso, matricula, negativacao, cobranca, pegarHistorico
        ])
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroMatriculas,
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: "Inserindo matrícula",
                success: "matrícula(s) inserida(s).",
                failStart: "Erro ao adicionar matrícula",
                failEnd: "."
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
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: `Inserindo litisconsorte ${comSem} CPF/CNPJ`,
                success: `litisconsorte(s) ${comSem} CPF/CNPJ inserido(s).`,
                failStart: `Erro ao adicionar o litisconsorte ${comSem} CPF/CNPJ`,
                failEnd: "."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeAndamentosToSheet(espaiderAndamentos, sheetId, token) {
        const values = espaiderAndamentos.map(({ id, numeroProcesso, numeroDesdobramento, nome, data, obs }) => {
            const dataString = toBrDateString(data)
            return [ id, numeroProcesso, numeroDesdobramento, nome, dataString, obs ]
        })
        const params = {
            entitiesArray: values,
            sheetId,
            token,
            sheetName: hardcoded.cadastroAndamentos,
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: "Inserindo andamento",
                success: "andamento(s) inserido(s).",
                failStart: "Erro ao adicionar o andamento",
                failEnd: "."
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
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: "Inserindo providência",
                success: "providência(s) inserida(s).",
                failStart: "Erro ao adicionar a providência",
                failEnd: "."
            }
        }
        await writeEntitiesToSheet(params)
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
            checkSuccessfulCreation: responseJson => responseJson === true, //TODO: verificar qual é a função
            getEntityName: processoInfo => processoInfo.numeroProcesso,
            msgs: {
                update: "Inserindo pedido",
                success: "pedido(s) inserido(s).",
                failStart: "Erro ao adicionar o pedido",
                failEnd: "."
            }
        }
        await writeEntitiesToSheet(params)
    }

    async function writeEntitiesToSheet(creationParams) {
        const { entitiesArray, sheetId, token, sheetName, checkSuccessfulCreation, getEntityName, msgs } = creationParams
        const qtd = entitiesArray.length
        msgSetter.setSingleProcessingMsg(`${msgs.update} (${qtd})...`)
        const response = await writeToSheet(sheetId, sheetName, entitiesArray, token)
        console.log(response)

        // const requestSuccessful = (response.status && response.status >=200 && response.status < 300 )
        // const createdSuccessful = checkSuccessfulCreation(await response.json())
        // if (!(requestSuccessful && createdSuccessful)) {
        //     const msg = msgs.failStart + " " + getEntityName(entitiesArray[index]) + " "  + msg.failEnd
        //     msgSetter.addMsg({ type: "fail", msg })
        //     return
        // }

        msgSetter.clear({ type: "processing" })
        msgSetter.addMsg({ type: "success", msg: `${qtd} ${msgs.success}` })
    }

    return { createAll }
}