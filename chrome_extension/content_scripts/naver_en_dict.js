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

function appendCopyButtonToOrigins(row, copyButton) {
  const origins = [...row.getElementsByClassName('origin')];
  origins.forEach((origin) => {
    origin.appendChild(copyButton);
  });
}

async function requestAnkiSave(target) {
  // TODO: Make this configurable.
  const url = 'http://localhost:8732/anki';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target,
    }),
  });
  const json = await response.json();
  return json.basename;
}

function makeCopyButton(targetWord, playButton, meaningBlock) {
  const button = document.createElement('button');
  // TODO: make the appearance fancier
  button.innerText = 'Copy';
  button.onclick = function onclick() {
    if (playButton === null) {
      const content = `${targetWord}\n${meaningBlock}`;
      navigator.clipboard.writeText(content);
    } else {
      const target = playButton.getAttribute('purl');
      requestAnkiSave(target).then((basename) => {
        const content = `${targetWord} [sound:${basename}]\n${meaningBlock}`;
        navigator.clipboard.writeText(content);
        playButton.click();
      });
    }
  };
  return button;
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

  //   if (firstPlayButton === null) {
  //   return '';
  // }
  // return firstPlayButton.getAttribute('purl');
}

function extractTargetWord(row) {
  const el = row.querySelector('.origin > :first-child');
  return el.innerText.trim();
}

function processRow(row) {
  const targetWord = extractTargetWord(row);
  const playButton = extractFirstPlayButton(row);
  const meaningBlock = collateMeaningBlock(row);
  const copyButton = makeCopyButton(targetWord, playButton, meaningBlock);
  appendCopyButtonToOrigins(row, copyButton);
}

function processSection(section) {
  const rows = [...section.getElementsByClassName('row')];
  rows.forEach((row) => {
    processRow(row);
  });
}

function injectMeaningBlockCopyButton() {
  const keywordSections = [...document.getElementsByClassName('component_keyword')];
  keywordSections.forEach((section) => {
    processSection(section);
  });
}

/**
 * NOTE: Injects the actual features after the page is fully loaded.
 * The search result page of 'en.dict.naver.com' seems to
 * do some internal redirection which makes the actual contents unavailable unless
 * it's fully loaded.
 */
document.onreadystatechange = function onreadystatechange() {
  if (document.readyState === 'complete') {
    injectMeaningBlockCopyButton();
  }
};
