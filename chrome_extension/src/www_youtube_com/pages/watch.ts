import "src/www_youtube_com/style.css";

function injectEuisu(): boolean {
  const title = retrieveTitle();
  if (title === null) {
    return false;
  }

  const parent = title.parentNode;
  if (parent === null) {
    return false;
  }

  // NOTE: To place "div.euisu" right next to h1.title, which is 'block' element,
  // surround it with an empty blocks and override title's display
  // with "inline-block".
  const blockBefore = createBlock();
  parent.insertBefore(blockBefore, title);

  title.style.display = "inline-block";

  const euisu = createEuisu(title);
  parent.insertBefore(euisu, title.nextSibling);

  const blockAfter = createBlock();
  parent.insertBefore(blockAfter, euisu.nextSibling);
  return true;
}

function retrieveTitle(): HTMLElement | null {
  const primary = document.querySelector<HTMLElement>(
    "ytd-video-primary-info-renderer"
  );
  const title = primary?.querySelector<HTMLElement>("h1.title");
  return title || null;
}

function createBlock(): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu-block");
  return div;
}

function createEuisu(title: HTMLElement): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");
  const button = makeTitleButton(title);
  div.appendChild(button);
  return div;
}

function makeTitleButton(title: HTMLElement) {
  const button = document.createElement("button");
  button.innerText = "Title";
  button.onclick = function onclick() {
    navigator.clipboard.writeText(title.innerText);
  };
  return button;
}

// -------------------------------------------
const DELAY = 500;

setTimeout(function tryInjectEuisu(): void {
  const success = injectEuisu();
  if (!success) {
    setTimeout(tryInjectEuisu, DELAY);
  }
}, DELAY);
