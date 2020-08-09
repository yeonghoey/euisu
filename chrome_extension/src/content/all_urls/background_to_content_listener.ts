import { Request } from "src/protocols/background_to_content";
import { showSnackbar } from "src/content/snackbar";
import { copyScreenshotOfFirstVideo } from "src/content/actions";

chrome.runtime.onMessage.addListener((message) => {
  const request = message as Request;
  switch (request.type) {
    case "RequestShowSnackbar":
      showSnackbar(request.text);
      break;
    case "RequestCopyScreenshotOfFirstVideo":
      copyScreenshotOfFirstVideo();
      break;
  }
});
