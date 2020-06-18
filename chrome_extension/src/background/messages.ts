import { requestAnki } from "src/api/anki";

type Message = CreateTab | RequestAnki;
type Sender = chrome.runtime.MessageSender;
type Response = FromRequestAnki | undefined;
type Callback = (response: Response) => void;

export function onMessage(
  message: Message,
  sender: Sender,
  sendResponse: Callback
): boolean {
  switch (message.type) {
    case "createTab":
      return onCreateTab(message, sender);
    case "requestAnki":
      return onRequestAnki(message, sender, sendResponse);
  }
}

interface CreateTab {
  type: "createTab";
  url: string;
}

function onCreateTab(message: CreateTab, sender: Sender): boolean {
  const tab = sender.tab;
  if (tab === undefined) {
    return false;
  }
  chrome.tabs.create({ url: message.url, index: tab.index + 1 });
  return false;
}

interface RequestAnki {
  type: "requestAnki";
  typ: string;
  target: string;
}

interface FromRequestAnki {
  basename: string;
}
function onRequestAnki(
  message: RequestAnki,
  sender: Sender,
  sendResponse: (response: FromRequestAnki) => void
): boolean {
  requestAnki({ type: message.typ, target: message.target }).then(sendResponse);
  return true;
}
