class EspaiderParteDataStructure
{
    constructor({ nome, cpfCnpj, tipo, condicao, classe, nomeAdvogado, semCpfCnpj = false } = {})
    {
        Object.assign(this, {
            nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe, nomeAdvogado
        })
    }
}

export default EspaiderParteDataStructure