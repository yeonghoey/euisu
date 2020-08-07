import { clipboardWriteBlob } from "src/content/clipboard";
import { showSnackbar } from "src/content/snackbar";

export async function captureVideo(): Promise<void> {
  const video = document.querySelector<HTMLVideoElement>("video");
  if (video === null) {
    return;
  }
  const blob = await snapshotOfVideo(video);
  await clipboardWriteBlob(blob);
  showSnackbar("Video captured");
}

async function snapshotOfVideo(video: HTMLVideoElement): Promise<Blob> {
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
