# How to Use Waveforms in LogicPulse

## ✅ Fixed: Waveforms Now Work Like Falstad!

The waveform viewer now requires a **Clock component** to generate time-varying signals, just like Falstad Circuit Simulator.

---

## 🎯 Quick Start: See Waveforms in 3 Steps

### Method 1: Load a Sample Circuit (Easiest)

1. Go to **Simulator** page
2. Click **"Load Sample"** dropdown
3. Select **"Clock + LED"**
4. Click **"Run Simulation"** button
5. ✅ See the waveform with square wave pattern!

### Method 2: Build Your Own Circuit

1. **Add a Clock** component from the palette
2. **Add an LED** (or any gate)
3. **Wire** Clock output to LED input
4. Click **"Run Simulation"**
5. ✅ See the waveform!

---

## 🔧 Why Do I Need a Clock?

**Like Falstad simulator**, waveforms show how signals change **over time**:

- **Without Clock**: All signals are constant → Flat lines ❌
- **With Clock**: Signals toggle over time → Square waves ✅

### Example Circuits That Work:

✅ **Clock + LED** - Shows basic square wave
✅ **Clock + Counter** - Shows counting pattern  
✅ **Clock + Flip-Flop** - Shows state changes
✅ **Clock + Logic Gates** - Shows gate outputs changing

### Circuits That Won't Show Waveforms:

❌ **Just AND gate with static inputs** - No time variation
❌ **Just LEDs** - No clock to drive changes
❌ **Disconnected components** - No signal flow

---

## 📊 Understanding the Waveform Display

### What You'll See:

```
Clock:  ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
        ▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀

LED:    ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄     ▄▄▄▄▄
        ▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀▄▄▄▄▄▀▀▀▀▀
```

### Waveform Features:

- **Square waves** - Digital signals (0 or 1)
- **Color coded** - Each signal has a different color
- **Time axis** - Shows 100 time steps
- **Zoom controls** - Zoom in/out to see details
- **Signal list** - Toggle signals on/off
- **Grid lines** - Help read timing

---

## 🎨 Sample Circuits to Try

### 1. Clock + LED (Simplest)
**What it shows**: Basic square wave
```
Components: Clock → LED
Waveform: Perfect square wave
```

### 2. Clock + AND Gate + LED
**What it shows**: Logic gate operation
```
Components: Clock → AND → LED
           Input → AND
Waveform: AND gate truth table over time
```

### 3. Clock + Counter
**What it shows**: Binary counting
```
Components: Clock → Counter (4-bit)
Waveform: Binary count pattern (0,1,2,3...)
```

### 4. Clock + D Flip-Flop
**What it shows**: State storage
```
Components: Clock → DFF → LED
           Input → DFF
Waveform: Flip-flop state changes
```

### 5. Clock + SR Latch
**What it shows**: Memory element
```
Components: Clock → SR Latch → LED
Waveform: Set/Reset behavior
```

---

## 🚫 Common Issues & Solutions

### Issue: "Add a Clock component" Error

**Problem**: Circuit has no clock
**Solution**: 
1. Add a Clock component from the palette
2. Or load a sample circuit (they all have clocks)

### Issue: Waveforms are Flat Lines

**Problem**: Clock not connected or not working
**Solution**:
1. Check that Clock is wired to other components
2. Verify wires are connected properly (green lines)
3. Try loading "Clock + LED" sample to test

### Issue: No Waveform Window Appears

**Problem**: Simulation didn't run
**Solution**:
1. Check for error messages (red toast)
2. Make sure you have components in the circuit
3. Click "Run Simulation" button

### Issue: Some Signals Missing

**Problem**: Components not wired or no outputs
**Solution**:
1. Check all components are connected with wires
2. Verify components have outputs (not just inputs)
3. Look at the signal list - toggle signals on/off

---

## 🎓 How It Works (Technical)

### Simulation Process:

1. **Time Steps**: Simulates 100 time steps (0-99)
2. **Clock Toggles**: Clock alternates 0→1→0→1 every few steps
3. **Signal Propagation**: Changes flow through wires and gates
4. **Recording**: Each component's output is recorded at each step
5. **Display**: Waveform viewer plots all recorded values

### Clock Frequency:

- Default: 1 Hz (toggles every 10 steps)
- Adjustable in component properties
- Higher frequency = faster toggling

### Component Evaluation Order:

1. **Inputs & Clocks** - Evaluated first
2. **Logic Gates** - Evaluated next
3. **Outputs & LEDs** - Evaluated last

This ensures signals propagate correctly through the circuit.

---

## 📱 Using on Mobile/Tablet

The waveform viewer works on mobile devices:

- **Pinch to zoom** - Zoom in/out on waveforms
- **Swipe** - Pan left/right to see different time ranges
- **Tap signals** - Toggle signals on/off in the list
- **Rotate device** - Landscape mode shows more waveforms

---

## 🔬 Advanced Tips

### Multiple Clocks

You can add multiple clock components with different frequencies:
- Clock 1: 1 Hz (slow)
- Clock 2: 2 Hz (fast)
- See how they interact!

### Complex Circuits

For circuits with many components:
1. Use "Load Sample" to see working examples
2. Start simple, add complexity gradually
3. Use signal list to hide/show specific signals
4. Zoom in to see timing details

### Debugging Circuits

Use waveforms to debug:
1. Check if signals are changing (not flat)
2. Verify timing relationships
3. Confirm logic gate outputs
4. Trace signal propagation

---

## 🎉 Success Checklist

After deployment, verify:

✅ Load "Clock + LED" sample
✅ Click "Run Simulation"
✅ See waveform window appear
✅ Clock signal shows square wave
✅ LED signal follows clock
✅ No flat lines
✅ Zoom in/out works
✅ Signal list shows all components
✅ Can toggle signals on/off

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for errors
2. **Try "Clock + LED" sample** - simplest test
3. **Verify clock component** is in the circuit
4. **Check wire connections** - should be green
5. **Reload page** and try again

---

## 📚 Learn More

- **Falstad Circuit Simulator**: https://falstad.com/circuit/
- **Digital Logic Tutorial**: See Docs page in app
- **Sample Circuits**: Load from dropdown menu

---

## Summary

**To see waveforms like Falstad:**

1. ✅ Add a **Clock** component
2. ✅ Wire it to other components
3. ✅ Click **"Run Simulation"**
4. ✅ Enjoy the waveforms!

**Or just load "Clock + LED" sample and click Run!** 🚀
