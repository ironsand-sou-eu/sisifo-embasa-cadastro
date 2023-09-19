import generateErrMsg from "../exceptions/error-message-generator"
import compareWithOperator from "../utils/utils"
import { gSheetsUrls } from "../envVars"
import hardcoded from "../hardcodedValues"

export default async function fetchGoogleToken() {
    const tokenObj = await chrome.identity.getAuthToken({interactive: true})
    return tokenObj.token
}

export async function fetchGoogleSheetRowsMatchingExpression(sheetName, expressionToSearch, token, getMany) {
    if (!token) token = await fetchGoogleToken()
    const promise = fetchGoogleSheetData(sheetName, token)
    const values = await extractValuesFromSheetsPromise(promise)
    const errorParams = {
        errorKind: "google",
        missingEntry: expressionToSearch,
        entryType: sheetName
    }
    return getMatchingEntry(values, expressionToSearch, errorParams, getMany)
}

export async function extractValuesFromSheetsPromise(promise) {
    const response = await promise
    const json = await response.json()
    return json?.values
}

export async function fetchGoogleSheetData(
    sheetName, token = null, workbookCodename = "configSheetId", range = null, readByColumns = false
) {
    if (!token) token = await fetchGoogleToken()
    if (!workbookCodename) workbookCodename = "configSheetId"
    const sheetInfo = {
        spreadsheetId: gSheetsUrls[workbookCodename],
        name: sheetName,
        range,
        readByColumns
    }
    return requestGoogleSheetContents(sheetInfo, token)
}

function requestGoogleSheetContents(sheetInfo, token) {
    const apiBaseUrl = gSheetsUrls.apiBase
    const workbookId = sheetInfo.spreadsheetId
    const sheetName = sheetInfo.name
    const range = sheetInfo.range ? `!${sheetInfo.range}` : ""
    const queryString = sheetInfo.readByColumns ? `?majorDimension=COLUMNS` : ""
    const uri = `${apiBaseUrl}${workbookId}/values/${sheetName}${range}${queryString}`
    if (sheetName === "pedidos") console.log(uri)
    const params = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    }
    return fetch(uri, params)
}

export function getMatchingEntry(dictionaryArray, nameToFind, errorParams, getMany = false) {
    const { errorKind, missingEntry, entryType } = errorParams
    const resultArray = dictionaryArray.filter(pairItem => pairItem[0].toLowerCase() === nameToFind.toLowerCase())
    if (resultArray.length >= 1) {
        return { found: true, value: getMany ? resultArray : resultArray[0] }
    } else {
        const errorFunction = {
            google: generateErrMsg.noMatchInGoogle
        }
        return { found: false, value: errorFunction[errorKind](missingEntry, entryType) }
    }
}

export async function loadOptionsInSheetRange (sheetName, rangeName, filterObject = undefined, shallMap = true, readByColumns = false) {
    const response = await fetchGoogleSheetData(sheetName, null, null, rangeName, readByColumns)
    const responseJson = await response.json()
    if (sheetName === "pedidos") console.log(responseJson)
    let filteredOptions
    if (rangeName) filteredOptions = responseJson.values[0]
    else filteredOptions = responseJson.values
    
    if (filterObject) {
        filteredOptions = filteredOptions
            .filter(option => {
                return compareWithOperator(Array.isArray(option) ? option[0] : option, filterObject.operator, filterObject.val)
            })
    }
    if (shallMap) {
        return filteredOptions
            .map(option => {
                return {
                    ...option,
                    value: option,
                    label: option
                }
            })
    } else {
        return filteredOptions
    }
}

export { gSheetsUrls }