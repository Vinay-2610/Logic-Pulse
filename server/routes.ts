import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";
import { parseVCD } from "./verilog/vcd-parser";
import { simulateVerilogFallback, compileVerilogFallback } from "./verilog/fallback-simulator";
import type { CompileResult, SimulationResult } from "@shared/schema";

const execAsync = promisify(exec);

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", message: "LogicPulse server running" });
  });

  app.post("/api/compile", async (req, res) => {
    try {
      const { code, language } = req.body;

      if (language !== "verilog") {
        res.status(400).json({ status: "error", message: "Only Verilog is supported" });
        return;
      }

      const dataDir = join(process.cwd(), "server", "data");
      await mkdir(dataDir, { recursive: true });

      const fileId = nanoid();
      const verilogFile = join(dataDir, `${fileId}.v`);
      await writeFile(verilogFile, code);

      let result: CompileResult;

      try {
        const { stdout, stderr } = await execAsync(
          `iverilog -g2012 -o ${dataDir}/${fileId}.out ${verilogFile}`
        );

        result = {
          status: "ok",
          stdout: stdout || "Compilation successful",
          stderr: stderr || "",
          usingFallback: false,
        };
      } catch (error: any) {
        if (error.message.includes("iverilog") && error.message.includes("not found")) {
          const fallbackResult = compileVerilogFallback(code);
          result = {
            status: fallbackResult.status as "ok" | "error",
            message: fallbackResult.message,
            stderr: fallbackResult.stderr,
            usingFallback: true,
          };
        } else {
          result = {
            status: "error",
            stderr: error.stderr || error.message,
            message: "Compilation failed",
          };
        }
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const { code, language } = req.body;

      if (language !== "verilog") {
        res.status(400).json({ status: "error", message: "Only Verilog is supported" });
        return;
      }

      const dataDir = join(process.cwd(), "server", "data");
      await mkdir(dataDir, { recursive: true });

      const fileId = nanoid();
      const verilogFile = join(dataDir, `${fileId}.v`);
      await writeFile(verilogFile, code);

      let result: SimulationResult;

      try {
        await execAsync(`iverilog -g2012 -o ${dataDir}/${fileId}.out ${verilogFile}`);

        const vcdFile = join(dataDir, `${fileId}.vcd`);

        const testbench = code.includes("$dumpfile") ? code : code + `\ninitial begin\n  $dumpfile("${vcdFile}");\n  $dumpvars(0);\nend\n`;
        await writeFile(verilogFile, testbench);
        await execAsync(`iverilog -g2012 -o ${dataDir}/${fileId}.out ${verilogFile}`);

        const { stdout } = await execAsync(`vvp ${dataDir}/${fileId}.out`);

        try {
          const vcdContent = await readFile(vcdFile, "utf-8");
          const waveform = parseVCD(vcdContent);

          result = {
            status: "ok",
            waveform,
            message: "Simulation completed successfully",
            vcdPath: vcdFile,
          };
        } catch (parseError) {
          result = {
            status: "error",
            message: "Failed to parse VCD file",
          };
        }
      } catch (error: any) {
        if (error.message.includes("iverilog") && error.message.includes("not found")) {
          try {
            const waveform = simulateVerilogFallback(code);
            result = {
              status: "ok",
              waveform,
              message: "Simulation completed using fallback simulator (limited Verilog support)",
            };
          } catch (fallbackError: any) {
            result = {
              status: "error",
              message: fallbackError.message || "Fallback simulation failed",
            };
          }
        } else {
          result = {
            status: "error",
            message: error.stderr || error.message || "Simulation failed",
          };
        }
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  });

  app.post("/api/parse-vcd", async (req, res) => {
    try {
      const { vcdContent } = req.body;

      if (!vcdContent) {
        res.status(400).json({ status: "error", message: "VCD content is required" });
        return;
      }

      const waveform = parseVCD(vcdContent);
      res.json({ status: "ok", waveform });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to parse VCD",
      });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch projects",
      });
    }
  });

  app.post("/api/projects/save", async (req, res) => {
    try {
      const { name, type, content } = req.body;

      if (!name || !type || !content) {
        res.status(400).json({
          status: "error",
          message: "Name, type, and content are required",
        });
        return;
      }

      const project = await storage.createProject({ name, type, content });
      res.json(project);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to save project",
      });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);

      if (!project) {
        res.status(404).json({
          status: "error",
          message: "Project not found",
        });
        return;
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to load project",
      });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);

      if (!deleted) {
        res.status(404).json({
          status: "error",
          message: "Project not found",
        });
        return;
      }

      res.json({ status: "ok", message: "Project deleted" });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete project",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
