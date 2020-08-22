export interface RequestRunHew {
  type: "RequestRunHew";
  ytURL: string;
  bookmarks: number[];
}

export interface ResponseRunHew {
  type: "ResponseRunHew";
  ok: boolean;
  body: string;
}

// ----

export interface RequestRunHewOnSrc {
  type: "RequestRunHewOnSrc";
  filename: string;
  srcURL: string;
  startAt: number;
  bookmarks: number[];
}

export interface ResponseRunHewOnSrc {
  type: "ResponseRunHewOnSrc";
  ok: boolean;
  body: string;
}

// ----

export type Request = RequestRunHew | RequestRunHewOnSrc;
export type Response = ResponseRunHew | ResponseRunHewOnSrc;
