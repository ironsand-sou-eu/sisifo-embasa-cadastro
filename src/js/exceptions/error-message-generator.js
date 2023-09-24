import { googleUrls } from "../envVars";

//TODO: Adaptar paulatinamente ao Espaider.

const textualReferenceType = {
    vara: "uma vara",
    tipoVara: "um tipo de vara",
    instanciaCnj: "uma instância CNJ",
    orgaoJudicial: "um órgão judicial",
    tipoJustica: "um tipo de justiça",
    area: "uma área",
    fase: "uma fase",
    juizo: "um juízo",
    andamento: "um andamento",
    tarefa: "tarefas para um grupo de trabalho",
    gts: "um grupo de trabalho",
    usuario: "um usuário",
    pedido: "um pedido"
};

const gSheetUrl = {
    vara: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    tipoVara: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    instanciaCnj: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    orgaoJudicial: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    tipoJustica: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    juizo: googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId,
    andamento: googleUrls.sheetsFrontendBase + googleUrls.andamentosSheetId,
    tarefa: googleUrls.sheetsFrontendBase + googleUrls.tarefasSheetId,
    gts: googleUrls.sheetsFrontendBase + googleUrls.gtsSheetId,
    pedido: googleUrls.sheetsFrontendBase + googleUrls.pedidosProvisionamentosSheetId
};

function linkOrText(type, text) {
    const url = gSheetUrl[type]
    if (url) {
        return `<a href=${url} target="_blank">${text}</a>`
    } else {
        return text
    }
};

const generateErrMsg = {
    noMatchInGoogle: (missingEntry, type) => {
        return `Não encontramos ${textualReferenceType[type]} correspondente a `
        + `<span class="copy">${missingEntry}</span>. Insira a informação na `
        + `${linkOrText(type, "planilha correspondente")} e tente novamente.`
    },

    noMatchInSaj: (missingEntry, type) => {
        return `Não encontramos ${textualReferenceType[type]} correspondente a `
        + `<span class="copy">${missingEntry}</span> no Projuris. Confira as `
        + `informações no Projuris e na ${linkOrText(type, "planilha correspondente")} `
        + `e tente novamente.`
    },
};

const generateValidationMsg = {
    generalWarning: () => {
        return 'Foram encontrados as situações abaixo. Se você quiser cadastrar o processo '
        + 'sem resolvê-las, é só clicar na tampa, mas lembre-se de que os itens abaixo não '
        + 'estarão no cadastro e deverão ser verificados manualmente.'
    },

    noLocalidadeCode: () => {
        return 'Você não indicou o código da localidade no SCI. É obrigatório indicar uma.'
    },

    noMatricula: () => {
        return 'Você não indicou a matrícula comercial. Isso não é essencial, mas '
        + 'é recomendado inseri-la, se o processo tratar sobre uma matrícula.'
    },

    noCausaPedir: () => {
        return 'Você não indicou a causa de pedir.'
    },

    noAdvogado: () => {
        return 'Você não indicou o advogado responsável pelo processo.'
    },

    noPedidos: () => {
        return 'Você não indicou pedidos. Isso não é essencial, mas '
        + 'é recomendado inseri-los, para não afetar o provisionamento.'
    },
};

export default generateErrMsg;
export { generateValidationMsg };