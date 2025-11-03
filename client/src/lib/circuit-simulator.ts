import type { Component, Wire, WaveformData } from "@shared/schema";

export function simulateCircuit(
  components: Component[],
  wires: Wire[],
  timeSteps: number
): { waveform: WaveformData } {
  const time: number[] = [];
  const signals: Record<string, (number | string)[]> = {};

  components.forEach((comp) => {
    signals[comp.label] = [];
  });

  for (let t = 0; t < timeSteps; t++) {
    time.push(t);

    const componentOutputs = new Map<string, number[]>();

    components.forEach((comp) => {
      const inputs = getComponentInputs(comp, wires, componentOutputs, components);
      const outputs = evaluateComponent(comp, inputs, t);
      componentOutputs.set(comp.id, outputs);

      if (comp.outputs && comp.outputs > 0) {
        signals[comp.label].push(Number(outputs[0] || 0));
      } else if (comp.type === "input") {
        signals[comp.label].push(Number(comp.value || 0));
      }
    });
  }

  return {
    waveform: {
      time,
      signals,
    },
  };
}

function getComponentInputs(
  component: Component,
  wires: Wire[],
  componentOutputs: Map<string, number[]>,
  components: Component[]
): number[] {
  const inputs: number[] = [];
  const inputWires = wires.filter((w) => w.to.componentId === component.id);

  for (let i = 0; i < (component.inputs || 0); i++) {
    const wire = inputWires.find((w) => w.to.pinIndex === i);
    if (wire) {
      const sourceComp = components.find((c) => c.id === wire.from.componentId);
      if (sourceComp) {
        if (sourceComp.type === "input") {
          inputs.push(Number(sourceComp.value) || 0);
        } else {
          const sourceOutputs = componentOutputs.get(sourceComp.id) || [];
          inputs.push(sourceOutputs[wire.from.pinIndex] || 0);
        }
      } else {
        inputs.push(0);
      }
    } else {
      inputs.push(0);
    }
  }

  return inputs;
}

function evaluateComponent(component: Component, inputs: number[], time: number): number[] {
  switch (component.type) {
    case "input":
      return [Number(component.value) || 0];

    case "clock":
      const freq = component.state?.frequency || 1;
      const period = 10 / freq;
      return [Math.floor(time / period) % 2];

    case "and":
      return [inputs.every((i) => Number(i)) ? 1 : 0];

    case "or":
      return [inputs.some((i) => Number(i)) ? 1 : 0];

    case "not":
      return [Number(inputs[0]) ? 0 : 1];

    case "nand":
      return [inputs.every((i) => Number(i)) ? 0 : 1];

    case "nor":
      return [inputs.some((i) => Number(i)) ? 0 : 1];

    case "xor":
      return [inputs.filter((i) => Number(i)).length % 2 === 1 ? 1 : 0];

    case "xnor":
      return [inputs.filter((i) => Number(i)).length % 2 === 0 ? 1 : 0];

    case "dff":
      if (!component.state) component.state = { q: 0 };
      const clk = inputs[1];
      const prevClk = component.state.prevClk || 0;
      if (clk && !prevClk) {
        component.state.q = inputs[0];
      }
      component.state.prevClk = clk;
      return [component.state.q, component.state.q ? 0 : 1];

    case "tff":
      if (!component.state) component.state = { q: 0 };
      const tClk = inputs[1];
      const prevTClk = component.state.prevClk || 0;
      if (tClk && !prevTClk && inputs[0]) {
        component.state.q = component.state.q ? 0 : 1;
      }
      component.state.prevClk = tClk;
      return [component.state.q, component.state.q ? 0 : 1];

    case "jkff":
      if (!component.state) component.state = { q: 0 };
      const jkClk = inputs[2];
      const prevJkClk = component.state.prevClk || 0;
      if (jkClk && !prevJkClk) {
        const j = inputs[0];
        const k = inputs[1];
        if (j && k) {
          component.state.q = component.state.q ? 0 : 1;
        } else if (j) {
          component.state.q = 1;
        } else if (k) {
          component.state.q = 0;
        }
      }
      component.state.prevClk = jkClk;
      return [component.state.q, component.state.q ? 0 : 1];

    case "srff":
      if (!component.state) component.state = { q: 0 };
      const s = inputs[0];
      const r = inputs[1];
      if (s && !r) {
        component.state.q = 1;
      } else if (!s && r) {
        component.state.q = 0;
      }
      return [component.state.q, component.state.q ? 0 : 1];

    case "mux2":
      const sel2 = inputs[2];
      return [sel2 ? inputs[1] : inputs[0]];

    case "mux4":
      const sel4 = (inputs[4] << 1) | inputs[5];
      return [inputs[sel4] || 0];

    case "demux2":
      const dsel2 = inputs[1];
      return dsel2 ? [0, inputs[0]] : [inputs[0], 0];

    case "demux4":
      const dsel4 = (inputs[1] << 1) | inputs[2];
      const dout = [0, 0, 0, 0];
      dout[dsel4] = inputs[0];
      return dout;

    case "decoder2":
      const dec2 = inputs[0] | (inputs[1] << 1);
      const decOut2 = [0, 0, 0, 0];
      decOut2[dec2] = 1;
      return decOut2;

    case "decoder3":
      const dec3 = inputs[0] | (inputs[1] << 1) | (inputs[2] << 2);
      const decOut3 = new Array(8).fill(0);
      decOut3[dec3] = 1;
      return decOut3;

    case "encoder4":
      for (let i = 3; i >= 0; i--) {
        if (inputs[i]) {
          return [i & 1, (i >> 1) & 1];
        }
      }
      return [0, 0];

    case "encoder8":
      for (let i = 7; i >= 0; i--) {
        if (inputs[i]) {
          return [i & 1, (i >> 1) & 1, (i >> 2) & 1];
        }
      }
      return [0, 0, 0];

    case "counter4":
      if (!component.state) component.state = { count: 0 };
      const cntClk = inputs[0];
      const cntRst = inputs[1];
      const prevCntClk = component.state.prevClk || 0;
      if (cntRst) {
        component.state.count = 0;
      } else if (cntClk && !prevCntClk) {
        component.state.count = (component.state.count + 1) % 16;
      }
      component.state.prevClk = cntClk;
      const cnt = component.state.count;
      return [cnt & 1, (cnt >> 1) & 1, (cnt >> 2) & 1, (cnt >> 3) & 1];

    case "register4":
      if (!component.state) component.state = { value: 0 };
      const regClk = inputs[4];
      const prevRegClk = component.state.prevClk || 0;
      if (regClk && !prevRegClk) {
        component.state.value = inputs[0] | (inputs[1] << 1) | (inputs[2] << 2) | (inputs[3] << 3);
      }
      component.state.prevClk = regClk;
      const reg = component.state.value;
      return [reg & 1, (reg >> 1) & 1, (reg >> 2) & 1, (reg >> 3) & 1];

    // Passive components (pass through with optional modification)
    case "resistor":
    case "capacitor":
    case "inductor":
      return [inputs[0] || 0];

    case "diode":
    case "zenerdiode":
    case "photodiode":
      // Diode only passes signal in one direction
      return [inputs[0] > 0 ? inputs[0] : 0];

    // Active components
    case "transistor-npn":
      // NPN: if base (input 0) is high, pass collector (input 1) to emitter
      return [inputs[0] && inputs[1] ? inputs[1] : 0];

    case "transistor-pnp":
      // PNP: if base (input 0) is low, pass emitter (input 1) to collector
      return [!inputs[0] && inputs[1] ? inputs[1] : 0];

    case "mosfet-n":
      // N-channel: if gate (input 0) is high, pass drain (input 1) to source
      return [inputs[0] ? inputs[1] : 0];

    case "mosfet-p":
      // P-channel: if gate (input 0) is low, pass source (input 1) to drain
      return [!inputs[0] ? inputs[1] : 0];

    case "opamp":
      // Op-amp: amplify difference between inputs
      const diff = (inputs[0] || 0) - (inputs[1] || 0);
      return [diff > 0 ? 1 : 0];

    case "relay":
      // Relay: switch controlled by coil
      return [inputs[0] ? 1 : 0];

    // Power sources
    case "battery":
    case "vcc":
      return [1];

    case "ground":
      return [];

    // Input/Output
    case "switch":
    case "button":
      return [Number(component.value) || 0];

    case "buzzer":
    case "lamp":
    case "motor":
    case "display7seg":
      // Output devices - store input value
      component.value = inputs[0];
      return [];

    // ICs
    case "ic555":
      // Simple 555 timer simulation (astable mode)
      if (!component.state) component.state = { output: 0, counter: 0 };
      component.state.counter = (component.state.counter + 1) % 10;
      if (component.state.counter === 0) {
        component.state.output = component.state.output ? 0 : 1;
      }
      return [component.state.output];

    case "ic":
      // Generic IC - pass through
      return inputs.slice(0, component.outputs || 1);

    case "shiftregister":
      // Shift register
      if (!component.state) component.state = { bits: [0, 0, 0, 0] };
      const srClk = inputs[1];
      const prevSrClk = component.state.prevClk || 0;
      if (srClk && !prevSrClk) {
        component.state.bits.unshift(inputs[0]);
        component.state.bits.pop();
      }
      component.state.prevClk = srClk;
      return component.state.bits;

    default:
      return new Array(component.outputs || 1).fill(0);
  }
}
