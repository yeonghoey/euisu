export interface RequestRunHew {
  type: "RequestRunHew";
  ytURL: string;
}

export interface ResponseRunHew {
  type: "ResponseRunHew";
  ok: boolean;
  body: string;
}

export type Request = RequestRunHew;
export type Response = ResponseRunHew;
