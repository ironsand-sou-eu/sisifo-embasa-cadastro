import React, { useEffect, useState, createContext } from "react"
import Header from "./components/Header"
import Messenger from "./components/Messenger"
import PopupForm from "./components/PopupForm"
import useMsgSetter from "./hooks/useMsgSetter"
import useLoadingHandler from "./hooks/useLoadingHandler"
import useErrorHandler from "./hooks/useErrorHandler"
import usePostConfirmationAdapter from "./hooks/usePostConfirmationAdapter"

const LoadingContext = createContext();
const MsgSetterContext = createContext();    

function App() {
    const [formData, setFormData] = useState()
    const [scrappedData, setscrappedData] = useState(null)
    const [loading, setLoading] = useState({ scrapping: true, creating: false })
    const [result, setResult] = useState({ success: [], processing: [], fail: [] });
    const { msgSetter } = useMsgSetter(result, setResult);
    const { finalizeProcessoInfo } = usePostConfirmationAdapter(scrappedData, msgSetter)

    useLoadingHandler(scrappedData, setscrappedData)
    const { adaptedInfoHasErrors } = useErrorHandler(scrappedData, msgSetter)

    function updateFormData(newData, changedInput) {
        setFormData(prevData => {
            return {...prevData, [changedInput]: newData}
        })
    }

    function onSubmit(e) {
        e.preventDefault()
        setLoading({ scrapping: false, creating: true })
        // console.log({scrappedData, formData})
        finalizeProcessoInfo(formData)
    }

    useEffect(() => {
        if (scrappedData === null) return
        setLoading({ scrapping: false, creating: false })
        if (adaptedInfoHasErrors()) return
        const {
            espaiderProcesso: { numeroProcesso, comarca, causaPedir, dataCitacao, advogado, rito, tipoAcao, natureza, gerencia, sistema },
            espaiderPartes: { partesRequerentes, partesRequeridas },
            espaiderAndamentos, espaiderPedidos: pedidos
        } = scrappedData
        const data = {
            numeroProcesso, comarca, partesRequerentes, partesRequeridas, causaPedir,
            dataCitacao, advogado, rito, tipoAcao, pedidos, natureza, gerencia, sistema,
            matricula: "",
            localidadeCode: "",
            obsParaAdvogado: "",
            nomeAndamento: Array.isArray(espaiderAndamentos) && espaiderAndamentos[0].nome,
            dataAndamento: Array.isArray(espaiderAndamentos) && espaiderAndamentos[0].data,
            recomendarAnalise: false,
        }
        setFormData(data)
    }, [scrappedData])

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
                    setLoading={setLoading}
                    loading={loading}
                />
            </MsgSetterContext.Provider>
        </LoadingContext.Provider>
    )
}

export default App
export { LoadingContext, MsgSetterContext }