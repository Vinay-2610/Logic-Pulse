// Full Adder - Adds two bits plus carry-in
// Demonstrates combinational logic

module full_adder (
  input a,
  input b,
  input cin,
  output sum,
  output cout
);

  assign sum = a ^ b ^ cin;
  assign cout = (a & b) | (b & cin) | (a & cin);

endmodule

// Testbench
module tb_full_adder;
  reg a, b, cin;
  wire sum, cout;

  // Instantiate full adder
  full_adder uut (
    .a(a),
    .b(b),
    .cin(cin),
    .sum(sum),
    .cout(cout)
  );

  // Test all input combinations
  initial begin
    $display("Testing Full Adder");
    $display("A B Cin | Sum Cout");
    $display("--------|----------");
    
    a = 0; b = 0; cin = 0; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 0; b = 0; cin = 1; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 0; b = 1; cin = 0; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 0; b = 1; cin = 1; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 1; b = 0; cin = 0; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 1; b = 0; cin = 1; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 1; b = 1; cin = 0; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    a = 1; b = 1; cin = 1; #10;
    $display("%b %b  %b  |  %b   %b", a, b, cin, sum, cout);
    
    #10 $finish;
  end

endmodule
