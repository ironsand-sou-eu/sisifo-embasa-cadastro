import generateErrMsg from "../../../exceptions/error-message-generator"
import compareWithOperator from "../../../utils/utils"
import { googleUrls } from "../../../envVars"

export async function fetchGoogleSheetRowsMatchingExpression(sheetName, expressionToSearch, token, getMany) {
    if (!token) token = await fetchGoogleToken()
    const { fetchGoogleSheetData } = useGoogleSheets()
    const responseJson = await fetchGoogleSheetData(sheetName, token)
    const values = responseJson?.values
    const errorParams = {
        errorKind: "google",
        missingEntry: expressionToSearch,
        entryType: sheetName
    }
    return getMatchingEntry(values, expressionToSearch, errorParams, getMany)
}

function getMatchingEntry(dictionaryArray, nameToFind, errorParams, getMany = false) {
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

export function useGoogleSheets() {
    async function fetchGoogleToken() {
        const tokenObj = await chrome.identity.getAuthToken({interactive: true})
        return tokenObj.token
    }

    async function fetchGoogleSheetData(
        sheetName, token = null, workbookId, range = null, readByColumns = false
    ) {
        if (!token) token = await fetchGoogleToken()
        if (!workbookId) workbookId = googleUrls.configSheetId
        const sheetInfo = {
            spreadsheetId: workbookId,
            name: sheetName,
            range,
            readByColumns
        }
        const response = await requestGoogleSheetContents(sheetInfo, token)
        return await response.json()
    }

    function requestGoogleSheetContents(sheetInfo, token) {
        const workbookId = sheetInfo.spreadsheetId
        const range = sheetInfo.name + ( sheetInfo.range ? `!${sheetInfo.range}` : "" )
        const queryString = sheetInfo.readByColumns ? `?majorDimension=COLUMNS` : ""
        const uri = `${googleUrls.sheetsApiBase}${workbookId}/values/${range}${queryString}`
        const params = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        }
        return fetch(uri, params)
    }

    async function getFileId(fileName, token) {
        if (!token) token = await fetchGoogleToken()
        const folderId = googleUrls.generatedSheetsFolderId
        const searchTerm = `name='${fileName}' and mimeType='${googleUrls.sheetMimeType}' and trashed = false and '${folderId}' in parents`
        const qsParams = new URLSearchParams()
        qsParams.set('q', searchTerm)
        const queryString = qsParams.toString()
        const uri = `${googleUrls.driveApiBase}?${queryString}`
        const params = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        }
        const response = await fetch(uri, params)
        const json = await response.json()
        if (json.files && json.files.length === 0) return null
        if (json.files && json.files.length > 1) return `There are multiple files with name ${fileName}`
        return json.files[0].id
    }

    async function createSheet(fileName, token) {
        if (!token) token = await fetchGoogleToken()
        const folderId = googleUrls.generatedSheetsFolderId
        const uri = `${googleUrls.driveApiBase}${googleUrls.templateSheetId}/copy`
        const params = {
            method: 'POST',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: fileName,
                parents: [folderId]
            })
        }
        const response = await fetch(uri, params)
        const json = await response.json()
        return json.id
    }

    async function appendToSheet(workbookId, sheetName, values, token) {
        if (!token) token = await fetchGoogleToken()
        const qsParams = new URLSearchParams()
        qsParams.set("valueInputOption", "RAW")
        const queryString = qsParams.toString()
        const uri = `${googleUrls.sheetsApiBase}${workbookId}/values/${sheetName}:append?${queryString}`
        const params = {
            method: 'POST',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                majorDimension: "ROWS",
                values
            })
        }
        const response = await fetch(uri, params)
        return await response.json()
    }

    async function writeToRange(workbookId, sheetAndRangeName, values, token) {
        if (!token) token = await fetchGoogleToken()
        const qsParams = new URLSearchParams()
        qsParams.set("valueInputOption", "RAW")
        const queryString = qsParams.toString()
        const uri = `${googleUrls.sheetsApiBase}${workbookId}/values/${sheetAndRangeName}?${queryString}`
        const params = {
            method: 'PUT',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                majorDimension: "ROWS",
                values
            })
        }
        const response = await fetch(uri, params)
        return await response.json()
    }

    async function loadSheetRange (sheetName, rangeName, filterObject = undefined, shallMap = true, readByColumns = false, workbookId) {
        const responseJson = await fetchGoogleSheetData(sheetName, null, workbookId, rangeName, readByColumns)
        let filteredOptions
        if (rangeName) filteredOptions = responseJson.values[0]
        else filteredOptions = responseJson.values
        
        if (filterObject) {
            filteredOptions = filteredOptions
                .filter(option => {
                    const valuesToSearch = Array.isArray(filterObject.val) ? filterObject.val : [ filterObject.val ]
                    return valuesToSearch.some(value => {
                        return compareWithOperator(Array.isArray(option) ? option[0] : option, filterObject.operator, value)
                    })
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
    return { fetchGoogleToken, fetchGoogleSheetData, getFileId, createSheet, loadSheetRange, appendToSheet, writeToRange }
}