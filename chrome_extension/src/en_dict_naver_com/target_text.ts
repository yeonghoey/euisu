export function extractNormalizedText(elOrg: HTMLElement): string {
  let el = clone(elOrg);
  el = dropSup(el);
  return el.innerText.trim();
}

function clone(el: HTMLElement): HTMLElement {
  return el.cloneNode(true) as HTMLElement;
}

function dropSup(el: HTMLElement): HTMLElement {
  [...el.getElementsByTagName("sup")].forEach((sup) => sup.remove());
  return el;
}
