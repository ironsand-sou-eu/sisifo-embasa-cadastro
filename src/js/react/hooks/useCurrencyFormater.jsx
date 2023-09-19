export default function useCurrencyFormater() {
    function formatNumberToPtbrString(number, decimals = 2) {
        return number?.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    }

    function formatStringToNumber(string) {
        if (typeof(string) === "number") return string
        const onlyDigitsOrCommaString = string?.replace(/[^\d]/g,'')
        let number = parseFloat(onlyDigitsOrCommaString?.replace(",", "."))
        number /= 100
        return isNaN(number) ? "" : number
    }

    return { formatNumberToPtbrString, formatStringToNumber }
}