import React from "react"


function Parte(props) {
    return (
        <div className="input-group">
            <label className="input-group-addon">
                <input type="checkbox"
                    checked={props.isClient}
                    onChange={props.onChange}
                />
            </label>
            <input name={props.type}
                value={props.value}
                className="form-control"
                type="text"
                disabled
            />
        </div>
    )
}

export default Parte