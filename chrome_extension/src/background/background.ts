import { onMessage } from "src/background/messages";
import {
  createContextMenus,
  onContextMenuClicked,
} from "src/background/contextmenus";
import { handleCommands } from "src/background/commands";

// Messages
chrome.runtime.onMessage.addListener(onMessage);

// Context menus
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
chrome.commands.onCommand.addListener(handleCommands);
