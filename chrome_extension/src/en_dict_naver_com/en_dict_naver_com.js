import './style.css';

/**
 * Utility functions
 */
function extractTextWithoutSup(el) {
  const node = el.cloneNode(true);
  [...node.getElementsByTagName('sup')].forEach((sup) => sup.remove());
  return node.innerText.trim();
}

/**
 * Injects a button on each row of component_keyword section
 * into n.dict.naver.com/#/search
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
    chrome.runtime.sendMessage({ type: 'requestAnki', typ, target }, (basename) => {
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
  return extractTextWithoutSup(el);
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

function injectEuisuToSearchPage() {
  const keywordSections = [...document.getElementsByClassName('component_keyword')];
  keywordSections.forEach((section) => {
    processSection(section);
  });
}

/**
 * Injects a button on each row of
 * into n.dict.naver.com/#/entry
 */

// function extractTitleText() {
//   let el = document.querySelector('.entry_title > :first-child');
//   if (el === null) {
//     el = document.querySelector('.entry_title--saying > :first-child');
//   }
//   return extractTextWithoutSup(el);
// }

// function extractEntryPlayButton() {
//   return document.querySelector('.entry_pronounce .tray > :first-child button.btn_listen.mp3');
// }

// function injectEuisuToEntryPage() {
//   const targetText = extractTitleText();
//   const playButton = extractEntryPlayButton();
// }

/**
 * NOTE: 'en.dict.naver.com' loads the page dynamically.
 * Just keep monitoring the page and injects the actual features
 * when the searchPage_entry element is fully loaded.
 */
setInterval(() => {
  if (window.location.hash.startsWith('#/search')) {
    const el = document.getElementById('searchPage_entry');
    if (el === null) {
      return;
    }
    if (el.dataset.euisuInjected) {
      return;
    }
    injectEuisuToSearchPage();
    el.dataset.euisuInjected = true;
    return;
  }

  if (window.location.hash.startsWith('#/entry')) {
    const el = document.querySelector('.article > .section_mean > .component_mean');
    if (el === null) {
      return;
    }
    if (el.dataset.euisuInjected) {
      return;
    }
    // injectEuisuToEntryPage();
    el.dataset.euisuInjected = true;
  }
}, 500);
