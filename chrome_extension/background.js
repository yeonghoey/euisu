async function requestAnki(typ, target) {
  // TODO: Make this configurable.
  const url = 'http://localhost:8732/anki';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: typ,
      target,
    }),
  });
  const json = await response.json();
  return json.basename;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'createTab') {
    const index = sender.tab.index + 1;
    chrome.tabs.create({ url: message.url, index });
    return false;
  }

  if (message.type === 'requestAnki') {
    requestAnki(message.typ, message.target).then(sendResponse);
    return true;
  }

  return false;
});
