// Define protocols between background script and content scripts.
// Since some chrome features are only allowed to run on background scripts,
// content scripts have to ask background scripts to do some tasks on their behalf.
// Exported functions except "onMessage" are suppoed to be used by content scripts.

import { postAnki } from "src/api/anki";

type MsgReq = ReqPostAnki | ReqCreateTab;
type MsgResp = RespPostAnki | void;
type MsgSender = chrome.runtime.MessageSender;
type MsgCallback = (response: MsgResp) => void;

// PostAnki
interface ReqPostAnki {
  type: "postAnki";
  typ: string;
  target: string;
}

interface RespPostAnki {
  basename: string;
}

export async function requestPostAnki(
  typ: string,
  target: string
): Promise<RespPostAnki> {
  return sendMessage({
    type: "postAnki",
    typ,
    target,
  } as ReqPostAnki);
}

// CreateTab
interface ReqCreateTab {
  type: "createTab";
  url: string;
}

export async function requestCreateTab(url: string): Promise<void> {
  return sendMessage({ type: "createTab", url } as ReqCreateTab);
}

// Wrap "chrome.runtime.sendMessage" to return Promise
async function sendMessage<R extends MsgResp>(req: MsgReq): Promise<R> {
  return new Promise<R>((resolve) => {
    chrome.runtime.sendMessage(req, (resp: R) => resolve(resp));
  });
}

// From this point, the fuctions are for handling messages,
// which should be run on the background script.
export function onMessage(
  req: MsgReq,
  sender: MsgSender,
  sendResponse: MsgCallback
): boolean {
  // IMPORTANT: Make sure to call sendResponse so that message channel can be closed.
  switch (req.type) {
    case "postAnki":
      onRequestAnki(req, sender, sendResponse);
      break;

    case "createTab":
      onCreateTab(req, sender);
      sendResponse();
      break;
  }
  return true;
}

function onRequestAnki(
  message: ReqPostAnki,
  sender: MsgSender,
  sendResponse: (resp: RespPostAnki) => void
): void {
  postAnki({ type: message.typ, target: message.target }).then(sendResponse);
}

function onCreateTab(message: ReqCreateTab, sender: MsgSender): void {
  const tab = sender.tab;
  if (tab === undefined) {
    return;
  }
  chrome.tabs.create({ url: message.url, index: tab.index + 1 });
}
