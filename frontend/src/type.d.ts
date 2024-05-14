export type Coordinate = {
  x: number;
  y: number;
};
export interface PixelData {
  mousePosition: Coordinate;
  newMousePosition: Coordinate;
  color: string;
}