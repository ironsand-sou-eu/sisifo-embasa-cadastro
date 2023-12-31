import React from "react";
import { createRoot } from "react-dom/client";
import App from "./react/App";

const reactRoot = createRoot(document.getElementById("react-root"));

reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
