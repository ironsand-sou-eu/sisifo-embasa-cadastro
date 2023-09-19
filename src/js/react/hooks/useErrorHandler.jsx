import { useEffect } from "react"

export default function useErrorHandler(processoEspaiderData) {
    function adaptedInfoHasErrors() {
        if (processoEspaiderData?.hasErrors) return true
        else return false
    }

    function handleAdaptedInfoErrors() {
        if (!adaptedInfoHasErrors()) return
        processoEspaiderData.errorMsgs.forEach(errorMsg => {msgSetter.addMsg({
            type: "fail",
            msg: errorMsg
        })})
        return true
    }

    useEffect(
        () => {
            if (adaptedInfoHasErrors()) handleAdaptedInfoErrors()
        },
        [processoEspaiderData]
    )

    return { adaptedInfoHasErrors }
}