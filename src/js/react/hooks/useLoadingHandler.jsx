import { useEffect } from "react"
import { debounce } from "../../utils/utils"

export default function useLoadingHandler(scrappedData, setScrappedData) {
    useEffect(debounce(() => {
        if (scrappedData !== null) return
        chrome.runtime.sendMessage({
                from: "sisifoPopup",
                subject: "query-processo-info-to-show"
            },
            response => {
                setScrappedData(response)
            }
        )
    }, [scrappedData]))
}