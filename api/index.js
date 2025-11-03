// Vercel serverless function entry point
// This file is compiled by Vercel, so we import from the source
import express from 'express';
import { storage } from '../server/storage.js';
import { parseVCD } from '../server/verilog/vcd-parser.js';
import { simulateVerilogFallback, compileVerilogFallback } from '../server/verilog/fallback-simulator.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

let app;

async function createApp() {
  const expressApp = express();
  
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));

  // API Routes
  expressApp.get("/api/status", (req, res) => {
    res.json({ status: "ok", message: "LogicPulse server running" });
  });

  expressApp.post("/api/compile", async (req, res) => {
    try {
      const { code, language } = req.body;

      if (language !== "verilog") {
        res.status(400).json({ status: "error", message: "Only Verilog is supported" });
        return;
      }

      const dataDir = "/tmp";
      const fileId = nanoid();
      const verilogFile = join(dataDir, `${fileId}.v`);
      await writeFile(verilogFile, code);

      let result;

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
      } catch (error) {
        const fallbackResult = compileVerilogFallback(code);
        result = {
          status: fallbackResult.status,
          message: fallbackResult.message,
          stderr: fallbackResult.stderr,
          usingFallback: true,
        };
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  });

  expressApp.post("/api/simulate", async (req, res) => {
    try {
      const { code, language } = req.body;

      if (language !== "verilog") {
        res.status(400).json({ status: "error", message: "Only Verilog is supported" });
        return;
      }

      const dataDir = "/tmp";
      const fileId = nanoid();
      const verilogFile = join(dataDir, `${fileId}.v`);
      await writeFile(verilogFile, code);

      let result;

      try {
        await execAsync(`iverilog -g2012 -o ${dataDir}/${fileId}.out ${verilogFile}`);
        const vcdFile = join(dataDir, `${fileId}.vcd`);
        const testbench = code.includes("$dumpfile") ? code : code + `\ninitial begin\n  $dumpfile("${vcdFile}");\n  $dumpvars(0);\nend\n`;
        await writeFile(verilogFile, testbench);
        await execAsync(`iverilog -g2012 -o ${dataDir}/${fileId}.out ${verilogFile}`);
        await execAsync(`vvp ${dataDir}/${fileId}.out`);

        const vcdContent = await readFile(vcdFile, "utf-8");
        const waveform = parseVCD(vcdContent);

        result = {
          status: "ok",
          waveform,
          message: "Simulation completed successfully",
          vcdPath: vcdFile,
        };
      } catch (error) {
        try {
          const waveform = simulateVerilogFallback(code);
          result = {
            status: "ok",
            waveform,
            message: "Simulation completed using fallback simulator (limited Verilog support). Install iverilog for full support.",
          };
        } catch (fallbackError) {
          result = {
            status: "error",
            message: `Fallback simulation failed: ${fallbackError.message || "Unknown error"}`,
          };
        }
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  });

  expressApp.post("/api/parse-vcd", async (req, res) => {
    try {
      const { vcdContent } = req.body;

      if (!vcdContent) {
        res.status(400).json({ status: "error", message: "VCD content is required" });
        return;
      }

      const waveform = parseVCD(vcdContent);
      res.json({ status: "ok", waveform });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to parse VCD",
      });
    }
  });

  expressApp.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch projects",
      });
    }
  });

  expressApp.post("/api/projects/save", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to save project",
      });
    }
  });

  expressApp.get("/api/projects/:id", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to load project",
      });
    }
  });

  expressApp.delete("/api/projects/:id", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete project",
      });
    }
  });

  // Serve static files from dist/public
  const distPath = path.join(__dirname, '..', 'dist', 'public');
  expressApp.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  return expressApp;
}

export default async function handler(req, res) {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
}
