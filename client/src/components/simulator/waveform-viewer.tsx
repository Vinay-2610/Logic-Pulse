import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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

  const chartData = data.time.map((t, index) => {
    const point: any = { time: t };
    Object.entries(data.signals).forEach(([name, values]) => {
      if (visibleSignals.has(name)) {
        point[name] = Number(values[index]) || 0;
      }
    });
    return point;
  });

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
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Waveform Viewer</span>
          <span className="text-xs text-muted-foreground">
            {Object.keys(data.signals).length} signals, {data.time.length} time steps
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            data-testid="button-waveform-zoom-in"
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            data-testid="button-waveform-zoom-out"
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} data-testid="button-close-waveform">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-40 border-r border-border p-2">
          <div className="text-xs font-semibold mb-2 text-muted-foreground">Signals</div>
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {Object.keys(data.signals).map((signalName, index) => (
                <button
                  key={signalName}
                  onClick={() => toggleSignal(signalName)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                    visibleSignals.has(signalName)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  data-testid={`signal-toggle-${signalName}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="truncate">{signalName}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-auto">
          <div style={{ width: `${Math.max(100, chartData.length * zoom * 10)}px`, minHeight: "100%" }}>
            <ScrollArea className="h-full">
              {Array.from(visibleSignals).map((signalName, index) => (
                <div key={signalName} className="border-b border-border p-4">
                  <div className="text-xs font-semibold mb-2" style={{ color: colors[Object.keys(data.signals).indexOf(signalName) % colors.length] }}>
                    {signalName}
                  </div>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 10 }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        ticks={[0, 1]}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 10 }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                        width={30}
                      />
                      <Line
                        type="stepAfter"
                        dataKey={signalName}
                        stroke={colors[Object.keys(data.signals).indexOf(signalName) % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}

              {visibleSignals.size === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No signals selected. Click signal names on the left to display.
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
