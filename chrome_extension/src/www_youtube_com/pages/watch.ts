import "src/www_youtube_com/style.css";

function injectEuisu(): boolean {
  const title = retrieveTitle();
  if (title === null) {
    return false;
  }

  title.style.display = "inline-block";
  const euisu = createEuisu(title);
  title.parentNode?.insertBefore(euisu, title.nextSibling);
  return true;
}

function retrieveTitle(): HTMLElement | null {
  const primary = document.querySelector<HTMLElement>(
    "ytd-video-primary-info-renderer"
  );
  const title = primary?.querySelector<HTMLElement>("h1.title");
  return title || null;
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
