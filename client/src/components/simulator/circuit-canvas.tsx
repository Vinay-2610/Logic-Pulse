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
    ctx.strokeStyle = "#404040";
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
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.strokeRect(-4, -4, width + 8, height + 8);
        
        // Add a glow effect
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.strokeRect(-4, -4, width + 8, height + 8);
        ctx.shadowBlur = 0;
      }

      // Draw component body with better visibility
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#3a3a3a");
      gradient.addColorStop(1, "#2a2a2a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw border
      ctx.strokeStyle = "#606060";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      // Draw component symbol/icon
      ctx.strokeStyle = "#909090";
      ctx.fillStyle = "#707070";
      ctx.lineWidth = 2;
      
      const centerX = width / 2;
      const centerY = height / 2 - 5;
      const iconSize = 24;
      
      switch (component.type) {
        case "and":
          // AND gate shape
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX, centerY - iconSize/2);
          ctx.arc(centerX, centerY, iconSize/2, -Math.PI/2, Math.PI/2);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2);
          ctx.closePath();
          ctx.stroke();
          break;
          
        case "or":
          // OR gate shape
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY - iconSize/2, centerX + iconSize/2, centerY);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY + iconSize/2, centerX - iconSize/2, centerY + iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/3, centerY, centerX - iconSize/2, centerY - iconSize/2);
          ctx.stroke();
          break;
          
        case "not":
          // NOT gate (triangle with circle)
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + iconSize/2, centerY, 3, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case "nand":
          // NAND gate (AND with circle)
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX, centerY - iconSize/2);
          ctx.arc(centerX, centerY, iconSize/2 - 4, -Math.PI/2, Math.PI/2);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + iconSize/2, centerY, 3, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case "nor":
          // NOR gate (OR with circle)
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY - iconSize/2, centerX + iconSize/3, centerY);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY + iconSize/2, centerX - iconSize/2, centerY + iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/3, centerY, centerX - iconSize/2, centerY - iconSize/2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + iconSize/2, centerY, 3, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case "xor":
          // XOR gate (OR with extra curve)
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2 - 4, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/2 - 2, centerY, centerX - iconSize/2 - 4, centerY + iconSize/2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY - iconSize/2, centerX + iconSize/2, centerY);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY + iconSize/2, centerX - iconSize/2, centerY + iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/3, centerY, centerX - iconSize/2, centerY - iconSize/2);
          ctx.stroke();
          break;
          
        case "xnor":
          // XNOR gate (XOR with circle)
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2 - 4, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/2 - 2, centerY, centerX - iconSize/2 - 4, centerY + iconSize/2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY - iconSize/2, centerX + iconSize/3, centerY);
          ctx.quadraticCurveTo(centerX - iconSize/4, centerY + iconSize/2, centerX - iconSize/2, centerY + iconSize/2);
          ctx.quadraticCurveTo(centerX - iconSize/3, centerY, centerX - iconSize/2, centerY - iconSize/2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + iconSize/2, centerY, 3, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case "input":
          // Draw input value indicator
          ctx.fillStyle = component.value ? "#10b981" : "#404040";
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = component.value ? "#34d399" : "#606060";
          ctx.stroke();
          
          ctx.fillStyle = component.value ? "#ffffff" : "#808080";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(component.value ? "1" : "0", centerX, centerY);
          break;
          
        case "output":
          // Output circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2 - 6, centerY);
          ctx.lineTo(centerX - iconSize/2, centerY);
          ctx.stroke();
          break;
          
        case "led":
          // Draw LED circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/2, 0, Math.PI * 2);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.stroke();
          if (component.value) {
            ctx.fillStyle = "#ef4444";
            ctx.fill();
          }
          break;
          
        case "clock":
          // Clock waveform
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY + iconSize/4);
          ctx.lineTo(centerX - iconSize/2, centerY - iconSize/4);
          ctx.lineTo(centerX - iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX - iconSize/4, centerY + iconSize/4);
          ctx.lineTo(centerX, centerY + iconSize/4);
          ctx.lineTo(centerX, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/4, centerY + iconSize/4);
          ctx.lineTo(centerX + iconSize/2, centerY + iconSize/4);
          ctx.stroke();
          break;
          
        case "mux2":
        case "mux4":
        case "demux2":
        case "demux4":
          // Multiplexer trapezoid
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX + iconSize/2, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/2, centerY + iconSize/3);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2);
          ctx.closePath();
          ctx.stroke();
          ctx.font = "9px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("MUX", centerX, centerY);
          break;
          
        case "resistor":
          // Resistor zigzag
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY);
          ctx.lineTo(centerX - iconSize/3, centerY - iconSize/4);
          ctx.lineTo(centerX - iconSize/6, centerY + iconSize/4);
          ctx.lineTo(centerX + iconSize/6, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/3, centerY + iconSize/4);
          ctx.lineTo(centerX + iconSize/2, centerY);
          ctx.stroke();
          break;
          
        case "capacitor":
          // Capacitor parallel lines
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY);
          ctx.lineTo(centerX - 2, centerY);
          ctx.moveTo(centerX - 2, centerY - iconSize/3);
          ctx.lineTo(centerX - 2, centerY + iconSize/3);
          ctx.moveTo(centerX + 2, centerY - iconSize/3);
          ctx.lineTo(centerX + 2, centerY + iconSize/3);
          ctx.moveTo(centerX + 2, centerY);
          ctx.lineTo(centerX + iconSize/2, centerY);
          ctx.stroke();
          break;
          
        case "inductor":
          // Inductor coil
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY);
          for (let i = 0; i < 4; i++) {
            const x = centerX - iconSize/2 + (i * iconSize/4);
            ctx.arc(x + iconSize/8, centerY, iconSize/8, Math.PI, 0, false);
          }
          ctx.stroke();
          break;
          
        case "diode":
          // Diode triangle and line
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/3, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.lineTo(centerX - iconSize/3, centerY + iconSize/3);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX + iconSize/3, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY + iconSize/3);
          ctx.stroke();
          break;
          
        case "zenerdiode":
          // Zener diode
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/3, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.lineTo(centerX - iconSize/3, centerY + iconSize/3);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX + iconSize/3, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY + iconSize/3);
          ctx.lineTo(centerX + iconSize/2, centerY + iconSize/3);
          ctx.stroke();
          break;
          
        case "photodiode":
          // Photodiode with arrows
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/3, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.lineTo(centerX - iconSize/3, centerY + iconSize/3);
          ctx.closePath();
          ctx.stroke();
          // Arrows
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX - iconSize/3, centerY - iconSize/3);
          ctx.stroke();
          break;
          
        case "transistor-npn":
        case "transistor-pnp":
          // Transistor symbol
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/4, centerY - iconSize/2);
          ctx.lineTo(centerX - iconSize/4, centerY + iconSize/2);
          ctx.moveTo(centerX - iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/3, centerY - iconSize/2);
          ctx.moveTo(centerX - iconSize/4, centerY + iconSize/4);
          ctx.lineTo(centerX + iconSize/3, centerY + iconSize/2);
          ctx.stroke();
          // Arrow
          const arrowY = component.type === "transistor-npn" ? centerY + iconSize/2 : centerY - iconSize/2;
          ctx.beginPath();
          ctx.moveTo(centerX + iconSize/4, arrowY - 3);
          ctx.lineTo(centerX + iconSize/3, arrowY);
          ctx.lineTo(centerX + iconSize/4 - 3, arrowY);
          ctx.fill();
          break;
          
        case "mosfet-n":
        case "mosfet-p":
          // MOSFET symbol
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/3, centerY - iconSize/2);
          ctx.lineTo(centerX - iconSize/3, centerY + iconSize/2);
          ctx.moveTo(centerX - iconSize/4, centerY - iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY - iconSize/3);
          ctx.moveTo(centerX - iconSize/4, centerY);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.moveTo(centerX - iconSize/4, centerY + iconSize/3);
          ctx.lineTo(centerX + iconSize/3, centerY + iconSize/3);
          ctx.stroke();
          break;
          
        case "opamp":
          // Op-amp triangle
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY - iconSize/2);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2);
          ctx.lineTo(centerX + iconSize/2, centerY);
          ctx.closePath();
          ctx.stroke();
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("+", centerX - iconSize/3, centerY - iconSize/6);
          ctx.fillText("-", centerX - iconSize/3, centerY + iconSize/4);
          break;
          
        case "relay":
          // Relay coil and switch
          ctx.strokeRect(centerX - iconSize/2, centerY - iconSize/3, iconSize/2, iconSize * 2/3);
          ctx.beginPath();
          ctx.moveTo(centerX + iconSize/6, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/2, centerY);
          ctx.stroke();
          break;
          
        case "battery":
          // Battery symbol
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/4, centerY - iconSize/3);
          ctx.lineTo(centerX - iconSize/4, centerY + iconSize/3);
          ctx.moveTo(centerX + iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/4, centerY + iconSize/4);
          ctx.stroke();
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("+", centerX - iconSize/4 - 8, centerY - iconSize/3 - 4);
          ctx.fillText("-", centerX + iconSize/4 + 4, centerY - iconSize/3 - 4);
          break;
          
        case "ground":
          // Ground symbol
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - iconSize/3);
          ctx.lineTo(centerX, centerY);
          ctx.moveTo(centerX - iconSize/3, centerY);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.moveTo(centerX - iconSize/4, centerY + iconSize/6);
          ctx.lineTo(centerX + iconSize/4, centerY + iconSize/6);
          ctx.moveTo(centerX - iconSize/6, centerY + iconSize/3);
          ctx.lineTo(centerX + iconSize/6, centerY + iconSize/3);
          ctx.stroke();
          break;
          
        case "vcc":
          // VCC symbol
          ctx.beginPath();
          ctx.moveTo(centerX, centerY + iconSize/3);
          ctx.lineTo(centerX, centerY);
          ctx.moveTo(centerX - iconSize/3, centerY);
          ctx.lineTo(centerX + iconSize/3, centerY);
          ctx.stroke();
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("VCC", centerX, centerY - iconSize/4);
          break;
          
        case "switch":
        case "button":
          // Switch symbol
          ctx.beginPath();
          ctx.arc(centerX - iconSize/3, centerY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(centerX + iconSize/3, centerY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/3, centerY);
          ctx.lineTo(centerX + iconSize/4, centerY - iconSize/4);
          ctx.stroke();
          break;
          
        case "buzzer":
          // Buzzer symbol
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("BZ", centerX, centerY + 3);
          break;
          
        case "lamp":
          // Lamp/bulb symbol
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX + iconSize/4, centerY + iconSize/4);
          ctx.moveTo(centerX + iconSize/4, centerY - iconSize/4);
          ctx.lineTo(centerX - iconSize/4, centerY + iconSize/4);
          ctx.stroke();
          break;
          
        case "motor":
          // Motor symbol
          ctx.beginPath();
          ctx.arc(centerX, centerY, iconSize/3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("M", centerX, centerY + 4);
          break;
          
        case "display7seg":
          // 7-segment display
          ctx.strokeRect(centerX - iconSize/3, centerY - iconSize/2, iconSize * 2/3, iconSize);
          ctx.font = "bold 16px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("8", centerX, centerY + 4);
          break;
          
        case "ic555":
        case "ic":
          // IC chip
          ctx.strokeRect(centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize);
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("IC", centerX, centerY + 3);
          // Draw pins
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(centerX - iconSize/2 - 2, centerY - iconSize/3 + i * iconSize/3, 2, 2);
            ctx.fillRect(centerX + iconSize/2, centerY - iconSize/3 + i * iconSize/3, 2, 2);
          }
          break;
          
        case "shiftregister":
          // Shift register
          ctx.strokeRect(centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize);
          ctx.font = "9px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.fillText("SR", centerX, centerY + 2);
          break;
          
        case "dff":
        case "tff":
        case "jkff":
        case "srff":
          // Flip-flop rectangle with clock triangle
          ctx.strokeRect(centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize);
          ctx.beginPath();
          ctx.moveTo(centerX - iconSize/2, centerY + iconSize/4);
          ctx.lineTo(centerX - iconSize/3, centerY + iconSize/3);
          ctx.lineTo(centerX - iconSize/2, centerY + iconSize/2 - 2);
          ctx.stroke();
          ctx.font = "bold 10px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(component.type.toUpperCase().replace("FF", ""), centerX, centerY - 2);
          break;
          
        default:
          // Default: show type name
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#909090";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const typeText = component.type.toUpperCase();
          ctx.fillText(typeText.length > 6 ? typeText.substring(0, 6) : typeText, centerX, centerY);
      }

      // Draw label at bottom
      ctx.fillStyle = "#e0e0e0";
      ctx.font = "10px sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(component.label, width / 2, height - 6);

      const inputPins = component.inputs || 0;
      const outputPins = component.outputs || 0;

      // Draw input pins (left side)
      for (let i = 0; i < inputPins; i++) {
        const pinY = ((i + 1) * height) / (inputPins + 1);
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(0, pinY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pin outline for better visibility
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw output pins (right side)
      for (let i = 0; i < outputPins; i++) {
        const pinY = ((i + 1) * height) / (outputPins + 1);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(width, pinY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pin outline for better visibility
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (component.type === "led" && component.value) {
        ctx.fillStyle = "#ef4444";
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

      ctx.strokeStyle = "#3b82f6";
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
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use container dimensions instead of canvas getBoundingClientRect
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    drawGrid(ctx, rect.width, rect.height);

    wires.forEach((wire) => drawWire(ctx, wire));
    components.forEach((comp) => drawComponent(ctx, comp));

    // Draw wiring preview
    if (wiringFrom) {
      const fromComp = components.find((c) => c.id === wiringFrom.componentId);
      if (fromComp) {
        const fromX = fromComp.x + pan.x + 80;
        const fromY =
          fromComp.y +
          pan.y +
          ((wiringFrom.pinIndex + 1) * 60) / ((fromComp.outputs || 1) + 1);

        // Get mouse position
        const mouseX = (canvas as any).mouseX || fromX;
        const mouseY = (canvas as any).mouseY || fromY;

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [components, wires, drawGrid, drawWire, drawComponent, wiringFrom, pan]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - pan.x;
    const y = e.clientY - rect.top - pan.y;

    // Check if clicking on a pin to start wiring
    for (const comp of components) {
      const compX = comp.x;
      const compY = comp.y;
      const width = 80;
      const height = 60;

      // Check output pins (right side)
      const outputPins = comp.outputs || 0;
      for (let i = 0; i < outputPins; i++) {
        const pinY = compY + ((i + 1) * height) / (outputPins + 1);
        const pinX = compX + width;
        const dist = Math.sqrt((x - pinX) ** 2 + (y - pinY) ** 2);
        
        if (dist < 8) {
          setWiringFrom({ componentId: comp.id, pinIndex: i });
          return;
        }
      }

      // Check input pins (left side) for completing wire
      if (wiringFrom) {
        const inputPins = comp.inputs || 0;
        for (let i = 0; i < inputPins; i++) {
          const pinY = compY + ((i + 1) * height) / (inputPins + 1);
          const pinX = compX;
          const dist = Math.sqrt((x - pinX) ** 2 + (y - pinY) ** 2);
          
          if (dist < 8) {
            // Create wire
            const newWire: Wire = {
              id: nanoid(),
              from: wiringFrom,
              to: { componentId: comp.id, pinIndex: i },
            };
            onAddWire(newWire);
            setWiringFrom(null);
            return;
          }
        }
      }
    }

    const clickedComponent = components.find(
      (c) => x >= c.x && x <= c.x + 80 && y >= c.y && y <= c.y + 60
    );

    if (e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setWiringFrom(null);
      return;
    }

    if (clickedComponent) {
      onSelectComponent(clickedComponent);
      setDraggedComponent(clickedComponent);
      setDragOffset({ x: x - clickedComponent.x, y: y - clickedComponent.y });
      setWiringFrom(null);
    } else {
      onSelectComponent(null);
      setWiringFrom(null);
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

    // Track mouse position for wiring preview
    if (wiringFrom && canvas) {
      const rect = canvas.getBoundingClientRect();
      (canvas as any).mouseX = e.clientX - rect.left;
      (canvas as any).mouseY = e.clientY - rect.top;
      render();
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
    if (e.key === "Escape") {
      setWiringFrom(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComponent, wiringFrom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-background relative overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${wiringFrom ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
      />
    </div>
  );
}
