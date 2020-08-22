import { showSnackbar } from "src/content/snackbar";

const bookmarkEpsilon = 2;

export async function addOrRemoveBookmark(
  storageKey: string,
  video: HTMLVideoElement
): Promise<void> {
  const bookmarks = await loadBookmarks(storageKey);
  const currentTime = video.currentTime;
  const bookmarksExcludedMatchingCurrentTime = bookmarks.filter(
    (timeStamp) => Math.abs(timeStamp - currentTime) > bookmarkEpsilon
  );

  if (bookmarksExcludedMatchingCurrentTime.length === bookmarks.length) {
    // No bookmark mathcing current time -> Add a new one
    bookmarks.push(currentTime);
    bookmarks.sort((a, b) => a - b);
    await saveBookmarks(storageKey, bookmarks);
    showSnackbar("Bookmark added");
    console.log(`Bookmarks after adding: ${bookmarks}`);
  } else {
    await saveBookmarks(storageKey, bookmarksExcludedMatchingCurrentTime);
    showSnackbar("Bookmark removed");
    console.log(
      `Bookmarks after removing: ${bookmarksExcludedMatchingCurrentTime}`
    );
  }
}

export async function prevBookmark(
  storageKey: string,
  video: HTMLVideoElement
): Promise<void> {
  const bookmarks = await loadBookmarks(storageKey);
  const currentTime = video.currentTime;
  const closestPrevTimestamp = bookmarks.reduce((a, x) => {
    if (x + bookmarkEpsilon > currentTime) {
      return a;
    }
    return x;
  }, currentTime);
  if (bookmarks.every((x) => Math.abs(x - currentTime) > bookmarkEpsilon)) {
    video.dataset.euisuBookmarkStorageKey = storageKey;
    video.dataset.euisuTimeBeforeBookmark = currentTime.toString();
  }
  video.currentTime = closestPrevTimestamp;
}

export async function nextBookmark(
  storageKey: string,
  video: HTMLVideoElement
): Promise<void> {
  const bookmarks = await loadBookmarks(storageKey);
  const currentTime = video.currentTime;
  const closestNextTimestamp = bookmarks.reduceRight((a, x) => {
    if (x - bookmarkEpsilon < currentTime) {
      return a;
    }
    return x;
  }, currentTime);
  if (bookmarks.every((x) => Math.abs(x - currentTime) > bookmarkEpsilon)) {
    video.dataset.euisuBookmarkStorageKey = storageKey;
    video.dataset.euisuTimeBeforeBookmark = currentTime.toString();
  }
  video.currentTime = closestNextTimestamp;
}

export async function returnBeforeBookmark(
  storageKey: string,
  video: HTMLVideoElement
): Promise<void> {
  if (video.dataset.euisuBookmarkStorageKey !== storageKey) {
    return;
  }
  if (video.dataset.euisuTimeBeforeBookmark === undefined) {
    return;
  }
  video.currentTime = parseFloat(video.dataset.euisuTimeBeforeBookmark);
}

export async function saveBookmarks(
  storageKey: string,
  bookmarks: number[]
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey]: bookmarks }, () => {
      resolve();
    });
  });
}

export async function loadBookmarks(storageKey: string): Promise<number[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [storageKey]: [] }, (items) => {
      resolve(items[storageKey]);
    });
  });
}
