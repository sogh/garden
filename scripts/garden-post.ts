#!/usr/bin/env tsx
/**
 * garden post — capture a rough thought, get back a draft note.
 *
 * Usage:
 *   npm run post
 *   npm run post -- "quick idea about drop-2 voicings"
 *   echo "something I was thinking" | npm run post -- --stdin
 *
 * The CLI:
 *   1. Reads AGENTS.md and a sample of existing notes for context.
 *   2. Sends your rough thought + context to Claude.
 *   3. Writes a draft markdown file under src/content/notes/.
 *   4. Prints the path. You review the diff and commit (or trash it).
 *
 * Set ANTHROPIC_API_KEY in your env (or in a .env file at the repo root).
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NOTES_DIR = join(ROOT, 'src/content/notes');
const AGENTS_PATH = join(ROOT, 'AGENTS.md');

const MODEL = 'claude-opus-4-7';

// ---------- helpers ----------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

async function readAgents(): Promise<string> {
  try {
    return await readFile(AGENTS_PATH, 'utf8');
  } catch {
    return '';
  }
}

async function readNoteSample(limit = 8): Promise<string> {
  // Send the agent a sample of recent note titles + frontmatter as link bait.
  if (!existsSync(NOTES_DIR)) return '';
  const files = await readdir(NOTES_DIR);
  const samples: string[] = [];
  for (const f of files.slice(0, limit)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
    const content = await readFile(join(NOTES_DIR, f), 'utf8');
    const frontmatter = content.split('---')[1] ?? '';
    const slug = f.replace(/\.(md|mdx)$/, '');
    samples.push(`### ${slug}\n${frontmatter.trim()}`);
  }
  return samples.join('\n\n');
}

async function getRoughThought(): Promise<string> {
  const args = argv.slice(2).filter(a => !a.startsWith('--'));
  if (args.length > 0) return args.join(' ');

  if (argv.includes('--stdin')) {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString('utf8').trim();
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  console.log('\n  what are you tinkering with? (end with empty line)\n');
  const lines: string[] = [];
  while (true) {
    const line = await rl.question('  > ');
    if (line === '') break;
    lines.push(line);
  }
  rl.close();
  return lines.join('\n');
}

// ---------- main ----------

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set. Add it to your env or .env file.');
    exit(1);
  }

  const thought = await getRoughThought();
  if (!thought) {
    console.error('No input. Nothing to draft.');
    exit(1);
  }

  const agents = await readAgents();
  const sample = await readNoteSample();

  const systemPrompt = `You are drafting a note for Mark's digital garden.

Read AGENTS.md carefully — voice, frontmatter, tag taxonomy, and what NEVER to do
are all defined there. The voice rules are strict.

You will be given:
1. A rough thought from Mark (the seed).
2. A sample of existing notes (titles + frontmatter) so you can suggest [[wiki-links]] that point to real notes.

Output ONLY the markdown file content, starting with the frontmatter \`---\` block.
Do NOT wrap in code fences. Do NOT add commentary before or after.

Default to:
- growth: seedling
- source: agent (you are the agent)
- title: concept-oriented, lowercase-leaning, short
- length: short. A seedling can be three paragraphs. If it's longer than that,
  ask yourself whether you're padding.

If the thought references a project or concept that exists in the sample,
LINK to it via [[wiki-link]]. If it references something that probably should
exist but doesn't yet, link to it anyway — broken links are visible in the UI
and signal "stub me out next."

----- AGENTS.md -----
${agents}

----- existing notes sample (frontmatter only) -----
${sample}
-----`;

  const client = new Anthropic({ apiKey });

  console.log('\n  drafting...\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Rough thought:\n\n${thought}` }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();

  // Pull the title out of frontmatter for the filename
  const titleMatch = text.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = titleMatch?.[1] ?? 'untitled-seedling';
  const slug = slugify(title);
  const path = join(NOTES_DIR, `${slug}.md`);

  if (existsSync(path)) {
    const ts = new Date().toISOString().slice(0, 10);
    const altPath = join(NOTES_DIR, `${slug}-${ts}.md`);
    await writeFile(altPath, text + '\n');
    console.log(`  draft written: ${altPath}`);
    console.log(`  (a file at ${path} already exists — saved alongside)\n`);
  } else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text + '\n');
    console.log(`  draft written: ${path}\n`);
  }

  console.log('  review it. edit. commit or delete.\n');
}

main().catch(err => {
  console.error(err);
  exit(1);
});
