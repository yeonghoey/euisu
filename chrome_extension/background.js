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

function copyToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.style.cssText = 'opacity:0; position:fixed; width:1px; height:1px; top:0; left:0;';
  ta.value = text;
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'euisu-scrap',
    title: 'Euisu: Scrap',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'euisu-scrap') {
    const text = info.selectionText.trim();
    requestAnki('tts', text).then((basename) => {
      copyToClipboard(`${text}\n[sound:${basename}]`);
    });
  }
});

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
