import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });
wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.on("error", console.error);

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
