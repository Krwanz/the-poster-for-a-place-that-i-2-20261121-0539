// Velmaris — a travel poster for a place that isn't there.
// main.ts copies the poster image into the make.fun output directory
// as /output/entry.png. The image is a 1024x1024 JPEG (under 1 MiB),
// a vintage travel poster for Velmaris, a floating-island archipelago
// above a sea of cloud at golden hour, with the invented place's name
// set in large legible type. No network, no dependencies: Node 22 stdlib only.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Clear the output directory's contents only — never remove the directory itself.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

const MAX_BYTES = 1_048_576;
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

// Read the written output back and verify it is really the poster we meant
// to ship: small enough for the 1 MiB gate, and a JPEG whose frame size is
// 1024x1024. Fail loudly instead of silently leaving a bad entry behind.
function verifyOutput(path: string): void {
  const bytes = readFileSync(path);
  if (bytes.length > MAX_BYTES) {
    throw new Error(
      `entry.png is ${bytes.length} bytes, over the ${MAX_BYTES} byte limit`,
    );
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error("entry.png is not a JPEG (missing SOI marker)");
  }
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new Error(`corrupt JPEG marker at offset ${offset}`);
    }
    const marker = bytes[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const height = bytes.readUInt16BE(offset + 5);
      const width = bytes.readUInt16BE(offset + 7);
      if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
        throw new Error(
          `entry.png is ${width}x${height}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`,
        );
      }
      return;
    }
    const segmentLength = bytes.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }
  throw new Error("entry.png has no JPEG frame header (SOF marker)");
}

const outPath = join(outDir, "entry.png");
copyFileSync(join(here, "poster.jpg"), outPath);
verifyOutput(outPath);
console.log("wrote /output/entry.png (Velmaris poster, 1024x1024)");
