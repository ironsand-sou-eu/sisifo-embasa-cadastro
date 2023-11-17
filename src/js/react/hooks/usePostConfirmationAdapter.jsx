import EspaiderProvidenciaDataStructure from "../../data-structures/EspaiderProvidenciaDataStructure";
import EspaiderProcessoDataStructure from "../../data-structures/EspaiderProcessoDataStructure";
import EspaiderAndamentoDataStructure from "../../data-structures/EspaiderAndamentoDataStructure";
import EspaiderParteDataStructure from "../../data-structures/EspaiderParteDataStructure";
import EspaiderPedidoDataStructure from "../../data-structures/EspaiderPedidoDataStructure";
import EspaiderMatriculaDataStructure from "../../data-structures/EspaiderMatriculaDataStructure";
import {
  impedirCobrancaMatricula,
  impedirNegativacaoMatricula,
  planilhaBloquearMatricula,
  planilhaObservacoes,
  planilhaUnidadesELs,
  responsavelType,
} from "../../enums";
import useUpdateCausaPedir from "./useUpdateCausaPedir";
import useIdGenerator from "./useIdGenerator";
import { isNumber, parteEhEmbasa } from "../../utils/utils";
import useGoogleSheets from "./connectors/useGoogleSheets";
import useExporter from "./creators/useExporter";

export default function usePostConfirmationAdapter(scrappedInfo, msgSetter) {
  const { getNucleoResp } = useUpdateCausaPedir(confirmedInfo);
  const { generateAndamentoId, generateProvidenciaId, generatePedidoId } =
    useIdGenerator();
  const { loadSheetRange } = useGoogleSheets();
  const { createAll } = useExporter(msgSetter);
  let confirmedInfo;

  async function finalizeProcessoInfo(formData) {
    confirmedInfo = formData;
    const {
      espaiderProcessoMerged,
      espaiderPartesMerged,
      espaiderAndamentosMerged,
      espaiderPedidosMerged,
      providenciasParams,
    } = mergeConfirmedInfo();
    const [unidadeDivisaoFoundEntries, bloquearMatriculaFoundEntries] =
      await makeFetches();
    const espaiderProcesso = await finalAdaptProcesso(
      espaiderProcessoMerged,
      providenciasParams.dates.subsidios,
      unidadeDivisaoFoundEntries
    );
    const espaiderAndamentos = finalAdaptAndamentos(espaiderAndamentosMerged);
    const espaiderProvidencias = await finalAdaptProvidencias(
      providenciasParams,
      espaiderProcesso,
      espaiderAndamentos[0].id
    );
    const espaiderPartes = finalAdaptPartes(espaiderPartesMerged);
    const espaiderPartesComCpfCnpj = espaiderPartes.filter(
      parte => !!parte.cpfCnpj
    );
    const espaiderPartesSemCpfCnpj = espaiderPartes.filter(
      parte => !parte.cpfCnpj
    );
    const espaiderPedidos = finalAdaptPedidos(
      espaiderPedidosMerged,
      espaiderProcesso.dataCitacao
    );
    const espaiderMatricula = await adaptMatricula(
      bloquearMatriculaFoundEntries,
      espaiderProcesso.gerencia
    );

    // if (Drafter.hasErrors([espaiderProvidencias])) throw new Exception(espaiderProvidencias.errorMsgs, msgSetter)

    // console.log({ espaiderProcesso, espaiderMatricula, espaiderPartesComCpfCnpj, espaiderPartesSemCpfCnpj,
    //     espaiderAndamentos, espaiderPedidos, espaiderProvidencias }, msgSetter)
    createAll({
      espaiderProcesso,
      espaiderMatricula,
      espaiderPartesComCpfCnpj,
      espaiderPartesSemCpfCnpj,
      espaiderAndamentos,
      espaiderPedidos,
      espaiderProvidencias,
    });
  }

  function mergeConfirmedInfo() {
    const {
      espaiderProcesso,
      espaiderPartes,
      espaiderAndamentos,
      espaiderPedidos,
    } = scrappedInfo;
    const {
      nucleo,
      advogado,
      advogadoGroupSheetName,
      causaPedir,
      comarca,
      dataCitacao,
      gerencia,
      natureza,
      numeroProcesso,
      rito,
      tipoAcao,
      partesRequerentes,
      partesRequeridas,
      nomeAndamento,
      dataAndamento,
      pedidos,
      providenciasParams,
    } = confirmedInfo;
    const espaiderProcessoMerge = {
      nucleo,
      advogado,
      advogadoGroupSheetName,
      causaPedir,
      comarca,
      dataCitacao,
      gerencia,
      natureza,
      numeroProcesso,
      rito,
      tipoAcao,
    };
    const espaiderPartesMerge = { partesRequerentes, partesRequeridas };

    const espaiderProcessoMerged = {
      ...espaiderProcesso,
      ...espaiderProcessoMerge,
    };
    const espaiderPartesMerged = { ...espaiderPartes, ...espaiderPartesMerge };
    const espaiderPedidosMerged = [...espaiderPedidos, ...pedidos];
    const espaiderAndamentosMerged = espaiderAndamentos;
    espaiderAndamentosMerged[0].nome = nomeAndamento;
    espaiderAndamentosMerged[0].data = dataAndamento;

    const allEspaiderPartes = {
      clientRole: espaiderPartesMerged.clientRole,
      values: [
        ...espaiderPartesMerged.partesRequerentes,
        ...espaiderPartesMerged.partesRequeridas,
        ...espaiderPartesMerged.terceiros,
      ],
    };
    return {
      espaiderProcessoMerged,
      espaiderPedidosMerged,
      espaiderAndamentosMerged,
      providenciasParams,
      espaiderPartesMerged: allEspaiderPartes,
    };
  }

  async function makeFetches() {
    const { localidadeCode, comarca } = confirmedInfo;
    const operator = isNumber(localidadeCode)
      ? "numericEquality"
      : "insensitiveStrictEquality";
    const unidadeDivisaoPromise = loadSheetRange(
      planilhaUnidadesELs,
      null,
      { operator, val: localidadeCode },
      false,
      false
    );
    const bloquearMatriculaPromise = loadSheetRange(
      planilhaBloquearMatricula,
      null,
      { operator: "insensitiveStrictEquality", val: comarca },
      false,
      false
    );
    return await Promise.all([unidadeDivisaoPromise, bloquearMatriculaPromise]);
  }

  async function finalAdaptProcesso(
    {
      numeroProcesso,
      nomeAdverso,
      cpfCnpjAdverso,
      tipoAdverso,
      condicaoAdverso,
      advogadoAdverso,
      valorCausa,
      natureza,
      tipoAcao,
      causaPedir,
      orgao,
      juizo,
      comarca,
      rito,
      nucleo,
      advogado,
      advogadoGroupSheetName,
      responsavelRegressivo,
      dataCitacao,
      gerencia,
      sistema,
      errorMsgs,
    },
    providenciaSubsidiosDate,
    unidadeDivisaoFoundEntries
  ) {
    const { unidade, divisao } = await getUnidadeDivisaoFromGoogleRow(
      unidadeDivisaoFoundEntries
    );
    const siglaUnidade = unidade.split(" - ")[0];
    const { responsavel: preposto, groupName } = await getNucleoResp(
      responsavelType.preposto,
      gerencia,
      causaPedir,
      providenciaSubsidiosDate,
      siglaUnidade,
      divisao
    );
    const espaiderProcesso = new EspaiderProcessoDataStructure({
      numeroProcesso,
      nomeAdverso,
      cpfCnpjAdverso,
      tipoAdverso,
      condicaoAdverso,
      advogadoAdverso,
      valorCausa,
      natureza,
      tipoAcao,
      causaPedir,
      unidade,
      divisao,
      orgao,
      juizo,
      comarca,
      rito,
      nucleo,
      advogado,
      preposto,
      responsavelRegressivo,
      dataCitacao: new Date(dataCitacao),
      gerencia,
      sistema,
      errorMsgs,
    });
    espaiderProcesso.prepostoGroupSheetName = groupName;
    espaiderProcesso.advogadoGroupSheetName = advogadoGroupSheetName;
    return espaiderProcesso;
  }

  async function getUnidadeDivisaoFromGoogleRow(foundEntries) {
    if (foundEntries < 1) return null;
    const [, , unidade, , divisao] = foundEntries[0];
    return { unidade, divisao };
  }

  function finalAdaptAndamentos(espaiderAndamentos) {
    const { numeroProcesso } = confirmedInfo;
    return espaiderAndamentos.map(andamento => {
      const nome = andamento.nome;
      const obs = andamento.obs;
      const data = new Date(andamento.data);
      const id = generateAndamentoId(numeroProcesso, andamento.id);
      const numeroDesdobramento = numeroProcesso;
      return new EspaiderAndamentoDataStructure({
        nome,
        obs,
        data,
        id,
        numeroProcesso,
        numeroDesdobramento,
      });
    });
  }

  async function finalAdaptProvidencias(
    providenciasParams,
    espaiderProcesso,
    idAndamento
  ) {
    const providenciasValues = await getAdaptedProvidenciasValues(
      providenciasParams,
      espaiderProcesso.preposto,
      idAndamento
    );
    const dataToPutOnSheets = getValuesToLaunch(
      providenciasValues,
      espaiderProcesso
    );
    return { values: providenciasValues, dataToPutOnSheets };
  }

  async function getAdaptedProvidenciasValues(
    providenciasParams,
    preposto,
    idAndamento
  ) {
    const providenciasPromises = providenciasParams.values.map(
      async (providParamsValues, index) => {
        const nome = providParamsValues.nome;
        if (
          nome.toLowerCase() === "analisar processo novo" &&
          !confirmedInfo.recomendarAnalise
        )
          return null;
        const responsavel =
          providParamsValues.tipoResponsavel === "advogado"
            ? confirmedInfo.advogado
            : preposto;
        const numeroProcesso = providParamsValues.numeroProcesso;
        const numeroDesdobramento = providParamsValues.numeroDesdobramento;
        const dataFinal = new Date(providParamsValues.dataFinal);
        const alertar = providParamsValues.alertar;
        const diasAntecedenciaAlerta =
          providParamsValues.diasAntecedenciaAlerta;
        const nucleo = confirmedInfo.nucleo;
        const gerarAndamento = providParamsValues.gerarAndamento;
        const nomeAndamentoParaGerar =
          providParamsValues.nomeAndamentoParaGerar;
        const obs = await getObservacao(nome);
        const id = generateProvidenciaId(numeroProcesso, dataFinal, index);
        return new EspaiderProvidenciaDataStructure({
          id,
          idAndamento,
          nome,
          dataFinal,
          alertar,
          diasAntecedenciaAlerta,
          nucleo,
          responsavel,
          obs,
          gerarAndamento,
          numeroProcesso,
          numeroDesdobramento,
          nomeAndamentoParaGerar,
        });
      }
    );
    const providencias = await Promise.all(providenciasPromises);
    return providencias.filter(providencia => !!providencia);
  }

  function getValuesToLaunch(providencias, espaiderProcesso) {
    const { advogadoGroupSheetName, prepostoGroupSheetName } = espaiderProcesso;
    const providenciaContestar = providencias.find(providencia =>
      providencia.nome.toLowerCase().includes("contestar")
    );
    const providenciaSubsidios = providencias.find(providencia =>
      providencia.nome.toLowerCase().includes("subsídios")
    );
    let contestar, subsidios;
    if (providenciaContestar)
      contestar = {
        date: providenciaContestar.dataFinal,
        responsavelName: providenciaContestar.responsavel,
        sheetName: advogadoGroupSheetName,
      };
    if (providenciaSubsidios)
      subsidios = {
        date: providenciaSubsidios.dataFinal,
        responsavelName: providenciaSubsidios.responsavel,
        sheetName: prepostoGroupSheetName,
      };
    return [contestar, subsidios];
  }

  async function getObservacao(nomeProvidencia) {
    const dataAndamentoFormatada = new Date(
      confirmedInfo.dataAndamento
    ).toLocaleDateString("pt-BR");
    let obs = `Sísifo: ${confirmedInfo.nomeAndamento} - ${dataAndamentoFormatada}`;
    switch (nomeProvidencia.toLowerCase()) {
      case "analisar processo novo":
        obs += confirmedInfo.obsParaAdvogado
          ? `\nObs. do cadastro: ${confirmedInfo.obsParaAdvogado}`
          : "";
        break;

      case "levantar subsídios":
        const sheetName =
          planilhaObservacoes[String(confirmedInfo.gerencia).toLowerCase()];
        const foundEntriesByGerencia = await loadSheetRange(
          sheetName,
          null,
          {
            operator: "insentiviveIncludes",
            val: [confirmedInfo.causaPedir, "geral"],
          },
          false,
          false
        );
        obs +=
          foundEntriesByGerencia.length > 0
            ? `\n\n${foundEntriesByGerencia[0][1]}`
            : "";
        break;
    }
    return obs;
  }

  function finalAdaptPartes(espaiderPartes) {
    const values = espaiderPartes.values;
    deleteFirstParte(values);
    const litisconsortes = stripPartesEmbasa(values);
    return litisconsortes.map(litisconsorte => {
      const { numeroProcesso } = confirmedInfo;
      const numeroDesdobramento = numeroProcesso;
      const nome = litisconsorte.nome;
      const cpfCnpj = litisconsorte.cpfCnpj;
      const tipo = litisconsorte.tipo;
      const condicao = litisconsorte.condicao;
      const classe = litisconsorte.classe;
      const semCpfCnpj = litisconsorte.semCpfCnpj;
      return new EspaiderParteDataStructure({
        numeroProcesso,
        numeroDesdobramento,
        nome,
        cpfCnpj,
        tipo,
        condicao,
        classe,
        semCpfCnpj,
      });
    });
  }

  function deleteFirstParte(partes) {
    partes.shift();
  }

  function stripPartesEmbasa(partes) {
    return partes.filter(({ nome }) => !parteEhEmbasa(nome));
  }

  function finalAdaptPedidos(espaiderPedidos, dataCitacao) {
    const { numeroProcesso } = confirmedInfo;
    return espaiderPedidos.map(pedido => {
      const id = generatePedidoId(numeroProcesso, pedido.idComponent);
      const nome = pedido.nome;
      const valor = pedido.valorPedido;
      const databaseAtualizacao = dataCitacao;
      const databaseJuros = dataCitacao;
      const riscoOriginal = pedido.estimativaTipo;
      const valorRiscoOriginal = pedido.valorProvisionado;
      const estimativaPagamento = new Date(
        dataCitacao.getTime() + 365 * 24 * 60 * 60 * 1000
      );
      return new EspaiderPedidoDataStructure({
        id,
        numeroProcesso,
        nome,
        valor,
        databaseAtualizacao,
        databaseJuros,
        riscoOriginal,
        valorRiscoOriginal,
        estimativaPagamento,
      });
    });
  }

  async function adaptMatricula(bloquearMatriculaFoundEntries, gerencia) {
    const { matricula, numeroProcesso } = confirmedInfo;
    if (!matricula) return [];
    const bloqueioParams = {
      sim: {
        negativacao: impedirNegativacaoMatricula.sim,
        cobranca: impedirCobrancaMatricula.sim,
      },
      nao: {
        negativacao: impedirNegativacaoMatricula.nao,
        cobranca: impedirCobrancaMatricula.nao,
      },
    };
    const shouldBlock = await bloquearMatricula(
      bloquearMatriculaFoundEntries,
      gerencia
    );
    const res = bloqueioParams[shouldBlock];
    const { negativacao, cobranca } = bloqueioParams[shouldBlock];
    return [
      new EspaiderMatriculaDataStructure({
        matricula,
        numeroProcesso,
        negativacao,
        cobranca,
      }),
    ];
  }

  async function bloquearMatricula(foundEntries, gerencia) {
    if (foundEntries.length < 1) return null;
    const [, ppjcm, ppjce] = foundEntries[0];
    const switchObj = { ppjcm, ppjce };
    const resultado = switchObj[gerencia.toLowerCase()].toLowerCase();
    return resultado === "não" ? "nao" : resultado;
  }

  return { finalizeProcessoInfo };
}
