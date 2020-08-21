import * as ctb from "src/protocols/content_to_background";

export async function requestRunHew(
  ytURL: string,
  bookmarks: number[]
): Promise<[boolean, string]> {
  const response = await requestToBackground({
    type: "RequestRunHew",
    ytURL,
    bookmarks,
  } as ctb.RequestRunHew);
  if (response.type === "ResponseRunHew") {
    return [response.ok, response.body];
  }
  return Promise.reject();
}

export async function requestRunHewOnSrc(
  filename: string,
  srcURL: string
): Promise<[boolean, string]> {
  const response = await requestToBackground({
    type: "RequestRunHewOnSrc",
    filename,
    srcURL,
  } as ctb.RequestRunHewOnSrc);
  if (response.type === "ResponseRunHewOnSrc") {
    return [response.ok, response.body];
  }
  return Promise.reject();
}

function requestToBackground(request: ctb.Request): Promise<ctb.Response> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(request, resolve);
  });
}
