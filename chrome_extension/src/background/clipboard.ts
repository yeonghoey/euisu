export function copyToClipboard(text: string): void {
  const ta = document.createElement("textarea");
  ta.style.cssText =
    "opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;";
  ta.value = text;
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  ta.remove();
}
