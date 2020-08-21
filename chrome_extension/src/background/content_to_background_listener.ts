import {
  Request,
  ResponseRunHew,
  ResponseRunHewOnSrc,
} from "src/protocols/content_to_background";

export function registerContentToBackgroundListener(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const request = message as Request;
    switch (request.type) {
      case "RequestRunHew":
        requestRunHew(request.ytURL, request.bookmarks).then(sendResponse);
        return true;
      case "RequestRunHewOnSrc":
        requestRunHewOnSrc(request.filename, request.srcURL).then(sendResponse);
        return true;
    }
  });
}

async function requestRunHew(
  ytURL: string,
  bookmarks: number[]
): Promise<ResponseRunHew> {
  const response = await fetch("http://localhost:8732/hew/yt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ytURL,
      bookmarks,
    }),
  });
  return {
    type: "ResponseRunHew",
    ok: response.ok,
    body: await response.text(),
  };
}

async function requestRunHewOnSrc(
  filename: string,
  srcURL: string
): Promise<ResponseRunHewOnSrc> {
  const response = await fetch("http://localhost:8732/hew/src", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      srcURL,
    }),
  });
  return {
    type: "ResponseRunHewOnSrc",
    ok: response.ok,
    body: await response.text(),
  };
}
