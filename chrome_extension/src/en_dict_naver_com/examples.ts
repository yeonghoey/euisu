import { extractNormalizedLineText } from "src/en_dict_naver_com/textextractor";
import { createEuisu } from "src/en_dict_naver_com/euisu";

export function processExamples(el: HTMLElement): void {
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
