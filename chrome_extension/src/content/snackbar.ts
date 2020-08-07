import "src/content/snackbar.css";

export function showSnackbar(text: string): void {
  const div = document.createElement("div");
  div.id = "euisu-snackbar";
  div.innerText = text;
  div.addEventListener("animationend", () => {
    div.remove();
  });
  document.body.appendChild(div);
}
