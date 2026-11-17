import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createApiApp } from "./src/server/createApp.ts";

dotenv.config();

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 3000;
}

const PORT = resolvePort();

async function startServer() {
  const app = createApiApp();
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isDev = process.env.NODE_ENV === "development";

  if (isDev || !hasDist) {
    const vitePromise = import("vite").then(({ createServer: createViteServer }) =>
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      })
    );

    vitePromise.catch((err) => {
      console.error("Failed to initialize Vite dev middleware:", err);
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GymX Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
