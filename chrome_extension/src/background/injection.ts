export interface InjectionSpec {
  // NOTE: target should be a RE2 pattern for matching URL.
  // SEE: https://github.com/google/re2/wiki/Syntax
  target: string;
  file: string;
}

export function registerInjection(spec: InjectionSpec): void {
  chrome.webNavigation.onCompleted.addListener(
    (details) => {
      console.log(
        `onCompleted: Injecting "${spec.file}" into "${details.url}", matched by: "${spec.target}"`
      );
      chrome.tabs.executeScript({ file: spec.file });
    },
    {
      url: [{ urlMatches: spec.target }],
    }
  );

  // Some websites, like YouTube, use HTML5 PushState for internal page navgation,
  // in which case the usual content script declaratibe injection won't be triggered.
  chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      console.log(
        `onHistoryStateUpdated: Injecting "${spec.file}" into "${details.url}", matched by: "${spec.target}"`
      );
      chrome.tabs.executeScript({ file: spec.file });
    },
    {
      url: [{ urlMatches: spec.target }],
    }
  );
}
