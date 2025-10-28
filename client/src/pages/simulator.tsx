import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw, Save, Download, ZoomIn, ZoomOut, SkipForward } from "lucide-react";
import { componentTypes, type Component, type Wire, type Circuit } from "@shared/schema";
import { nanoid } from "nanoid";
import html2canvas from "html2canvas";
import { ComponentPalette } from "@/components/simulator/component-palette";
import { CircuitCanvas } from "@/components/simulator/circuit-canvas";
import { PropertiesPanel } from "@/components/simulator/properties-panel";
import { WaveformViewer } from "@/components/simulator/waveform-viewer";
import { simulateCircuit } from "@/lib/circuit-simulator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Simulator() {
  const { toast } = useToast();
  const [components, setComponents] = useState<Component[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState([50]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [waveformData, setWaveformData] = useState<any>(null);
  const [showWaveform, setShowWaveform] = useState(false);

  useEffect(() => {
    const loadedCircuit = localStorage.getItem("loadedCircuit");
    if (loadedCircuit) {
      try {
        const circuit = JSON.parse(loadedCircuit) as Circuit;
        setComponents(circuit.components || []);
        setWires(circuit.wires || []);
        localStorage.removeItem("loadedCircuit");
        toast({ title: "Circuit loaded from projects" });
      } catch (error) {
        console.error("Failed to load circuit:", error);
      }
    }
  }, [toast]);

  const saveCircuitMutation = useMutation({
    mutationFn: async (circuit: Circuit) => {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: circuit.name || "Untitled Circuit",
          type: "circuit",
          content: circuit,
        }),
      });
      if (!response.ok) throw new Error("Failed to save circuit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Circuit saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save circuit", variant: "destructive" });
    },
  });

  const handleAddComponent = useCallback((typeId: string) => {
    const componentType = componentTypes.find((t) => t.id === typeId);
    if (!componentType) return;

    const newComponent: Component = {
      id: nanoid(),
      type: typeId,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      label: componentType.name,
      inputs: componentType.inputs,
      outputs: componentType.outputs,
      value: typeId === "input" ? 0 : undefined,
      propagationDelay: 1,
      state: {},
    };

    setComponents((prev) => [...prev, newComponent]);
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.from.componentId !== id && w.to.componentId !== id)
    );
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const handleAddWire = useCallback((wire: Wire) => {
    setWires((prev) => [...prev, wire]);
  }, []);

  const handleDeleteWire = useCallback((id: string) => {
    setWires((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleRunSimulation = useCallback(() => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    const result = simulateCircuit(components, wires, 100);
    setWaveformData(result.waveform);
    setShowWaveform(true);

    toast({
      title: "Simulation complete",
      description: `Simulated ${result.waveform.time.length} time steps`,
    });
  }, [components, wires, isSimulating, toast]);

  const handleStepSimulation = useCallback(() => {
    const result = simulateCircuit(components, wires, 1);
    setWaveformData(result.waveform);
    setShowWaveform(true);
  }, [components, wires]);

  const handleReset = useCallback(() => {
    setIsSimulating(false);
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        value: c.type === "input" ? 0 : undefined,
        state: {},
      }))
    );
    setWaveformData(null);
  }, []);

  const handleSave = useCallback(() => {
    const circuit: Circuit = {
      name: `Circuit ${new Date().toISOString()}`,
      components,
      wires,
    };
    saveCircuitMutation.mutate(circuit);
  }, [components, wires, saveCircuitMutation]);

  const handleExportPNG = useCallback(async () => {
    try {
      const canvasElement = document.querySelector('canvas');
      if (!canvasElement) {
        toast({ title: "No canvas found to export", variant: "destructive" });
        return;
      }
      const canvas = await html2canvas(canvasElement.parentElement as HTMLElement);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "circuit.png";
      link.href = url;
      link.click();
      toast({ title: "Circuit exported as PNG" });
    } catch (error) {
      toast({ title: "Failed to export circuit", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette onAddComponent={handleAddComponent} />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isSimulating ? "destructive" : "default"}
                onClick={handleRunSimulation}
                data-testid="button-run-simulation"
              >
                {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isSimulating ? "Pause" : "Run"}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleStepSimulation} data-testid="button-step">
                <SkipForward className="w-4 h-4 mr-2" />
                Step
              </Button>
              <Button size="sm" variant="secondary" onClick={handleReset} data-testid="button-reset">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} data-testid="button-zoom-in">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} data-testid="button-zoom-out">
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <Label className="text-sm text-muted-foreground">Speed:</Label>
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  min={1}
                  max={100}
                  step={1}
                  className="w-32"
                  data-testid="slider-speed"
                />
              </div>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button size="sm" variant="secondary" onClick={handleSave} data-testid="button-save">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={handleExportPNG} data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <CircuitCanvas
              components={components}
              wires={wires}
              selectedComponent={selectedComponent}
              zoom={zoom}
              pan={pan}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={handleUpdateComponent}
              onDeleteComponent={handleDeleteComponent}
              onAddWire={handleAddWire}
              onDeleteWire={handleDeleteWire}
              onPanChange={setPan}
            />
          </div>

          {showWaveform && waveformData && (
            <div className="border-t border-border h-64">
              <WaveformViewer data={waveformData} onClose={() => setShowWaveform(false)} />
            </div>
          )}
        </div>

        <PropertiesPanel
          component={selectedComponent}
          onUpdate={handleUpdateComponent}
          onDelete={handleDeleteComponent}
        />
      </div>
    </div>
  );
}
