import { postAnki } from "src/api/anki";
import { copyToClipboard } from "src/background/clipboard";

export function createContextMenus(): void {
  chrome.contextMenus.create({
    id: "euisu-scrap",
    title: "Euisu: Scrap",
    contexts: ["selection"],
  });
}

export function onContextMenuClicked(
  info: chrome.contextMenus.OnClickData
): void {
  if (info.menuItemId === "euisu-scrap") {
    if (info.selectionText === undefined) {
      return;
    }
    const text = info.selectionText.trim();
    postAnki({ type: "tts", target: text }).then((resp) => {
      copyToClipboard(`${text} [sound:${resp.basename}]`);
    });
  }
}
