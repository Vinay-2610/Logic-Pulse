import { useEffect, useRef, useState, useCallback } from "react";
import type { Component, Wire } from "@shared/schema";
import { ComponentIcon } from "./component-icon";
import { nanoid } from "nanoid";

interface CircuitCanvasProps {
  components: Component[];
  wires: Wire[];
  selectedComponent: Component | null;
  zoom: number;
  pan: { x: number; y: number };
  onSelectComponent: (component: Component | null) => void;
  onUpdateComponent: (id: string, updates: Partial<Component>) => void;
  onDeleteComponent: (id: string) => void;
  onAddWire: (wire: Wire) => void;
  onDeleteWire: (id: string) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
}

export function CircuitCanvas({
  components,
  wires,
  selectedComponent,
  zoom,
  pan,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddWire,
  onDeleteWire,
  onPanChange,
}: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wiringFrom, setWiringFrom] = useState<{ componentId: string; pinIndex: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const gridSize = 16;

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 0.5;

    for (let x = pan.x % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = pan.y % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [pan]);

  const drawComponent = useCallback(
    (ctx: CanvasRenderingContext2D, component: Component) => {
      const x = component.x + pan.x;
      const y = component.y + pan.y;
      const width = 80;
      const height = 60;

      const isSelected = selectedComponent?.id === component.id;

      ctx.save();
      ctx.translate(x, y);

      if (isSelected) {
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 3;
        ctx.strokeRect(-5, -5, width + 10, height + 10);
      }

      ctx.fillStyle = "hsl(var(--card))";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "10px Inter";
      ctx.textAlign = "center";
      ctx.fillText(component.label, width / 2, height - 5);

      const inputPins = component.inputs || 0;
      const outputPins = component.outputs || 0;

      ctx.fillStyle = "hsl(var(--primary))";
      for (let i = 0; i < inputPins; i++) {
        const pinY = ((i + 1) * height) / (inputPins + 1);
        ctx.beginPath();
        ctx.arc(0, pinY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < outputPins; i++) {
        const pinY = ((i + 1) * height) / (outputPins + 1);
        ctx.beginPath();
        ctx.arc(width, pinY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (component.type === "led" && component.value) {
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    [pan, selectedComponent]
  );

  const drawWire = useCallback(
    (ctx: CanvasRenderingContext2D, wire: Wire) => {
      const fromComp = components.find((c) => c.id === wire.from.componentId);
      const toComp = components.find((c) => c.id === wire.to.componentId);

      if (!fromComp || !toComp) return;

      const fromX = fromComp.x + pan.x + 80;
      const fromY =
        fromComp.y +
        pan.y +
        ((wire.from.pinIndex + 1) * 60) / ((fromComp.outputs || 1) + 1);

      const toX = toComp.x + pan.x;
      const toY =
        toComp.y + pan.y + ((wire.to.pinIndex + 1) * 60) / ((toComp.inputs || 1) + 1);

      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);

      const midX = (fromX + toX) / 2;
      ctx.bezierCurveTo(midX, fromY, midX, toY, toX, toY);

      ctx.stroke();
    },
    [components, pan]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);

    wires.forEach((wire) => drawWire(ctx, wire));
    components.forEach((comp) => drawComponent(ctx, comp));
  }, [components, wires, drawGrid, drawWire, drawComponent]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;

    const clickedComponent = components.find(
      (c) => x >= c.x && x <= c.x + 80 && y >= c.y && y <= c.y + 60
    );

    if (e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (clickedComponent) {
      onSelectComponent(clickedComponent);
      setDraggedComponent(clickedComponent);
      setDragOffset({ x: x - clickedComponent.x, y: y - clickedComponent.y });
    } else {
      onSelectComponent(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedComponent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - pan.x - dragOffset.x;
      const y = e.clientY - rect.top - pan.y - dragOffset.y;

      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;

      onUpdateComponent(draggedComponent.id, { x: snappedX, y: snappedY });
    }
  };

  const handleMouseUp = () => {
    setDraggedComponent(null);
    setIsPanning(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" && selectedComponent) {
      onDeleteComponent(selectedComponent.id);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponent]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-background"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
      />
    </div>
  );
}
