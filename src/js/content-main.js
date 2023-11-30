import {
  identifyCorrectScrapper,
  NotProcessoHomepageException,
} from "brazilian-courts-scrappers";

const DOMAINS = {
  TJBA: {
    projudi: "projudi.tjba.jus.br",
    pje1g: "pje.tjba.jus.br",
  },
};

const urlObj = new URL(document.URL);

(function () {
  if (
    urlObj.hostname === DOMAINS.TJBA.pje1g &&
    urlObj.pathname.includes("ConsultaProcesso")
  ) {
    const pjeFullPageLoader = document.createElement("script");
    pjeFullPageLoader.src = chrome.runtime.getURL("timelineLoader.js");
    pjeFullPageLoader.type = "module";
    pjeFullPageLoader.defer = true;
    document.head.appendChild(pjeFullPageLoader);
  }
})();

chrome.runtime.sendMessage(
  {
    from: "sisifoContent",
    url: urlObj,
  },
  () => {}
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.subject === "attempted-start-scrapping") {
    try {
      const scrapperClass = identifyCorrectScrapper(document);
      const scrapper = new scrapperClass(document);
      if (!scrapper.checkProcessoHomepage()) return;
      scrapper
        .fetchProcessoInfo()
        .then(processoInfo => {
          sendResponse(processoInfo);
        })
        .catch(e => console.error(e));
    } catch (e) {
      if (!(e instanceof NotProcessoHomepageException)) sendResponse(e);
    }
    return true;
  }
});
