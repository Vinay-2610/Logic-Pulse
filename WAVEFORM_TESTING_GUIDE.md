# Waveform Testing Guide

## Issue Fixed
The waveforms were showing as flat lines because:
1. Component states weren't being reset between simulations
2. Components weren't evaluated in the correct order
3. LED and output signals weren't being recorded properly

## Changes Made
1. **State Reset** - Component states are now reset before each simulation
2. **Evaluation Order** - Components are sorted (inputs → gates → outputs)
3. **Signal Recording** - All component types now properly record their signals
4. **Debug Logging** - Added console logs to help identify issues

## How to Test Waveforms

### Test 1: Clock + LED (Simplest Test)
1. Go to Simulator page
2. Load sample: "Clock + LED"
3. Click "Run Simulation"
4. **Expected**: Clock signal should toggle between 0 and 1, LED should follow

### Test 2: Half Adder
1. Load sample: "Half Adder"
2. Toggle input A to HIGH (1)
3. Toggle input B to HIGH (1)
4. Click "Run Simulation"
5. **Expected**: Sum and Carry outputs should show logic patterns

### Test 3: SR Latch
1. Load sample: "SR Latch"
2. Toggle S (Set) to HIGH
3. Click "Run Simulation"
4. **Expected**: Q output should go HIGH and stay HIGH

### Test 4: Custom Circuit with Clock
1. Add a Clock component
2. Add an LED component
3. Wire Clock output to LED input
4. Click "Run Simulation"
5. **Expected**: Square wave pattern (alternating 0 and 1)

## Debugging in Browser

### Check Console Logs
Open browser console (F12) and look for:
```
Simulation complete: {
  time: 100,
  signals: 2,
  sampleData: [...]
}

Waveform data received: {
  timeSteps: 100,
  signals: ["Clock", "LED"],
  sampleValues: [
    { name: "Clock", hasChanges: true, sample: [0,1,0,1,0,1...] },
    { name: "LED", hasChanges: true, sample: [0,1,0,1,0,1...] }
  ]
}
```

### What to Look For
- **hasChanges: true** - Signal is changing (good!)
- **hasChanges: false** - Signal is flat (problem!)
- **sample array** - Should show varying values like [0,1,0,1,0,1]

## Common Issues & Solutions

### Issue: All signals show flat lines
**Cause**: No clock or changing inputs in circuit
**Solution**: Add a Clock component or toggle Input values

### Issue: Some signals flat, others working
**Cause**: Components not connected properly
**Solution**: Check wire connections, ensure all components are wired

### Issue: Waveforms not appearing at all
**Cause**: No components in circuit
**Solution**: Add components and wires before simulating

### Issue: Console shows "hasChanges: false"
**Cause**: Signal values aren't changing
**Solution**: 
- Add a Clock component for time-varying signals
- Toggle Input components to different values
- Check that gates have proper inputs

## Verilog Editor Waveforms

The Verilog editor uses a different simulation backend:
- **With iverilog**: Full Verilog simulation (accurate)
- **Without iverilog**: Fallback simulator (limited)

### Test Verilog Waveforms
1. Go to Verilog Editor
2. Load sample: "4-bit Counter"
3. Click "Simulate" (Ctrl+Enter)
4. **Expected**: Counter bits should increment over time

### Verilog Debugging
Check console for:
```
Simulation completed using fallback simulator
```
This means iverilog isn't installed (expected on Render).

## Expected Waveform Patterns

### Clock Signal
```
HIGH ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
LOW       ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
```

### Counter (2-bit)
```
Bit 0: ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
Bit 1:     ▄▄▄▄▄▄▄▄▄     ▄▄▄▄▄▄▄▄▄
```

### AND Gate (A=1, B=toggle)
```
A:     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
B:     ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
Out:   ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
```

## Performance Notes

- **100 time steps** = default simulation length
- **Zoom In/Out** = adjust time scale
- **Toggle signals** = show/hide individual signals
- **Multiple signals** = different colors for each

## After Deployment

Once Render redeploys (2-3 minutes):
1. Visit https://logic-pulse.onrender.com
2. Test with Clock + LED sample
3. Check browser console for debug logs
4. Verify waveforms show changing patterns

## Still Having Issues?

If waveforms are still flat after deployment:
1. Check browser console for errors
2. Verify the sample circuit has a Clock component
3. Try creating a simple Clock + LED circuit manually
4. Check that console shows "hasChanges: true"

## Success Criteria

✅ Clock signals toggle between 0 and 1
✅ LED follows input signal
✅ Logic gates show correct truth table patterns
✅ Console shows "hasChanges: true" for active signals
✅ Waveform viewer displays square wave patterns
✅ No flat lines for time-varying signals
