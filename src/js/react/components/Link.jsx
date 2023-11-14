import React from "react";

function SelectInput({ url, label, classes, styles }) {
  return (
    <a
      className={"inputGroupContainer col-sm-8" + classes ? ` ${classes}` : ""}
      style={styles}
      href={url}
      target="_blank"
    >
      {label}
    </a>
  );
}

export default SelectInput;
