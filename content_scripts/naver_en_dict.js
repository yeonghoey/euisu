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
function injectMeaningBlockCopyButton() {
    let keywordSections = Array.from(
        document.getElementsByClassName("component_keyword")
    );
    keywordSections.forEach((section) => {
        processSection(section);
    });
}

function processSection(section) {
    let rows = Array.from(
        section.getElementsByClassName("row")
    );
    rows.forEach((row) => {
        processRow(row);
    })
}

function processRow(row) {
    let meaningBlock = collateMeaningBlock(row);
    let copyButton = makeCopyButton(meaningBlock);
    appendCopyButtonToOrigins(row, copyButton);
}

function collateMeaningBlock(row) {
    let meanLists = Array.from(
        row.getElementsByClassName("mean_list")
    );
    let meanings = meanLists.map((meanList) => {
        return convertMeanListToMeanings(meanList);
    })
    let meaningBlock = meanings.join("\n");
    return meaningBlock;
}

function convertMeanListToMeanings(meanList) {
    let meanItems = Array.from(
        meanList.getElementsByClassName("mean_item")
    );
    let meaningLines = meanItems.map((meanItem) => {
        return convertMeanItemToMeanLine(meanItem);
    })

    let meaning = meaningLines.join("\n");
    return meaning;
}

function convertMeanItemToMeanLine(meanItem) {
    let children = Array.from(meanItem.children);
    let columns = children.map((el) => {
        return el.innerText.trim()
    })
    let meanLine = columns.join(" ");
    return meanLine;
}

function makeCopyButton(meaningBlock) {
    let button = document.createElement("button");
    // TODO: make the appearance fancier
    button.innerText = "Copy";
    button.onclick = function () {
        navigator.clipboard.writeText(meaningBlock);
    }
    return button
}

function appendCopyButtonToOrigins(row, copyButton) {
    let origins = Array.from(
        row.getElementsByClassName("origin")
    );
    origins.forEach((origin) => {
        origin.appendChild(copyButton);
    })
}

/**
 * NOTE: Injects the actual features after the page is fully loaded.
 * The search result page of 'en.dict.naver.com' seems to
 * do some internal redirection which makes the actual contents unavailable unless
 * it's fully loaded.
 */
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        injectMeaningBlockCopyButton();
    }
}