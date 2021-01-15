/**
 * Injects a button on each row of
 * into n.dict.naver.com/#/entry
 */

import {
  extractNormalizedTargetText,
  extractNormalizedLineText,
} from "src/content/en_dict_naver_com/textextractor";
import { createEuisu } from "src/content/en_dict_naver_com/euisu";
import { processExamples } from "src/content/en_dict_naver_com/examples";

export function injectEuisuToEntryMeaning(): void {
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
  const meanAdditionText = extractMeanAdditionText(mean);
  const meanText = extractNormalizedLineText(mean);
  const meaning =
    meanAdditionText !== "" ? `(${meanAdditionText}) ${meanText}` : meanText;

  const euisu = createEuisu(targetText, audioURL, meaning);
  mean.parentElement?.appendChild(euisu);
}

function injectEuisuIntoExampleItems(): void {
  queryExampleItems().forEach(processExamples);
}

function extractMeanAdditionText(mean: HTMLElement): string {
  const meanAdditions = mean.parentNode?.querySelectorAll<HTMLElement>(
    ".mean_addition"
  );

  if (meanAdditions === undefined) {
    return "";
  }

  return [...meanAdditions]
    .map((el) => extractNormalizedLineText(el))
    .join(" ")
    .trim();
}

function queryExampleItems(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".mean_list > .mean_item .example_item"
    ),
  ];
}

export function injectEuisuIntoEntryExampleRows(): void {
  queryExampleRows().forEach(processExamples);
}

function queryExampleRows(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(".component_example > .row"),
  ];
}
