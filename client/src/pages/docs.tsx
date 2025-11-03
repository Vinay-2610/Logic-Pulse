import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Docs() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <p className="text-muted-foreground mt-1">Learn how to use LogicPulse circuit simulator</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics of LogicPulse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                LogicPulse is a browser-based circuit simulator that allows you to design, simulate, and analyze
                digital circuits. It also includes a Verilog editor with compilation and simulation capabilities.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Visual circuit builder with drag-and-drop components</li>
                  <li>Real-time circuit simulation with waveform visualization</li>
                  <li>Verilog code editor with syntax highlighting</li>
                  <li>Compile and simulate Verilog code</li>
                  <li>Save and manage multiple projects</li>
                  <li>Export circuits as PNG images</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Circuit Simulator</CardTitle>
              <CardDescription>Build and simulate digital circuits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Component Palette</h4>
                <p className="text-muted-foreground mb-2">
                  The left panel contains all available components organized by category:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Badge variant="secondary">Logic Gates</Badge>
                    <p className="text-xs text-muted-foreground">AND, OR, NOT, NAND, NOR, XOR, XNOR</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary">Input/Output</Badge>
                    <p className="text-xs text-muted-foreground">Input, Output, LED, Clock</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary">Flip-Flops</Badge>
                    <p className="text-xs text-muted-foreground">D, T, JK, SR Flip-Flops</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary">Multiplexers</Badge>
                    <p className="text-xs text-muted-foreground">2:1, 4:1 MUX, 1:2, 1:4 DEMUX</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary">Encoders/Decoders</Badge>
                    <p className="text-xs text-muted-foreground">2:4, 3:8 Decoder, 4:2, 8:3 Encoder</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary">Sequential</Badge>
                    <p className="text-xs text-muted-foreground">4-bit Counter, 4-bit Register</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Building Circuits</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Click on a component in the palette to add it to the canvas</li>
                  <li>Drag components to reposition them (they snap to a grid)</li>
                  <li>Click a component to select it and view/edit its properties</li>
                  <li>Connect components by clicking output pins and dragging to input pins</li>
                  <li>Delete components by selecting them and pressing Delete or using the properties panel</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Simulation Controls</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>Run/Pause:</strong> Start or stop continuous simulation</li>
                  <li><strong>Step:</strong> Advance simulation by one time step</li>
                  <li><strong>Reset:</strong> Reset all component states to initial values</li>
                  <li><strong>Speed:</strong> Adjust simulation speed with the slider</li>
                  <li><strong>Zoom:</strong> Zoom in/out of the canvas</li>
                  <li><strong>Save:</strong> Save the current circuit to projects</li>
                  <li><strong>Export PNG:</strong> Download circuit as an image</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verilog Editor</CardTitle>
              <CardDescription>Write, compile, and simulate Verilog code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The Verilog editor provides a full-featured code editor with syntax highlighting for
                writing hardware description language code.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Editor Features</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Syntax highlighting for Verilog</li>
                  <li>Line numbers and minimap</li>
                  <li>Auto-indentation and code formatting</li>
                  <li>Sample templates to get started</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Compilation & Simulation</h4>
                <p className="text-muted-foreground mb-2">
                  Click <strong>Compile</strong> to check your Verilog code for syntax errors. The console
                  will show compilation output, warnings, and errors.
                </p>
                <p className="text-muted-foreground mb-2">
                  Click <strong>Simulate</strong> to run your Verilog code. The waveform viewer will display
                  signal values over time, allowing you to verify circuit behavior.
                </p>
                <div className="bg-muted/30 p-3 rounded-md mt-2">
                  <p className="text-xs font-mono">
                    <strong>Note:</strong> If iverilog is not installed, LogicPulse will use a JavaScript
                    fallback simulator that supports basic Verilog constructs.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 text-orange-500">⚠️ Common Issues & Solutions</h4>
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                    <p className="font-semibold text-sm mb-1">Error: "No testbench module found"</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Your code must include a testbench module with 'tb' or 'test' in its name.
                    </p>
                    <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
{`module tb_mydesign;  // ✓ Correct
  // testbench code here
endmodule`}
                    </pre>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                    <p className="font-semibold text-sm mb-1">Error: "No valid Verilog modules found"</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Check your syntax. Make sure you have proper module...endmodule structure.
                    </p>
                    <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
{`module mydesign (...);
  // design code
endmodule  // ← Don't forget this!`}
                    </pre>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-md">
                    <p className="font-semibold text-sm mb-1">💡 Tip: Complete Example</p>
                    <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto mt-2">
{`// Design module
module and_gate (input a, input b, output y);
  assign y = a & b;
endmodule

// Testbench (required!)
module tb_and_gate;
  reg a, b;
  wire y;
  
  and_gate uut (.a(a), .b(b), .y(y));
  
  initial begin
    a = 0; b = 0; #10;
    a = 1; b = 1; #10;
    $finish;
  end
endmodule`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waveform Viewer</CardTitle>
              <CardDescription>Visualize signal timing diagrams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                The waveform viewer displays digital signals as timing diagrams, showing how signal values
                change over time.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Controls</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Zoom:</strong> Use the +/- buttons to zoom in/out of the timeline</li>
                  <li><strong>Scroll:</strong> Use mouse wheel to scroll horizontally through time</li>
                  <li><strong>Signals:</strong> Each signal is displayed on its own row with its name on the left</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Manage your saved circuits and Verilog files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                All saved circuits and Verilog files are stored in the Projects page. You can load, delete,
                and manage your projects from here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delete component</span>
                    <Badge variant="outline" className="font-mono">Delete</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pan canvas</span>
                    <Badge variant="outline" className="font-mono">Right Click + Drag</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Save project</span>
                    <Badge variant="outline" className="font-mono">Ctrl+S</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">TODO: Future Enhancements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Replace fallback simulator with full iverilog integration</li>
                <li>Add job queue for long-running simulations</li>
                <li>Add authentication & cloud storage with Supabase</li>
                <li>Add waveform measurement tools and cursors</li>
                <li>Add circuit-to-Verilog export functionality</li>
                <li>Add unit tests for simulation engine</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
