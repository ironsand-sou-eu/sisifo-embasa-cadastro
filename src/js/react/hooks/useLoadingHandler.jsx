import { useEffect } from "react"
import { debounce } from "../../utils/utils"

export default function useLoadingHandler(processoEspaiderData, setProcessoEspaiderData) {
    useEffect(debounce(() => {
        if (processoEspaiderData !== null) return
        chrome.runtime.sendMessage({
                from: "sisifoPopup",
                subject: "query-processo-info-to-show"
            },
            response => {
                setProcessoEspaiderData(response)
            }
        )
    }, [processoEspaiderData]))
}