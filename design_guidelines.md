# LogicPulse Mini-Sim - Design Guidelines

## Design Approach

**Selected Approach**: Design System (Utility-Focused)
- **Justification**: Educational circuit simulator prioritizing functionality, information density, and technical precision over visual storytelling
- **Primary Reference**: Material Design with Carbon Design influences for technical/engineering applications
- **Key Principles**: Clarity over decoration, efficient space usage, technical precision, educational accessibility

---

## Typography System

### Font Stack
- **Primary**: Inter (sans-serif) - excellent for UI elements, data, and technical content
- **Monospace**: JetBrains Mono - for Verilog code editor and technical displays
- **CDN**: Google Fonts

### Type Scale & Hierarchy
- **App Title/Logo**: text-2xl font-bold (24px)
- **Tab Navigation**: text-base font-medium (16px)
- **Section Headers**: text-lg font-semibold (18px)
- **Component Labels**: text-sm font-medium (14px)
- **Body Text**: text-sm (14px)
- **Helper Text/Metadata**: text-xs (12px)
- **Code Editor**: text-sm monospace (14px) with 1.6 line-height

---

## Layout System

### Spacing Primitives
**Core Units**: Tailwind spacing of 2, 4, 6, 8, 12, 16
- **Micro spacing** (gaps, padding): p-2, gap-2, m-2
- **Component spacing**: p-4, gap-4, m-4
- **Section spacing**: p-6, gap-6, p-8
- **Major layout divisions**: p-12, p-16

### Grid Structure

**Application Shell**:
- Fixed top navbar: h-14 with px-6
- Main content area: Full height minus navbar
- No max-width constraint - use full viewport

**Simulator Layout** (Three-panel design):
- Left Palette: w-64 fixed width, overflow-y-auto
- Center Canvas: flex-1 (remaining space), relative positioning
- Right Properties: w-80 fixed width, overflow-y-auto
- Bottom Controls: h-16 fixed height, full width

**Verilog Layout** (Split-view design):
- Top: Editor pane - h-2/3 of available space
- Bottom: Split between console (w-1/2) and waveform viewer (w-1/2)
- Resizable divider between top/bottom sections

---

## Component Library

### Navigation & Structure

**Top Navbar**:
- Horizontal flex layout with items-center
- Logo/title on left (gap-3 from edge)
- Tab group in center (gap-6 between tabs)
- Utility buttons on right (gap-4 between icons)
- Border-b separator (border-2)

**Tab Navigation**:
- Inline flex layout with gap-2
- Each tab: px-4 py-2 rounded-t-lg
- Active state: border-b-3 indicator
- Transition duration-200

**Component Palette** (Left Panel):
- Grouped sections with collapsible headers
- Section header: py-3 px-4 with chevron icon
- Component grid: grid-cols-2 gap-2 p-4
- Each component card: aspect-square p-3 rounded-lg

**Canvas Area**:
- Relative container with overflow-hidden
- Grid background pattern (optional visual aid)
- Transform origin for zoom/pan
- Minimum size indicators at edges

**Properties Panel** (Right Panel):
- Sticky header showing selected component name
- Form sections with space-y-4
- Label-input pairs with gap-2
- Input fields: w-full px-3 py-2 rounded-md

### Interactive Elements

**Component Cards** (Draggable):
- Size: min-h-16 with flex column layout
- Icon container: h-10 w-10 mx-auto
- Label: text-xs text-center truncate
- Hover state with scale-105 transform
- Border: border-2 rounded-lg

**Buttons**:
- **Primary Action**: px-6 py-2.5 rounded-lg font-medium
- **Secondary Action**: px-4 py-2 rounded-md font-medium border-2
- **Icon Only**: p-2 rounded-md (for toolbar actions)
- **Group Buttons**: flex gap-2 with rounded-lg container

**Control Panel** (Bottom):
- Flex layout with justify-between
- Left: Simulation controls (Play/Pause/Step/Reset) with gap-2
- Center: Speed slider with labels
- Right: Export/Save actions with gap-2

### Form Elements

**Input Fields**:
- Text input: px-3 py-2 rounded-md border-2 w-full
- Number input: w-24 for compact numeric values
- Checkbox: h-5 w-5 rounded
- Select dropdown: px-3 py-2 rounded-md with chevron icon

**Input Groups**:
- Label above input with gap-1.5
- Helper text below with text-xs and mt-1
- Error state with border-2 and text-xs error message

### Data Display

**Waveform Viewer**:
- Canvas-based rendering with fixed-height rows
- Signal labels: w-32 fixed width on left
- Timeline header: h-8 with tick marks
- Signal rows: h-12 each with gap-1 between
- Zoom controls: absolute positioned top-right corner

**Console Output**:
- Monospace font with text-sm
- Scrollable container with max-h-64
- Line numbers in gutter (w-12)
- Auto-scroll to bottom on new output

**Component Properties**:
- Key-value pairs in dl/dt/dd structure
- dt (label): text-sm font-medium
- dd (value): text-sm with ml-4
- Divider between groups: border-t with my-3

### Overlays & Modals

**Modal Dialog**:
- Backdrop: fixed inset-0
- Content: max-w-2xl mx-auto mt-20
- Padding: p-6
- Header: pb-4 border-b
- Body: py-4
- Footer: pt-4 border-t with button group

**Context Menu** (Right-click):
- Absolute positioning
- min-w-48 with rounded-lg
- Menu items: px-4 py-2 with gap-3 for icon+text
- Divider: border-t my-1

**Tooltip**:
- Absolute positioning with z-50
- max-w-xs with px-3 py-2 rounded-md
- Text: text-xs
- Arrow indicator (8px triangle)

---

## Specialized Components

### Circuit Canvas Features
- **Grid System**: 16px grid squares for snap-to-grid
- **Wire Routing**: 2px stroke width, rounded line caps
- **Connection Points**: 6px circle indicators
- **Selection Box**: 2px dashed border with 8px corner handles
- **Component Sizing**: Minimum 48x48px for touch targets

### Monaco Editor Integration
- **Container**: Full height with border-2 rounded-lg
- **Gutter**: Line numbers with 48px width
- **Minimap**: w-20 on right edge
- **Settings**: Tab size 2, font size 14px

### Waveform Timing Display
- **Time Scale**: Adjustable from 1ns to 1s per division
- **Signal Height**: 48px per signal with 4px gap
- **Transition Edges**: Sharp corners for digital signals
- **Cursor/Marker**: 1px vertical line with label box

---

## Responsive Behavior

### Breakpoints
- **Desktop (default)**: Three-panel layout as specified
- **Tablet (< 1024px)**: Stack properties panel below canvas
- **Mobile (< 768px)**: Single column, collapsible panels with drawer pattern

### Mobile Adaptations
- Canvas becomes full-width with overlay palette (drawer)
- Bottom controls become sticky footer
- Properties panel accessible via floating button
- Waveform viewer switches to horizontal scroll

---

## Accessibility Features

**Keyboard Navigation**:
- Tab order: Navbar → Palette → Canvas → Properties → Controls
- Spacebar: Toggle play/pause
- Arrow keys: Pan canvas when focused
- +/- keys: Zoom in/out
- Escape: Clear selection

**Screen Reader Support**:
- ARIA labels on all icon-only buttons
- Role attributes for canvas (application) and custom widgets
- Live regions for simulation state announcements
- Landmark roles for major sections

**Focus States**:
- Visible focus ring: ring-2 ring-offset-2
- High contrast focus indicators
- Skip to content links

---

## Animation & Transitions

**Minimal Motion Philosophy**: Use sparingly for functional feedback only

**Permitted Animations**:
- Button states: transition-colors duration-150
- Panel expand/collapse: transition-all duration-200
- Component drag preview: transition-opacity duration-100
- Signal pulse in waveform: subtle opacity pulse for active clock

**No Decorative Animations**: Avoid gratuitous motion that distracts from technical work

---

## Images

**No Hero Images**: This is a utility application, not a marketing site

**Icon Usage**:
- Heroicons library via CDN for all UI icons
- Component palette icons: 24x24px custom SVG symbols (AND gate, OR gate, flip-flop diagrams)
- Placeholder comment format: `<!-- CUSTOM ICON: D Flip-Flop schematic symbol -->`

**Diagram Examples** (Optional):
- Small tutorial overlays showing how to wire components (max-w-md)
- Sample circuit thumbnails in project list (w-32 h-24)