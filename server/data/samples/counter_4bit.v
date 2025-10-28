// 4-bit Counter Example
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

// Testbench
module tb_counter;
  reg clk, rst;
  wire [3:0] count;

  counter_4bit uut (
    .clk(clk),
    .rst(rst),
    .count(count)
  );

  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  initial begin
    $dumpfile("counter.vcd");
    $dumpvars(0, tb_counter);
    
    rst = 1;
    #10 rst = 0;
    #200 $finish;
  end

endmodule
