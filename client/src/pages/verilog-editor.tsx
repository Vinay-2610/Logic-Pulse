import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, Zap, FileCode } from "lucide-react";
import { WaveformViewer } from "@/components/simulator/waveform-viewer";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { CompileResult, SimulationResult } from "@shared/schema";

const sampleVerilogCode = `// 4-bit Counter Example
module counter_4bit (
  input clk,
  input rst,
  output reg [3:0] count
);

  always @(posedge clk or posedge rst) begin
    if (rst)
      count <= 4'b0000;
    else
      count <= count + 1;
  end

endmodule

// Testbench
module tb_counter;
  reg clk, rst;
  wire [3:0] count;

  counter_4bit uut (
    .clk(clk),
    .rst(rst),
    .count(count)
  );

  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  initial begin
    rst = 1;
    #10 rst = 0;
    #200 $finish;
  end

endmodule`;

export default function VerilogEditor() {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(sampleVerilogCode);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [waveformData, setWaveformData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("console");

  useEffect(() => {
    const loadedVerilog = localStorage.getItem("loadedVerilog");
    if (loadedVerilog) {
      try {
        const verilogCode = JSON.parse(loadedVerilog);
        setCode(verilogCode);
        localStorage.removeItem("loadedVerilog");
        toast({ title: "Verilog code loaded from projects" });
      } catch (error) {
        console.error("Failed to load Verilog:", error);
      }
    }
  }, [toast]);

  const compileMutation = useMutation<CompileResult, Error, string>({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "verilog", code }),
      });
      if (!response.ok) throw new Error("Compilation failed");
      return response.json();
    },
    onSuccess: (data) => {
      setConsoleOutput((prev) => [
        ...prev,
        `[COMPILE] ${data.status === "ok" ? "✓ Success" : "✗ Error"}`,
        ...(data.stdout ? [data.stdout] : []),
        ...(data.stderr ? [data.stderr] : []),
        ...(data.message ? [data.message] : []),
        ...(data.usingFallback ? ["⚠ Using fallback simulator"] : []),
      ]);
      setActiveTab("console");
      toast({
        title: data.status === "ok" ? "Compilation successful" : "Compilation failed",
        variant: data.status === "ok" ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setConsoleOutput((prev) => [...prev, `[ERROR] ${error.message}`]);
      toast({ title: "Compilation error", variant: "destructive" });
    },
  });

  const simulateMutation = useMutation<SimulationResult, Error, string>({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "verilog", code }),
      });
      if (!response.ok) throw new Error("Simulation failed");
      return response.json();
    },
    onSuccess: (data) => {
      setConsoleOutput((prev) => [
        ...prev,
        `[SIMULATE] ${data.status === "ok" ? "✓ Success" : "✗ Error"}`,
        ...(data.message ? [data.message] : []),
      ]);
      if (data.waveform) {
        setWaveformData(data.waveform);
        setActiveTab("waveform");
      }
      toast({
        title: data.status === "ok" ? "Simulation successful" : "Simulation failed",
        variant: data.status === "ok" ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setConsoleOutput((prev) => [...prev, `[ERROR] ${error.message}`]);
      toast({ title: "Simulation error", variant: "destructive" });
    },
  });

  const handleCompile = () => {
    setConsoleOutput([]);
    compileMutation.mutate(code);
  };

  const handleSimulate = () => {
    setConsoleOutput([]);
    simulateMutation.mutate(code);
  };

  const saveMutation = useMutation({
    mutationFn: async (verilogCode: string) => {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Verilog ${new Date().toISOString()}`,
          type: "verilog",
          content: verilogCode,
        }),
      });
      if (!response.ok) throw new Error("Failed to save Verilog");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Verilog code saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save Verilog code", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(code);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Verilog Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCompile}
            disabled={compileMutation.isPending}
            data-testid="button-compile"
          >
            <Zap className="w-4 h-4 mr-2" />
            {compileMutation.isPending ? "Compiling..." : "Compile"}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleSimulate}
            disabled={simulateMutation.isPending}
            data-testid="button-simulate"
          >
            <Play className="w-4 h-4 mr-2" />
            {simulateMutation.isPending ? "Simulating..." : "Simulate"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleSave} data-testid="button-save-verilog">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 border-b border-border">
          <Editor
            height="100%"
            defaultLanguage="verilog"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={(editor) => (editorRef.current = editor)}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "JetBrains Mono, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        <div className="h-80 border-t border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pt-2 border-b border-border">
              <TabsList>
                <TabsTrigger value="console" data-testid="tab-console">Console</TabsTrigger>
                <TabsTrigger value="waveform" data-testid="tab-waveform">Waveform</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="console" className="flex-1 overflow-hidden mt-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm space-y-1">
                  {consoleOutput.length === 0 ? (
                    <p className="text-muted-foreground">Console output will appear here...</p>
                  ) : (
                    consoleOutput.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("[ERROR]")
                            ? "text-destructive"
                            : line.startsWith("[COMPILE]") || line.startsWith("[SIMULATE]")
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }
                        data-testid={`console-line-${i}`}
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="waveform" className="flex-1 overflow-hidden mt-0 p-0">
              {waveformData ? (
                <WaveformViewer data={waveformData} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No waveform data available. Run a simulation first.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
