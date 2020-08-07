import { requestCaptureVideo } from "src/background/request_to_content";

export function handleCommands(command: string): void {
  switch (command) {
    case "capture-video":
      requestCaptureVideo();
      break;
  }
}
