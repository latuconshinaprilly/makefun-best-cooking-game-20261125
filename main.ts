// Gelato Giardino — entrypoint for the make.fun cooking-game bounty.
//
// What this program does, in plain terms: it assembles the submission
// folder. The playable game lives under game/ and the judge-facing renders
// under screenshots/; both are copied, untouched, into the output directory
// (MAKEFUN_OUTPUT_DIR when set, /output inside the grader). Finally it asks
// the vendored kit library to describe that assembled folder and writes the
// resulting dossier.json next to the copies, so the scorer can verify the
// entry describes itself honestly.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fresh copies of the two payload folders.
mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// Gate limits for this bounty, passed in full so a local run fails in
// exactly the same places the real scorer would refuse the entry.
const gateCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, gateCaps));
