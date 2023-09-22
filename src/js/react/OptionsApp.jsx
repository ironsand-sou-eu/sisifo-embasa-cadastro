import React from "react"
import Link from "./components/Link"
import { googleUrls } from "../envVars"

function OptionsApp() {
    const andamentosUrl = googleUrls.sheetsFrontendBase + googleUrls.andamentosSheetId
    const juizosUrl = googleUrls.sheetsFrontendBase + googleUrls.juizosSheetId
    const clientesUrl = googleUrls.sheetsFrontendBase + googleUrls.clientesSheetId
    const gtsUrl = googleUrls.sheetsFrontendBase + googleUrls.gtsSheetId
    const pedidosProvisionamentosUrl = googleUrls.sheetsFrontendBase + googleUrls.pedidosProvisionamentosSheetId
    const tarefasUrl = googleUrls.sheetsFrontendBase + googleUrls.tarefasSheetId
    return (
        <div className="form-group">
            <Link
                label="Lista de juízos"
                url={juizosUrl}
            />
            <Link
                label="Lista de andamentos"
                url={andamentosUrl}
            />
            <Link
                label="Lista de clientes"
                url={clientesUrl}
            />
            <Link
                label="Lista de grupos de trabalho"
                url={gtsUrl}
            />
            <Link
                label="Lista de pedidos"
                url={pedidosProvisionamentosUrl}
            />
            <Link
                label="Lista de tarefas"
                url={tarefasUrl}
            />
        </div>
    )
}

export default OptionsApp