// Lightweight module-level toast API bridge
type ToastPayload = { type: "success" | "error" | "info"; message: string };

let handler: ((t: ToastPayload) => void) | null = null;

export const _setToastHandler = (h: ((t: ToastPayload) => void) | null) => {
  handler = h;
};

export const toast = {
  success: (message: string) => handler && handler({ type: "success", message }),
  error: (message: string) => handler && handler({ type: "error", message }),
  info: (message: string) => handler && handler({ type: "info", message }),
};

export default toast;
