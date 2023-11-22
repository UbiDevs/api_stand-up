import { CLIENTS } from "../index.js";
import { sendData, sendError } from "./send.js";
import fs from "node:fs/promises";

export const handleUpdateClient = (req, res, segments) => {
  let body = "";
  const ticket = segments[1];
  try {
    req.on("data", (chunk) => {
      body += chunk;
    });
  } catch (error) {
    console.log(`Ошибка при чтении запроса`);
    sendError(res, 500, "Ошибка сервера при чтении запроса");
  }

  req.on("end", async () => {
    try {
      const updateClientData = JSON.parse(body);

      if (
        !updateClientData.fullName ||
        !updateClientData.phone ||
        !updateClientData.ticket ||
        !updateClientData.booking
      ) {
        sendError(res, 400, "Введены неверные данные клиента");
        return;
      }

      if (
        updateClientData.booking &&
        (!updateClientData.booking.length ||
          !Array.isArray(updateClientData.booking) ||
          !updateClientData.booking.every((item) => item.comedian && item.time))
      ) {
        sendError(res, 400, "Неверно заполнены поля бронирования");
        return;
      }

      const clientData = await fs.readFile(CLIENTS, "utf-8");
      const clients = JSON.parse(clientData);

      const clientIndex = clients.findIndex((c) => c.ticket === ticket);

      if (clientIndex === -1) {
        sendError(res, 404, "Клиент с данным номером билета не найден");
      }

      clients[clientIndex] = {
        ...clients[clientIndex],
        ...updateClientData,
      };

      await fs.writeFile(CLIENTS, JSON.stringify(clients));
      sendData(res, clients[clientIndex]);
    } catch (error) {
      console.error(`error: ${error}`);
      sendError(res, 500, "Ошибка сервера при обновлении данных");
    }
  });
};