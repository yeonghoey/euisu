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

export type Request = RequestRunHew;
export type Response = ResponseRunHew;
