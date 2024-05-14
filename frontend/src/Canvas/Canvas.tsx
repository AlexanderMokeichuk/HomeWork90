import {useCallback, useEffect, useRef, useState} from "react";
import {ColorPicker} from "react-pick-color";
import {Coordinate, PixelData} from "../type";


const Canvas = () => {
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [color, setColor] = useState("#000");
  const [pixels, setPixels] = useState<PixelData[]>([]);

  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);


  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:8000/draw');

    ws.current?.addEventListener('message', (msg) => {
      const parsed = JSON.parse(msg.data);
      if (parsed.type === 'NEW_PIXELS') {
        setPixels((prevState) => [...prevState, parsed.payload]);
      }
      if (parsed.type === 'PIXELS') {
        setPixels(parsed.payload);
      }
      if (parsed.type === 'WELCOME') {
        console.log(parsed.payload);
      }

      if (parsed.type === 'CLEAR_PIXELS') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, canvas.width, canvas.height);
        setPixels([]);
      }

    });
  }, []);

  useEffect(() => {
    if (pixels.length) {
      pixels.forEach((item) => {
        drawLine(item);
      });
    }
  }, [pixels]);

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {

    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop,
    };
  };

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousedown", startPaint);
    return () => {
      canvas.removeEventListener("mousedown", startPaint);
    };
  }, [startPaint]);


  const drawLine = (pixelData: PixelData) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      context.strokeStyle = pixelData.color;
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(pixelData.mousePosition.x, pixelData.mousePosition.y);
      context.lineTo(pixelData.newMousePosition.x, pixelData.newMousePosition.y);
      context.closePath();

      context.stroke();
    }
  };

  const paint = useCallback(
    (event: MouseEvent) => {
      if (isPainting) {
        const newMousePosition = getCoordinates(event);
        if (mousePosition && newMousePosition) {
            ws.current?.send(JSON.stringify({type: 'PIXELS_DATA', payload: {
                mousePosition: mousePosition,
                newMousePosition: newMousePosition,
                color: color,
              }}));
          setMousePosition(newMousePosition);
        }
      }
    },
    [isPainting, mousePosition, color]
  );


  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousemove", paint);
    return () => {
      canvas.removeEventListener("mousemove", paint);
    };
  }, [paint]);


  const exitPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mouseup", exitPaint);
    canvas.addEventListener("mouseleave", exitPaint);
    return () => {
      canvas.removeEventListener("mouseup", exitPaint);
      canvas.removeEventListener("mouseleave", exitPaint);
    };
  }, [exitPaint]);



  const clear = () => {
    ws.current?.send(JSON.stringify({type: 'CLEAR_PIXELS'}));
  };

  return (
    <>
      <ColorPicker color={color} onChange={color => setColor(color.hex)}/>;
      <canvas
        style={{border: "1px solid"}}
        ref={canvasRef}
        height={600}
        width={800}
      />
      <button onClick={clear}>
        Clear
      </button>
    </>
  );
};

export default Canvas;