import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import type { WaveformData } from "@shared/schema";

interface WaveformViewerProps {
  data: WaveformData;
  onClose?: () => void;
}

export function WaveformViewer({ data, onClose }: WaveformViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [visibleSignals, setVisibleSignals] = useState<Set<string>>(
    new Set(Object.keys(data.signals))
  );
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const toggleSignal = (signalName: string) => {
    setVisibleSignals((prev) => {
      const next = new Set(prev);
      if (next.has(signalName)) {
        next.delete(signalName);
      } else {
        next.add(signalName);
      }
      return next;
    });
  };

  const colors = [
    "#10b981", // Green
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#f59e0b", // Orange
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#14b8a6", // Teal
  ];

  const drawWaveform = (
    canvas: HTMLCanvasElement,
    signalData: (number | string)[],
    color: string
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Clear canvas with dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 0.5;

    const timeSteps = signalData.length;
    const pixelsPerStep = graphWidth / timeSteps;

    // Vertical grid lines (time divisions)
    const numVerticalLines = Math.min(20, timeSteps);
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = padding + (i * graphWidth) / numVerticalLines;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines (amplitude divisions)
    const numHorizontalLines = 8;
    for (let i = 0; i <= numHorizontalLines; i++) {
      const y = padding + (i * graphHeight) / numHorizontalLines;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw center line (0.5 level)
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, padding + graphHeight / 2);
    ctx.lineTo(width - padding, padding + graphHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw axes
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = "#909090";
    ctx.font = "10px monospace";
    
    // Y-axis labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("HIGH (1)", padding - 8, padding + 5);
    ctx.fillText("LOW (0)", padding - 8, height - padding - 5);
    
    // X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("0", padding, height - padding + 8);
    ctx.fillText(`${timeSteps}`, width - padding, height - padding + 8);
    
    // Time label
    ctx.fillStyle = "#707070";
    ctx.font = "11px monospace";
    ctx.fillText("Time Steps →", width / 2, height - 15);

    // Draw waveform with proper square wave style
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    ctx.beginPath();
    
    let prevValue = Number(signalData[0]) || 0;
    let prevX = padding;
    let prevY = height - padding - prevValue * graphHeight;
    
    ctx.moveTo(prevX, prevY);

    for (let i = 0; i < signalData.length; i++) {
      const value = Number(signalData[i]) || 0;
      const x = padding + (i + 1) * pixelsPerStep;
      const y = height - padding - value * graphHeight;

      // Draw horizontal line at current level
      ctx.lineTo(x, prevY);
      
      // If value changed, draw vertical transition
      if (value !== prevValue) {
        ctx.lineTo(x, y);
      }
      
      prevValue = value;
      prevY = y;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw transition markers
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    
    for (let i = 1; i < signalData.length; i++) {
      const value = Number(signalData[i]) || 0;
      const prevValue = Number(signalData[i - 1]) || 0;
      
      if (value !== prevValue) {
        const x = padding + i * pixelsPerStep;
        const y = height - padding - value * graphHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.shadowBlur = 0;

    // Draw signal level indicators
    ctx.fillStyle = color;
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    // Show current value at the end
    const lastValue = Number(signalData[signalData.length - 1]) || 0;
    const lastY = height - padding - lastValue * graphHeight;
    ctx.fillText(lastValue === 1 ? "HIGH" : "LOW", width - padding + 10, lastY);
  };

  useEffect(() => {
    Object.entries(canvasRefs.current).forEach(([signalName, canvas]) => {
      if (canvas && visibleSignals.has(signalName)) {
        const signalIndex = Object.keys(data.signals).indexOf(signalName);
        const color = colors[signalIndex % colors.length];
        drawWaveform(canvas, data.signals[signalName], color);
      }
    });
  }, [data, visibleSignals, zoom]);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold">Waveform Viewer</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{Object.keys(data.signals).length}</span> signals
            </span>
            <span>
              <span className="font-medium text-foreground">{data.time.length}</span> time steps
            </span>
            <span>
              <span className="font-medium text-foreground">{visibleSignals.size}</span> visible
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            data-testid="button-waveform-zoom-in"
            className="h-8"
          >
            <ZoomIn className="w-3 h-3 mr-1" />
            <span className="text-xs">Zoom In</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            data-testid="button-waveform-zoom-out"
            className="h-8"
          >
            <ZoomOut className="w-3 h-3 mr-1" />
            <span className="text-xs">Zoom Out</span>
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} data-testid="button-close-waveform" className="h-8">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r border-border bg-card">
          <div className="p-3 border-b border-border">
            <div className="text-xs font-semibold text-foreground">Signal List</div>
            <div className="text-xs text-muted-foreground mt-1">
              Click to show/hide
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="p-2 space-y-1">
              {Object.keys(data.signals).map((signalName, index) => {
                const isVisible = visibleSignals.has(signalName);
                const color = colors[index % colors.length];
                
                return (
                  <button
                    key={signalName}
                    onClick={() => toggleSignal(signalName)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all ${
                      isVisible
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "border border-transparent hover:bg-muted hover:border-border"
                    }`}
                    data-testid={`signal-toggle-${signalName}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-sm transition-all ${isVisible ? 'ring-2 ring-offset-1 ring-offset-card' : ''}`}
                        style={{ 
                          backgroundColor: color
                        }}
                      />
                      <span className={`truncate ${isVisible ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {signalName}
                      </span>
                      {isVisible && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-auto bg-black">
          <ScrollArea className="h-full">
            <div style={{ padding: "16px", minWidth: `${Math.max(800, data.time.length * zoom * 8)}px` }}>
              {Array.from(visibleSignals).map((signalName) => {
                const signalIndex = Object.keys(data.signals).indexOf(signalName);
                const color = colors[signalIndex % colors.length];
                const highPulses = data.signals[signalName].filter(v => v === 1 || v === "1").length;
                
                return (
                  <div key={signalName} className="mb-6 bg-card rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border-b border-border">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                      />
                      <span className="text-sm font-semibold" style={{ color }}>
                        {signalName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {highPulses} high pulses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Max: 1
                      </span>
                    </div>
                    <div className="relative bg-black" style={{ height: "180px" }}>
                      <canvas
                        ref={(el) => {
                          canvasRefs.current[signalName] = el;
                          if (el) {
                            const dpr = window.devicePixelRatio || 1;
                            const canvasWidth = Math.max(1000, data.time.length * zoom * 10);
                            el.width = canvasWidth * dpr;
                            el.height = 180 * dpr;
                            el.style.width = canvasWidth + 'px';
                            el.style.height = '180px';
                            
                            const ctx = el.getContext('2d');
                            if (ctx) {
                              ctx.scale(dpr, dpr);
                            }
                            
                            const signalIndex = Object.keys(data.signals).indexOf(signalName);
                            const color = colors[signalIndex % colors.length];
                            drawWaveform(el, data.signals[signalName], color);
                          }
                        }}
                        className="w-full h-full"
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                );
              })}

              {visibleSignals.size === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground text-sm mb-2">
                    No signals selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click signal names on the left to display waveforms
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
