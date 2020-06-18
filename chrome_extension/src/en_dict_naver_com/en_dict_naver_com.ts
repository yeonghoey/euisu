import "src/en_dict_naver_com/style.css";
import { injectEuisuIntoSearchPage } from "src/en_dict_naver_com/pages/search";

/**
 * NOTE: 'en.dict.naver.com' loads the page dynamically.
 * Just keep monitoring the page and injects the actual features
 * when the searchPage_entry element is fully loaded.
 */
setInterval(() => {
  if (window.location.hash.startsWith("#/search")) {
    const el = document.getElementById("searchPage_entry");
    if (el === null) {
      return;
    }
    if ("euisu" in el.dataset) {
      return;
    }
    injectEuisuIntoSearchPage();
    el.dataset.euisu = "Injected";
    return;
  }

  if (window.location.hash.startsWith("#/entry")) {
    const el = document.querySelector(
      ".article > .section_mean > .component_mean"
    ) as HTMLElement;
    if (el === null) {
      return;
    }
    if ("euisu" in el.dataset) {
      return;
    }
    // injectEuisuToEntryPage();
    el.dataset.euisu = "Injected";
  }
}, 500);
