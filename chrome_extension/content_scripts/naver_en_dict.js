/**
 * Injects a button on each row of component_keyword section
 * in the search result page of en.dict.naver.com.
 *
 * The keyword section of the search result page is constructed like:
 * <div class="component_keyword">
 *  <div class="row">
 *   <div class="origin"></div>
 *   <div class="mean_list"></div>
 *   <div class="mean_list"></div>
 *   ...
 *  </div>
 *  ...
 * </div>
 *
 * This featue puts together a string for each row
 * which contains all of the text in `mean_list` and make it available through
 * injecting a button which copy this string into clipboard
 */
function appendEuisuContainerToOrigins(row, euisuContainer) {
  const origins = [...row.getElementsByClassName('origin')];
  origins.forEach((origin) => {
    origin.appendChild(euisuContainer);
  });
}

function makeImageButton(targetText) {
  const button = document.createElement('button');
  button.innerText = 'Image';
  button.onclick = function onclick() {
    chrome.runtime.sendMessage({
      type: 'createTab',
      url: `https://www.google.com/search?tbm=isch&q=${targetText}`,
    });
  };
  return button;
}

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

function makeScrapButton(targetText, playButton, meaningBlock) {
  const button = document.createElement('button');
  // TODO: make the appearance fancier
  button.innerText = 'Scrap';
  button.onclick = function onclick() {
    let typ = '';
    let target = '';
    if (playButton !== null) {
      typ = 'download';
      target = playButton.getAttribute('purl');
    } else {
      typ = 'tts';
      target = targetText;
    }
    requestAnki(typ, target).then((basename) => {
      const content = `${targetText} [sound:${basename}]\n${meaningBlock}`;
      navigator.clipboard.writeText(content);
    });
  };
  return button;
}

function makeEuisuContainer() {
  const div = document.createElement('div');
  div.classList.add('euisu');
  return div;
}

function convertMeanItemToMeanLine(meanItem) {
  const children = [...meanItem.children];
  const columns = children.map((el) => el.innerText.trim());
  const meanLine = columns.join(' ');
  return meanLine;
}

function convertMeanListToMeanings(meanList) {
  const meanItems = [...meanList.getElementsByClassName('mean_item')];
  const meaningLines = meanItems.map((meanItem) => convertMeanItemToMeanLine(meanItem));

  const meaning = meaningLines.join('\n');
  return meaning;
}

function collateMeaningBlock(row) {
  const meanLists = [...row.getElementsByClassName('mean_list')];
  const meanings = meanLists.map((meanList) => convertMeanListToMeanings(meanList));
  const meaningBlock = meanings.join('\n');
  return meaningBlock;
}

function extractFirstPlayButton(row) {
  return row.querySelector('.origin > .listen_list > :first-child button.btn_listen.play');
}

function extractTargetText(row) {
  const el = row.querySelector('.origin > :first-child');
  return el.innerText.trim();
}

function processRow(row) {
  const targetText = extractTargetText(row);
  const playButton = extractFirstPlayButton(row);
  const meaningBlock = collateMeaningBlock(row);

  const euisuContainer = makeEuisuContainer();
  euisuContainer.appendChild(
    makeScrapButton(targetText, playButton, meaningBlock),
  );
  euisuContainer.appendChild(
    makeImageButton(targetText),
  );
  appendEuisuContainerToOrigins(row, euisuContainer);
}

function processSection(section) {
  const rows = [...section.getElementsByClassName('row')];
  rows.forEach((row) => {
    processRow(row);
  });
}

function injectEuisu() {
  const keywordSections = [...document.getElementsByClassName('component_keyword')];
  keywordSections.forEach((section) => {
    processSection(section);
  });
}

/**
 * NOTE: 'en.dict.naver.com' loads the page dynamically.
 * Just keep monitoring the page and injects the actual features
 * when the searchPage_entry element is fully loaded.
 */
setInterval(() => {
  const el = document.getElementById('searchPage_entry');
  if (el === null) {
    return;
  }
  if (el.dataset.euisuInjected) {
    return;
  }
  injectEuisu();
  el.dataset.euisuInjected = true;
}, 500);
