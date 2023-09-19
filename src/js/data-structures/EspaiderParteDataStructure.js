class EspaiderParteDataStructure
{
    constructor(nome, cpfCnpj, semCpfCnpj = false, tipo, condicao, classe, nomeAdvogado, ehEmbasa = false)
    {
        Object.assign(this, {
            nome, cpfCnpj, semCpfCnpj, tipo, condicao, classe, nomeAdvogado, ehEmbasa
        })
    }
}

export default EspaiderParteDataStructure