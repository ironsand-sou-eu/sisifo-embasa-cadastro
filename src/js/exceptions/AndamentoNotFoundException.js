import { googleUrls } from "../envVars"
import Exception from "./Exception"

class AndamentoNotFoundException
    extends Exception
{
    constructor(nomeAndamento) {
        const andamentosUrl = googleUrls.sheetsFrontendBase + googleUrls.andamentosSheetId
        const errorMessage = `O Andamento ${nomeAndamento} não foi encontrado na `
        + `<a href="${andamentosUrl}" target="_blank">planilha de andamentos</a>. `
        + `Adicione-o, com o nome correspondente no Projuris, e tente novamente.`
        super(errorMessage)
    }
}

export default AndamentoNotFoundException