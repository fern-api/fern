# Seed CLI (release tooling)

`@fern-api/seed-cli` is the internal CLI that CI uses to release the Fern CLI. The generator test
harness that used to live here was removed along with the generators.

## Commands

```bash
pnpm seed:build                                   # Build packages/seed/dist/cli.cjs
pnpm seed publish cli --ver <version> [--dev]     # Publish the Fern CLI to npm
pnpm seed register cli                            # Register CLI releases with FDR
pnpm seed validate cli                            # Validate packages/cli/cli/versions.yml
pnpm seed validate versions-yml                   # Validate packages/generator-cli/versions.yml
pnpm seed latest cli | versions-yml               # Print the latest released version
pnpm seed generate changelog cli -o <dir>         # Write CLI changelog pages for the docs repo
```

These are called from `.github/workflows/publish-cli.yml`, `validate-changelog.yml` and
`write-changelogs-to-docs.yml`.
