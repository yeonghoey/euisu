import { clipboardWriteBlob } from "src/content/clipboard";
import { screenshotOfVideo } from "src/content/video";
import { showSnackbar } from "src/content/snackbar";

export async function copyScreenshotOfFirstVideo(): Promise<void> {
  const video = document.querySelector<HTMLVideoElement>("video");
  if (video === null) {
    return;
  }
  const blob = await screenshotOfVideo(video);
  await clipboardWriteBlob(blob);
  showSnackbar("Video screenshot copied");
}
