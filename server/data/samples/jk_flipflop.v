// JK Flip-Flop
module jk_flipflop (
  input j,
  input k,
  input clk,
  input rst,
  output reg q,
  output q_bar
);

  assign q_bar = ~q;

  always @(posedge clk or posedge rst) begin
    if (rst)
      q <= 1'b0;
    else begin
      case ({j, k})
        2'b00: q <= q;       // No change
        2'b01: q <= 1'b0;    // Reset
        2'b10: q <= 1'b1;    // Set
        2'b11: q <= ~q;      // Toggle
      endcase
    end
  end

endmodule

// Testbench
module tb_jk_flipflop;
  reg j, k, clk, rst;
  wire q, q_bar;

  jk_flipflop uut (
    .j(j),
    .k(k),
    .clk(clk),
    .rst(rst),
    .q(q),
    .q_bar(q_bar)
  );

  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  initial begin
    $dumpfile("jk_flipflop.vcd");
    $dumpvars(0, tb_jk_flipflop);
    
    rst = 1;
    j = 0; k = 0;
    #10 rst = 0;
    
    #10 j = 0; k = 1;  // Reset
    #10 j = 1; k = 0;  // Set
    #10 j = 0; k = 0;  // Hold
    #10 j = 1; k = 1;  // Toggle
    #10 j = 1; k = 1;  // Toggle again
    
    #20 $finish;
  end

endmodule
