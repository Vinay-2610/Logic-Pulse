// D Flip-Flop with Clock and Reset
// Demonstrates sequential logic and state storage

module d_flipflop (
  input clk,
  input rst,
  input d,
  output reg q,
  output reg q_bar
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

// Testbench
module tb_d_flipflop;
  reg clk, rst, d;
  wire q, q_bar;

  // Instantiate D flip-flop
  d_flipflop uut (
    .clk(clk),
    .rst(rst),
    .d(d),
    .q(q),
    .q_bar(q_bar)
  );

  // Clock generation
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  // Test stimulus
  initial begin
    // Initialize
    rst = 1;
    d = 0;
    #10 rst = 0;
    
    // Test different input patterns
    #10 d = 1;
    #20 d = 0;
    #20 d = 1;
    #20 d = 0;
    #20 d = 1;
    #20 d = 1;
    #20 d = 0;
    
    #50 $finish;
  end

endmodule
