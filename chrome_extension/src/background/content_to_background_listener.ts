import { Request, ResponseRunHew } from "src/protocols/content_to_background";

export function registerContentToBackgroundListener(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const request = message as Request;
    switch (request.type) {
      case "RequestRunHew":
        requestRunHew(request.ytURL).then(sendResponse);
        return true;
    }
  });
}

async function requestRunHew(ytURL: string): Promise<ResponseRunHew> {
  const url = new URL("http://localhost:8732/hew");
  url.searchParams.append("yturl", ytURL);
  const response = await fetch(url.href);
  return {
    type: "ResponseRunHew",
    ok: response.ok,
    body: await response.text(),
  };
}
