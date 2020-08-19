import "src/content/www_youtube_com/pages/watch.css";
import { showSnackbar } from "src/content/snackbar";
import { screenshotOfVideo, currentTimeOfVideo } from "src/content/video";
import { clipboardWriteText, clipboardWriteBlob } from "src/content/clipboard";
import { urlParamGet } from "src/content/url";
import { requestRunHew } from "src/content/request_to_background";

function main(): void {
  const DELAY = 500;
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

  const euisu = createEuisu(title, video);
  parent.insertBefore(euisu, rightControls);
  return true;
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

function createEuisu(title: HTMLElement, video: HTMLVideoElement): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");

  // Buttons
  const titleButton = makeTitleButton(title);
  div.appendChild(titleButton);

  const urlButton = makeURLButton();
  div.appendChild(urlButton);

  const urlAtCurrentButton = makeURLAtCurrentButton(video);
  div.appendChild(urlAtCurrentButton);

  div.appendChild(makeSpacer());

  const screenshotButton = makeScreenshotButton(video);
  div.appendChild(screenshotButton);

  const thumbnailButton = makeThumbnailButton();
  div.appendChild(thumbnailButton);

  div.appendChild(makeSpacer());

  const hewButton = makeHewButton(video);
  div.appendChild(hewButton);

  // Shortcuts
  const shortcuts: Shortcuts = {
    Digit1: () => titleButton.click(),
    Digit2: () => urlButton.click(),
    Digit3: () => urlAtCurrentButton.click(),
    Digit4: () => screenshotButton.click(),
    Digit5: () => thumbnailButton.click(),
    Digit0: () => hewButton.click(),
    Backquote: () => addOrRemoveBookmark(video),
    BracketLeft: () => prevBookmark(video),
    BracketRight: () => nextBookmark(video),
    Backslash: () => returnBeforeBookmark(video),
  };

  window.addEventListener(
    "keydown",
    (ev) => {
      // Skip when shortcuts used with modifiers
      if (ev.ctrlKey || ev.altKey || ev.metaKey) {
        return;
      }
      // Skip when typing in search bar
      if (document.activeElement?.nodeName === "INPUT") {
        return;
      }
      if (ev.code in shortcuts) {
        shortcuts[ev.code]();
        console.log(`"${ev.code}" captured`);
        ev.stopPropagation();
      }
    },
    { capture: true }
  );
  return div;
}

interface Shortcuts {
  [code: string]: () => void;
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

function makeURLButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "URL";
  button.addEventListener("click", async () => {
    const videoId = retrieveVideoId();
    if (videoId === null) {
      showSnackbar("Failed to retrieve video id");
      return;
    }
    const url = `https://youtu.be/${videoId}`;
    await clipboardWriteText(url);
    showSnackbar(`"${url}" copied`);
  });
  return button;
}

function makeThumbnailButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Thumbnail";
  button.addEventListener("click", async () => {
    const videoId = retrieveVideoId();
    if (videoId === null) {
      showSnackbar("Failed to retrieve video id");
      return;
    }
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

function makeURLAtCurrentButton(video: HTMLVideoElement): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "URL@";
  button.addEventListener("click", async () => {
    const videoId = retrieveVideoId();
    if (videoId === null) {
      showSnackbar("Failed to retrieve video id");
      return;
    }
    const t = Math.round(currentTimeOfVideo(video));
    const url = `https://youtu.be/${videoId}?t=${t}`;
    await clipboardWriteText(url);
    showSnackbar(`"${url}" copied`);
  });
  return button;
}

function makeHewButton(video: HTMLVideoElement): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Hew";
  button.addEventListener("click", async () => {
    const videoId = retrieveVideoId();
    if (videoId === null) {
      showSnackbar("Failed to retrieve video id");
      return;
    }
    showSnackbar("Starting Hew...");
    video.pause();
    const t = Math.round(currentTimeOfVideo(video));
    const ytURL = `https://youtu.be/${videoId}?t=${t}`;
    const bookmarks = await loadBookmarks(videoId);
    // NOTE: Handler will be blocked until hew finishes.
    const [ok, body] = await requestRunHew(ytURL, bookmarks);
    console.log(body);
    if (!ok) {
      showSnackbar("Failed to start Hew");
    }
  });
  return button;
}

const bookmarkEpsilon = 2;

async function addOrRemoveBookmark(video: HTMLVideoElement): Promise<void> {
  const videoId = retrieveVideoId();
  if (videoId === null) {
    showSnackbar("Failed to retrieve video id");
    return;
  }
  const bookmarks = await loadBookmarks(videoId);
  const currentTime = video.currentTime;
  const bookmarksExcludedMatchingCurrentTime = bookmarks.filter(
    (timeStamp) => Math.abs(timeStamp - currentTime) > bookmarkEpsilon
  );

  if (bookmarksExcludedMatchingCurrentTime.length === bookmarks.length) {
    bookmarks.push(currentTime);
    bookmarks.sort((a, b) => a - b);
    await saveBookmarks(videoId, bookmarks);
    showSnackbar(`Mark added`);
    console.log(`Euisu: After adding: ${bookmarks}`);
  } else {
    await saveBookmarks(videoId, bookmarksExcludedMatchingCurrentTime);
    showSnackbar(`Mark removed`);
    console.log(
      `Euisu: After removing: ${bookmarksExcludedMatchingCurrentTime}`
    );
  }
}

async function prevBookmark(video: HTMLVideoElement): Promise<void> {
  const videoId = retrieveVideoId();
  if (videoId === null) {
    showSnackbar("Failed to retrieve video id");
    return;
  }
  const bookmarks = await loadBookmarks(videoId);
  const currentTime = video.currentTime;
  const closestPrevTimestamp = bookmarks.reduce((a, x) => {
    if (x + bookmarkEpsilon > currentTime) {
      return a;
    }
    return x;
  }, currentTime);
  if (bookmarks.every((x) => Math.abs(x - currentTime) > bookmarkEpsilon)) {
    video.dataset.euisuVideoId = videoId;
    video.dataset.euisuBeforeBookmark = currentTime.toString();
  }
  video.currentTime = closestPrevTimestamp;
}

async function nextBookmark(video: HTMLVideoElement): Promise<void> {
  const videoId = retrieveVideoId();
  if (videoId === null) {
    showSnackbar("Failed to retrieve video id");
    return;
  }
  const bookmarks = await loadBookmarks(videoId);
  const currentTime = video.currentTime;
  const closestNextTimestamp = bookmarks.reduceRight((a, x) => {
    if (x - bookmarkEpsilon < currentTime) {
      return a;
    }
    return x;
  }, currentTime);
  if (bookmarks.every((x) => Math.abs(x - currentTime) > bookmarkEpsilon)) {
    video.dataset.euisuVideoId = videoId;
    video.dataset.euisuBeforeBookmark = currentTime.toString();
  }
  video.currentTime = closestNextTimestamp;
}

async function returnBeforeBookmark(video: HTMLVideoElement): Promise<void> {
  const videoId = retrieveVideoId();
  if (videoId === null) {
    showSnackbar("Failed to retrieve video id");
    return;
  }
  if (video.dataset.euisuVideoId !== videoId) {
    return;
  }
  if (video.dataset.euisuBeforeBookmark === undefined) {
    return;
  }
  video.currentTime = parseFloat(video.dataset.euisuBeforeBookmark);
}

async function saveBookmarks(
  videoId: string,
  bookmarks: number[]
): Promise<void> {
  return new Promise((resolve) => {
    const key = `youtube-watch-bookmarks-${videoId}`;
    chrome.storage.local.set({ [key]: bookmarks }, () => {
      resolve();
    });
  });
}

async function loadBookmarks(videoId: string): Promise<number[]> {
  return new Promise((resolve) => {
    const key = `youtube-watch-bookmarks-${videoId}`;
    chrome.storage.local.get({ [key]: [] }, (items) => {
      resolve(items[key]);
    });
  });
}

// -------------------------------------------
main();
