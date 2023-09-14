const hardcoded = {
    classeProcesso: 2,
    peticionamento: 20,
    fase: "Inicial e instrução",
    nomeEmbasa: "EMBASA S/A",
    cnpjEmbasa: "13.504.675/0001-10",
    tipoEmpresaEmbasa: 2,
    condicaoEmpresaEmbasa: "Réu",
    nomeDesdobramento: "Autos Principais",
    juizadosTipoAcao: "Defesa do Consumidor - Juizados/Procon",
    juizadosOrgao: "TJ/BA - Varas dos Sistemas dos Juizados Especiais",
    juizadosRito: "Sumaríssimo (Juizados)",
    juizados: "Audiência Una",

    prazoProvidencia: 1,
    situacaoProvidencia: 3,
    alertarProvidencia: false,
    antecedenciaAlertaProvidencia: 1,
    periodicidadeAlertaProvidencia: 0,
    gerarAndamentoProvidenciaContestar: true,
    nomeAndamentoParaGerarNaProvidencia: "Contestação",
    codigoDatabaseAndamentoProvidencia: 20,

    riscoBaseadoEmPedido: 2,
    indiceAtualizacaoPedido: "INPC",
    porcentagemJuros: 1,

    pegarHistoricoMatricula: "Sim",
    negativacaoMatricula: {
        true: "CLI_S",
        false: "CLI_N"
    },
    cobrancaMatricula: {
        true: "CLI_S",
        false: "CLI_N"
    }
}

export default hardcoded