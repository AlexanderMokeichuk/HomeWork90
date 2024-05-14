import {WebSocket} from 'ws';

export interface ActiveConnections {
  [id: string]: WebSocket
}

type Coordinate = {
  x: number;
  y: number;
}
export interface PixelData {
  mousePosition: Coordinate;
  newMousePosition: Coordinate;
  color: string;
}
export interface IncomingCoordinate {
  type: string;
  payload: PixelData;
}
