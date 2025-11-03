// 4-bit Shift Register (Serial In, Parallel Out)
// Demonstrates sequential logic and data shifting

module shift_register_4bit (
  input clk,
  input rst,
  input serial_in,
  output reg [3:0] parallel_out
);

  always @(posedge clk or posedge rst) begin
    if (rst)
      parallel_out <= 4'b0000;
    else
      parallel_out <= {parallel_out[2:0], serial_in};
  end

endmodule

// Testbench
module tb_shift_register;
  reg clk, rst, serial_in;
  wire [3:0] parallel_out;

  shift_register_4bit uut (
    .clk(clk),
    .rst(rst),
    .serial_in(serial_in),
    .parallel_out(parallel_out)
  );

  // Clock generation
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  // Test stimulus
  initial begin
    rst = 1;
    serial_in = 0;
    #10 rst = 0;
    
    // Shift in pattern: 1011
    #10 serial_in = 1;
    #10 serial_in = 0;
    #10 serial_in = 1;
    #10 serial_in = 1;
    
    // Shift in zeros
    #10 serial_in = 0;
    #10 serial_in = 0;
    #10 serial_in = 0;
    #10 serial_in = 0;
    
    #50 $finish;
  end

endmodule
