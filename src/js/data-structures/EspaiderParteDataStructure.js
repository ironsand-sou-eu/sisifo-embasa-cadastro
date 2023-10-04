class EspaiderParteDataStructure
{
    constructor({ numeroProcesso, numeroDesdobramento, nome, cpfCnpj, tipo, condicao, classe, nomeAdvogado, semCpfCnpj = false } = {})
    {
        Object.assign(this, {
            numeroProcesso, numeroDesdobramento, nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe, nomeAdvogado
        })
    }
}

export default EspaiderParteDataStructure