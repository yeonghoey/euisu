import { retrieveActiveTabId } from "src/content_agent/retrieve_active_tab_id";

export interface RequestShowSnackbar {
  type: "RequestShowSnackbar";
  text: string;
}

export async function showSnackbar(text: string): Promise<void> {
  const tabId = await retrieveActiveTabId();
  chrome.tabs.sendMessage(tabId, {
    type: "RequestShowSnackbar",
    text,
  } as RequestShowSnackbar);
}
