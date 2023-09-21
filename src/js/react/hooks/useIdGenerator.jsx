export default function useIdGenerator() {
    function generateAndamentoId(numeroProcesso, index) {
        return generateId(numeroProcesso, index)
    }

    function generateProvidenciaId(numeroProcesso, providenciaDate, index) {
        const date = providenciaDate.toLocaleDateString("pt-BR")
        const dateNumbers = date.replace(/[^0-9]/g, '')
        const textToAdd = `${dateNumbers}${index}`
        return generateId(numeroProcesso, textToAdd)
    }

    function generatePedidoId(numeroProcesso, pedidoCode) {
        return generateId(numeroProcesso, pedidoCode)
    }

    function generateId(numeroProcesso, textToAdd) {
        const baseId = numeroProcesso.replace(".8.05.", "")
        const fullId = `${baseId}${textToAdd}`
        const onlyNumbersId = fullId.replace(/[^0-9]/g, '')
        const idWithoutLeadingZeros = onlyNumbersId.replace(/^0*/g, '')
        return idWithoutLeadingZeros
    }

    return { generateAndamentoId, generateProvidenciaId, generatePedidoId }
}