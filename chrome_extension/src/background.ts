import { Message } from "src/messages";
import { requestAnki } from "src/api/anki";

// Message handler for content scripts
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    if (message.type === "createTab") {
      const tab = sender.tab;
      if (tab === undefined) {
        return;
      }
      chrome.tabs.create({ url: message.url, index: tab.index + 1 });
      return false;
    }

    if (message.type === "requestAnki") {
      requestAnki({ type: message.typ, target: message.target }).then(
        sendResponse
      );
      return true;
    }

    return false;
  }
);

// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "euisu-scrap",
    title: "Euisu: Scrap",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "euisu-scrap") {
    if (info.selectionText === undefined) {
      return;
    }
    const text = info.selectionText.trim();
    requestAnki({ type: "tts", target: text }).then((resp) => {
      copyToClipboard(`${text} [sound:${resp.basename}]`);
    });
  }
});

function copyToClipboard(text: string): void {
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
