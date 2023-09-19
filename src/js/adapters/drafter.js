import { fetchGoogleSheetRowsMatchingExpression } from "../connectors/google-sheets"
import EspaiderProcessoDataStructure from "../data-structures/EspaiderProcessoDataStructure"
import EspaiderParteDataStructure from "../data-structures/EspaiderParteDataStructure"
import EspaiderAndamentoDataStructure from "../data-structures/EspaiderAndamentoDataStructure"
import generateErrMsg from "../exceptions/error-message-generator"
import { nomesEmbasa, sistemas, tiposParte, tiposParteEspaider } from "../enums"
import hardcoded from "../hardcodedValues"

class Drafter {
    static #errorMsgFallback = "Ocorreu uma falha, vide mensagens de erro"
    #processoInfo
    #googleToken
    
    constructor(processoInfo, googleToken) {
        this.#processoInfo = processoInfo
        this.#googleToken = googleToken
    }

    async draftProcessoInfo() {
    // nomeAndamentoAdicional, obsAndamentoAdicional, dataAndamentoAdicional, strIdAndamentoAdicional
        if (Drafter.hasErrors([this.#processoInfo])) return { hasErrors: true, errorMsgs: this.#processoInfo.errorMsgs }
        
        const espaiderPartes = await this.#getAdaptedPartes()
        const espaiderProcesso = await this.#getAdaptedProcesso(espaiderPartes)
        const espaiderAndamentos = await this.#getAdaptedAndamentos()
        const espaiderPedidos = await this.#getAdaptedPedidos()
        const errors = Drafter.hasErrors([espaiderProcesso, espaiderAndamentos, espaiderPedidos])
        if (errors) return { hasErrors: true, errorMsgs: errors }
        console.log({
            espaiderProcesso,
            espaiderPartes,
            espaiderAndamentos: espaiderAndamentos.values,
            espaiderPedidos: espaiderPedidos.values,
            hasErrors: false
        })
        return {
            espaiderProcesso,
            espaiderPartes,
            espaiderAndamentos: espaiderAndamentos.values,
            espaiderPedidos: espaiderPedidos.values,
            hasErrors: false
        }
    }
    
    static hasErrors(espaiderEntitiesArray) {
        const allErrors = []
        espaiderEntitiesArray.forEach(espaiderEntity => {
            const errorMsgs = espaiderEntity.errorMsgs
            if (errorMsgs && Array.isArray(errorMsgs) && errorMsgs.length > 0) {
                allErrors.push(...errorMsgs)
            }
        })
        if (allErrors.length === 0) return false
        return allErrors
    }
    
    async #getAdaptedPartes() {
        const espaiderPartes = {
            partesRequerentes: [],
            partesRequeridas: [],
            terceiros: [],
            clientRole: null
        }
        this.#pushAdaptedPartesIntoPolo(this.#processoInfo.partesRequerentes, espaiderPartes.partesRequerentes)
        this.#pushAdaptedPartesIntoPolo(this.#processoInfo.partesRequeridas, espaiderPartes.partesRequeridas)
        this.#pushAdaptedPartesIntoPolo(this.#processoInfo.outrosParticipantes, espaiderPartes.terceiros)
        if (this.#clienteIsInPolo(espaiderPartes.partesRequerentes)) espaiderPartes.clientRole = tiposParte.requerente
        if (this.#clienteIsInPolo(espaiderPartes.partesRequeridas)) espaiderPartes.clientRole = tiposParte.requerido
        return espaiderPartes
    }
    
    #pushAdaptedPartesIntoPolo(partesArray, polo) {
        if (partesArray === undefined) partesArray = []
        partesArray.forEach(async parte => {
            const espaiderParte = this.#adaptParteToEspaider(parte)
            polo.push(espaiderParte)
        })
    }
    
    #adaptParteToEspaider(parte) {
        const nome = parte.nome
        const semCpfCnpj = parte.dontHaveCpfCnpj
        let cpfCnpj
        let tipo
        if (parte.dontHaveCpfCnpj) {
            cpfCnpj = this.#generateRandomCode()
            tipo = tiposParte.pessoaFisica
        } else {
            cpfCnpj = parte.cpf ?? parte.cnpj
            tipo = cpfCnpj.includes("/") ? tiposParteEspaider.pessoaJuridica : tiposParteEspaider.pessoaFisica
        }
        const condicao = parte.tipoDeParte.charAt(0).toUpperCase() + parte.tipoDeParte.substring(1).toLowerCase()
        const classe = parte.tipoDeParte === tiposParte.requerente ? 2 : 1
        const nomeAdvogado = parte.advogados.length > 0 ? parte.advogados[0].nome : null
        return new EspaiderParteDataStructure(nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe, nomeAdvogado)
    }

    #generateRandomCode() {
        const date = new Date().getTime()
        const randomNumber = Math.floor(Math.random() * 1000)
        return `SemCpf${date}${randomNumber}`
    }
    
    #clienteIsInPolo(partes) {
        return partes.some(parte => {
            const parteEhEmbasa = nomesEmbasa.some(nomeEmbasa => parte.nome.toLowerCase().includes(nomeEmbasa.toLowerCase()))
            if (parteEhEmbasa) return true
            else return false
        })
    }
    
    async #getAdaptedProcesso(espaiderPartes) {
        const numeroProcesso = this.#processoInfo.numero
        const valorCausa = this.#processoInfo.valorDaCausa
        const sistema = this.#processoInfo.sistema
        const dataCitacao = new Date()
        const { nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso, advogadoAdverso } = this.#getAdversoinfo(espaiderPartes)
        const { tipoAcao, rito } = this.#getTipoAcaoAndRito(sistema)
        const googleJuizoInfo = await fetchGoogleSheetRowsMatchingExpression("juizos", this.#processoInfo.juizo.nomeOriginalSistemaJustica, this.#googleToken)
        if (!googleJuizoInfo.found) {
            const espaiderProcesso = new EspaiderProcessoDataStructure()
            espaiderProcesso.errorMsgs.push(generateErrMsg.noMatchInGoogle(this.#processoInfo.juizo.nomeOriginalSistemaJustica, "juizo"))
            return espaiderProcesso
        }
        const [ , juizo, comarca, orgao ] = googleJuizoInfo.value
        // const causaDePedir
        // const { gerencia, natureza }(causaDePedir)
        // const { nucleoAdvogado, advogado } (strNumProc, causaDePedir, dtDataPrazo, bolAceitaCausaPedirSemResponsavel)
        // const { nucleoPreposto, preposto } (strNumProc, causaDePedir, dtDataPrazo, bolAceitaCausaPedirSemResponsavel)
        // const { unidade, divisao }(codLocalidadeSci)

        return new EspaiderProcessoDataStructure(numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
            advogadoAdverso, valorCausa, null, hardcoded.classeProcesso, tipoAcao, null, orgao, juizo, comarca, rito,
            hardcoded.fase, null, null, null, null, null, hardcoded.nomeDesdobramento, null, hardcoded.peticionamento,
            hardcoded.nomeEmbasa, hardcoded.cnpjEmbasa, hardcoded.tipoEmpresaEmbasa, hardcoded.condicaoEmpresaEmbasa,
            dataCitacao, null, sistema, [])
    }

    #getAdversoinfo(espaiderPartes) {
        let adversoPrincipal
        switch (espaiderPartes.clientRole) {
        case tiposParte.requerido:
            adversoPrincipal = espaiderPartes.partesRequerentes[0]
            break
        case tiposParte.requerente:
            adversoPrincipal = espaiderPartes.partesRequeridas[0]
            break
        default:
            adversoPrincipal = null
        }
        return {
            nomeAdverso: adversoPrincipal?.nome,
            cpfCnpjAdverso: adversoPrincipal?.cpfCnpj,
            tipoAdverso: adversoPrincipal?.tipo,
            condicaoAdverso: adversoPrincipal?.nomeAdvogado,
            advogadoAdverso: adversoPrincipal?.condicaoAdverso
        }
    }

    #getTipoAcaoAndRito(sistema, classePje = undefined) {
        if (sistema === sistemas.projudiTjba) return { tipoAcao: hardcoded.juizadosTipoAcao, rito: hardcoded.juizadosRito }
        // TODO: Fazer PJE
    }
    
    async #getAdaptedAndamentos(espaiderProcesso) {
        if (!this.#processoInfo.audienciaFutura || this.#processoInfo.audienciaFutura.cancelado === true) {
            return this.#adaptCitacaoToEspaider(espaiderProcesso)
        }
        const espaiderAndamentos = { values: [], errorMsgs: [] }
        espaiderAndamentos.values = [ this.#adaptAudienciaToEspaider(this.#processoInfo.audienciaFutura) ]
        // TODO: andamento adicional para PJe
        return espaiderAndamentos
    }

    #adaptCitacaoToEspaider(espaiderProcesso) {
        const obs = ""
        const data = espaiderProcesso.dataCitacao
        return new EspaiderAndamentoDataStructure(hardcoded.nomeAndamentoCitacao, obs, data, null,
            this.#processoInfo.numero, this.#processoInfo.numero)
    }
    
    #adaptAudienciaToEspaider(audienciaFutura) {
        if (!audienciaFutura.data) return null
        const data =  new Date(audienciaFutura.data)
        const cabecalhoObs = `Ev./ID ${audienciaFutura.id} - ${audienciaFutura.nomeOriginalSistemaJustica}. `
        const detalhe = audienciaFutura.observacao ? ` - ${audienciaFutura.observacao}` : ""
        const obs =  cabecalhoObs + detalhe
        return new EspaiderAndamentoDataStructure(hardcoded.juizadosNomeAndamento, obs, data,
            audienciaFutura.id, this.#processoInfo.numero, this.#processoInfo.numero)
    }
    
    async #getAdaptedPedidos() {
        return { values: [], errorMsgs: [] }
    }
    
    // async #getStandardPedidosByClientAndCausaPedir(clientName, dataDistribuicao, causasDePedir = []) {
    //     const clientFilteredProvisionsList = await this.#getAllClientsProvisions(clientName)
    //     const clientProvisionsByCausasDePedir = this.#filterClientsProvisionsByCausasDePedir(clientFilteredProvisionsList, causasDePedir)
    //     return clientProvisionsByCausasDePedir.map(pedidoProvision => {
    //         const sajPedido = new SajPedidoDataStructure()
    //         sajPedido.nomePedido = pedidoProvision[2].trim()
    //         sajPedido.dataPedido = dataDistribuicao
    //         sajPedido.valorProvisionado = pedidoProvision[4]
    //         sajPedido.estimativaTipo = pedidoProvision[3]
    //         sajPedido.riscoPorcentagem = pedidoProvision[5]
    //         return sajPedido
    //     })
    // }
    
    // async #fetchRelevantPedidosEspaiderData(pedidos) {
    //     const promises = pedidos.map(pedido => fetchSajInfo(endPoints.pedidos + pedido.nomePedido))
    //     const responses = await Promise.all(promises)
    //     return await Promise.all(responses.map(async response => await extractOptionsArray(response)))
    // }
    
    // #pushNomeAndCodigoIntoPedidos(sajPedidos, list) {
    //     sajPedidos.values.forEach((pedido, index) => {
    //         const relatedTypes = list[index]
    //         if (relatedTypes === "no content") {
    //             sajPedidos.errorMsgs.push(generateErrMsg.noMatchInSaj(pedido.nomePedido, "pedido"))
    //             return
    //         }
    //         const type = relatedTypes.filter(type => type.valor === pedido.nomePedido)
    //         pedido.codigoPedido = type[0].chave
    //         pedido.nomePedido = type[0].valor
    //     })
    // }
    
    // async #getAllClientsProvisions(clientName) {
    //     if (clientName === undefined) return []
    //     const promises = await this.#makeSajPedidosFetches()
    //     const responses = await Promise.all(promises)
    //     const allClientsProvisionsList = await extractValuesFromSheetsPromise(responses[0])
    //     const filter = {
    //         key: 0,
    //         operator: "insensitiveStrictEquality",
    //         val: clientName
    //     }
    //     return "olá"
    //     // return Drafter.#filterSajOptions(allClientsProvisionsList, filter)
    // }
    
    // async #makeSajPedidosFetches() {
    //     return [ fetchGoogleSheetData("pedidosProvisionamentos", this.#googleToken) ]
    // }
    
    // #filterClientsProvisionsByCausasDePedir(provisionsList, causasDePedir) {
    //     if (causasDePedir.length === 0) {
    //         const fallbackValue = "geral"
    //         return provisionsList
    //             .filter(clientProvision => clientProvision[1].trim().toLowerCase() === fallbackValue)
    //     } else {
    //         return provisionsList
    //             .filter(clientProvision => causasDePedir.includes(clientProvision[1]))
    //     }
    // }    
}
export default Drafter