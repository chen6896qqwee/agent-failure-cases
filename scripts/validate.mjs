#!/usr/bin/env node
/**
 * Zero-dependency validator + index builder for Agent Failure Cases.
 *
 *   node scripts/validate.mjs            # validate cases/*.json, rebuild cases/index.json
 *   node scripts/validate.mjs --check    # validate only, fail if index.json is stale
 *
 * Exits non-zero on any violation. Agents: run this before opening a PR.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const casesDir = join(root, 'cases');
const indexPath = join(casesDir, 'index.json');
const checkOnly = process.argv.includes('--check');

const REQUIRED = [
  'id', 'title', 'domain', 'tags', 'symptom',
  'wrong_handling', 'root_cause', 'correct_handling',
  'guardrail', 'reported_at', 'confidence',
];
const ENUMS = {
  status: ['draft', 'verified', 'disputed', 'retired'],
  severity: ['low', 'medium', 'high', 'critical'],
  confidence: ['low', 'medium', 'high'],
};

const errors = [];
const cases = [];

const files = readdirSync(casesDir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort();

for (const file of files) {
  const label = `cases/${file}`;
  let data;
  try {
    data = JSON.parse(readFileSync(join(casesDir, file), 'utf8'));
  } catch (e) {
    errors.push(`${label}: invalid JSON — ${e.message}`);
    continue;
  }

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      errors.push(`${label}: missing required field "${key}"`);
    }
  }

  if (typeof data.id === 'string' && !/^FC-\d{4}$/.test(data.id)) {
    errors.push(`${label}: id must match FC-NNNN, got "${data.id}"`);
  }
  if (data.id && !file.startsWith(data.id)) {
    errors.push(`${label}: filename must start with the id "${data.id}"`);
  }
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (data[key] !== undefined && !allowed.includes(data[key])) {
      errors.push(`${label}: ${key} must be one of ${allowed.join('|')}, got "${data[key]}"`);
    }
  }
  for (const key of ['tags', 'wrong_handling', 'correct_handling', 'guardrail']) {
    if (Array.isArray(data[key]) && data[key].length === 0) {
      errors.push(`${label}: "${key}" must not be empty (wrong_handling especially — it is the point of this repo)`);
    }
  }
  for (const key of ['symptom', 'root_cause']) {
    if (typeof data[key] === 'string' && data[key].trim().length < 20) {
      errors.push(`${label}: "${key}" is too short to be useful`);
    }
  }
  if (typeof data.reported_at === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(data.reported_at)) {
    errors.push(`${label}: reported_at must be YYYY-MM-DD`);
  }

  cases.push({
    id: data.id,
    title: data.title,
    title_zh: data.title_zh,
    domain: data.domain,
    tags: data.tags,
    severity: data.severity,
    symptom: data.symptom,
    wrong_handling: data.wrong_handling,
    root_cause: data.root_cause,
    correct_handling: data.correct_handling,
    guardrail: data.guardrail,
    confidence: data.confidence,
    reported_at: data.reported_at,
    file: `cases/${file}`,
  });
}

const ids = new Set();
for (const c of cases) {
  if (ids.has(c.id)) errors.push(`duplicate id: ${c.id}`);
  ids.add(c.id);
}

const index = {
  schema_version: 1,
  generated_by: 'scripts/validate.mjs',
  count: cases.length,
  note: 'Machine entrypoint for agents. Match on symptom/tags, apply correct_handling, skip wrong_handling.',
  cases,
};
const serialized = JSON.stringify(index, null, 2) + '\n';

if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

if (checkOnly) {
  let current = '';
  try { current = readFileSync(indexPath, 'utf8'); } catch {}
  if (current !== serialized) {
    console.error('FAIL — cases/index.json is stale. Run: node scripts/validate.mjs');
    process.exit(1);
  }
  console.log(`OK — ${cases.length} case(s) valid, index.json up to date.`);
} else {
  writeFileSync(indexPath, serialized);
  console.log(`OK — ${cases.length} case(s) valid, index.json rebuilt.`);
}
