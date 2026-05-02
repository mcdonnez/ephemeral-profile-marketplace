#!/usr/bin/env node
/* global console, process, URL */
/**
 * Validates marketplace/catalog/index.json and each referenced cookbook artifact on disk.
 * Run from repo root: node marketplace/scripts/validate.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MARKETPLACE_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(MARKETPLACE_ROOT, 'catalog', 'index.json');

function fail(msg) {
  console.error(`marketplace validate: ${msg}`);
  process.exit(1);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function toolOrigin(urlTemplate) {
  try {
    return new URL(urlTemplate).origin;
  } catch {
    return null;
  }
}

function catalogOrigin(originStr) {
  try {
    return new URL(originStr).origin;
  } catch {
    return null;
  }
}

function assertNoSensitiveToolFields(tool, idx) {
  if ('headers' in tool) fail(`Tool ${idx}: must not include "headers" in marketplace artifacts`);
  if ('example' in tool) fail(`Tool ${idx}: must not include "example" in marketplace artifacts`);
}

const catalog = readJson(CATALOG_PATH);
if (catalog.catalogVersion !== 1) fail('catalogVersion must be 1');
if (!Array.isArray(catalog.entries)) fail('catalog.entries must be an array');

const seenIds = new Set();
for (const entry of catalog.entries) {
  if (!entry || typeof entry !== 'object') fail('each entry must be an object');
  const { id, artifact } = entry;
  if (typeof id !== 'string' || !/^([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(id)) {
    fail(`entry id invalid: ${String(id)}`);
  }
  if (seenIds.has(id)) fail(`duplicate entry id: ${id}`);
  seenIds.add(id);
  for (const k of ['title', 'description', 'publisher', 'origin', 'semver']) {
    if (typeof entry[k] !== 'string' || !entry[k].trim()) fail(`entry ${id}: missing ${k}`);
  }
  const semver = entry.semver;
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(semver)) fail(`entry ${id}: semver must be MAJOR.MINOR.PATCH`);

  if (!artifact || typeof artifact !== 'object') fail(`entry ${id}: missing artifact`);
  const { url, sha256, cookbookFormat, cookbookVersion } = artifact;
  if (typeof url !== 'string' || !url.startsWith('https://')) fail(`entry ${id}: artifact.url must be https`);
  if (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(sha256)) fail(`entry ${id}: artifact.sha256 must be 64 hex chars`);
  if (cookbookFormat !== 'cookbookmcp-cookbook' && cookbookFormat !== 'cookbookmcp-profile') {
    fail(`entry ${id}: artifact.cookbookFormat must be cookbookmcp-cookbook or cookbookmcp-profile`);
  }
  if (typeof cookbookVersion !== 'number' || cookbookVersion < 2) {
    fail(`entry ${id}: artifact.cookbookVersion must be >= 2`);
  }

  const cookbookPath = path.join(MARKETPLACE_ROOT, 'cookbooks', id, semver, 'cookbook.json');
  if (!fs.existsSync(cookbookPath)) {
    fail(`entry ${id}: expected cookbook at ${path.relative(process.cwd(), cookbookPath)}`);
  }

  const raw = fs.readFileSync(cookbookPath);
  const digest = sha256Hex(raw);
  if (digest !== sha256) {
    fail(
      `entry ${id}: SHA-256 mismatch for ${cookbookPath}\n  catalog: ${sha256}\n  actual: ${digest}\n  Run shasum -a 256 on the file and update catalog/index.json`,
    );
  }

  const cookbook = JSON.parse(raw.toString('utf8'));
  if (cookbook.format !== 'cookbookmcp-cookbook' && cookbook.format !== 'cookbookmcp-profile') {
    fail(`cookbook ${id}: format must be cookbookmcp-cookbook or cookbookmcp-profile`);
  }
  if (typeof cookbook.version !== 'number') fail(`cookbook ${id}: version required`);
  if (!Array.isArray(cookbook.tools) || cookbook.tools.length === 0) fail(`cookbook ${id}: tools must be non-empty array`);

  const co = catalogOrigin(entry.origin);
  if (!co) fail(`entry ${id}: invalid catalog origin ${entry.origin}`);

  if (cookbook.documentOriginHint != null && cookbook.documentOriginHint !== '') {
    const dh = catalogOrigin(cookbook.documentOriginHint);
    if (dh !== co) fail(`entry ${id}: documentOriginHint must match catalog origin`);
  }

  cookbook.tools.forEach((tool, idx) => {
    assertNoSensitiveToolFields(tool, idx);
    const u = toolOrigin(tool.urlTemplate);
    if (!u) fail(`cookbook ${id} tool ${idx}: invalid urlTemplate`);
    if (u !== co) fail(`cookbook ${id} tool ${idx}: urlTemplate origin ${u} must match entry origin ${co}`);
  });

  const suffix = `/cookbooks/${id}/${semver}/cookbook.json`;
  try {
    const au = new URL(url);
    if (!au.pathname.replace(/\/+$/, '').endsWith(suffix.replace(/\/+$/, ''))) {
      console.warn(`warning: entry ${id}: artifact.url path should end with ${suffix} (got ${au.pathname})`);
    }
  } catch {
    console.warn(`warning: entry ${id}: could not parse artifact.url`);
  }
}

console.log(`OK: ${catalog.entries.length} marketplace catalog entr(y|ies) validated`);
