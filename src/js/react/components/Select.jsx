import React, { useContext } from "react"
import AsyncSelect from "react-select/async"
import { loadOptionsInSheetRange } from "../../connectors/google-sheets"
import { LoadingContext } from "../App.jsx"
import useSelectAdapter from "../hooks/useSelectAdapter.jsx"

export default function Select({ sheetName, rangeName, name, label, value, isMulti, onChange }) {
    const isLoading = useContext(LoadingContext)
    const { objectifyToSelect, deobjectifyFromSelect } = useSelectAdapter()
    
    const filterFunction = input => loadOptionsInSheetRange(sheetName, rangeName, { operator: "insentiviveIncludes", val: input }, true, true)

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