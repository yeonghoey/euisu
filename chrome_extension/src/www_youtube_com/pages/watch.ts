import "src/www_youtube_com/style.css";
import { copyImageToClipboard } from "src/www_youtube_com/clipboard.js";

function injectEuisu(): boolean {
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
  const titleButton = makeTitleButton(title);
  div.appendChild(titleButton);
  const screenshotButton = makeScreenshotButton(video);
  div.appendChild(screenshotButton);
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

function makeScreenshotButton(video: HTMLVideoElement) {
  const button = document.createElement("button");
  button.innerText = "Screenshot";
  button.onclick = async function onclick() {
    const blob = await captureVideo(video);
    await copyImageToClipboard(blob);
    // TODO: Notify it's done.
  };
  return button;
}

async function captureVideo(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (context === null) {
      reject(null);
      return;
    }
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob !== null) {
        resolve(blob);
        return;
      } else {
        reject(null);
        return;
      }
    }, "image/png");
  });
}

// -------------------------------------------
const DELAY = 500;

setTimeout(function tryInjectEuisu(): void {
  const success = injectEuisu();
  if (!success) {
    setTimeout(tryInjectEuisu, DELAY);
  }
}, DELAY);
