import "src/content/www_youtube_com/pages/watch.css";
import { showSnackbar } from "src/content/snackbar";
import { screenshotOfVideo, currentTimeOfVideo } from "src/content/video";
import { clipboardWriteText, clipboardWriteBlob } from "src/content/clipboard";
import { urlParamGet } from "src/content/url";

function main(): void {
  const DELAY = 500;

  // NOTE: YouTube reuses the same DOM elements and because of the fact,
  // buttons will keep the first loaded contexts.
  // To make sure for buttons to have current context,
  // remove the pre-existing euisu at load time.
  clearEuisu();

  setTimeout(function tryInjectEuisu(): void {
    const success = injectEuisu();
    if (!success) {
      setTimeout(tryInjectEuisu, DELAY);
    }
  }, DELAY);
}

function injectEuisu(): boolean {
  if (isAlreadyInjected()) {
    return true;
  }

  const videoId = retrieveVideoId();
  if (videoId === null) {
    return false;
  }
  const title = retrieveTitle();
  if (title === null) {
    return false;
  }
  const video = retrieveVideo();
  if (video === null) {
    return false;
  }
  const rightControls = retrieveRightControls();
  if (rightControls === null) {
    return false;
  }

  const parent = rightControls.parentNode;
  if (parent === null) {
    return false;
  }

  const euisu = createEuisu(videoId, title, video);
  parent.appendChild(euisu);
  return true;
}

function clearEuisu(): void {
  document.querySelector(".euisu")?.remove();
}

function isAlreadyInjected(): boolean {
  return document.querySelector(".euisu") !== null;
}

function retrieveVideoId(): string | null {
  return urlParamGet("v");
}

function retrieveTitle(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    "ytd-video-primary-info-renderer h1.title"
  );
}

function retrieveVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("#primary video");
}

function retrieveRightControls(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".ytp-right-controls");
}

function createEuisu(
  videoId: string,
  title: HTMLElement,
  video: HTMLVideoElement
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");

  // Buttons

  const titleButton = makeTitleButton(title);
  div.appendChild(titleButton);

  const urlButton = makeURLButton(videoId);
  div.appendChild(urlButton);

  const thumbnailButton = makeThumbnailButton(videoId);
  div.appendChild(thumbnailButton);

  div.appendChild(makeSpacer());

  const screenshotButton = makeScreenshotButton(video);
  div.appendChild(screenshotButton);

  const urlAtCurrentButton = makeURLAtCurrentButton(videoId, video);
  div.appendChild(urlAtCurrentButton);

  // Shortcuts
  const shortcuts: Shortcuts = {
    Digit1: titleButton,
    Digit2: urlButton,
    Digit3: thumbnailButton,
    Digit4: screenshotButton,
    Digit5: urlAtCurrentButton,
  };

  document.addEventListener(
    "keydown",
    (ev) => {
      if (ev.code in shortcuts) {
        shortcuts[ev.code].click();
        console.log(`"${ev.code}" captured`);
        ev.stopPropagation();
      }
    },
    { capture: true }
  );

  return div;
}

interface Shortcuts {
  [code: string]: HTMLButtonElement;
}

function makeTitleButton(title: HTMLElement): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Title";
  button.addEventListener("click", async () => {
    const titleText = title.innerText;
    await clipboardWriteText(titleText);
    showSnackbar(`"${titleText}" copied`);
  });
  return button;
}

function makeURLButton(videoId: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "URL";
  button.addEventListener("click", async () => {
    const url = `https://youtu.be/${videoId}`;
    await clipboardWriteText(url);
    showSnackbar(`"${url}" copied`);
  });
  return button;
}

function makeThumbnailButton(videoId: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Thumbnail";
  button.addEventListener("click", async () => {
    const url = `http://localhost:8732/youtube/thumbnail?v=${videoId}`;
    const response = await fetch(url);
    const blob = await response.blob();
    await clipboardWriteBlob(blob);
    showSnackbar("Thumbnail copied!");
  });
  return button;
}

function makeSpacer(): HTMLElement {
  const spacer = document.createElement("span");
  return spacer;
}

function makeScreenshotButton(video: HTMLVideoElement): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Screenshot";
  button.addEventListener("click", async () => {
    const blob = await screenshotOfVideo(video);
    await clipboardWriteBlob(blob);
    showSnackbar("Screenshot copied!");
  });
  return button;
}

function makeURLAtCurrentButton(
  videoId: string,
  video: HTMLVideoElement
): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "URL@";
  button.addEventListener("click", async () => {
    const t = Math.round(currentTimeOfVideo(video));
    const url = `https://youtu.be/${videoId}?t=${t}`;
    await clipboardWriteText(url);
    showSnackbar(`"${url}" copied`);
  });
  return button;
}

// -------------------------------------------
main();
