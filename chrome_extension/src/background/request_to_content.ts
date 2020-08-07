import * as btc from "src/protocols/background_to_content";

export function requestShowSnackbar(text: string): void {
  requestToContent({
    type: "RequestShowSnackbar",
    text,
  } as btc.RequestShowSnackbar);
}

export function requestCaptureVideo(): void {
  requestToContent({
    type: "RequestCaptureVideo",
  } as btc.RequestCaptureVideo);
}

function requestToContent(request: btc.Request): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      return;
    }
    const tab = tabs[0];
    const tabId = tab.id;
    if (tabId === undefined) {
      return;
    }
    chrome.tabs.sendMessage(tabId, request);
  });
}
