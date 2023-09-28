import EspaiderProcessoDataStructure from "../data-structures/EspaiderProcessoDataStructure"
import generateErrMsg from "../exceptions/error-message-generator"
import { sistemas, tiposParte, tiposParteEspaider } from "../enums"
import hardcoded from "../hardcodedValues"
import { parteEhEmbasa } from "../utils/utils"
import { fetchGoogleSheetRowsMatchingExpression } from "../react/hooks/connectors/useGoogleSheets"

class Drafter {
    static #errorMsgFallback = "Ocorreu uma falha, vide mensagens de erro"
    #processoInfo
    #googleToken

    constructor(processoInfo, googleToken) {
        this.#processoInfo = processoInfo
        this.#googleToken = googleToken
    }

    async draftProcessoInfo() {
        if (Drafter.hasErrors([this.#processoInfo])) return { hasErrors: true, errorMsgs: this.#processoInfo.errorMsgs }
        
        const espaiderPartes = await this.#getAdaptedPartes()
        const espaiderProcesso = await this.#getAdaptedProcesso(espaiderPartes)
        const espaiderAndamentos = await this.#getAdaptedAndamentos()
        const espaiderPedidos = await this.#getAdaptedPedidos()
        const errors = Drafter.hasErrors([espaiderProcesso, espaiderAndamentos, espaiderPedidos])
        if (errors) return { hasErrors: true, errorMsgs: errors }
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
        return { nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe, nomeAdvogado }
    }

    #generateRandomCode() {
        const date = new Date().getTime()
        const randomNumber = Math.floor(Math.random() * 1000)
        return `SemCpf${date}${randomNumber}`
    }
    
    #clienteIsInPolo(partes) {
        return partes.some(({nome}) => parteEhEmbasa(nome))
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
        
        return {
            numeroProcesso, nomeAdverso, cpfCnpjAdverso, tipoAdverso, condicaoAdverso,
            advogadoAdverso, valorCausa, tipoAcao, orgao, juizo, comarca, rito, dataCitacao, sistema
        }
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
            condicaoAdverso: adversoPrincipal?.condicao,
            advogadoAdverso: adversoPrincipal?.nomeAdvogado
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
        return {
            obs, data,
            nome: hardcoded.nomeAndamentoCitacao,
            numeroProcesso: this.#processoInfo.numero,
            numeroDesdobramento: this.#processoInfo.numero
        }
    }
    
    #adaptAudienciaToEspaider(audienciaFutura) {
        if (!audienciaFutura.data) return null
        const data =  new Date(audienciaFutura.data)
        const cabecalhoObs = `Ev./ID ${audienciaFutura.id} - ${audienciaFutura.nomeOriginalSistemaJustica}. `
        const detalhe = audienciaFutura.observacao ? ` - ${audienciaFutura.observacao}` : ""
        const obs =  cabecalhoObs + detalhe
        return {
            obs, data,
            nome: hardcoded.juizadosNomeAndamento,
            id: audienciaFutura.id,
            numeroProcesso: this.#processoInfo.numero,
            numeroDesdobramento: this.#processoInfo.numero
        }
    }
    
    async #getAdaptedPedidos() {
        return { values: [], errorMsgs: [] }
    }
}
export default Drafter