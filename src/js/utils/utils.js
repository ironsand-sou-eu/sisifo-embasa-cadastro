import { nomesEmbasa } from "../enums"

export const REGEX_CNJ_NUMBER = /(\d{7}-\d{2}.\d{4}.)(\d)(.\d{2}.\d{4})/

export default function compareWithOperator(a, operator, b) {
    if (a === undefined || b === undefined) return false
    switch (operator) {
    case "sensitiveStrictEquality":
        return a === b
    case "insensitiveStrictEquality":
        return a.toString().toLowerCase() === b.toString().toLowerCase()
    case "insentiviveIncludes":
        return a.toLowerCase().includes(b.toLowerCase())
    case "includes":
        return a.includes(b)
    case "numericEquality":
        return Number(a) === Number(b)
    }
}

export function debounce(cb, delay = 250) {
    let timeOut
    return (...args) => {
        clearTimeout(timeOut)
        timeOut = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}

export function toBrDateString(date, outputHours = false) {
    if (!date) return null
    const dateObj = new Date(date)
    const dateCompensatingTimezone = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000))
    const year = dateCompensatingTimezone.getUTCFullYear()
    const month = String(dateCompensatingTimezone.getUTCMonth()).padStart(2, "0")
    const day = String(dateCompensatingTimezone.getUTCDate()).padStart(2, "0")
    let finalStr = `${year}-${month}-${day}`
    if (outputHours) {
        const hour = String(dateCompensatingTimezone.getUTCHours()).padStart(2, "0")
        const minute = String(dateCompensatingTimezone.getUTCMinutes()).padStart(2, "0")
        finalStr += `T${hour}:${minute}`
    }
    return finalStr
}

export function isNumber(x) {
    return parseFloat(x) == x
}

export function parteEhEmbasa(nome) {
    return nomesEmbasa.some(nomeEmbasa => nome.toLowerCase().includes(nomeEmbasa.toLowerCase()))
}