import { copyImageToClipboard } from "src/content_scripts/clipboard.js";

function main() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.name === "delegateCopyMediaSnapshot") {
      copyMediaSnapshot();
    }
  });
}

async function copyMediaSnapshot(): Promise<void> {
  // TODO: Support image, too.
  const video = document.querySelector<HTMLVideoElement>("video");
  if (video === null) {
    return;
  }
  const blob = await captureVideo(video);
  await copyImageToClipboard(blob);
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

main();
