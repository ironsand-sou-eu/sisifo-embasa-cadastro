import React from "react"
import Select from "react-select"
import AsyncSelect from "react-select/async"
import Trash from "./Trash"
import { tiposContingencia } from "../../enums"
import useCurrencyFormater from "../hooks/useCurrencyFormater"
import useSelectAdapter from "../hooks/useSelectAdapter"
import { useGoogleSheets } from "../hooks/connectors/useGoogleSheets"

const { loadSheetRange } = useGoogleSheets()

function Pedido({ index, pedido, onChange }) {
    const { formatNumberToPtbrString, formatStringToNumber } = useCurrencyFormater()
    const { objectifyToSelect, deobjectifyFromSelect } = useSelectAdapter()
    const filterFunction = input => loadSheetRange("pedidos", "nomesPedidos", { operator: "insentiviveIncludes", val: input }, true, true)

    function getDeleteParams() {
        return {
            type: "delete",
            targetIndex: index
        }
    }

    function getUpdateParams({ updatedField, newValue }) {
        return {
            type: "update",
            targetIndex: index,
            newPedido: {...pedido, [updatedField]: newValue}
        }
    }

    function getPrognosticoOption(prognosticoValue) {
        return tiposContingencia.find(prognosticoOption => prognosticoOption.value === prognosticoValue)
    }

    function validateNumberAndUpdate(ev) {
        let value = formatStringToNumber(ev.target.value)
        onChange(getUpdateParams({
                updatedField: ev.target.name,
                newValue: formatStringToNumber(value)
        }))
    }
    
    return (
        <div className="input-group d-flex">
            <div className="col-sm-5 no-padding">
                <AsyncSelect
                    loadOptions={filterFunction}
                    value={objectifyToSelect(pedido.nome)}
                    name="nome"
                    placeholder="Selecione uma opção..."
                    onChange={newData => onChange(getUpdateParams(
                        {updatedField: "nome", newValue: deobjectifyFromSelect(newData, "value")}
                    ))}
                    isSearchable
                    defaultOptions
                    cacheOptions
                />
            </div>

            <div className="col-sm-2 no-padding">
                <input name="valorPedido"
                    value={formatNumberToPtbrString(pedido.valorPedido) ?? ''}
                    onChange={validateNumberAndUpdate}
                    className="form-control"
                    type="text"
                />
            </div>

            <div className="col-sm-2 no-padding">
                <Select
                    options={tiposContingencia}
                    value={getPrognosticoOption(pedido.estimativaTipo)}
                    onChange={newData => onChange(getUpdateParams(
                        {updatedField: "estimativaTipo", newValue: newData.value}
                    ))}
                />
            </div>

            <div className="col-sm-2 no-padding">
                <input name="valorProvisionado"
                    value={formatNumberToPtbrString(pedido.valorProvisionado) ?? ''}
                    onChange={validateNumberAndUpdate}
                    className="form-control"
                    type="text"
                />
            </div>

            <div className="no-padding">
                <Trash
                    onClick={() => onChange(getDeleteParams())}
                />
            </div>
        </div>
    )
}

export default Pedido