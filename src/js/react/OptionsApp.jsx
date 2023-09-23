import React from "react"
import Link from "./components/Link"
import { googleUrls } from "../envVars"

function OptionsApp() {
    const juizosUrl = googleUrls.sheetsFrontendBase + googleUrls.configSheetId
    return (
        <div className="form-group">
            <Link
                label="Configurações"
                url={juizosUrl}
            />
        </div>
    )
}

export default OptionsApp