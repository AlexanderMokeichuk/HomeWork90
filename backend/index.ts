import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {ActiveConnections, IncomingCoordinate, PixelData} from "./type";

const app = express();
expressWs(app);

const port = 8000;
const localhost = `http://localhost:${port}`;

app.use(cors());

const router = express.Router();

const activeConnections: ActiveConnections = {};
let pixels: PixelData[] = [];

router.ws('/draw', (ws) => {
  const id = crypto.randomUUID();
  console.log(`User connected! id - ${id}`);

  activeConnections[id] = ws;
  activeConnections[id].send(JSON.stringify({type: 'PIXELS', payload: pixels}));


  ws.on('message', (message) => {
    const clientMessage = JSON.parse(message.toString()) as IncomingCoordinate;
    if (clientMessage.type === 'PIXELS_DATA') {
      Object.values(activeConnections).forEach((connection) => {
        const serverMessage = {type: 'NEW_PIXELS', payload: clientMessage.payload};
        pixels.push(clientMessage.payload);
        connection.send(JSON.stringify(serverMessage));
      })
    }
    if (clientMessage.type === 'CLEAR_PIXELS') {
      pixels = [];
      Object.values(activeConnections).forEach((connection) => {
        const serverMessage = {type: 'CLEAR_PIXELS'};
        pixels.push(clientMessage.payload);
        connection.send(JSON.stringify(serverMessage));
      })
    }
  });

  ws.on('close', () => {
    delete activeConnections[id];
    if (Object.keys(activeConnections).length === 0) pixels = [];
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server running at ${localhost}`);
});