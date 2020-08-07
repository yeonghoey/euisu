import "src/content/en_dict_naver_com/style.css";
import { injectEuisuIntoSearchPage } from "src/content/en_dict_naver_com/pages/search";
import {
  injectEuisuToEntryMeaning,
  injectEuisuIntoEntryExampleRows,
} from "src/content/en_dict_naver_com/pages/entry";

/**
 * NOTE: 'en.dict.naver.com' loads the page dynamically.
 * Just keep monitoring the page and injects the actual features
 * when the searchPage_entry element is fully loaded.
 */

function tryInject(selector: string, injectFunc: () => void): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (el === null) {
    return;
  }
  if ("euisu" in el.dataset) {
    return;
  }
  injectFunc();
  el.dataset.euisu = "Injected";
}

setInterval(() => {
  if (window.location.hash.startsWith("#/search")) {
    tryInject("#searchPage_entry", injectEuisuIntoSearchPage);
    return;
  }

  if (window.location.hash.startsWith("#/entry")) {
    tryInject(
      ".article > .section_mean > .component_mean",
      injectEuisuToEntryMeaning
    );
    tryInject(
      "#searchPage_example .component_example",
      injectEuisuIntoEntryExampleRows
    );
    return;
  }
}, 500);
