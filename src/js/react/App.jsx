import React, { useEffect, useState, createContext } from "react"
import Header from "./components/Header.jsx"
import Messenger from "./components/Messenger.jsx"
import PopupForm from "./components/PopupForm.jsx"
import finalizeProcessoInfo from "../adapters/confirmation-projuris.js"
import useMsgSetter from "./hooks/useMsgSetter.jsx"
import useLoadingHandler from "./hooks/useLoadingHandler.jsx"
import useErrorHandler from "./hooks/useErrorHandler.jsx"

const LoadingContext = createContext();
const MsgSetterContext = createContext();    

function App() {
    const [result, setResult] = useState({ success: [], processing: [], fail: [] });
    const { msgSetter } = useMsgSetter(result, setResult);
    const [formData, setFormData] = useState()
    const [processoEspaiderData, setProcessoEspaiderData] = useState(null)
    const [loading, setLoading] = useState({ scrapping: true, creating: false })

    useLoadingHandler(processoEspaiderData, setProcessoEspaiderData)
    const { adaptedInfoHasErrors } = useErrorHandler(processoEspaiderData)

    function updateFormData(newData, changedInput) {
        setFormData(prevData => {
            return {...prevData, [changedInput]: newData}
        })
    }

    function onSubmit(e) {
        e.preventDefault()
        setLoading({ scrapping: false, creating: true })
        finalizeProcessoInfo(processoEspaiderData, formData, msgSetter)
    }

    useEffect(() => {
        if (processoEspaiderData === null) return
        setLoading({ scrapping: false, creating: false })
        if (adaptedInfoHasErrors()) return
        const data = {
            numeroProcesso: processoEspaiderData.espaiderProcesso.numeroProcesso,
            matricula: "",
            codLocalidade: "",
            partesRequerentes: processoEspaiderData.espaiderPartes.partesRequerentes,
            partesRequeridas: processoEspaiderData.espaiderPartes.partesRequeridas,
            nomeAndamento: Array.isArray(processoEspaiderData.espaiderAndamentos) && processoEspaiderData.espaiderAndamentos[0].nome,
            dataAndamento: Array.isArray(processoEspaiderData.espaiderAndamentos) && processoEspaiderData.espaiderAndamentos[0].data,
            causaPedir: processoEspaiderData.espaiderProcesso.causaPedir,
            dataCitacao: processoEspaiderData.espaiderProcesso.dataCitacao,
            recomendarAnalise: false,
            obsParaAdvogado: "",
            advogado: processoEspaiderData.espaiderProcesso.advogadoNucleo,
            rito: processoEspaiderData.espaiderProcesso.rito,
            tipoAcao: processoEspaiderData.espaiderProcesso.tipoAcao,
            pedidos: processoEspaiderData.espaiderPedidos,
            natureza: processoEspaiderData.espaiderProcesso.natureza,
            gerencia: processoEspaiderData.espaiderProcesso.gerencia,
            sistema: processoEspaiderData.espaiderProcesso.sistema
        }
        console.log({data})
        setFormData(data)
    }, [processoEspaiderData])

    return (
        <LoadingContext.Provider value={loading}>
            <MsgSetterContext.Provider value={msgSetter}>
                <Header />
                <Messenger
                    successMsgs={result.success}
                    processingMsgs={result.processing}
                    failureMsgs={result.fail}
                />
                <PopupForm
                    data={formData}
                    updateData={updateFormData}
                    onSubmit={onSubmit}
                />
            </MsgSetterContext.Provider>
        </LoadingContext.Provider>
    )
}

export default App
export { LoadingContext, MsgSetterContext }