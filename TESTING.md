# LogicPulse Circuit Simulator - Testing Guide

## ✅ Testing Checklist

### 1. Basic Functionality Tests

#### Test 1: Component Addition
- [ ] Click on any component in the left palette
- [ ] Component should appear on the canvas with proper symbol
- [ ] Component should be visible with gradient background
- [ ] Toast notification should appear confirming addition

#### Test 2: Component Movement
- [ ] Click and drag a component
- [ ] Component should move smoothly
- [ ] Component should snap to grid (16px)
- [ ] Component should stay selected (blue border)

#### Test 3: Component Selection
- [ ] Click on a component
- [ ] Blue selection border should appear
- [ ] Properties panel on right should show component details
- [ ] Component label should be editable

#### Test 4: Component Deletion
- [ ] Select a component
- [ ] Press Delete key
- [ ] Component should disappear
- [ ] Connected wires should also be removed

### 2. Wiring Tests

#### Test 5: Create Wire
- [ ] Add two components (e.g., Input and LED)
- [ ] Click on green output pin of first component
- [ ] Green dashed line should follow mouse
- [ ] Click on blue input pin of second component
- [ ] Wire should be created with blue curve
- [ ] Wire should connect the two components

#### Test 6: Cancel Wiring
- [ ] Click on an output pin
- [ ] Press Escape key
- [ ] Wiring mode should cancel
- [ ] No wire should be created

#### Test 7: Multiple Wires
- [ ] Create multiple wires between different components
- [ ] All wires should be visible
- [ ] Wires should not overlap components
- [ ] Wires should use bezier curves

### 3. Simulation Tests

#### Test 8: Simple Circuit (Half Adder)
**Setup:**
1. Add 2 Input components
2. Add 1 XOR gate
3. Add 1 AND gate
4. Add 2 LED components
5. Wire: Input1 → XOR input 0, Input2 → XOR input 1
6. Wire: Input1 → AND input 0, Input2 → AND input 1
7. Wire: XOR output → LED1 input
8. Wire: AND output → LED2 input

**Test:**
- [ ] Click on Input1, set value to 1 in properties
- [ ] Click Run button
- [ ] LED1 should light up (Sum = 1)
- [ ] LED2 should stay off (Carry = 0)
- [ ] Set Input2 to 1
- [ ] Click Run again
- [ ] LED1 should turn off (Sum = 0)
- [ ] LED2 should light up (Carry = 1)

#### Test 9: Clock and Flip-Flop
**Setup:**
1. Add Clock component
2. Add D Flip-Flop
3. Add Input component
4. Add 2 LEDs
5. Wire: Clock → DFF clock input
6. Wire: Input → DFF data input
7. Wire: DFF Q output → LED1
8. Wire: DFF Q̄ output → LED2

**Test:**
- [ ] Set Input value to 1
- [ ] Click Run
- [ ] LEDs should toggle with clock cycles
- [ ] Q and Q̄ should be complementary

#### Test 10: Counter Circuit
**Setup:**
1. Add Clock component
2. Add 4-bit Counter
3. Add 4 LEDs
4. Wire: Clock → Counter clock input
5. Wire: Counter outputs → LEDs

**Test:**
- [ ] Click Run
- [ ] LEDs should count in binary (0000, 0001, 0010, etc.)
- [ ] Counter should reset after 15 (1111)

### 4. Component-Specific Tests

#### Test 11: Logic Gates
Test each gate type:
- [ ] AND: Output 1 only when both inputs are 1
- [ ] OR: Output 1 when any input is 1
- [ ] NOT: Output opposite of input
- [ ] NAND: Output 0 only when both inputs are 1
- [ ] NOR: Output 0 when any input is 1
- [ ] XOR: Output 1 when inputs are different
- [ ] XNOR: Output 1 when inputs are same

#### Test 12: Passive Components
- [ ] Resistor: Passes signal through
- [ ] Capacitor: Passes signal through
- [ ] Inductor: Passes signal through
- [ ] Diode: Only passes positive signals

#### Test 13: Active Components
- [ ] NPN Transistor: Conducts when base is high
- [ ] PNP Transistor: Conducts when base is low
- [ ] MOSFET-N: Conducts when gate is high
- [ ] MOSFET-P: Conducts when gate is low
- [ ] Op-Amp: Outputs based on input difference
- [ ] Relay: Switches based on coil input

#### Test 14: Power Components
- [ ] Battery: Always outputs 1
- [ ] VCC: Always outputs 1
- [ ] Ground: No output

#### Test 15: I/O Components
- [ ] Switch: Toggle value in properties
- [ ] Button: Toggle value in properties
- [ ] LED: Lights up when input is 1
- [ ] Buzzer: Activates when input is 1
- [ ] Lamp: Lights up when input is 1
- [ ] Motor: Activates when input is 1

### 5. UI/UX Tests

#### Test 16: Zoom and Pan
- [ ] Click zoom in button (+)
- [ ] Canvas should zoom in
- [ ] Click zoom out button (-)
- [ ] Canvas should zoom out
- [ ] Right-click and drag
- [ ] Canvas should pan

#### Test 17: Save and Load
- [ ] Create a circuit
- [ ] Click Save button
- [ ] Navigate to Projects tab
- [ ] Circuit should appear in list
- [ ] Click on saved circuit
- [ ] Circuit should load on canvas

#### Test 18: Export
- [ ] Create a circuit
- [ ] Click Export PNG button
- [ ] PNG file should download
- [ ] Image should show the circuit

#### Test 19: Waveform Viewer
- [ ] Create a circuit with clock
- [ ] Click Run
- [ ] Waveform panel should appear at bottom
- [ ] Waveforms should show signal changes over time
- [ ] Can toggle signal visibility

### 6. Performance Tests

#### Test 20: Many Components
- [ ] Add 20+ components to canvas
- [ ] All components should render properly
- [ ] No lag when dragging components
- [ ] Simulation should run smoothly

#### Test 21: Complex Circuit
- [ ] Create circuit with 10+ gates and wires
- [ ] All wires should render correctly
- [ ] Simulation should produce correct results
- [ ] No visual glitches

### 7. Error Handling Tests

#### Test 22: Invalid Connections
- [ ] Try to connect output to output
- [ ] Should not create wire
- [ ] Try to connect input to input
- [ ] Should not create wire

#### Test 23: Circular Dependencies
- [ ] Create a wire loop (A → B → A)
- [ ] Simulation should handle gracefully
- [ ] No infinite loops or crashes

### 8. Browser Compatibility

#### Test 24: Different Browsers
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test in Safari (if available)
- [ ] All features should work consistently

### 9. Responsive Design

#### Test 25: Window Resize
- [ ] Resize browser window
- [ ] Canvas should resize properly
- [ ] Components should remain visible
- [ ] UI should remain usable

## 🐛 Known Issues to Check

1. **Component Visibility**: All components should be clearly visible with proper symbols
2. **Wire Rendering**: Wires should not overlap components
3. **Simulation Accuracy**: Logic gates should produce correct outputs
4. **Performance**: No lag with 50+ components
5. **Memory Leaks**: No memory issues after extended use

## ✅ Success Criteria

The circuit simulator is working perfectly if:
- ✅ All 62 components are available and visible
- ✅ Components can be added, moved, and deleted
- ✅ Wires can be created between components
- ✅ Simulation produces correct results
- ✅ UI is responsive and smooth
- ✅ No console errors
- ✅ Save/load functionality works
- ✅ Export to PNG works
- ✅ Waveform viewer displays correctly

## 🚀 Quick Test Circuit

**Simple LED Test:**
1. Add Input component
2. Add LED component
3. Wire: Input output → LED input
4. Set Input value to 1
5. Click Run
6. LED should light up (red)

**Expected Result:** LED turns red when input is 1, stays off when input is 0.

If this works, the basic functionality is confirmed! ✅
