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

  const euisu = createEuisu(videoId, title, video);
  parent.insertBefore(euisu, title.nextSibling);

  const blockAfter = createBlock();
  parent.insertBefore(blockAfter, euisu.nextSibling);
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

function createBlock(): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu-block");
  return div;
}

function createEuisu(
  videoId: string,
  title: HTMLElement,
  video: HTMLVideoElement
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");
  div.appendChild(makeTitleButton(title));
  div.appendChild(makeURLButton(videoId));
  div.appendChild(makeURLAtCurrentButton(videoId, video));
  div.appendChild(makeThumbnailButton(videoId));
  div.appendChild(makeScreenshotButton(video));

  return div;
}

function makeTitleButton(title: HTMLElement): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "Title";
  button.addEventListener("click", async () => {
    const titleText = title.innerText;
    await clipboardWriteText(titleText);
    showSnackbar(`"${titleText}" copied`);
  });
  return button;
}

function makeURLButton(videoId: string): HTMLElement {
  const button = document.createElement("button");
  button.innerText = "URL";
  button.addEventListener("click", async () => {
    const url = `https://youtu.be/${videoId}`;
    await clipboardWriteText(url);
    showSnackbar(`"${url}" copied`);
  });
  return button;
}

function makeURLAtCurrentButton(
  videoId: string,
  video: HTMLVideoElement
): HTMLElement {
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

function makeThumbnailButton(videoId: string): HTMLElement {
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
main();
