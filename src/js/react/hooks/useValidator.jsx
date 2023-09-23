import { generateValidationMsg } from "../../exceptions/error-message-generator";

export default function useValidator(formData) {
    const warningMessages = [];
    if (!formData) return [ warningMessages ];
    const { localidadeCode, matricula, causaPedir, advogado, pedidos } = formData;

    function validateAll() {
        if (!localidadeCode) warningMessages.push(generateValidationMsg.noLocalidadeCode());
        if (!matricula) warningMessages.push(generateValidationMsg.noMatricula());
        if (!causaPedir) warningMessages.push(generateValidationMsg.noCausaPedir());
        if (!advogado) warningMessages.push(generateValidationMsg.noAdvogado());
        if (!pedidos?.length) warningMessages.push(generateValidationMsg.noPedidos());
    };    

    function prependGeneralWarning() {
        if (warningMessages.length > 0) warningMessages.unshift(generateValidationMsg.generalWarning());
    }

    validateAll();
    prependGeneralWarning();
    return [ warningMessages ];
}