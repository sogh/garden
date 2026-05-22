#!/usr/bin/env tsx
/**
 * garden digest — scan recent commits across configured project repos
 * and draft a weekly "what changed" note.
 *
 * Designed to run as a scheduled GitHub Action (see .github/workflows/digest.yml)
 * or locally:
 *
 *   npm run digest
 *   npm run digest -- --since "7 days ago"
 *
 * Configure the list of repos in garden.config.json at the repo root, OR via
 * the GARDEN_REPOS env var (comma-separated paths).
 *
 * Outputs a draft digest under src/content/digests/. In CI, the digest commit
 * should be opened as a PR — never merged automatically.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIGESTS_DIR = join(ROOT, 'src/content/digests');
const AGENTS_PATH = join(ROOT, 'AGENTS.md');
const CONFIG_PATH = join(ROOT, 'garden.config.json');

const MODEL = 'claude-opus-4-7';

// ---------- helpers ----------

function arg(name: string, fallback: string): string {
  const idx = argv.indexOf(`--${name}`);
  return idx >= 0 && argv[idx + 1] ? argv[idx + 1] : fallback;
}

function isoWeek(d: Date): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

interface RepoConfig {
  name: string;
  path: string;
}

async function loadRepos(): Promise<RepoConfig[]> {
  if (process.env.GARDEN_REPOS) {
    return process.env.GARDEN_REPOS.split(',').map(p => ({
      path: p.trim(),
      name: basename(p.trim()),
    }));
  }
  if (existsSync(CONFIG_PATH)) {
    const cfg = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
    return cfg.repos ?? [];
  }
  return [];
}

function readGitLog(repoPath: string, since: string): string {
  try {
    const out = execSync(
      `git -C "${repoPath}" log --since="${since}" --pretty=format:"- %s (%h)" --no-merges`,
      { encoding: 'utf8' }
    );
    return out.trim();
  } catch (err) {
    return `(could not read git log: ${(err as Error).message})`;
  }
}

// ---------- main ----------

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set.');
    exit(1);
  }

  const since = arg('since', '7 days ago');
  const repos = await loadRepos();

  if (repos.length === 0) {
    console.error('No repos configured. Set GARDEN_REPOS or create garden.config.json.');
    console.error('Example garden.config.json:');
    console.error(JSON.stringify({ repos: [{ name: 'harmonic-atlas', path: '../fretboard-explorer' }] }, null, 2));
    exit(1);
  }

  // Gather commits per repo
  const commitsByRepo: Record<string, string> = {};
  for (const r of repos) {
    if (!existsSync(r.path)) {
      console.warn(`  skipping ${r.name}: path not found (${r.path})`);
      continue;
    }
    const log = readGitLog(r.path, since);
    if (log) commitsByRepo[r.name] = log;
  }

  if (Object.keys(commitsByRepo).length === 0) {
    console.log('  no commits in the window across any repo. nothing to digest.');
    exit(0);
  }

  const agents = await readFile(AGENTS_PATH, 'utf8').catch(() => '');

  const commitsBlock = Object.entries(commitsByRepo)
    .map(([repo, log]) => `### ${repo}\n${log}`)
    .join('\n\n');

  const systemPrompt = `You are drafting a weekly digest for Mark's digital garden.

Read AGENTS.md carefully — voice rules apply. Especially: no marketing speak,
no inventing progress, no "exciting developments." If a repo had a quiet week,
say so plainly.

You will be given commit messages from the last week, grouped by repo.

Output ONLY the markdown content of the digest. Frontmatter first. Then a short
section per active repo with 2–4 sentences of substantive analysis (what
changed, what's interesting, what feels stuck). If a repo had nothing worth
highlighting, write a one-line "quiet week" line for it. End with the standard
provenance note.

Frontmatter:
- title: "Week of [Mon DD] — what changed" (use the most recent Monday)
- kind: digest (the schema default)
- growth: evergreen (digests are dated and stable once written)
- source: agent
- period: ISO week (e.g. 2026-W21)
- projects: [array of repo names that had activity]

Link to project notes via [[wiki-link]] where they exist — common ones are
[[the-harmonic-atlas-project]], [[dinner-party-progress]], [[harmonia]],
[[songmap]].

End with this provenance line, italicized:
*This digest was drafted by an agent from commit messages and recent notes.
Edited lightly before publishing.*

----- AGENTS.md -----
${agents}
-----`;

  const client = new Anthropic({ apiKey });

  console.log(`\n  digesting commits since "${since}"...\n`);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Commits since ${since}:\n\n${commitsBlock}`,
    }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();

  const week = isoWeek(new Date()).toLowerCase();
  const path = join(DIGESTS_DIR, `${week}.md`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text + '\n');

  console.log(`  digest written: ${path}\n`);
  console.log('  review, edit, open a PR.\n');
}

main().catch(err => {
  console.error(err);
  exit(1);
});
