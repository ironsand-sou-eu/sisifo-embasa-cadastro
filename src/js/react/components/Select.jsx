import React, { useContext } from "react"
import AsyncSelect from "react-select/async"
import { LoadingContext } from "../App"
import useSelectAdapter from "../hooks/useSelectAdapter"
import { useGoogleSheets } from "../hooks/connectors/useGoogleSheets"

export default function Select({ sheetName, rangeName, name, label, value, isMulti, onChange }) {
    const isLoading = useContext(LoadingContext)
    const { objectifyToSelect, deobjectifyFromSelect } = useSelectAdapter()
    const { loadSheetRange } = useGoogleSheets()

    const filterFunction = input => loadSheetRange(sheetName, rangeName, { operator: "insentiviveIncludes", val: input }, true, true)

    async function changed(newData) {
        onChange(deobjectifyFromSelect(newData), name)
    }

    return (
        <div className="col-sm-6">
            <label className="sisifo-label">{label}</label>
            <div className="col-sm-12 inputGroupContainer">
                <AsyncSelect
                    loadOptions={filterFunction}
                    value={objectifyToSelect(value)}
                    name={name}
                    placeholder="Selecione uma opção..."
                    onChange={changed}
                    isLoading={isLoading.scrapping ?? true}
                    isSearchable
                    isClearable
                    isMulti={isMulti ? true : false}
                    defaultOptions
                    cacheOptions
                />
            </div>
        </div>
    )
}