chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'createTab') {
    const index = sender.tab.index + 1;
    chrome.tabs.create({ url: message.url, index });
  }
});
