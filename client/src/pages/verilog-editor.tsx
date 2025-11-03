import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Save, Zap, FileCode, BookOpen, Trash2 } from "lucide-react";
import { WaveformViewer } from "@/components/simulator/waveform-viewer";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { CompileResult, SimulationResult } from "@shared/schema";

const sampleCodes = {
  counter: `// 4-bit Counter with Clock and Reset
// This example demonstrates sequential logic with waveform output

module counter_4bit (
  input clk,
  input rst,
  output reg [3:0] count
);

  always @(posedge clk or posedge rst) begin
    if (rst)
      count <= 4'b0000;
    else
      count <= count + 1;
  end

endmodule

// Testbench - generates waveforms for visualization
module tb_counter;
  reg clk, rst;
  wire [3:0] count;

  // Instantiate the counter
  counter_4bit uut (
    .clk(clk),
    .rst(rst),
    .count(count)
  );

  // Clock generation (10 time units period)
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  // Test stimulus
  initial begin
    // Initialize
    rst = 1;
    #15 rst = 0;  // Release reset after 15 time units
    
    // Let counter run for 200 time units
    #200;
    
    $finish;
  end

endmodule`,
  
  dff: `// D Flip-Flop Example
module d_flipflop (
  input clk, rst, d,
  output reg q, q_bar
);
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      q <= 1'b0;
      q_bar <= 1'b1;
    end else begin
      q <= d;
      q_bar <= ~d;
    end
  end
endmodule

module tb_d_flipflop;
  reg clk, rst, d;
  wire q, q_bar;
  
  d_flipflop uut (.clk(clk), .rst(rst), .d(d), .q(q), .q_bar(q_bar));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; d = 0;
    #10 rst = 0;
    #10 d = 1;
    #20 d = 0;
    #20 d = 1;
    #50 $finish;
  end
endmodule`,

  adder: `// Full Adder Example
module full_adder (
  input a, b, cin,
  output sum, cout
);
  assign sum = a ^ b ^ cin;
  assign cout = (a & b) | (b & cin) | (a & cin);
endmodule

module tb_full_adder;
  reg a, b, cin;
  wire sum, cout;
  
  full_adder uut (.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));
  
  initial begin
    a = 0; b = 0; cin = 0; #10;
    a = 0; b = 0; cin = 1; #10;
    a = 0; b = 1; cin = 0; #10;
    a = 0; b = 1; cin = 1; #10;
    a = 1; b = 0; cin = 0; #10;
    a = 1; b = 0; cin = 1; #10;
    a = 1; b = 1; cin = 0; #10;
    a = 1; b = 1; cin = 1; #10;
    $finish;
  end
endmodule`,

  mux: `// 4:1 Multiplexer Example
module mux_4to1 (
  input [1:0] sel,
  input [3:0] data_in,
  output reg out
);
  always @(*) begin
    case(sel)
      2'b00: out = data_in[0];
      2'b01: out = data_in[1];
      2'b10: out = data_in[2];
      2'b11: out = data_in[3];
    endcase
  end
endmodule

module tb_mux;
  reg [1:0] sel;
  reg [3:0] data_in;
  wire out;
  
  mux_4to1 uut (.sel(sel), .data_in(data_in), .out(out));
  
  initial begin
    data_in = 4'b1010;
    sel = 2'b00; #10;
    sel = 2'b01; #10;
    sel = 2'b10; #10;
    sel = 2'b11; #10;
    $finish;
  end
endmodule`,

  shift: `// 4-bit Shift Register
module shift_register_4bit (
  input clk, rst, serial_in,
  output reg [3:0] parallel_out
);
  always @(posedge clk or posedge rst) begin
    if (rst)
      parallel_out <= 4'b0000;
    else
      parallel_out <= {parallel_out[2:0], serial_in};
  end
endmodule

module tb_shift_register;
  reg clk, rst, serial_in;
  wire [3:0] parallel_out;
  
  shift_register_4bit uut (.clk(clk), .rst(rst), .serial_in(serial_in), .parallel_out(parallel_out));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; serial_in = 0;
    #10 rst = 0;
    #10 serial_in = 1;
    #10 serial_in = 0;
    #10 serial_in = 1;
    #10 serial_in = 1;
    #50 $finish;
  end
endmodule`,

  alu: `// Simple 4-bit ALU
module alu_4bit (
  input [3:0] a, b,
  input [1:0] op,
  output reg [3:0] result,
  output reg carry
);
  always @(*) begin
    carry = 0;
    case(op)
      2'b00: {carry, result} = a + b;
      2'b01: {carry, result} = a - b;
      2'b10: result = a & b;
      2'b11: result = a | b;
    endcase
  end
endmodule

module tb_alu;
  reg [3:0] a, b;
  reg [1:0] op;
  wire [3:0] result;
  wire carry;
  
  alu_4bit uut (.a(a), .b(b), .op(op), .result(result), .carry(carry));
  
  initial begin
    a = 4'b0011; b = 4'b0101; op = 2'b00; #10;
    a = 4'b0101; b = 4'b0011; op = 2'b01; #10;
    a = 4'b1100; b = 4'b1010; op = 2'b10; #10;
    a = 4'b1100; b = 4'b1010; op = 2'b11; #10;
    $finish;
  end
endmodule`,

  fsm: `// Sequence Detector FSM (detects "101")
module sequence_detector (
  input clk, rst, data_in,
  output reg detected
);
  parameter S0 = 2'b00, S1 = 2'b01, S2 = 2'b10, S3 = 2'b11;
  reg [1:0] state, next_state;
  
  always @(posedge clk or posedge rst) begin
    if (rst) state <= S0;
    else state <= next_state;
  end
  
  always @(*) begin
    case(state)
      S0: next_state = data_in ? S1 : S0;
      S1: next_state = data_in ? S1 : S2;
      S2: next_state = data_in ? S3 : S0;
      S3: next_state = data_in ? S1 : S2;
    endcase
  end
  
  always @(*) detected = (state == S3);
endmodule

module tb_sequence_detector;
  reg clk, rst, data_in;
  wire detected;
  
  sequence_detector uut (.clk(clk), .rst(rst), .data_in(data_in), .detected(detected));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; data_in = 0;
    #10 rst = 0;
    #10 data_in = 1;
    #10 data_in = 0;
    #10 data_in = 1;
    #50 $finish;
  end
endmodule`,

  jkff: `// JK Flip-Flop
module jk_flipflop (
  input clk, rst, j, k,
  output reg q, q_bar
);
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      q <= 1'b0;
      q_bar <= 1'b1;
    end else begin
      case({j, k})
        2'b00: begin q <= q; q_bar <= q_bar; end
        2'b01: begin q <= 1'b0; q_bar <= 1'b1; end
        2'b10: begin q <= 1'b1; q_bar <= 1'b0; end
        2'b11: begin q <= ~q; q_bar <= ~q_bar; end
      endcase
    end
  end
endmodule

module tb_jk_flipflop;
  reg clk, rst, j, k;
  wire q, q_bar;
  
  jk_flipflop uut (.clk(clk), .rst(rst), .j(j), .k(k), .q(q), .q_bar(q_bar));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; j = 0; k = 0;
    #10 rst = 0;
    #10 j = 0; k = 1;
    #10 j = 1; k = 0;
    #10 j = 1; k = 1;
    #10 j = 0; k = 0;
    #50 $finish;
  end
endmodule`,

  decoder: `// 3-to-8 Decoder
module decoder_3to8 (
  input [2:0] in,
  input enable,
  output reg [7:0] out
);
  always @(*) begin
    if (enable)
      out = 8'b00000001 << in;
    else
      out = 8'b00000000;
  end
endmodule

module tb_decoder;
  reg [2:0] in;
  reg enable;
  wire [7:0] out;
  
  decoder_3to8 uut (.in(in), .enable(enable), .out(out));
  
  initial begin
    enable = 1;
    in = 3'b000; #10;
    in = 3'b001; #10;
    in = 3'b010; #10;
    in = 3'b011; #10;
    in = 3'b100; #10;
    in = 3'b101; #10;
    in = 3'b110; #10;
    in = 3'b111; #10;
    enable = 0; in = 3'b101; #10;
    $finish;
  end
endmodule`,

  encoder: `// 8-to-3 Priority Encoder
module encoder_8to3 (
  input [7:0] in,
  output reg [2:0] out,
  output reg valid
);
  always @(*) begin
    valid = |in;
    casez(in)
      8'b1zzzzzzz: out = 3'b111;
      8'b01zzzzzz: out = 3'b110;
      8'b001zzzzz: out = 3'b101;
      8'b0001zzzz: out = 3'b100;
      8'b00001zzz: out = 3'b011;
      8'b000001zz: out = 3'b010;
      8'b0000001z: out = 3'b001;
      8'b00000001: out = 3'b000;
      default: out = 3'b000;
    endcase
  end
endmodule

module tb_encoder;
  reg [7:0] in;
  wire [2:0] out;
  wire valid;
  
  encoder_8to3 uut (.in(in), .out(out), .valid(valid));
  
  initial begin
    in = 8'b00000001; #10;
    in = 8'b00000010; #10;
    in = 8'b00000100; #10;
    in = 8'b00001000; #10;
    in = 8'b10000000; #10;
    in = 8'b11000000; #10;
    in = 8'b00000000; #10;
    $finish;
  end
endmodule`,

  comparator: `// 4-bit Comparator
module comparator_4bit (
  input [3:0] a, b,
  output reg equal, greater, less
);
  always @(*) begin
    equal = (a == b);
    greater = (a > b);
    less = (a < b);
  end
endmodule

module tb_comparator;
  reg [3:0] a, b;
  wire equal, greater, less;
  
  comparator_4bit uut (.a(a), .b(b), .equal(equal), .greater(greater), .less(less));
  
  initial begin
    a = 4'b0101; b = 4'b0101; #10;
    a = 4'b1000; b = 4'b0011; #10;
    a = 4'b0010; b = 4'b0111; #10;
    a = 4'b1111; b = 4'b0000; #10;
    a = 4'b0000; b = 4'b1111; #10;
    $finish;
  end
endmodule`,

  parity: `// Parity Generator and Checker
module parity_gen_check (
  input [7:0] data_in,
  input parity_in,
  output parity_out,
  output error
);
  assign parity_out = ^data_in;
  assign error = parity_in ^ parity_out;
endmodule

module tb_parity;
  reg [7:0] data_in;
  reg parity_in;
  wire parity_out, error;
  
  parity_gen_check uut (.data_in(data_in), .parity_in(parity_in), .parity_out(parity_out), .error(error));
  
  initial begin
    data_in = 8'b10101010; parity_in = 0; #10;
    data_in = 8'b10101010; parity_in = 1; #10;
    data_in = 8'b11111111; parity_in = 0; #10;
    data_in = 8'b11111111; parity_in = 1; #10;
    data_in = 8'b00000001; parity_in = 1; #10;
    $finish;
  end
endmodule`,

  ram: `// Simple 8x4 RAM
module ram_8x4 (
  input clk,
  input [2:0] addr,
  input [3:0] data_in,
  input we,
  output reg [3:0] data_out
);
  reg [3:0] memory [0:7];
  
  always @(posedge clk) begin
    if (we)
      memory[addr] <= data_in;
    data_out <= memory[addr];
  end
endmodule

module tb_ram;
  reg clk;
  reg [2:0] addr;
  reg [3:0] data_in;
  reg we;
  wire [3:0] data_out;
  
  ram_8x4 uut (.clk(clk), .addr(addr), .data_in(data_in), .we(we), .data_out(data_out));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    we = 1; addr = 3'b000; data_in = 4'b1010; #10;
    addr = 3'b001; data_in = 4'b0101; #10;
    addr = 3'b010; data_in = 4'b1100; #10;
    we = 0; addr = 3'b000; #10;
    addr = 3'b001; #10;
    addr = 3'b010; #10;
    $finish;
  end
endmodule`,

  fifo: `// Simple 4-deep FIFO
module fifo_4deep (
  input clk, rst,
  input [7:0] data_in,
  input wr_en, rd_en,
  output reg [7:0] data_out,
  output reg full, empty
);
  reg [7:0] memory [0:3];
  reg [1:0] wr_ptr, rd_ptr;
  reg [2:0] count;
  
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      wr_ptr <= 0; rd_ptr <= 0; count <= 0;
      full <= 0; empty <= 1;
    end else begin
      if (wr_en && !full) begin
        memory[wr_ptr] <= data_in;
        wr_ptr <= wr_ptr + 1;
        count <= count + 1;
      end
      if (rd_en && !empty) begin
        data_out <= memory[rd_ptr];
        rd_ptr <= rd_ptr + 1;
        count <= count - 1;
      end
      full <= (count == 4);
      empty <= (count == 0);
    end
  end
endmodule

module tb_fifo;
  reg clk, rst;
  reg [7:0] data_in;
  reg wr_en, rd_en;
  wire [7:0] data_out;
  wire full, empty;
  
  fifo_4deep uut (.clk(clk), .rst(rst), .data_in(data_in), .wr_en(wr_en), .rd_en(rd_en), .data_out(data_out), .full(full), .empty(empty));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; wr_en = 0; rd_en = 0;
    #10 rst = 0;
    #10 wr_en = 1; data_in = 8'hAA; #10;
    data_in = 8'hBB; #10;
    data_in = 8'hCC; #10;
    wr_en = 0; rd_en = 1; #10;
    #10; #10;
    $finish;
  end
endmodule`,

  pwm: `// PWM Generator
module pwm_generator (
  input clk, rst,
  input [7:0] duty_cycle,
  output reg pwm_out
);
  reg [7:0] counter;
  
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      counter <= 0;
      pwm_out <= 0;
    end else begin
      counter <= counter + 1;
      pwm_out <= (counter < duty_cycle);
    end
  end
endmodule

module tb_pwm;
  reg clk, rst;
  reg [7:0] duty_cycle;
  wire pwm_out;
  
  pwm_generator uut (.clk(clk), .rst(rst), .duty_cycle(duty_cycle), .pwm_out(pwm_out));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; duty_cycle = 8'd128;
    #10 rst = 0;
    #2560;
    duty_cycle = 8'd64;
    #2560;
    duty_cycle = 8'd192;
    #2560;
    $finish;
  end
endmodule`,

  uart_tx: `// Simple UART Transmitter (8N1)
module uart_tx (
  input clk, rst,
  input [7:0] data_in,
  input tx_start,
  output reg tx,
  output reg tx_busy
);
  parameter IDLE = 0, START = 1, DATA = 2, STOP = 3;
  reg [1:0] state;
  reg [2:0] bit_idx;
  reg [7:0] data_reg;
  
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= IDLE;
      tx <= 1;
      tx_busy <= 0;
    end else begin
      case(state)
        IDLE: begin
          tx <= 1;
          if (tx_start) begin
            data_reg <= data_in;
            state <= START;
            tx_busy <= 1;
          end
        end
        START: begin
          tx <= 0;
          bit_idx <= 0;
          state <= DATA;
        end
        DATA: begin
          tx <= data_reg[bit_idx];
          if (bit_idx == 7)
            state <= STOP;
          else
            bit_idx <= bit_idx + 1;
        end
        STOP: begin
          tx <= 1;
          state <= IDLE;
          tx_busy <= 0;
        end
      endcase
    end
  end
endmodule

module tb_uart_tx;
  reg clk, rst;
  reg [7:0] data_in;
  reg tx_start;
  wire tx, tx_busy;
  
  uart_tx uut (.clk(clk), .rst(rst), .data_in(data_in), .tx_start(tx_start), .tx(tx), .tx_busy(tx_busy));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1; tx_start = 0;
    #10 rst = 0;
    #10 data_in = 8'hA5; tx_start = 1;
    #10 tx_start = 0;
    #200;
    $finish;
  end
endmodule`,

  traffic: `// Traffic Light Controller
module traffic_light (
  input clk, rst,
  output reg [2:0] light
);
  parameter RED = 3'b100, YELLOW = 3'b010, GREEN = 3'b001;
  parameter S_RED = 0, S_GREEN = 1, S_YELLOW = 2;
  reg [1:0] state;
  reg [3:0] counter;
  
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= S_RED;
      counter <= 0;
      light <= RED;
    end else begin
      counter <= counter + 1;
      case(state)
        S_RED: begin
          light <= RED;
          if (counter == 10) begin
            state <= S_GREEN;
            counter <= 0;
          end
        end
        S_GREEN: begin
          light <= GREEN;
          if (counter == 8) begin
            state <= S_YELLOW;
            counter <= 0;
          end
        end
        S_YELLOW: begin
          light <= YELLOW;
          if (counter == 3) begin
            state <= S_RED;
            counter <= 0;
          end
        end
      endcase
    end
  end
endmodule

module tb_traffic_light;
  reg clk, rst;
  wire [2:0] light;
  
  traffic_light uut (.clk(clk), .rst(rst), .light(light));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1;
    #10 rst = 0;
    #500;
    $finish;
  end
endmodule`,

  bcd_counter: `// BCD Counter (0-9)
module bcd_counter (
  input clk, rst,
  output reg [3:0] count
);
  always @(posedge clk or posedge rst) begin
    if (rst)
      count <= 4'b0000;
    else if (count == 4'd9)
      count <= 4'b0000;
    else
      count <= count + 1;
  end
endmodule

module tb_bcd_counter;
  reg clk, rst;
  wire [3:0] count;
  
  bcd_counter uut (.clk(clk), .rst(rst), .count(count));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1;
    #10 rst = 0;
    #200;
    $finish;
  end
endmodule`,

  gray_counter: `// Gray Code Counter
module gray_counter (
  input clk, rst,
  output reg [3:0] gray_count
);
  reg [3:0] binary_count;
  
  always @(posedge clk or posedge rst) begin
    if (rst)
      binary_count <= 4'b0000;
    else
      binary_count <= binary_count + 1;
  end
  
  always @(*) begin
    gray_count[3] = binary_count[3];
    gray_count[2] = binary_count[3] ^ binary_count[2];
    gray_count[1] = binary_count[2] ^ binary_count[1];
    gray_count[0] = binary_count[1] ^ binary_count[0];
  end
endmodule

module tb_gray_counter;
  reg clk, rst;
  wire [3:0] gray_count;
  
  gray_counter uut (.clk(clk), .rst(rst), .gray_count(gray_count));
  
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end
  
  initial begin
    rst = 1;
    #10 rst = 0;
    #200;
    $finish;
  end
endmodule`
};

const sampleVerilogCode = sampleCodes.counter;

export default function VerilogEditor() {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(sampleVerilogCode);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [waveformData, setWaveformData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("console");

  useEffect(() => {
    const loadedVerilog = localStorage.getItem("loadedVerilog");
    if (loadedVerilog) {
      try {
        const verilogCode = JSON.parse(loadedVerilog);
        setCode(verilogCode);
        localStorage.removeItem("loadedVerilog");
        toast({ title: "Verilog code loaded from projects" });
      } catch (error) {
        console.error("Failed to load Verilog:", error);
      }
    }
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Simulate
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSimulate();
      }
      // Ctrl/Cmd + Shift + C: Compile
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleCompile();
      }
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code]);

  const compileMutation = useMutation<CompileResult, Error, string>({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "verilog", code }),
      });
      if (!response.ok) throw new Error("Compilation failed");
      return response.json();
    },
    onSuccess: (data) => {
      setConsoleOutput((prev) => [
        ...prev,
        `[COMPILE] ${data.status === "ok" ? "✓ Success" : "✗ Error"}`,
        ...(data.stdout ? [data.stdout] : []),
        ...(data.stderr ? [data.stderr] : []),
        ...(data.message ? [data.message] : []),
        ...(data.usingFallback ? ["⚠ Using fallback simulator"] : []),
      ]);
      setActiveTab("console");
      toast({
        title: data.status === "ok" ? "Compilation successful" : "Compilation failed",
        variant: data.status === "ok" ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setConsoleOutput((prev) => [...prev, `[ERROR] ${error.message}`]);
      toast({ title: "Compilation error", variant: "destructive" });
    },
  });

  const simulateMutation = useMutation<SimulationResult, Error, string>({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "verilog", code }),
      });
      if (!response.ok) throw new Error("Simulation failed");
      return response.json();
    },
    onSuccess: (data) => {
      setConsoleOutput((prev) => [
        ...prev,
        `[SIMULATE] ${data.status === "ok" ? "✓ Success" : "✗ Error"}`,
        ...(data.message ? [data.message] : []),
      ]);
      if (data.waveform) {
        setWaveformData(data.waveform);
        setActiveTab("waveform");
      }
      toast({
        title: data.status === "ok" ? "Simulation successful" : "Simulation failed",
        variant: data.status === "ok" ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setConsoleOutput((prev) => [...prev, `[ERROR] ${error.message}`]);
      toast({ title: "Simulation error", variant: "destructive" });
    },
  });

  const handleCompile = () => {
    setConsoleOutput([]);
    compileMutation.mutate(code);
  };

  const handleSimulate = () => {
    setConsoleOutput([]);
    simulateMutation.mutate(code);
  };

  const saveMutation = useMutation({
    mutationFn: async (verilogCode: string) => {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Verilog ${new Date().toISOString()}`,
          type: "verilog",
          content: verilogCode,
        }),
      });
      if (!response.ok) throw new Error("Failed to save Verilog");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Verilog code saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save Verilog code", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(code);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="text-blue-400 text-lg">💡</div>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-blue-400 font-semibold">
              Quick Start Guide:
            </p>
            <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
              <li>Write your Verilog module (e.g., <code className="bg-blue-500/20 px-1 rounded">module counter</code>)</li>
              <li>Add a testbench module with 'tb' or 'test' in the name (e.g., <code className="bg-blue-500/20 px-1 rounded">module tb_counter</code>)</li>
              <li>Click <strong>Simulate</strong> or press <kbd className="bg-blue-500/20 px-1 rounded">Ctrl+Enter</kbd> to run</li>
              <li>View waveforms in the <strong>Waveform</strong> tab below</li>
              <li>Use <strong>Load Sample</strong> dropdown to try example code</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Verilog Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setCode(sampleCodes[value as keyof typeof sampleCodes])}
          >
            <SelectTrigger className="w-[180px] h-9">
              <BookOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Load Sample" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="counter">4-bit Counter</SelectItem>
              <SelectItem value="dff">D Flip-Flop</SelectItem>
              <SelectItem value="jkff">JK Flip-Flop</SelectItem>
              <SelectItem value="adder">Full Adder</SelectItem>
              <SelectItem value="mux">4:1 Multiplexer</SelectItem>
              <SelectItem value="decoder">3-to-8 Decoder</SelectItem>
              <SelectItem value="encoder">8-to-3 Encoder</SelectItem>
              <SelectItem value="shift">Shift Register</SelectItem>
              <SelectItem value="alu">Simple ALU</SelectItem>
              <SelectItem value="comparator">4-bit Comparator</SelectItem>
              <SelectItem value="parity">Parity Generator</SelectItem>
              <SelectItem value="ram">8x4 RAM</SelectItem>
              <SelectItem value="fifo">4-deep FIFO</SelectItem>
              <SelectItem value="pwm">PWM Generator</SelectItem>
              <SelectItem value="uart_tx">UART Transmitter</SelectItem>
              <SelectItem value="fsm">Sequence Detector FSM</SelectItem>
              <SelectItem value="traffic">Traffic Light</SelectItem>
              <SelectItem value="bcd_counter">BCD Counter</SelectItem>
              <SelectItem value="gray_counter">Gray Code Counter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCode("");
              setConsoleOutput([]);
              setWaveformData(null);
            }}
            title="Clear editor"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCompile}
            disabled={compileMutation.isPending}
            data-testid="button-compile"
          >
            <Zap className="w-4 h-4 mr-2" />
            {compileMutation.isPending ? "Compiling..." : "Compile"}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleSimulate}
            disabled={simulateMutation.isPending}
            data-testid="button-simulate"
          >
            <Play className="w-4 h-4 mr-2" />
            {simulateMutation.isPending ? "Simulating..." : "Simulate"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleSave} data-testid="button-save-verilog">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 border-b border-border">
          <Editor
            height="100%"
            defaultLanguage="verilog"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={(editor) => (editorRef.current = editor)}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "JetBrains Mono, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        <div className="h-80 border-t border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 pt-2 border-b border-border">
              <TabsList>
                <TabsTrigger value="console" data-testid="tab-console">Console</TabsTrigger>
                <TabsTrigger value="waveform" data-testid="tab-waveform">Waveform</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="console" className="flex-1 overflow-hidden mt-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm space-y-1">
                  {consoleOutput.length === 0 ? (
                    <p className="text-muted-foreground">Console output will appear here...</p>
                  ) : (
                    consoleOutput.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("[ERROR]")
                            ? "text-destructive"
                            : line.startsWith("[COMPILE]") || line.startsWith("[SIMULATE]")
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }
                        data-testid={`console-line-${i}`}
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="waveform" className="flex-1 overflow-hidden mt-0 p-0">
              {waveformData ? (
                <WaveformViewer data={waveformData} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No waveform data available. Run a simulation first.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
