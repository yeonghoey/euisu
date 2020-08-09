import "src/content/www_youtube_com/pages/watch.css";
import { showSnackbar } from "src/content/snackbar";
import { screenshotOfVideo } from "src/content/video";
import { clipboardWriteText, clipboardWriteBlob } from "src/content/clipboard";

function injectEuisu(): boolean {
  if (isAlreadyInjected()) {
    return true;
  }
  const title = retrieveTitle();
  if (title === null) {
    return false;
  }
  const video = retrieveVideo();
  if (video === null) {
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

  const euisu = createEuisu(title, video);
  parent.insertBefore(euisu, title.nextSibling);

  const blockAfter = createBlock();
  parent.insertBefore(blockAfter, euisu.nextSibling);
  return true;
}

function isAlreadyInjected(): boolean {
  return document.querySelector(".euisu") !== null;
}

function retrieveTitle(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    "ytd-video-primary-info-renderer h1.title"
  );
}

function retrieveVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("#primary video");
}

function createBlock(): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu-block");
  return div;
}

function createEuisu(title: HTMLElement, video: HTMLVideoElement): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");
  div.appendChild(makeTitleButton(title));
  div.appendChild(makeURLButton("test"));
  div.appendChild(makeURLAtCurrentButton("test", video));
  div.appendChild(makeThumbnailButton(video));
  div.appendChild(makeScreenshotButton(video));

  return div;
}

function makeTitleButton(title: HTMLElement): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "Title";
  button.addEventListener("click", async () => {
    await clipboardWriteText(title.innerText);
    showSnackbar("Title copied!");
  });
  return button;
}

function makeURLButton(v: string): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "URL";
  button.addEventListener("click", async () => {
    await clipboardWriteText(v);
    showSnackbar("URL copied!");
  });
  return button;
}

function makeURLAtCurrentButton(
  v: string,
  video: HTMLVideoElement
): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "URL@";
  button.addEventListener("click", async () => {
    await clipboardWriteText(v);
    showSnackbar("URL at current time copied!");
  });
  return button;
}

function makeThumbnailButton(video: HTMLVideoElement): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "Thumbnail";
  button.addEventListener("click", async () => {
    const blob = await screenshotOfVideo(video);
    await clipboardWriteBlob(blob);
    showSnackbar("Thumbnail copied!");
  });
  return button;
}

function makeScreenshotButton(video: HTMLVideoElement): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "Screenshot";
  button.addEventListener("click", async () => {
    const blob = await screenshotOfVideo(video);
    await clipboardWriteBlob(blob);
    showSnackbar("Screenshot copied!");
  });
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
