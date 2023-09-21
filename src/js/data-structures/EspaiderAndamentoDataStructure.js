class EspaiderAndamentoDataStructure
{
    constructor({ nome, obs, data, id, numeroDoProcesso, numeroDoDesdobramento }) {
        Object.assign(this, {
            nome, obs, id, numeroDoProcesso, numeroDoDesdobramento,
            data: data ? new Date(data.getTime()) : undefined
        })
    }
}

export default EspaiderAndamentoDataStructure