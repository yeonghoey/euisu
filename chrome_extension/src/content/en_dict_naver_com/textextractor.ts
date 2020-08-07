// TargetText is generally the word itself in the dictionary
// and sometimes it contains superscripts if the word has multiple meanings.
// Drop sub/superscripts and extraneous symbols if so.
export function extractNormalizedTargetText(elOrg: HTMLElement): string {
  let el = clone(elOrg);
  el = dropSub(el);
  el = dropSup(el);
  let text = el.innerText.trim().replace(/\s\s+/g, " ");
  text = spaceSymbols(text);
  text = removeSymbols(text);
  return text;
}

// Some line texts contain extraneous whitespaces which won't get trimmed.
// To mitigate this, traverse each child node and trim on it then join altogether.
export function extractNormalizedLineText(elOrg: HTMLElement): string {
  let el = clone(elOrg);
  el = removeWordClass(el);
  el = putParenthesisToMark(el);
  return [...el.childNodes]
    .map((el) => el.textContent?.replace(/\s\s+/g, " "))
    .filter((s): s is string => s !== undefined && s !== "")
    .join("")
    .trim();
}

function clone(el: HTMLElement): HTMLElement {
  return el.cloneNode(true) as HTMLElement;
}

function dropSub(el: HTMLElement): HTMLElement {
  [...el.querySelectorAll<HTMLElement>("sub")].forEach((sup) => sup.remove());
  return el;
}
function dropSup(el: HTMLElement): HTMLElement {
  [...el.querySelectorAll<HTMLElement>("sup")].forEach((sup) => sup.remove());
  return el;
}

function putParenthesisToMark(el: HTMLElement): HTMLElement {
  [...el.querySelectorAll<HTMLElement>(".mark")].forEach(
    (mark) => (mark.innerText = `(${mark.innerText.trim()})`)
  );
  return el;
}

function spaceSymbols(text: string): string {
  return text.replace(/[⇄]/g, " ");
}

function removeSymbols(text: string): string {
  return text.replace(/[·]/g, "");
}

function removeWordClass(el: HTMLElement): HTMLElement {
  // Remove "word_class" which makes the mean line verbose.
  el.querySelectorAll<HTMLElement>(".word_class").forEach((el) => el.remove());
  return el;
}
