import { loadOptionsInSheetRange } from "../../connectors/google-sheets"
import { gerencias, sistemas } from "../../enums"
import hardcoded from "../../hardcodedValues"

export default function useUpdateCausaPedir() {
    async function updateCausaPedir(causaPedir, sistema, setFormData) {
        const { natureza, gerencia } = await getNaturezaGerenciaByCausaPedir(causaPedir, sistema)
        const pedidos = await getStandardPedidos(causaPedir)
        setFormData(causaPedir, "causaPedir")
        setFormData(natureza, "natureza")
        setFormData(gerencia, "gerencia")
        setFormData(pedidos, "pedidos")
    }

    async function getNaturezaGerenciaByCausaPedir(causaPedir, sistema) {
        const foundValues = await loadOptionsInSheetRange(hardcoded.listaCausasPedirSheet,
            null, { operator: "insensitiveStrictEquality", val: causaPedir}, false, false)
        let [, natureza, gerencia] = foundValues.length > 0 ? foundValues[0] : [null, null, null]
        if (sistema === sistemas.projudiTjba) gerencia = gerencias.ppjcm
        return { natureza, gerencia }
    }
    
    async function getStandardPedidos(causaPedir) {
        const foundEntries = await loadOptionsInSheetRange(hardcoded.causasDePedirPedidosSheet,
            null, { operator: "insensitiveStrictEquality", val: causaPedir}, false, false)
        const allPedidosCodesAndNames = await loadOptionsInSheetRange(hardcoded.pedidosSheet, null, null, false, false)
        console.log({foundEntries, allPedidosCodesAndNames})
        return foundEntries.map(entry => {
            const [, codPedido, estimativaTipo, valorProvisionado] = entry
            const nome = getPedidosNameByCode(codPedido, allPedidosCodesAndNames)
            return { nome, estimativaTipo, valorProvisionado }
        })
    }
    
    function getPedidosNameByCode(code, allPedidosCodesAndNames) {
        const found = allPedidosCodesAndNames.filter(entry => entry[0] === code)
        return found.length > 0 ? found[0][1] : null
    }
    
    return { updateCausaPedir }
}