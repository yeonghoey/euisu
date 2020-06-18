/**
 * Injects a button on each row of
 * into n.dict.naver.com/#/entry
 */

import { extractNormalizedText } from "src/en_dict_naver_com/target_text";
import { createEuisu } from "src/en_dict_naver_com/euisu";

export function injectEuisuToEntryPage(): void {
  const targetText = extractTitleText();
  if (targetText === null) {
    return;
  }
  const audioURL = extractAudioURL();
  queryMeans().forEach((el) => {
    processMean(targetText, audioURL, el);
  });
}

function extractTitleText(): string | null {
  const el = document.querySelector<HTMLElement>(
    ".entry_title > :first-child\
    ,.entry_title--saying > :first-child"
  );
  if (el === null) {
    return null;
  }
  return extractNormalizedText(el);
}

function extractAudioURL(): string | null {
  const el = document.querySelector<HTMLElement>(
    ".entry_pronounce .tray > :first-child button.btn_listen.mp3"
  );
  if (el === null) {
    return null;
  }
  return el.getAttribute("purl");
}

function queryMeans(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(".mean_list > .mean_item .mean"),
  ];
}

function processMean(
  targetText: string,
  audioURL: string | null,
  mean: HTMLElement
): void {
  const meaning = mean.innerText.trim();
  const euisu = createEuisu(targetText, audioURL, meaning);
  mean.parentElement?.appendChild(euisu);
}
