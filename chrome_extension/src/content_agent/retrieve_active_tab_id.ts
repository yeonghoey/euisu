export async function retrieveActiveTabId(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        reject();
        return;
      }
      const activeTab = tabs[0];
      const id = activeTab.id;
      if (id === undefined) {
        reject();
        return;
      }
      resolve(id);
      return;
    });
  });
}
