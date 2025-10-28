# LogicPulse Mini-Sim

## Project Overview

LogicPulse is a comprehensive browser-based circuit simulator with visual circuit building and Verilog compilation capabilities. It provides an educational platform for learning digital logic design with real-time simulation and waveform visualization.

## Architecture

### Frontend (React + Vite + Tailwind CSS)
- **Simulator Page**: Visual circuit builder with drag-drop components, interactive canvas, and properties panel
- **Verilog Editor**: Monaco-based code editor with syntax highlighting
- **Projects Page**: Project management and file listing
- **Docs Page**: Comprehensive documentation

### Backend (Express.js)
- RESTful API for Verilog compilation and simulation
- Project storage and management
- VCD parser for waveform data

### Components Available
- **Logic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR
- **I/O**: Input, Output, LED, Clock
- **Flip-Flops**: D, T, JK, SR
- **Multiplexers**: 2:1, 4:1 MUX, 1:2, 1:4 DEMUX
- **Encoders/Decoders**: 2:4, 3:8 Decoder, 4:2, 8:3 Encoder
- **Sequential**: 4-bit Counter, 4-bit Register

## Data Models

### Circuit
- Components: Array of circuit components with position, type, and state
- Wires: Connections between component pins
- Metadata: Circuit name, creation date

### VerilogFile
- Code: Verilog source code
- Compilation results: stdout/stderr from iverilog
- Simulation results: VCD or waveform JSON

### WaveformData
- Time array: Timestamps for simulation steps
- Signals: Signal name to value array mapping

## API Endpoints

- `GET /api/status` - Health check
- `POST /api/compile` - Compile Verilog (uses iverilog or fallback)
- `POST /api/simulate` - Run simulation and generate waveforms
- `POST /api/parse-vcd` - Convert VCD to JSON
- `GET /api/projects` - List all projects
- `POST /api/projects/save` - Save circuit or Verilog file
- `GET /api/projects/:id` - Load project
- `DELETE /api/projects/:id` - Delete project

## Design System

### Colors (Dark Theme with Neon-Blue Accents)
- **Background**: Navy blue (hsl(220, 25%, 8%))
- **Card**: Slightly elevated navy (hsl(220, 22%, 12%))
- **Primary**: Bright neon blue (hsl(200, 100%, 60%))
- **Accent**: Same as primary for consistency
- **Borders**: Subtle gray-blue (hsl(220, 20%, 18%))

### Typography
- **Primary Font**: Inter (UI and body text)
- **Monospace Font**: JetBrains Mono (code editor, waveforms, technical data)

### Component Spacing
- **Small**: 8px (component gaps)
- **Medium**: 16px (section padding)
- **Large**: 24px (page margins)

## Simulation Engine

### Client-Side Simulation
The circuit simulator runs entirely in the browser using a JavaScript simulation engine:
- Event-driven discrete simulation
- TTL-level boolean logic
- Clock tick propagation
- Sequential circuit state management
- Waveform data generation

### Verilog Simulation
1. **Primary**: Uses iverilog + vvp when available
2. **Fallback**: JavaScript simulator for basic Verilog constructs

## Development Notes

### Current Status
- ✅ Frontend UI complete with all pages and components
- ⏳ Backend API endpoints need implementation
- ⏳ Verilog fallback simulator needs implementation
- ⏳ Sample projects need to be created

### TODO List
- Implement backend API routes
- Create Verilog fallback simulator
- Add sample circuits and Verilog templates
- Implement project save/load functionality
- Add VCD parser implementation
- Test iverilog integration (if available)

### Future Enhancements
- Authentication & cloud storage (Supabase)
- Job queue for long simulations (Bull/Redis)
- Waveform measurement tools
- Circuit-to-Verilog export
- Unit tests for simulation engine
- WebAssembly simulator for performance

## Running the Project

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Monaco Editor
- HTML5 Canvas
- TanStack Query
- Wouter (routing)

### Backend
- Node.js
- Express
- child_process (for iverilog)
- In-memory storage (with file system backup)

## File Structure

```
/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── simulator/ # Simulator-specific components
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── index.css      # Global styles
├── server/                # Backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage
│   └── data/              # Saved projects
├── shared/                # Shared types
│   └── schema.ts          # Data models
└── README.md              # User documentation
```

## Notes for AI Assistants

When working on this project:
- The frontend is feature-complete and follows the dark theme with neon-blue accents
- Backend routes need full implementation
- Verilog fallback simulator is critical for demo without iverilog
- All components use Shadcn UI with proper theming
- Dark mode is enabled by default (class="dark" on html)
- Test data should be realistic circuit examples
