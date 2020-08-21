import "src/content/www_youtube_com/pages/watch.css";
import { showSnackbar } from "src/content/snackbar";
import { requestRunHewOnSrc } from "src/content/request_to_background";

function main(): void {
  const DELAY = 500;
  setTimeout(function tryInjectEuisu(): void {
    const success = injectEuisu();
    if (!success) {
      setTimeout(tryInjectEuisu, DELAY);
    }
  }, DELAY);
}

function injectEuisu(): boolean {
  if (isAlreadyInjected()) {
    return true;
  }

  const courseTitle = retrieveCourseTitle();
  if (courseTitle === null) {
    return false;
  }

  const lectureTitle = retrieveLectureTitle();
  if (lectureTitle === null) {
    return false;
  }

  const video = retrieveVideo();
  if (video === null) {
    return false;
  }

  const controlbarSpacer = retrieveControlbarSpacer();
  if (controlbarSpacer === null) {
    return false;
  }

  const parent = controlbarSpacer.parentNode;
  if (parent === null) {
    return false;
  }

  const nextSibling = controlbarSpacer.nextSibling;
  if (nextSibling === null) {
    return false;
  }

  const euisu = createEuisu();
  parent.insertBefore(euisu, nextSibling);

  return true;
}

function isAlreadyInjected(): boolean {
  return document.querySelector(".euisu") !== null;
}

function retrieveCourseTitle(): string | null {
  const a = document.querySelector<HTMLElement>(
    "a[data-purpose='course-header-title']"
  );
  if (a !== null) {
    return a.innerText;
  }
  return null;
}

function retrieveLectureTitle(): string | null {
  const fromSection = document.querySelector<HTMLElement>(
    "div[data-purpose='curriculum-section-container'] li[aria-current='true'] div[class^='curriculum-item-link--title']"
  );

  if (fromSection !== null) {
    return fromSection.innerText;
  }

  const overlay = document.querySelector<HTMLElement>(
    "div[class^='video-viewer--title-overlay']"
  );
  if (overlay !== null) {
    return overlay.innerText;
  }
  return null;
}

function retrieveVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("video");
}

function retrieveControlbarSpacer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    "div[class^='control-bar--spacer']"
  );
}

function createEuisu(): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");

  const hewButton = makeHewButton();
  div.appendChild(hewButton);

  // Shortcuts
  const shortcuts: Shortcuts = {
    Digit0: () => hewButton.click(),
  };

  window.addEventListener(
    "keydown",
    (ev) => {
      // Skip when shortcuts used with modifiers
      if (ev.ctrlKey || ev.altKey || ev.metaKey) {
        return;
      }
      // Skip when typing in search bar
      if (document.activeElement?.nodeName === "INPUT") {
        return;
      }
      if (ev.code in shortcuts) {
        shortcuts[ev.code]();
        console.log(`"${ev.code}" captured`);
        ev.stopPropagation();
      }
    },
    { capture: true }
  );
  return div;
}

interface Shortcuts {
  [code: string]: () => void;
}

function makeHewButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = "Hew";
  button.addEventListener("click", async () => {
    const video = retrieveVideo();
    if (video === null) {
      return;
    }
    const courseTitle = retrieveCourseTitle();
    if (courseTitle === null) {
      return;
    }
    const lectureTitle = retrieveLectureTitle();
    if (lectureTitle === null) {
      return;
    }

    const filename = `${courseTitle} - ${lectureTitle}.mp4`;

    showSnackbar("Starting Hew...");
    video.pause();
    const [ok, body] = await requestRunHewOnSrc(filename, video.currentSrc);
    console.log(body);
    if (!ok) {
      showSnackbar("Failed to start Hew");
    }
  });
  return button;
}

// -------------------------------------------
main();
