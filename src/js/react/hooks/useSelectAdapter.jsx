export default function useSelectAdapter() {
    function objectifyToSelect(value, label = value) {
        return {
            label: label,
            value: value ?? ""
        }
    }

    function deobjectifyFromSelect(selectObject, desiredProperty = "value") {
        return selectObject[desiredProperty]
    }
     return { objectifyToSelect, deobjectifyFromSelect }
}