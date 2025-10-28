# LogicPulse Mini-Sim

A browser-based circuit simulator with visual circuit building and Verilog compilation capabilities.

## Features

- **Visual Circuit Builder**: Drag-and-drop interface for creating digital circuits
  - Logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)
  - Flip-flops (D, T, JK, SR)
  - Multiplexers and Demultiplexers
  - Encoders and Decoders
  - Counters and Registers
  - Input/Output components, LEDs, Clock sources

- **Real-time Simulation**: Client-side circuit simulation with waveform visualization
  - Step-by-step or continuous simulation modes
  - Adjustable simulation speed
  - Interactive waveform viewer with zoom and pan
  - Export circuits as PNG images

- **Verilog Editor**: Full-featured code editor with Monaco
  - Syntax highlighting for Verilog
  - Compile and simulate Verilog code
  - Console output for compilation errors and warnings
  - Waveform visualization from simulation results

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

LogicPulse comes with preloaded sample circuits and Verilog templates:
- 4-bit Counter
- Half Adder
- JK Flip-Flop
- Traffic Light Controller

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

## TODO: Future Enhancements

- [ ] Replace fallback simulator with full iverilog integration when environment supports it
- [ ] Add job queue (Bull / Redis) for long-running simulations
- [ ] Add authentication & project storage (Supabase)
- [ ] Add waveform zoom sliders & marker cursors for precise timing analysis
- [ ] Add unit tests for VCD parser & simulation fallback
- [ ] Circuit-to-Verilog export functionality
- [ ] Verilog-to-circuit visual import
- [ ] Advanced waveform analysis tools (measurements, signal comparison)
- [ ] Support for more complex Verilog constructs
- [ ] WebAssembly-based simulator for improved performance

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

## Support

For questions or issues, please refer to the documentation in the Docs tab within the application.
