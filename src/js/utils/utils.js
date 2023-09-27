import { nomesEmbasa, operators } from "../enums"

export const REGEX_CNJ_NUMBER = /(\d{7}-\d{2}.\d{4}.)(\d)(.\d{2}.\d{4})/

export default function compareWithOperator(a, operator, b) {
    if (a === undefined || b === undefined) return false
    switch (operator) {
    case operators.sensitiveStrictEquality:
        return a === b
    case operators.insensitiveStrictEquality:
        return a.toString().toLowerCase() === b.toString().toLowerCase()
    case operators.insentiviveIncludes:
        return a.toLowerCase().includes(b.toLowerCase())
    case operators.includes:
        return a.includes(b)
    case operators.numericEquality:
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

export function toISOStringInSalvadorTimezone(date, outputHours = false) {
    return toBrDateString(date, outputHours, true)
}

export function toBrDateString(date, outputHours = false, isoFormat = false) {
    if (!date) return null
    const dateObj = new Date(date)
    const dateCompensatingTimezone = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000))
    const year = dateCompensatingTimezone.getUTCFullYear()
    const month = String(dateCompensatingTimezone.getUTCMonth() + 1).padStart(2, "0")
    const day = String(dateCompensatingTimezone.getUTCDate()).padStart(2, "0")
    let finalStr = isoFormat ? `${year}-${month}-${day}` : `${day}/${month}/${year}`
    if (outputHours) {
        const hour = String(dateCompensatingTimezone.getUTCHours()).padStart(2, "0")
        const minute = String(dateCompensatingTimezone.getUTCMinutes()).padStart(2, "0")
        const dateToHourSeparator = isoFormat ? "T" : " "
        finalStr += `${dateToHourSeparator}${hour}:${minute}`
    }
    return finalStr
}

export function lastWorkdayUntil(date) {
    let weekendDaysToSubtract = 0
    if (date.getDay() === 0) weekendDaysToSubtract = 2
    if (date.getDay() === 6) weekendDaysToSubtract = 1
    //TODO: compute holidays
    return addDaysToDate(calculatedDate, weekendDaysToSubtract)
}

export function addDaysToDate(date, daysToAdd) {
    return new Date(date.getTime() + parseInt(daysToAdd) * 24 * 60 * 60 * 1000 )
}

export function isNumber(x) {
    return parseFloat(x) == x
}

export function parteEhEmbasa(nome) {
    return nomesEmbasa.some(nomeEmbasa => nome.toLowerCase().includes(nomeEmbasa.toLowerCase()))
}