/**
 * Injects a button on each row of component_keyword section
 * into n.dict.naver.com/#/search
 *
 * The keyword section of the search result page is constructed like:
 * <div class="component_keyword">
 *  <div class="row">
 *   <div class="origin"></div>
 *   <div class="mean_list"></div>
 *   <div class="mean_list"></div>
 *   ...
 *  </div>
 *  ...
 * </div>
 *
 * This featue puts together a string for each row
 * which contains all of the text in `mean_list` and make it available through
 * injecting a button which copy this string into clipboard
 */

import {
  extractNormalizedTargetText,
  extractNormalizedLineText,
} from "src/content/en_dict_naver_com/textextractor";
import { createEuisu } from "src/content/en_dict_naver_com/euisu";
import { processExamples } from "src/content/en_dict_naver_com/examples";

export function injectEuisuIntoSearchPage(): void {
  injectEuisuIntoKeywordRows();
  injectEuisuIntoExampleRows();
}

function injectEuisuIntoKeywordRows(): void {
  queryKeywordRows().forEach(processRow);
}

function queryKeywordRows(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(".component_keyword > .row"),
  ];
}

function processRow(row: HTMLElement): void {
  const targetText = extractTargetText(row);
  if (targetText === null) {
    return;
  }
  const audioURL = extractAudioURL(row);
  const meaningBlock = extractMeaningBlock(row);
  const euisu = createEuisu(targetText, audioURL, meaningBlock);
  appendEuisuToOrigin(row, euisu);
}

function extractTargetText(row: HTMLElement): string | null {
  const el = row.querySelector<HTMLElement>(".origin > :first-child");
  if (el === null) {
    return null;
  }
  return extractNormalizedTargetText(el);
}

function extractAudioURL(row: HTMLElement): string | null {
  const el = row.querySelector<HTMLElement>(
    ".origin > .listen_list > :first-child button.btn_listen.play"
  );
  if (el === null) {
    return null;
  }
  return el.getAttribute("purl");
}

function extractMeaningBlock(row: HTMLElement): string {
  const meanLists = [...row.querySelectorAll<HTMLElement>(".mean_list")];
  const meanings = meanLists.map(convertMeanListToMeanings);
  const meaningBlock = meanings.join("\n");
  return meaningBlock;
}

function convertMeanListToMeanings(meanList: HTMLElement): string {
  const meanItems = [...meanList.querySelectorAll<HTMLElement>(".mean_item")];
  const meaningLines = meanItems.map(convertMeanItemToMeanLine);
  const meaning = meaningLines.join("\n");
  return meaning;
}

function convertMeanItemToMeanLine(meanItemOrg: HTMLElement): string {
  // Clone the original meanItem first so that it can be modified.
  const meanItem = meanItemOrg.cloneNode(true) as HTMLElement;
  return [...meanItem.children]
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .map(extractNormalizedLineText)
    .join(" ");
}

function appendEuisuToOrigin(row: HTMLElement, euisu: HTMLElement): void {
  const origin = row.querySelector<HTMLElement>(".origin");
  if (origin === null) {
    return;
  }
  origin.appendChild(euisu);
}

function injectEuisuIntoExampleRows(): void {
  queryExampleRows().forEach(processExamples);
}

function queryExampleRows(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(".component_example > .row"),
  ];
}
