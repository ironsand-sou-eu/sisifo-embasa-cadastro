import React from "react"
import Link from "./components/Link"
import { googleUrls } from "../envVars"

function OptionsApp() {
    const juizosUrl = googleUrls.sheetsFrontendBase + googleUrls.configSheetId
    const diretorioUrl = googleUrls.driveFoldersBase + googleUrls.applicationFolderId
    return (
        <div className="form-group">
            <Link
                label="Configurações"
                url={juizosUrl}
            />
            <Link
                label="Pasta com planilhas"
                url={diretorioUrl}
            />
        </div>
    )
}

export default OptionsApp