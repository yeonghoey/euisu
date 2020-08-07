export interface RequestShowSnackbar {
  type: "RequestShowSnackbar";
  text: string;
}

export interface RequestCaptureVideo {
  type: "RequestCaptureVideo";
}

export type Request = RequestShowSnackbar | RequestCaptureVideo;
