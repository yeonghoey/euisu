import { requestCopyScreenshotOfFirstVideo } from "src/background/request_to_content";

export function handleCommands(command: string): void {
  switch (command) {
    case "copy-screenshot-of-first-video":
      requestCopyScreenshotOfFirstVideo();
      break;
  }
}
