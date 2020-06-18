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

import { extractNormalizedText } from "src/en_dict_naver_com/target_text";

export function injectEuisuIntoSearchPage(): void {
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
  return extractNormalizedText(el);
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

function convertMeanItemToMeanLine(meanItem: HTMLElement): string {
  const children = [...meanItem.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  );
  const columns = children.map((el) => el.innerText.trim());
  const meanLine = columns.join(" ");
  return meanLine;
}

function createEuisu(
  targetText: string,
  audioURL: string | null,
  meaningBlock: string
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");
  const scrapButoon = makeScrapButton(targetText, audioURL, meaningBlock);
  div.appendChild(scrapButoon);
  const imageButton = makeImageButton(targetText);
  div.appendChild(imageButton);
  return div;
}

function makeScrapButton(
  targetText: string,
  audioURL: string | null,
  meaningBlock: string
) {
  // TODO: make the appearance fancier
  const button = document.createElement("button");
  button.innerText = "Scrap";
  button.onclick = function onclick() {
    let typ = "";
    let target = "";
    if (audioURL !== null) {
      typ = "download";
      target = audioURL;
    } else {
      typ = "tts";
      target = targetText;
    }
    chrome.runtime.sendMessage(
      { type: "requestAnki", typ, target },
      (basename: string) => {
        const content = `${targetText} [sound:${basename}]\n${meaningBlock}`;
        navigator.clipboard.writeText(content);
      }
    );
  };
  return button;
}

function makeImageButton(targetText: string) {
  const button = document.createElement("button");
  button.innerText = "Image";
  button.onclick = function onclick() {
    chrome.runtime.sendMessage({
      type: "createTab",
      url: `https://www.google.com/search?tbm=isch&q=${targetText}`,
    });
  };
  return button;
}

function appendEuisuToOrigin(row: HTMLElement, euisu: HTMLElement): void {
  const origin = row.querySelector<HTMLElement>(".origin");
  if (origin === null) {
    return;
  }
  origin.appendChild(euisu);
}
