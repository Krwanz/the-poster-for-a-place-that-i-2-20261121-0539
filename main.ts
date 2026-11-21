// Velmaris — a travel poster for a place that isn't there.
// main.ts copies the poster image into the make.fun output directory
// as /output/entry.png. The image is a 1024x1024 JPEG (under 1 MiB),
// a vintage travel poster for Velmaris, a floating-island archipelago
// above a sea of cloud at golden hour, with the invented place's name
// set in large legible type. No network, no dependencies: Node 22 stdlib only.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Clear the output directory's contents only — never remove the directory itself.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

copyFileSync(join(here, "poster.jpg"), join(outDir, "entry.png"));
console.log("wrote /output/entry.png (Velmaris poster, 1024x1024)");
