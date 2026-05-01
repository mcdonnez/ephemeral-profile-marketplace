# Ephemeral profile marketplace (GitHub-hosted)

Curated [`ephemeral-profile`](https://github.com/search?q=ephemeral-profile) v2 bundles that Ephemeral can subscribe to from **Extension options → Profile marketplace**.

## Layout

| Path | Purpose |
|------|---------|
| [`catalog/index.json`](catalog/index.json) | Machine-readable index (URLs + SHA-256 of each artifact). |
| `profiles/<id>/<semver>/profile.json` | Shareable profile JSON (`format: ephemeral-profile`, `version: 2`). |
| [`schemas/catalog.schema.json`](schemas/catalog.schema.json) | JSON Schema for the catalog file. |
| [`schemas/profile.schema.json`](schemas/profile.schema.json) | JSON Schema for profile artifacts. |

## Stable URL for the extension

Canonical catalog (tracks `main`):

`https://raw.githubusercontent.com/mcdonnez/ephemeral-profile-marketplace/main/catalog/index.json`

Repository: [github.com/mcdonnez/ephemeral-profile-marketplace](https://github.com/mcdonnez/ephemeral-profile-marketplace).

You can pin a **tag** (`catalog/vN`) instead of `main` for immutable snapshots.

## Tagging policy

- **`catalog/vN`** — immutable snapshots of `catalog/index.json` and referenced artifacts that extensions may default to.
- **`main`** — contributor staging; CI must pass before merge.

## Trust model

- Profiles describe **replay shapes** (methods, URL templates, JSON Schema). They **do not** ship cookies or API keys.
- Replay still runs in **your** browser tab with **your** session.
- Catalog entries pin **`artifact.sha256`**; the extension verifies downloads against that hash.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
