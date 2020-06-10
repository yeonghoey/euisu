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

function makeCopyButton(targetWord, meaningBlock) {
  const button = document.createElement('button');
  // TODO: make the appearance fancier
  button.innerText = 'Copy';
  button.onclick = function onclick() {
    navigator.clipboard.writeText(meaningBlock);
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

function extractTargetWord(row) {
  const el = row.querySelector('.origin > :first-child');
  return el;
}

function processRow(row) {
  const targetWord = extractTargetWord(row);
  const meaningBlock = collateMeaningBlock(row);
  const copyButton = makeCopyButton(targetWord, meaningBlock);
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
