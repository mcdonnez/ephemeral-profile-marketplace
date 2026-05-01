# Contributing marketplace profiles

## Before you open a PR

1. **Artifact shape** — Each profile must be valid `ephemeral-profile` version **2** (same JSON Ephemeral exports via **Export profile**, with sensitive fields stripped).
2. **No secrets** — Do not commit `headers`, `example`, or anything that could contain tokens or PII.
3. **Origin consistency**
   - Set the catalog entry **`origin`** to the canonical saved-profile key (e.g. `https://app.example.com`).
   - Every tool’s `urlTemplate` must use the **same origin** as that entry (scheme + host + port).
   - If present, `documentOriginHint` must match that origin.
4. **Checksum** — After editing `profiles/.../profile.json`, run validation locally (see below). CI recomputes SHA-256 and fails if **`artifact.sha256`** in `catalog/index.json` is wrong.
5. **Paths** — Place artifacts under `profiles/<id>/<semver>/profile.json` and add or update the matching row in `catalog/index.json`.

## Local validation

From the repository root:

```bash
node marketplace/scripts/validate.mjs
```

Requires Node 18+.

## Review expectations

Maintainers check that titles/descriptions are accurate, origins match real sites, and tooling is safe to replay under a normal user session.
