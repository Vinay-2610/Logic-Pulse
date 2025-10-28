// Traffic Light Controller
module traffic_light (
  input clk,
  input rst,
  output reg [2:0] light  // [red, yellow, green]
);

  parameter RED = 3'b100;
  parameter YELLOW = 3'b010;
  parameter GREEN = 3'b001;
  
  reg [1:0] state;
  reg [3:0] counter;
  
  parameter STATE_RED = 2'b00;
  parameter STATE_YELLOW = 2'b01;
  parameter STATE_GREEN = 2'b10;

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= STATE_RED;
      counter <= 0;
      light <= RED;
    end else begin
      if (counter == 4'd15) begin
        counter <= 0;
        case (state)
          STATE_RED: begin
            state <= STATE_GREEN;
            light <= GREEN;
          end
          STATE_GREEN: begin
            state <= STATE_YELLOW;
            light <= YELLOW;
          end
          STATE_YELLOW: begin
            state <= STATE_RED;
            light <= RED;
          end
          default: begin
            state <= STATE_RED;
            light <= RED;
          end
        endcase
      end else begin
        counter <= counter + 1;
      end
    end
  end

endmodule

// Testbench
module tb_traffic_light;
  reg clk, rst;
  wire [2:0] light;

  traffic_light uut (
    .clk(clk),
    .rst(rst),
    .light(light)
  );

  initial begin
    clk = 0;
    forever #5 clk = ~clk;
  end

  initial begin
    $dumpfile("traffic_light.vcd");
    $dumpvars(0, tb_traffic_light);
    
    rst = 1;
    #10 rst = 0;
    
    #1000 $finish;
  end

endmodule
