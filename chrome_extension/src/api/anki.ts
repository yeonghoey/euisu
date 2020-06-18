export async function postAnki(req: AnkiRequest): Promise<AnkiResponse> {
  // TODO: Make this configurable.
  const url = "http://localhost:8732/anki";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return await response.json();
}

interface AnkiRequest {
  readonly type: string;
  readonly target: string;
}

interface AnkiResponse {
  readonly basename: string;
}
