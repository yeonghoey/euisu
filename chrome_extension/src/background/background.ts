import { onMessage } from "src/background/messages";
import {
  createContextMenus,
  onContextMenuClicked,
} from "src/background/contextmenus";
import { handleCommands } from "src/background/commands";
import { registerContentToBackgroundListener } from "src/background/content_to_background_listener";

import { registerInjection } from "src/background/injection";

// Messages
chrome.runtime.onMessage.addListener(onMessage); // Legacy
registerContentToBackgroundListener(); // New

// Context menus
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
chrome.commands.onCommand.addListener(handleCommands);

registerInjection({
  target: ".*://www.youtube.com/watch.*",
  file: "www_youtube_com_watch.js",
});
