import React from "react";
import Link from "./components/Link";
import useOptionsLoadingHandler from "./hooks/useOptionsLoadingHandler";
import { getOrCreateTodaysCurrentSheetInLocalStorage } from "../utils/utils";

function updateLocalStorageToNextSheet() {
  const { date, number } = getOrCreateTodaysCurrentSheetInLocalStorage();
  const newSheet = { date, number: `${parseInt(number) + 1}`.padStart(2, "0") };
  localStorage.setItem("currentSheet", JSON.stringify(newSheet));
}

export default function OptionsApp() {
  const {
    sheetsInfo: { newestSheet, todaySheets, previousDaySheets },
    juizosUrl,
    folderUrl,
  } = useOptionsLoadingHandler();
  const downloadNewestLabel = newestSheet.name
    ? `Baixar planilha ${newestSheet.name}, mais recente, e abrir nova`
    : "Não há planilhas geradas hoje";

  return (
    <main style={mainStyles}>
      <div className="form-group">
        <Link
          label={downloadNewestLabel}
          url={newestSheet.url}
          classes="btn btn-info"
          styles={{ width: "58%" }}
          isDisabled={!newestSheet.name}
          onClick={updateLocalStorageToNextSheet}
        />
        <Link
          label="Configurações"
          url={juizosUrl}
          classes="btn btn-info"
          styles={{ width: "38%" }}
        />
      </div>
      <fieldset className="form-group">
        <legend className="sisifo-v-label">
          Planilhas de hoje, {todaySheets?.date}
        </legend>
        {todaySheets?.files?.map(sheetInfo => {
          return (
            <Link
              key={sheetInfo.url}
              label={sheetInfo.name}
              url={sheetInfo.url}
            />
          );
        })}
      </fieldset>
      <fieldset className="form-group">
        <legend className="sisifo-v-label">
          Planilhas do dia anterior, {previousDaySheets?.date}
        </legend>
        {previousDaySheets?.files?.map(sheetInfo => {
          return (
            <Link
              key={sheetInfo.url}
              label={sheetInfo.name}
              url={sheetInfo.url}
            />
          );
        })}
      </fieldset>
      <div className="form-group">
        <Link label="Pasta com planilhas" url={folderUrl} />
        <Link
          label="Abrir nova planilha manualmente"
          target="_self"
          onClick={updateLocalStorageToNextSheet}
        />
      </div>
    </main>
  );
}

const mainStyles = {
  margin: "0 2rem",
  padding: "0 1rem 1rem 1rem",
};
