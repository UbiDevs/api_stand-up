import { sendData } from "./send.js";

export const handleComediansRequest = async (req, res, comedians, segments) => {
  if (segments.length === 2) {
    const comedian = comedians.find((c) => c.id === segments[1]);

    if (!comedian) {
      sendError(res, 404, "Комик не найден");
      return;
    }

    sendData(res, comedian);
    return;
  }

  sendData(res, comedians);
}