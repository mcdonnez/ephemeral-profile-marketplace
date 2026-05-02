# Cookbook MCP cookbook marketplace (GitHub-hosted)

Curated shareable bundles (`cookbookmcp-cookbook` v5; `cookbookmcp-profile` where applicable) that Cookbook MCP can subscribe to from **Extension options → Cookbook marketplace**.

## Layout

| Path | Purpose |
|------|---------|
| `catalog/index.json` | Marketplace catalog (`catalogVersion: 1`, entries with semver + artifact hashes). |
| `cookbooks/<id>/<semver>/cookbook.json` | Shareable cookbook JSON (`format: cookbookmcp-cookbook`, `version: 5`). |
| `schemas/*.schema.json` | JSON Schema drafts for CI validation. |

`https://raw.githubusercontent.com/mcdonnez/cookbookmcp-marketplace/main/catalog/index.json`

Repository: [github.com/mcdonnez/cookbookmcp-marketplace](https://github.com/mcdonnez/cookbookmcp-marketplace).
