import Exception from "./Exception"

class ProcessoAlreadyExistsException
    extends Exception
{
    constructor(numeroProcesso, msgSetter) {
        const errorMessage = `O processo ${numeroProcesso} já está cadastrado.`
        super(errorMessage, msgSetter)
    }
}

export default ProcessoAlreadyExistsException