import { onMessage } from "src/background/messages";
import {
  createContextMenus,
  onContextMenuClicked,
} from "src/background/contextmenus";

// Messages
chrome.runtime.onMessage.addListener(onMessage);

// Context menus
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
