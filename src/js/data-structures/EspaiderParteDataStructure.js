class EspaiderParteDataStructure
{
    constructor(nome, cpfCnpj, semCpfCnpj = false, tipo, condicao, classe)
    {
        Object.assign(this, {
            nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe,
        })
    }
}

export default EspaiderParteDataStructure