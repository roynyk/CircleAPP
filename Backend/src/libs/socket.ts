import { WebSocketServer, WebSocket } from "ws";
import http from "http";

let wss: WebSocketServer;

export const initSocket = (server: http.Server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("⚡ Client terhubung ke WebSocket");

    ws.on("close", () => {
      console.log("🔌 Client terputus dari WebSocket");
    });
  });
};

// Fungsi untuk mengirim pesan ke seluruh client yang aktif
export const broadcast = (event: string, data: any) => {
  if (!wss) return;

  const payload = JSON.stringify({ event, data });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};
