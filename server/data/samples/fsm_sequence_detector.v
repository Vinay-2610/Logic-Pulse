// Finite State Machine - Sequence Detector (detects "101")
// Demonstrates state machine design

module sequence_detector (
  input clk,
  input rst,
  input data_in,
  output reg detected
);

  // State encoding
  parameter S0 = 2'b00;  // Initial state
  parameter S1 = 2'b01;  // Detected '1'
  parameter S2 = 2'b10;  // Detected '10'
  parameter S3 = 2'b11;  // Detected '101'

  reg [1:0] state, next_state;

  // State register
  always @(posedge clk or posedge rst) begin
    if (rst)
      state <= S0;
    else
      state <= next_state;
  end

  // Next state logic
  always @(*) begin
    case(state)
      S0: next_state = data_in ? S1 : S0;
      S1: next_state = data_in ? S1 : S2;
      S2: next_state = data_in ? S3 : S0;
      S3: next_state = data_in ? S1 : S2;
      default: next_state = S0;
    endcase
  end

  // Output logic
  always @(*) begin
    detected = (state == S3);
  end

endmodule

// Testbench
module tb_sequence_detector;
  reg clk, rst, data_in;
  wire detected;

  sequence_detector uut (
    .clk(clk),
    .rst(rst),
    .data_in(data_in),
    .detected(detected)
  );

  // Clock generation
  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  // Test stimulus
  initial begin
    rst = 1;
    data_in = 0;
    #10 rst = 0;
    
    // Send sequence: 1 0 1 0 1 1 0 1
    #10 data_in = 1;  // 1
    #10 data_in = 0;  // 10
    #10 data_in = 1;  // 101 - DETECTED!
    #10 data_in = 0;  // 0
    #10 data_in = 1;  // 01
    #10 data_in = 1;  // 11
    #10 data_in = 0;  // 10
    #10 data_in = 1;  // 101 - DETECTED!
    
    #50 $finish;
  end

endmodule
