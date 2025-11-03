import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, RotateCcw, Save, Download, ZoomIn, ZoomOut, SkipForward, BookOpen } from "lucide-react";
import { componentTypes, type Component, type Wire, type Circuit } from "@shared/schema";
import { nanoid } from "nanoid";
import html2canvas from "html2canvas";
import { ComponentPalette } from "@/components/simulator/component-palette";
import { CircuitCanvas } from "@/components/simulator/circuit-canvas";
import { PropertiesPanel } from "@/components/simulator/properties-panel";
import { WaveformViewer } from "@/components/simulator/waveform-viewer";
import { simulateCircuit } from "@/lib/circuit-simulator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Sample circuits
const sampleCircuits = {
  halfAdder: {
    name: "Half Adder",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 200, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "xor1", type: "xor", x: 300, y: 100, label: "XOR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 300, y: 200, label: "AND", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 500, y: 100, label: "Sum", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led2", type: "led", x: 500, y: 200, label: "Carry", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w4", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w5", from: { componentId: "xor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
      { id: "w6", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "led2", pinIndex: 0 } },
    ],
  },
  
  fullAdder: {
    name: "Full Adder",
    components: [
      { id: "a", type: "input", x: 80, y: 80, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "b", type: "input", x: 80, y: 160, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "cin", type: "input", x: 80, y: 240, label: "Cin", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "xor1", type: "xor", x: 240, y: 100, label: "XOR1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "xor2", type: "xor", x: 400, y: 120, label: "XOR2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 240, y: 200, label: "AND1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and2", type: "and", x: 400, y: 220, label: "AND2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "or1", type: "or", x: 560, y: 210, label: "OR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "sum", type: "led", x: 560, y: 120, label: "Sum", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "cout", type: "led", x: 720, y: 210, label: "Cout", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "a", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "b", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "xor1", pinIndex: 0 }, to: { componentId: "xor2", pinIndex: 0 } },
      { id: "w4", from: { componentId: "cin", pinIndex: 0 }, to: { componentId: "xor2", pinIndex: 1 } },
      { id: "w5", from: { componentId: "xor2", pinIndex: 0 }, to: { componentId: "sum", pinIndex: 0 } },
      { id: "w6", from: { componentId: "a", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w7", from: { componentId: "b", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w8", from: { componentId: "xor1", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 0 } },
      { id: "w9", from: { componentId: "cin", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 1 } },
      { id: "w10", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 0 } },
      { id: "w11", from: { componentId: "and2", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 1 } },
      { id: "w12", from: { componentId: "or1", pinIndex: 0 }, to: { componentId: "cout", pinIndex: 0 } },
    ],
  },
  
  srLatch: {
    name: "SR Latch",
    components: [
      { id: "s", type: "input", x: 100, y: 100, label: "S", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "r", type: "input", x: 100, y: 250, label: "R", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "nor1", type: "nor", x: 300, y: 120, label: "NOR1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "nor2", type: "nor", x: 300, y: 230, label: "NOR2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 500, y: 120, label: "Q", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led2", type: "led", x: 500, y: 230, label: "Q̄", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "s", pinIndex: 0 }, to: { componentId: "nor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "r", pinIndex: 0 }, to: { componentId: "nor2", pinIndex: 0 } },
      { id: "w3", from: { componentId: "nor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
      { id: "w4", from: { componentId: "nor2", pinIndex: 0 }, to: { componentId: "led2", pinIndex: 0 } },
    ],
  },
  clockDivider: {
    name: "Clock with LED",
    components: [
      { id: "clk", type: "clock", x: 100, y: 150, label: "Clock", inputs: 0, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led", type: "led", x: 300, y: 150, label: "LED", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "clk", pinIndex: 0 }, to: { componentId: "led", pinIndex: 0 } },
    ],
  },
  
  andGate: {
    name: "AND Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 280, y: 140, label: "AND", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  orGate: {
    name: "OR Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "or1", type: "or", x: 280, y: 140, label: "OR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "or1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  xorGate: {
    name: "XOR Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "xor1", type: "xor", x: 280, y: 140, label: "XOR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "xor1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "xor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  notGate: {
    name: "NOT Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 140, label: "Input", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "not1", type: "not", x: 280, y: 140, label: "NOT", inputs: 1, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "not1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "not1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  nandGate: {
    name: "NAND Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "nand1", type: "nand", x: 280, y: 140, label: "NAND", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "nand1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "nand1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "nand1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  norGate: {
    name: "NOR Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "nor1", type: "nor", x: 280, y: 140, label: "NOR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "nor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "nor1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "nor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  mux2to1: {
    name: "2:1 Multiplexer",
    components: [
      { id: "in0", type: "input", x: 80, y: 100, label: "D0", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in1", type: "input", x: 80, y: 180, label: "D1", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "sel", type: "input", x: 80, y: 260, label: "Sel", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "not1", type: "not", x: 200, y: 260, label: "NOT", inputs: 1, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 320, y: 120, label: "AND1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and2", type: "and", x: 320, y: 220, label: "AND2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "or1", type: "or", x: 480, y: 170, label: "OR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 640, y: 170, label: "Out", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in0", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "sel", pinIndex: 0 }, to: { componentId: "not1", pinIndex: 0 } },
      { id: "w3", from: { componentId: "not1", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w4", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 0 } },
      { id: "w5", from: { componentId: "sel", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 1 } },
      { id: "w6", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 0 } },
      { id: "w7", from: { componentId: "and2", pinIndex: 0 }, to: { componentId: "or1", pinIndex: 1 } },
      { id: "w8", from: { componentId: "or1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
  
  decoder2to4: {
    name: "2:4 Decoder",
    components: [
      { id: "a", type: "input", x: 80, y: 120, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "b", type: "input", x: 80, y: 200, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "not1", type: "not", x: 200, y: 120, label: "NOT1", inputs: 1, outputs: 1, propagationDelay: 1, state: {} },
      { id: "not2", type: "not", x: 200, y: 200, label: "NOT2", inputs: 1, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 340, y: 80, label: "AND1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and2", type: "and", x: 340, y: 160, label: "AND2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and3", type: "and", x: 340, y: 240, label: "AND3", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and4", type: "and", x: 340, y: 320, label: "AND4", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 500, y: 80, label: "Y0", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led2", type: "led", x: 500, y: 160, label: "Y1", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led3", type: "led", x: 500, y: 240, label: "Y2", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led4", type: "led", x: 500, y: 320, label: "Y3", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "a", pinIndex: 0 }, to: { componentId: "not1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "b", pinIndex: 0 }, to: { componentId: "not2", pinIndex: 0 } },
      { id: "w3", from: { componentId: "not1", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w4", from: { componentId: "not2", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w5", from: { componentId: "not1", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 0 } },
      { id: "w6", from: { componentId: "b", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 1 } },
      { id: "w7", from: { componentId: "a", pinIndex: 0 }, to: { componentId: "and3", pinIndex: 0 } },
      { id: "w8", from: { componentId: "not2", pinIndex: 0 }, to: { componentId: "and3", pinIndex: 1 } },
      { id: "w9", from: { componentId: "a", pinIndex: 0 }, to: { componentId: "and4", pinIndex: 0 } },
      { id: "w10", from: { componentId: "b", pinIndex: 0 }, to: { componentId: "and4", pinIndex: 1 } },
      { id: "w11", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
      { id: "w12", from: { componentId: "and2", pinIndex: 0 }, to: { componentId: "led2", pinIndex: 0 } },
      { id: "w13", from: { componentId: "and3", pinIndex: 0 }, to: { componentId: "led3", pinIndex: 0 } },
      { id: "w14", from: { componentId: "and4", pinIndex: 0 }, to: { componentId: "led4", pinIndex: 0 } },
    ],
  },
  
  dLatch: {
    name: "D Latch",
    components: [
      { id: "d", type: "input", x: 80, y: 120, label: "D", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "en", type: "input", x: 80, y: 220, label: "Enable", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "not1", type: "not", x: 200, y: 120, label: "NOT", inputs: 1, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and1", type: "and", x: 320, y: 100, label: "AND1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "and2", type: "and", x: 320, y: 200, label: "AND2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "nor1", type: "nor", x: 480, y: 120, label: "NOR1", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "nor2", type: "nor", x: 480, y: 220, label: "NOR2", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 640, y: 120, label: "Q", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
      { id: "led2", type: "led", x: 640, y: 220, label: "Q̄", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "d", pinIndex: 0 }, to: { componentId: "not1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "not1", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 0 } },
      { id: "w3", from: { componentId: "en", pinIndex: 0 }, to: { componentId: "and1", pinIndex: 1 } },
      { id: "w4", from: { componentId: "d", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 0 } },
      { id: "w5", from: { componentId: "en", pinIndex: 0 }, to: { componentId: "and2", pinIndex: 1 } },
      { id: "w6", from: { componentId: "and1", pinIndex: 0 }, to: { componentId: "nor1", pinIndex: 0 } },
      { id: "w7", from: { componentId: "and2", pinIndex: 0 }, to: { componentId: "nor2", pinIndex: 0 } },
      { id: "w8", from: { componentId: "nor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
      { id: "w9", from: { componentId: "nor2", pinIndex: 0 }, to: { componentId: "led2", pinIndex: 0 } },
    ],
  },
  
  xnorGate: {
    name: "XNOR Gate Demo",
    components: [
      { id: "in1", type: "input", x: 100, y: 100, label: "A", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "in2", type: "input", x: 100, y: 180, label: "B", inputs: 0, outputs: 1, value: 0, propagationDelay: 1, state: {} },
      { id: "xnor1", type: "xnor", x: 280, y: 140, label: "XNOR", inputs: 2, outputs: 1, propagationDelay: 1, state: {} },
      { id: "led1", type: "led", x: 450, y: 140, label: "Output", inputs: 1, outputs: 0, propagationDelay: 1, state: {} },
    ],
    wires: [
      { id: "w1", from: { componentId: "in1", pinIndex: 0 }, to: { componentId: "xnor1", pinIndex: 0 } },
      { id: "w2", from: { componentId: "in2", pinIndex: 0 }, to: { componentId: "xnor1", pinIndex: 1 } },
      { id: "w3", from: { componentId: "xnor1", pinIndex: 0 }, to: { componentId: "led1", pinIndex: 0 } },
    ],
  },
};

export default function Simulator() {
  const { toast } = useToast();
  const [components, setComponents] = useState<Component[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState([50]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [waveformData, setWaveformData] = useState<any>(null);
  const [showWaveform, setShowWaveform] = useState(false);

  useEffect(() => {
    const loadedCircuit = localStorage.getItem("loadedCircuit");
    if (loadedCircuit) {
      try {
        const circuit = JSON.parse(loadedCircuit) as Circuit;
        setComponents(circuit.components || []);
        setWires(circuit.wires || []);
        localStorage.removeItem("loadedCircuit");
        toast({ title: "Circuit loaded from projects" });
      } catch (error) {
        console.error("Failed to load circuit:", error);
      }
    }
  }, [toast]);

  const saveCircuitMutation = useMutation({
    mutationFn: async (circuit: Circuit) => {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: circuit.name || "Untitled Circuit",
          type: "circuit",
          content: circuit,
        }),
      });
      if (!response.ok) throw new Error("Failed to save circuit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Circuit saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save circuit", variant: "destructive" });
    },
  });

  const handleAddComponent = useCallback((typeId: string) => {
    const componentType = componentTypes.find((t) => t.id === typeId);
    if (!componentType) return;

    const newComponent: Component = {
      id: nanoid(),
      type: typeId,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      label: componentType.name,
      inputs: componentType.inputs,
      outputs: componentType.outputs,
      value: typeId === "input" ? 0 : undefined,
      propagationDelay: 1,
      state: {},
    };

    setComponents((prev) => [...prev, newComponent]);
    
    toast({ 
      title: `Added ${componentType.name}`, 
      description: `Component placed at (${Math.round(newComponent.x)}, ${Math.round(newComponent.y)})` 
    });
  }, [toast]);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.from.componentId !== id && w.to.componentId !== id)
    );
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const handleAddWire = useCallback((wire: Wire) => {
    setWires((prev) => [...prev, wire]);
  }, []);

  const handleDeleteWire = useCallback((id: string) => {
    setWires((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleRunSimulation = useCallback(() => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    const result = simulateCircuit(components, wires, 100);
    setWaveformData(result.waveform);
    setShowWaveform(true);

    toast({
      title: "Simulation complete",
      description: `Simulated ${result.waveform.time.length} time steps`,
    });
  }, [components, wires, isSimulating, toast]);

  const handleStepSimulation = useCallback(() => {
    const result = simulateCircuit(components, wires, 1);
    setWaveformData(result.waveform);
    setShowWaveform(true);
  }, [components, wires]);

  const handleReset = useCallback(() => {
    setIsSimulating(false);
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        value: c.type === "input" ? 0 : undefined,
        state: {},
      }))
    );
    setWaveformData(null);
  }, []);

  const handleSave = useCallback(() => {
    const circuit: Circuit = {
      name: `Circuit ${new Date().toISOString()}`,
      components,
      wires,
    };
    saveCircuitMutation.mutate(circuit);
  }, [components, wires, saveCircuitMutation]);

  const handleExportPNG = useCallback(async () => {
    try {
      const canvasElement = document.querySelector('canvas');
      if (!canvasElement) {
        toast({ title: "No canvas found to export", variant: "destructive" });
        return;
      }
      const canvas = await html2canvas(canvasElement.parentElement as HTMLElement);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "circuit.png";
      link.href = url;
      link.click();
      toast({ title: "Circuit exported as PNG" });
    } catch (error) {
      toast({ title: "Failed to export circuit", variant: "destructive" });
    }
  }, [toast]);

  const loadSampleCircuit = useCallback((sampleKey: string) => {
    const sample = sampleCircuits[sampleKey as keyof typeof sampleCircuits];
    if (sample) {
      setComponents(sample.components as Component[]);
      setWires(sample.wires as Wire[]);
      toast({ title: `Loaded: ${sample.name}`, description: "Sample circuit loaded successfully" });
    }
  }, [toast]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette onAddComponent={handleAddComponent} />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isSimulating ? "destructive" : "default"}
                onClick={handleRunSimulation}
                data-testid="button-run-simulation"
              >
                {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isSimulating ? "Pause" : "Run"}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleStepSimulation} data-testid="button-step">
                <SkipForward className="w-4 h-4 mr-2" />
                Step
              </Button>
              <Button size="sm" variant="secondary" onClick={handleReset} data-testid="button-reset">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} data-testid="button-zoom-in">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} data-testid="button-zoom-out">
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={loadSampleCircuit}>
                <SelectTrigger className="w-[160px] h-9">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Load Sample" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="andGate">AND Gate</SelectItem>
                  <SelectItem value="orGate">OR Gate</SelectItem>
                  <SelectItem value="notGate">NOT Gate</SelectItem>
                  <SelectItem value="nandGate">NAND Gate</SelectItem>
                  <SelectItem value="norGate">NOR Gate</SelectItem>
                  <SelectItem value="xorGate">XOR Gate</SelectItem>
                  <SelectItem value="xnorGate">XNOR Gate</SelectItem>
                  <SelectItem value="halfAdder">Half Adder</SelectItem>
                  <SelectItem value="fullAdder">Full Adder</SelectItem>
                  <SelectItem value="mux2to1">2:1 Multiplexer</SelectItem>
                  <SelectItem value="decoder2to4">2:4 Decoder</SelectItem>
                  <SelectItem value="srLatch">SR Latch</SelectItem>
                  <SelectItem value="dLatch">D Latch</SelectItem>
                  <SelectItem value="clockDivider">Clock + LED</SelectItem>
                </SelectContent>
              </Select>
              
              <Separator orientation="vertical" className="h-6 mx-2" />
              
              <div className="flex items-center gap-3">
                <Label className="text-sm text-muted-foreground">Speed:</Label>
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  min={1}
                  max={100}
                  step={1}
                  className="w-32"
                  data-testid="slider-speed"
                />
              </div>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button size="sm" variant="secondary" onClick={handleSave} data-testid="button-save">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={handleExportPNG} data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on components in the left panel to add them to the canvas
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Click output pins (green) and then input pins (blue) to create wires</p>
                    <p>• Drag components to move them</p>
                    <p>• Press Delete to remove selected components</p>
                    <p>• Press Escape to cancel wiring</p>
                  </div>
                </div>
              </div>
            )}
            <CircuitCanvas
              components={components}
              wires={wires}
              selectedComponent={selectedComponent}
              zoom={zoom}
              pan={pan}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={handleUpdateComponent}
              onDeleteComponent={handleDeleteComponent}
              onAddWire={handleAddWire}
              onDeleteWire={handleDeleteWire}
              onPanChange={setPan}
            />
          </div>

          {showWaveform && waveformData && (
            <div className="border-t border-border h-64">
              <WaveformViewer data={waveformData} onClose={() => setShowWaveform(false)} />
            </div>
          )}
        </div>

        <PropertiesPanel
          component={selectedComponent}
          onUpdate={handleUpdateComponent}
          onDelete={handleDeleteComponent}
        />
      </div>
    </div>
  );
}
