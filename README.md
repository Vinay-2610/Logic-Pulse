# LogicPulse Mini-Sim

A browser-based circuit simulator with visual circuit building and Verilog compilation capabilities.

## Features

- **Visual Circuit Builder**: Drag-and-drop interface for creating digital and analog circuits
  - **Logic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR
  - **Flip-Flops**: D, T, JK, SR
  - **Multiplexers**: 2:1, 4:1 MUX and DEMUX
  - **Encoders/Decoders**: 2:4, 3:8 Decoders and 4:2, 8:3 Encoders
  - **Sequential**: Counters, Registers, Shift Registers
  - **Passive Components**: Resistors, Capacitors, Inductors, Diodes (standard, Zener, Photo)
  - **Active Components**: NPN/PNP Transistors, N/P-Channel MOSFETs, Op-Amps, Relays
  - **Power Sources**: Battery, VCC, Ground
  - **Input/Output**: Inputs, Outputs, LEDs, Switches, Buttons, Clock sources
  - **Output Devices**: Buzzers, Lamps, Motors, 7-Segment Displays
  - **Integrated Circuits**: 555 Timer, Generic ICs

- **Real-time Simulation**: Client-side circuit simulation with professional waveform visualization
  - Step-by-step or continuous simulation modes
  - Adjustable simulation speed
  - Interactive waveform viewer with individual signal graphs
  - Digital waveform display with step-after transitions
  - Signal selection and color coding
  - Zoom and pan controls for detailed analysis
  - Shows high pulse counts for each signal
  - Export circuits as PNG images

- **Verilog Editor**: Full-featured code editor with Monaco (like EDA Playground)
  - Syntax highlighting for Verilog HDL
  - Compile button to check syntax
  - Simulate button to run testbench
  - Console output for compilation errors and warnings
  - **Professional waveform visualization** from simulation results
  - Oscilloscope-style waveform display (like Falstad/EDA Playground)
  - Multiple signal traces with color coding
  - Time-domain analysis with grid
  - Sample Verilog files included (counter, flip-flop, adder)

- **Project Management**: Save and load circuits and Verilog files
  - Organize multiple projects
  - Load existing projects to continue working

## Quick Start

### Running in Replit

1. Fork this Repl
2. Click the "Run" button or use the Shell to run:
   ```bash
   npm run dev
   ```
3. The application will start on port 5000
4. Navigate to the Simulator tab to build circuits or the Verilog tab to write code

### How to Use the Circuit Simulator

**Adding Components:**
- Click on any component in the left panel to add it to the canvas
- Components will appear at a random position on the canvas

**Wiring Components:**
1. Click on an **output pin** (green circle on the right side of a component)
2. Then click on an **input pin** (blue circle on the left side of another component)
3. A wire will be created connecting the two pins
4. Press **Escape** to cancel wiring

**Moving Components:**
- Click and drag any component to move it around the canvas
- Components snap to a grid for neat alignment

**Editing Components:**
- Click on a component to select it
- Use the Properties panel on the right to edit its properties
- For Input components, you can toggle their value (0 or 1)

**Deleting:**
- Select a component and press **Delete** key to remove it
- Wires connected to deleted components are automatically removed

**Running Simulation:**
- Click the **Run** button to simulate your circuit
- Use **Step** to advance one time step at a time
- Click **Reset** to reset all component states
- View waveforms in the panel that appears at the bottom

**✅ Project Status**: Fully functional! The LogicPulse simulator is ready to use with both visual circuit building and Verilog compilation/simulation capabilities.

### Current Features Working:
- ✅ Server running on port 5000
- ✅ API endpoints for compilation and simulation
- ✅ Component palette with all logic gates and components
- ✅ Circuit canvas with grid and zoom functionality
- ✅ Properties panel for component editing
- ✅ Waveform viewer for simulation results
- ✅ Project save/load functionality
- ✅ Verilog editor with Monaco
- ✅ Fallback simulator when iverilog not available
- ✅ Fixed CSS styling issues
- ✅ Component placement and interaction working
- ✅ Canvas rendering with proper scaling
- ✅ Fixed runtime error by adding missing Tailwind config
- ✅ Resolved Replit plugin conflicts
- ✅ Improved component visibility with gradient backgrounds
- ✅ Components show actual gate symbols matching the palette icons
- ✅ Logic gates display proper shapes (AND, OR, NOT, NAND, NOR, XOR, XNOR)
- ✅ Input components show their value (0 or 1) visually in a circle
- ✅ LED components show on/off state with red indicator
- ✅ Clock components show waveform symbol
- ✅ Flip-flops show type with clock triangle indicator
- ✅ Better selection highlighting with glow effect

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5000`

**Note for Windows users**: The project uses `cross-env` to handle environment variables across platforms, so it should work seamlessly on Windows, macOS, and Linux.

## Architecture

### Frontend (React + Vite + Tailwind CSS)
- `/client/src/pages/simulator.tsx` - Visual circuit builder
- `/client/src/pages/verilog-editor.tsx` - Verilog code editor
- `/client/src/pages/projects.tsx` - Project management
- `/client/src/pages/docs.tsx` - Documentation
- `/client/src/components/simulator/` - Circuit simulator components
- `/client/src/lib/circuit-simulator.ts` - Client-side simulation engine

### Backend (Node.js + Express)
- `/server/routes.ts` - API endpoints
- `/server/data/` - Storage for saved projects and samples

## API Endpoints

- `GET /api/status` - Health check
- `POST /api/compile` - Compile Verilog code
- `POST /api/simulate` - Simulate Verilog code and generate waveforms
- `POST /api/parse-vcd` - Parse VCD files to JSON
- `GET /api/projects` - List saved projects
- `POST /api/projects/save` - Save a circuit or Verilog file
- `GET /api/projects/:id` - Load a specific project
- `DELETE /api/projects/:id` - Delete a project

## Verilog Compilation

### Important: Testbench Requirement

For simulation to work, your Verilog code **must include a testbench module** with 'tb' or 'test' in its name. Example:

```verilog
// Your design module
module and_gate (input a, input b, output y);
  assign y = a & b;
endmodule

// Testbench module (required!)
module tb_and_gate;
  reg a, b;
  wire y;
  
  and_gate uut (.a(a), .b(b), .y(y));
  
  initial begin
    a = 0; b = 0; #10;
    a = 1; b = 1; #10;
    $finish;
  end
endmodule
```

### Using iverilog (Recommended)

If iverilog is installed in your environment, LogicPulse will use it for full Verilog compilation and simulation.

To install iverilog on Replit, you can use the Nix package manager. Add to `replit.nix`:

```nix
{ pkgs }: {
  deps = [
    pkgs.iverilog
  ];
}
```

### Fallback Simulator

When iverilog is not available, LogicPulse uses a JavaScript fallback simulator that supports basic Verilog constructs:
- Module declarations
- Always blocks with posedge/negedge
- Basic operators and assignments
- Register and wire declarations

**Limitations**: The fallback simulator has limited support for advanced Verilog features. For production use, install iverilog.

## Sample Projects

### Circuit Simulator Samples (14 samples - Load from dropdown):
- **AND Gate** - Basic AND logic gate demo
- **OR Gate** - Basic OR logic gate demo
- **NOT Gate** - Basic NOT logic gate demo
- **NAND Gate** - NAND logic gate demo
- **NOR Gate** - NOR logic gate demo
- **XOR Gate** - XOR logic gate demo
- **XNOR Gate** - XNOR logic gate demo
- **Half Adder** - XOR and AND gates demonstrating binary addition
- **Full Adder** - Complete 1-bit adder with carry
- **2:1 Multiplexer** - Data selector circuit
- **2:4 Decoder** - Binary decoder circuit
- **SR Latch** - NOR gate latch showing memory element
- **D Latch** - Data latch with enable
- **Clock + LED** - Simple clock signal visualization

### Verilog Code Samples (19 samples - Load from dropdown):
- **4-bit Counter** - Sequential counter with clock and reset
- **D Flip-Flop** - Basic flip-flop with Q and Q̄ outputs
- **JK Flip-Flop** - Toggle flip-flop with all modes
- **Full Adder** - 1-bit adder with carry in/out
- **4:1 Multiplexer** - Data selector with 2-bit select
- **3-to-8 Decoder** - Binary to one-hot decoder
- **8-to-3 Encoder** - Priority encoder
- **Shift Register** - 4-bit serial-in parallel-out register
- **Simple ALU** - 4-bit arithmetic logic unit (ADD, SUB, AND, OR)
- **4-bit Comparator** - Equality and magnitude comparison
- **Parity Generator** - Even parity generator and checker
- **8x4 RAM** - Simple memory module
- **4-deep FIFO** - First-in-first-out buffer
- **PWM Generator** - Pulse width modulation
- **UART Transmitter** - Simple serial transmitter (8N1)
- **Sequence Detector FSM** - State machine detecting "101" pattern
- **Traffic Light Controller** - FSM-based traffic light system
- **BCD Counter** - Decimal counter (0-9)
- **Gray Code Counter** - Gray code sequence generator

## Development

### Project Structure

```
/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and libraries
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── data/              # Saved projects and samples
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Data models and schemas
└── package.json           # Dependencies and scripts
```

### Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm start` - Start production server

## ⌨️ Keyboard Shortcuts

### Verilog Editor
- `Ctrl/Cmd + Enter` - Run simulation
- `Ctrl/Cmd + Shift + C` - Compile code
- `Ctrl/Cmd + S` - Save file

### Circuit Simulator
- `Delete` - Remove selected component
- `Escape` - Cancel wiring mode
- `Right-click + Drag` - Pan canvas

## 🎯 User Experience Features

- ✅ **Component Search** - Quickly find components by name
- ✅ **Sample Code Loader** - Load example Verilog code (Counter, Flip-Flop, Adder, MUX)
- ✅ **Keyboard Shortcuts** - Fast workflow with hotkeys
- ✅ **Clear Editor** - Quick reset button
- ✅ **Auto-open Waveforms** - Simulation results open automatically
- ✅ **Helpful Tips** - Inline guidance for beginners
- ✅ **Toast Notifications** - Visual feedback for all actions
- ✅ **Responsive Design** - Works on different screen sizes

## TODO: Future Enhancements

- [ ] Replace fallback simulator with full iverilog integration when environment supports it
- [ ] Add undo/redo for circuit operations
- [ ] Add job queue (Bull / Redis) for long-running simulations
- [ ] Add authentication & project storage (Supabase)
- [ ] Add waveform zoom sliders & marker cursors for precise timing analysis
- [ ] Add unit tests for VCD parser & simulation fallback
- [ ] Circuit-to-Verilog export functionality
- [ ] Verilog-to-circuit visual import
- [ ] Advanced waveform analysis tools (measurements, signal comparison)
- [ ] Support for more complex Verilog constructs
- [ ] WebAssembly-based simulator for improved performance
- [ ] Dark/Light theme toggle
- [ ] Component tooltips with descriptions

## Environment Variables

No API keys are required for basic functionality. For future enhancements:

- `SUPABASE_URL` - Supabase project URL (for cloud storage)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (for cloud storage)

## Security Notes

- Never commit secret keys to the repository
- Use environment variables for sensitive data
- The fallback simulator executes user-provided Verilog in a sandboxed environment

## Contributing

This project is designed for educational purposes. Contributions are welcome!

## License

MIT License - See LICENSE file for details

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing procedures and verification steps.

See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for the complete system verification report.

## Support

For questions or issues, please refer to the documentation in the Docs tab within the application.
