/**
 * Injects a button on each row of
 * into n.dict.naver.com/#/entry
 */

import {
  extractNormalizedTargetText,
  extractNormalizedLineText,
} from "src/en_dict_naver_com/textextractor";
import { createEuisu } from "src/en_dict_naver_com/euisu";

export function injectEuisuToEntryPage(): void {
  injectEuisuIntoMeaningLines();
  injectEuisuIntoExampleItems();
}

function injectEuisuIntoMeaningLines(): void {
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
  return extractNormalizedTargetText(el);
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
  const meaning = extractNormalizedLineText(mean);
  const euisu = createEuisu(targetText, audioURL, meaning);
  mean.parentElement?.appendChild(euisu);
}

function injectEuisuIntoExampleItems(): void {
  queryExampleItems().forEach(processExampleItem);
}

function queryExampleItems(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".mean_list > .mean_item .example_item"
    ),
  ];
}

function processExampleItem(el: HTMLElement): void {
  const originText = el.querySelector<HTMLElement>(".origin > .text");
  if (originText === null) {
    return;
  }
  const targetText = extractNormalizedLineText(originText);
  const translateText = el.querySelector<HTMLElement>(".translate > .text");
  const meaning =
    translateText === null ? null : extractNormalizedLineText(translateText);
  console.log(meaning);
  const euisu = createEuisu(targetText, null, meaning);
  originText.parentElement?.appendChild(euisu);
}
