// TargetText is generally the word itself in the dictionary
// and sometimes it contains superscripts if the word has multiple meanings.
// Drop superscripts if so.
export function extractNormalizedTargetText(elOrg: HTMLElement): string {
  let el = clone(elOrg);
  el = dropSup(el);
  return el.innerText.trim().replace(/\s\s+/g, " ");
}

function clone(el: HTMLElement): HTMLElement {
  return el.cloneNode(true) as HTMLElement;
}

function dropSup(el: HTMLElement): HTMLElement {
  [...el.getElementsByTagName("sup")].forEach((sup) => sup.remove());
  return el;
}

// Some meaning lines contain extraneous whilespaces which won't get trimmed.
// To mitigate this, traverse each child node and trim on it then join altogether.
export function extractNormalizedMeanText(el: HTMLElement): string {
  return [...el.childNodes]
    .map((node) => node.textContent?.replace(/\s\s+/g, " "))
    .filter((s): s is string => s !== undefined && s !== "")
    .join("")
    .trim();
}
