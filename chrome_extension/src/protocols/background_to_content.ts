export interface RequestShowSnackbar {
  type: "RequestShowSnackbar";
  text: string;
}

export interface RequestCopyScreenshotOfFirstVideo {
  type: "RequestCopyScreenshotOfFirstVideo";
}

export type Request = RequestShowSnackbar | RequestCopyScreenshotOfFirstVideo;
