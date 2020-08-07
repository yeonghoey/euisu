/* eslint-disable no-undef */
// NOTE: Using experimental Clipboard API here.
// Suppress type checkings.
export async function clipboardWriteBlob(blob) {
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}
