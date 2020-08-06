export function handleCommands(command: string): void {
  if (command === "copy-media-snapshot") {
    copyMediaSnapshot();
  }
}

async function copyMediaSnapshot(): Promise<void> {
  const activeTab = await retrieveActiveTab();
  if (activeTab.id !== undefined) {
    delegateCopyMediaSnapshot(activeTab.id);
  }
}

async function retrieveActiveTab(): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject();
      }
    });
  });
}

function delegateCopyMediaSnapshot(tabId: number): void {
  chrome.tabs.sendMessage(tabId, { name: "delegateCopyMediaSnapshot" });
}
