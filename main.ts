// HomeLedger hand-in: assemble the finished site into the grader's output
// folder and write the dossier that describes it. Outside the grader the
// MAKEFUN_OUTPUT_DIR variable stands in for /output, so a local run can
// point the hand-in at a scratch folder instead.
import { mkdirSync, cpSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Limits the grader applies to the hand-in: how large the dossier may be,
// how many screenshots and how big each may be, and how much the app
// folder may hold in files and total bytes.
const CAPS = {
  text_max_bytes: 163840,
  screenshots_max_count: 4,
  screenshot_max_bytes: 262144,
  app_max_entries: 993,
  app_max_bytes: 16777216,
};

const HERE = dirname(fileURLToPath(import.meta.url));

function assemble(): string {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });

  const appDir = resolve(HERE, "app");
  cpSync(appDir, join(outDir, "app"), { recursive: true });

  const shotsDir = resolve(HERE, "screenshots");
  if (existsSync(shotsDir)) {
    const outShots = join(outDir, "screenshots");
    mkdirSync(outShots, { recursive: true });
    cpSync(shotsDir, outShots, { recursive: true });
  }

  const dossierBytes = buildDossier(outDir, CAPS);
  if (!dossierBytes) {
    throw new Error("hand-in refused: dossier came back empty");
  }
  const dossier = new TextDecoder("utf-8").decode(dossierBytes);
  if (dossier.trim().length < 100) {
    throw new Error("hand-in refused: dossier came back empty");
  }
  writeFileSync(join(outDir, "dossier.json"), dossier);
  return outDir;
}

function publish(): void {
  const dir = assemble();
  console.log("HomeLedger handed in to " + dir);
}

publish();
