export async function screenshotOfVideo(
  video: HTMLVideoElement
): Promise<Blob> {
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
