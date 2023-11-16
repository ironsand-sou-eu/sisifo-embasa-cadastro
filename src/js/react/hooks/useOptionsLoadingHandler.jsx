import { useEffect, useState } from "react";
import useGoogleSheets from "./connectors/useGoogleSheets";
import { googleUrls } from "../../envVars";

export default function useOptionsLoadingHandler() {
  const { getGeneratedSheetsInfo } = useGoogleSheets();
  const [sheetsInfo, setSheetsInfo] = useState({
    newestSheet: { name: "", url: "" },
    todaySheets: { date: "", files: [] },
    previousDaySheets: { date: "", files: [] },
  });
  const juizosUrl = googleUrls.sheetsFrontendBase + googleUrls.configSheetId;
  const folderUrl =
    googleUrls.driveFoldersBase + googleUrls.applicationFolderId;

  useEffect(() => {
    loadInfo(setSheetsInfo);
  }, []);

  async function loadInfo(stateSetter) {
    const todaysSheetsInfo = await getGeneratedSheetsInfo(new Date());
    const files = todaysSheetsInfo?.files?.map(sheetMapping);
    const newestSheet = sheetMapping(todaysSheetsInfo.files[0]);
    const todaySheets = {
      date: new Date().toLocaleDateString("pt-BR"),
      files,
    };
    const previousDaySheets = await getPreviousDaySheetsInfoFromDate(
      new Date()
    );
    stateSetter({ newestSheet, todaySheets, previousDaySheets });
  }

  async function getPreviousDaySheetsInfoFromDate(date = new Date()) {
    date.setDate(date.getDate() - 1);
    const previousDaySheetsInfo = await getGeneratedSheetsInfo(date);
    if (
      Array.isArray(previousDaySheetsInfo?.files) &&
      previousDaySheetsInfo.files.length === 0
    ) {
      return await getPreviousDaySheetsInfoFromDate(date);
    }
    const files = previousDaySheetsInfo?.files?.map(sheetMapping);
    return {
      date: date.toLocaleDateString("pt-BR"),
      files,
    };
  }

  function sheetMapping(sheetInfo) {
    if (!sheetInfo) {
      return {
        name: undefined,
        url: undefined,
      };
    }
    return {
      name: sheetInfo.name,
      url: googleUrls.sheetsFrontendBase + sheetInfo.id,
    };
  }

  return { sheetsInfo, juizosUrl, folderUrl };
}
