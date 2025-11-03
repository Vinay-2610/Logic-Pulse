import type { WaveformData } from "@shared/schema";

export function simulateVerilogFallback(code: string, timeSteps: number = 100): WaveformData {
  const time: number[] = [];
  const signals: Record<string, (number | string)[]> = {};

  const modules = parseModules(code);
  
  if (modules.length === 0) {
    throw new Error("No valid Verilog modules found. Please check your syntax. Make sure you have 'module <name> ... endmodule' structure.");
  }
  
  const testbench = modules.find(m => m.name.toLowerCase().includes('tb') || m.name.includes('test'));
  
  if (!testbench) {
    throw new Error(`No testbench module found. Please add a testbench module with 'tb' or 'test' in its name. Found modules: ${modules.map(m => m.name).join(', ')}`);
  }

  const registers = parseRegisters(testbench.body);
  const wires = parseWires(testbench.body);
  const clockSignals = findClockSignals(testbench.body);

  const state: Record<string, number> = {};
  
  for (const reg of registers) {
    state[reg] = 0;
    signals[reg] = [];
  }
  
  for (const wire of wires) {
    state[wire] = 0;
    signals[wire] = [];
  }

  for (let t = 0; t < timeSteps; t++) {
    time.push(t);

    // Generate clock signals with proper period (toggle every 5 time steps for visible square waves)
    for (const clk of clockSignals) {
      state[clk] = Math.floor(t / 5) % 2;
    }

    // Reset signal: high for first 10 time steps, then low
    const resetSignals = findResetSignals(testbench.body);
    for (const rst of resetSignals) {
      if (t < 10) {
        state[rst] = 1;
      } else {
        state[rst] = 0;
      }
    }

    // Simulate counter logic (simple increment on clock edge)
    for (const clk of clockSignals) {
      const prevClk = t > 0 ? Math.floor((t - 1) / 5) % 2 : 0;
      const currClk = Math.floor(t / 5) % 2;
      
      // Detect rising edge (0 -> 1 transition)
      if (currClk === 1 && prevClk === 0) {
        // Increment counters on rising edge
        for (const wire of wires) {
          if (wire.includes('count') || wire.includes('q')) {
            const isReset = resetSignals.some(rst => state[rst] === 1);
            if (!isReset) {
              state[wire] = ((state[wire] || 0) + 1) % 2; // Toggle for simple simulation
            }
          }
        }
      }
    }

    // Record all signal values for this time step
    for (const signal in signals) {
      signals[signal].push(state[signal] || 0);
    }
  }

  return { time, signals };
}

function parseModules(code: string): Array<{ name: string; body: string }> {
  const modules: Array<{ name: string; body: string }> = [];
  const moduleRegex = /module\s+(\w+)\s*[^;]*;([\s\S]*?)endmodule/g;
  
  let match;
  while ((match = moduleRegex.exec(code)) !== null) {
    modules.push({
      name: match[1],
      body: match[2],
    });
  }
  
  return modules;
}

function parseRegisters(body: string): string[] {
  const registers: string[] = [];
  const regRegex = /reg\s+(?:\[\d+:\d+\]\s+)?(\w+)/g;
  
  let match;
  while ((match = regRegex.exec(body)) !== null) {
    registers.push(match[1]);
  }
  
  return registers;
}

function parseWires(body: string): string[] {
  const wires: string[] = [];
  const wireRegex = /wire\s+(?:\[\d+:\d+\]\s+)?(\w+)/g;
  
  let match;
  while ((match = wireRegex.exec(body)) !== null) {
    wires.push(match[1]);
  }
  
  return wires;
}

function findClockSignals(body: string): string[] {
  const clocks: string[] = [];
  const clockRegex = /\b(clk|clock|CLK|CLOCK)\b/g;
  const seen = new Set<string>();
  
  let match;
  while ((match = clockRegex.exec(body)) !== null) {
    const signal = match[1];
    if (!seen.has(signal)) {
      clocks.push(signal);
      seen.add(signal);
    }
  }
  
  return clocks;
}

function findResetSignals(body: string): string[] {
  const resets: string[] = [];
  const resetRegex = /\b(rst|reset|RST|RESET)\b/g;
  const seen = new Set<string>();
  
  let match;
  while ((match = resetRegex.exec(body)) !== null) {
    const signal = match[1];
    if (!seen.has(signal)) {
      resets.push(signal);
      seen.add(signal);
    }
  }
  
  return resets;
}

export function compileVerilogFallback(code: string): { status: string; message: string; stderr?: string } {
  try {
    const modules = parseModules(code);
    
    if (modules.length === 0) {
      return {
        status: "error",
        message: "No modules found in Verilog code",
        stderr: "Syntax error: Missing module declaration",
      };
    }

    const hasTestbench = modules.some(m => m.name.toLowerCase().includes('tb') || m.name.includes('test'));
    
    if (!hasTestbench) {
      return {
        status: "warning",
        message: "No testbench found. Simulation may not produce meaningful results.",
        stderr: "Warning: Testbench module not detected",
      };
    }

    return {
      status: "ok",
      message: `Successfully parsed ${modules.length} module(s): ${modules.map(m => m.name).join(', ')}`,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to parse Verilog code",
      stderr: error instanceof Error ? error.message : String(error),
    };
  }
}
