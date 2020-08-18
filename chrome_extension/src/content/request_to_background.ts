import * as ctb from "src/protocols/content_to_background";

export async function requestRunHew(ytURL: string): Promise<[boolean, string]> {
  const response = await requestToBackground({
    type: "RequestRunHew",
    ytURL,
  } as ctb.RequestRunHew);
  if (response.type === "ResponseRunHew") {
    return [response.ok, response.body];
  }
  return Promise.reject();
}

function requestToBackground(request: ctb.Request): Promise<ctb.Response> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(request, resolve);
  });
}
