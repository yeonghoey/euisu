import { RequestShowSnackbar } from "src/content_agent/snackbar";
import { showSnackbar } from "src/snackbar";

type Request = RequestShowSnackbar;

function main() {
  chrome.runtime.onMessage.addListener((message) => {
    const request = message as Request;
    switch (request.type) {
      case "RequestShowSnackbar":
        showSnackbar(request.text);
        break;
    }
  });
}

main();
