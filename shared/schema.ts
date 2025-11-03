import { z } from "zod";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
  inputs?: number;
  outputs?: number;
  value?: number | boolean;
  propagationDelay?: number;
  state?: any;
}

export interface Wire {
  id: string;
  from: { componentId: string; pinIndex: number };
  to: { componentId: string; pinIndex: number };
  points?: { x: number; y: number }[];
}

export interface Circuit {
  name: string;
  components: Component[];
  wires: Wire[];
}

export interface VerilogFile {
  name: string;
  code: string;
  lastCompiled?: string;
}

export interface WaveformData {
  time: number[];
  signals: Record<string, (number | string)[]>;
}

export interface CompileResult {
  status: "ok" | "error";
  stdout?: string;
  stderr?: string;
  message?: string;
  usingFallback?: boolean;
}

export interface SimulationResult {
  status: "ok" | "error";
  waveform?: WaveformData;
  message?: string;
  vcdPath?: string;
}

export const componentTypes = [
  // Logic Gates
  { id: "and", name: "AND Gate", category: "gates", inputs: 2, outputs: 1 },
  { id: "or", name: "OR Gate", category: "gates", inputs: 2, outputs: 1 },
  { id: "not", name: "NOT Gate", category: "gates", inputs: 1, outputs: 1 },
  { id: "nand", name: "NAND Gate", category: "gates", inputs: 2, outputs: 1 },
  { id: "nor", name: "NOR Gate", category: "gates", inputs: 2, outputs: 1 },
  { id: "xor", name: "XOR Gate", category: "gates", inputs: 2, outputs: 1 },
  { id: "xnor", name: "XNOR Gate", category: "gates", inputs: 2, outputs: 1 },
  
  // Input/Output
  { id: "input", name: "Input", category: "io", inputs: 0, outputs: 1 },
  { id: "output", name: "Output", category: "io", inputs: 1, outputs: 0 },
  { id: "led", name: "LED", category: "io", inputs: 1, outputs: 0 },
  { id: "clock", name: "Clock", category: "io", inputs: 0, outputs: 1 },
  { id: "switch", name: "Switch", category: "io", inputs: 0, outputs: 1 },
  { id: "button", name: "Button", category: "io", inputs: 0, outputs: 1 },
  { id: "buzzer", name: "Buzzer", category: "io", inputs: 1, outputs: 0 },
  { id: "lamp", name: "Lamp", category: "io", inputs: 1, outputs: 0 },
  { id: "motor", name: "Motor", category: "io", inputs: 1, outputs: 0 },
  { id: "display7seg", name: "7-Segment Display", category: "io", inputs: 7, outputs: 0 },
  
  // Flip-Flops
  { id: "dff", name: "D Flip-Flop", category: "flipflops", inputs: 2, outputs: 2 },
  { id: "tff", name: "T Flip-Flop", category: "flipflops", inputs: 2, outputs: 2 },
  { id: "jkff", name: "JK Flip-Flop", category: "flipflops", inputs: 3, outputs: 2 },
  { id: "srff", name: "SR Flip-Flop", category: "flipflops", inputs: 2, outputs: 2 },
  
  // Multiplexers
  { id: "mux2", name: "2:1 MUX", category: "mux", inputs: 3, outputs: 1 },
  { id: "mux4", name: "4:1 MUX", category: "mux", inputs: 6, outputs: 1 },
  { id: "demux2", name: "1:2 DEMUX", category: "mux", inputs: 2, outputs: 2 },
  { id: "demux4", name: "1:4 DEMUX", category: "mux", inputs: 3, outputs: 4 },
  
  // Encoders/Decoders
  { id: "decoder2", name: "2:4 Decoder", category: "encoders", inputs: 2, outputs: 4 },
  { id: "decoder3", name: "3:8 Decoder", category: "encoders", inputs: 3, outputs: 8 },
  { id: "encoder4", name: "4:2 Encoder", category: "encoders", inputs: 4, outputs: 2 },
  { id: "encoder8", name: "8:3 Encoder", category: "encoders", inputs: 8, outputs: 3 },
  
  // Sequential
  { id: "counter4", name: "4-bit Counter", category: "sequential", inputs: 2, outputs: 4 },
  { id: "register4", name: "4-bit Register", category: "sequential", inputs: 5, outputs: 4 },
  { id: "shiftregister", name: "Shift Register", category: "sequential", inputs: 3, outputs: 4 },
  
  // Passive Components
  { id: "resistor", name: "Resistor", category: "passive", inputs: 1, outputs: 1 },
  { id: "capacitor", name: "Capacitor", category: "passive", inputs: 1, outputs: 1 },
  { id: "inductor", name: "Inductor", category: "passive", inputs: 1, outputs: 1 },
  { id: "diode", name: "Diode", category: "passive", inputs: 1, outputs: 1 },
  { id: "zenerdiode", name: "Zener Diode", category: "passive", inputs: 1, outputs: 1 },
  { id: "photodiode", name: "Photodiode", category: "passive", inputs: 1, outputs: 1 },
  
  // Active Components
  { id: "transistor-npn", name: "NPN Transistor", category: "active", inputs: 2, outputs: 1 },
  { id: "transistor-pnp", name: "PNP Transistor", category: "active", inputs: 2, outputs: 1 },
  { id: "mosfet-n", name: "N-Channel MOSFET", category: "active", inputs: 2, outputs: 1 },
  { id: "mosfet-p", name: "P-Channel MOSFET", category: "active", inputs: 2, outputs: 1 },
  { id: "opamp", name: "Op-Amp", category: "active", inputs: 2, outputs: 1 },
  { id: "relay", name: "Relay", category: "active", inputs: 1, outputs: 1 },
  
  // Power
  { id: "battery", name: "Battery", category: "power", inputs: 0, outputs: 1 },
  { id: "ground", name: "Ground", category: "power", inputs: 1, outputs: 0 },
  { id: "vcc", name: "VCC", category: "power", inputs: 0, outputs: 1 },
  
  // Integrated Circuits
  { id: "ic555", name: "555 Timer", category: "ic", inputs: 3, outputs: 1 },
  { id: "ic", name: "Generic IC", category: "ic", inputs: 4, outputs: 4 },
] as const;
