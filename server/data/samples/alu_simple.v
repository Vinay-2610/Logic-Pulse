// Simple 4-bit ALU (Arithmetic Logic Unit)
// Performs ADD, SUB, AND, OR operations

module alu_4bit (
  input [3:0] a,
  input [3:0] b,
  input [1:0] op,  // 00=ADD, 01=SUB, 10=AND, 11=OR
  output reg [3:0] result,
  output reg carry
);

  always @(*) begin
    carry = 0;
    case(op)
      2'b00: {carry, result} = a + b;      // ADD
      2'b01: {carry, result} = a - b;      // SUB
      2'b10: result = a & b;               // AND
      2'b11: result = a | b;               // OR
      default: result = 4'b0000;
    endcase
  end

endmodule

// Testbench
module tb_alu;
  reg [3:0] a, b;
  reg [1:0] op;
  wire [3:0] result;
  wire carry;

  alu_4bit uut (
    .a(a),
    .b(b),
    .op(op),
    .result(result),
    .carry(carry)
  );

  initial begin
    // Test ADD
    a = 4'b0011; b = 4'b0101; op = 2'b00; #10;  // 3 + 5 = 8
    a = 4'b1111; b = 4'b0001; op = 2'b00; #10;  // 15 + 1 = 16 (overflow)
    
    // Test SUB
    a = 4'b0101; b = 4'b0011; op = 2'b01; #10;  // 5 - 3 = 2
    
    // Test AND
    a = 4'b1100; b = 4'b1010; op = 2'b10; #10;  // 1100 & 1010 = 1000
    
    // Test OR
    a = 4'b1100; b = 4'b1010; op = 2'b11; #10;  // 1100 | 1010 = 1110
    
    #20 $finish;
  end

endmodule
