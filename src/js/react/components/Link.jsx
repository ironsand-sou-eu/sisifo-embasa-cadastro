import React from "react";

export default function Link({
  label,
  url,
  target,
  classes,
  styles,
  isDisabled,
  onClick,
}) {
  return (
    <a
      className={
        "inputGroupContainer col-sm-8" + (classes ? ` ${classes}` : "")
      }
      style={styles ?? {}}
      disabled={!!isDisabled}
      href={url ?? "#"}
      target={target ?? "_blank"}
      onClick={onClick}
    >
      {label}
    </a>
  );
}
