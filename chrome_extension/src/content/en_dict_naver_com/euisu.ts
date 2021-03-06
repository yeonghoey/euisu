import { requestPostAnki, requestCreateTab } from "src/background/messages";

export function createEuisu(
  targetText: string,
  audioURL: string | null,
  meaning: string | null
): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("euisu");
  const scrapButoon = makeScrapButton(targetText, audioURL, meaning);
  div.appendChild(scrapButoon);
  if (targetText.split(" ").length == 1) {
    const vocaButoon = makeVocaButton(targetText);
    div.appendChild(vocaButoon);
  }
  const imageButton = makeImageButton(targetText);
  div.appendChild(imageButton);
  return div;
}

function makeScrapButton(
  targetText: string,
  audioURL: string | null,
  meaning: string | null
) {
  // TODO: make the appearance fancier
  const button = document.createElement("button");
  button.innerText = "Scrap";
  button.onclick = function onclick() {
    let typ = "";
    let target = "";
    if (audioURL !== null) {
      typ = "download";
      target = audioURL;
    } else {
      typ = "tts";
      target = targetText;
    }
    requestPostAnki(typ, target).then((resp) => {
      const head = `${targetText} [sound:${resp.basename}]`;
      const content = meaning === null ? head : `${head}\n${meaning}`;
      navigator.clipboard.writeText(content);
    });
  };
  return button;
}

function makeVocaButton(targetText: string) {
  const button = document.createElement("button");
  button.innerText = "Voca";
  button.onclick = function onclick() {
    requestCreateTab(`https://www.vocabulary.com/dictionary/${targetText}`);
  };
  return button;
}

function makeImageButton(targetText: string) {
  const button = document.createElement("button");
  button.innerText = "Image";
  button.onclick = function onclick() {
    requestCreateTab(`https://www.google.com/search?tbm=isch&q=${targetText}`);
  };
  return button;
}
