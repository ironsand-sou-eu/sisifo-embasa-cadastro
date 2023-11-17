export const operators = Object.freeze({
  sensitiveStrictEquality: "sensitiveStrictEquality",
  insensitiveStrictEquality: "insensitiveStrictEquality",
  insentiviveIncludes: "insentiviveIncludes",
  includes: "includes",
  numericEquality: "numericEquality",
});

export const tiposParteEspaider = Object.freeze({
  pessoaFisica: 1,
  pessoaJuridica: 2,
});

export const tiposParte = Object.freeze({
  requerente: "autor",
  requerido: "réu",
  testemunha: "testemunha",
  terceiro: "terceiro",
  advogado: "advogado contrário",
  juiz: "magistrado",
  perito: "perito",
  assistente: "assistente",
  administrador: "administrador",
  servidor: "servidor",
});

export const condicoesParte = Object.freeze({
  autor: "Autor",
  reu: "Réu",
});

export const tiposContingencia = [
  { value: "Provável", label: "Provável" },
  { value: "Possível", label: "Possível" },
  { value: "Remoto", label: "Remoto" },
];

export const sistemas = Object.freeze({
  projudiTjba: "projudiTjba",
  pje1gTjba: "pje1gTjba",
});

export const impedirNegativacaoMatricula = {
  sim: "CLI_S",
  nao: "CLI_N",
};

export const impedirCobrancaMatricula = {
  sim: 1,
  nao: 2,
};

export const gerencias = {
  ppjcm: "PPJCM",
  ppjce: "PPJCE",
  ppjct: "PPJCMT",
};

export const planilhaProvidenciasPorGerencia = {
  ppjcm: "providenciasPPJCM",
  ppjce: "providenciasPPJCE",
  ppjct: "providenciasPPJCMT",
};

export const planilhaResponsaveisPorGerencia = {
  ppjcm: {
    advogados: "advsPorComarcaPPJCM",
    prepostos: "prepostosPorUnidadeElPPJCM",
  },
  ppjce: {
    advogados: "advsPorComarcaPPJCE",
    prepostos: "prepostosPorUnidadeElPPJCE",
  },
  ppjct: {},
};

export const planilhaUnidadesELs = "unidadesELs";

export const planilhaBloquearMatricula = "bloquearMatriculaPorComarca";

export const planilhaObservacoes = {
  ppjcm: "obsSubsidiosPPJCM",
  ppjce: "obsSubsidiosPPJCE",
  ppjct: "obsSubsidiosPPJCT",
};

export const responsavelType = {
  advogado: "advogados",
  preposto: "prepostos",
};

export const nomesEmbasa = [
  "Embasa ",
  "Empresa Baiana de Águas e Saneamento",
  "Empresa Baiana de Água e Saneamento",
  "Empresa Baiana de Aguas e Saneamento",
  "Empresa Baiana de Agua e Saneamento",
  "Representação Embasa",
  "Representacao Embasa",
];
