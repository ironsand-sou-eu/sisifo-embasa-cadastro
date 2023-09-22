class EspaiderAndamentoDataStructure
{
    constructor({ nome, obs, data, id, numeroProcesso, numeroDesdobramento }) {
        Object.assign(this, {
            nome, obs, id, numeroProcesso, numeroDesdobramento,
            data: data ? new Date(data.getTime()) : undefined
        })
    }
}

export default EspaiderAndamentoDataStructure