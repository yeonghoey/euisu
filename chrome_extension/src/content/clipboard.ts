export { clipboardWriteBlob } from "src/content/clipboard_api.js";

export async function clipboardWriteText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
