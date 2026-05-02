# Contributing cookbooks

1. **Artifact shape** — Each cookbook must match what Cookbook MCP exports (**Export cookbook**), with sensitive fields stripped. Use `format: cookbookmcp-cookbook` and `version: 5` for new artifacts; older `cookbookmcp-profile` v2 bundles may remain importable depending on extension support.

2. **Catalog entries** — Follow `schemas/catalog.schema.json`; pin SHA-256 of the raw cookbook JSON.

3. **Validation** — From the monorepo root: `node marketplace/scripts/validate.mjs`.
