// Copies non-TypeScript runtime assets into dist/ after `tsc -b`, which only
// emits compiled .js — it never copies .json (or any other static file)
// even with resolveJsonModule enabled. Without this, loadCars.ts's
// same-directory `cars.json` lookup (relative to its own compiled location)
// resolves to a file that was never placed in dist/data/, and the server
// crashes on startup with ENOENT.
//
// Plain Node + fs.cpSync — no shell `cp`, so this runs identically on
// Linux (Render/Railway), macOS, and Windows.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(scriptDir, "..");

const ASSETS = [{ from: ["src", "data", "cars.json"], to: ["dist", "data", "cars.json"] }];

for (const asset of ASSETS) {
  const source = path.join(serverRoot, ...asset.from);
  const destination = path.join(serverRoot, ...asset.to);

  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination);

  if (!existsSync(destination)) {
    throw new Error(`copyAssets: expected ${destination} to exist after copy but it doesn't`);
  }

  console.log(`copyAssets: ${path.relative(serverRoot, source)} -> ${path.relative(serverRoot, destination)}`);
}
