/* eslint-disable no-undef */
// NOTE: Using experimental Clipboard API here.
// Suppress type checkings.
export async function copyImageToClipboard(blob) {
  return await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}
