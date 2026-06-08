# Fern Claude Code plugin

[Fern](https://buildwithfern.com) is a toolchain that turns API definitions
(OpenAPI, AsyncAPI, gRPC) into idiomatic SDKs and a documentation site.

This plugin ships skills that let Claude Code drive the `fern` CLI on your
behalf for common workflows:

| Skill                                                      | When Claude uses it                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| [`init-fern-project`](skills/init-fern-project/SKILL.md)   | "Set up a Fern project from this OpenAPI spec"                |
| [`generate-sdk`](skills/generate-sdk/SKILL.md)             | "Generate a TypeScript / Python / Java / Go SDK for this API" |
| [`scaffold-docs-site`](skills/scaffold-docs-site/SKILL.md) | "Build a Fern docs site for this API"                         |
| [`check-fern-config`](skills/check-fern-config/SKILL.md)   | "Validate this Fern configuration"                            |
| [`preview-docs`](skills/preview-docs/SKILL.md)             | "Preview the docs site locally"                               |

## Install

From inside Claude Code:

```
/plugin marketplace add fern-api/fern
/plugin install fern@fern-api
```

Or, if you already have the `fern` CLI installed:

```
fern claude install
```

## Requirements

- `fern` CLI on PATH. Install it with `npm install -g fern-api` (or
  `pnpm add -g fern-api`, `yarn global add fern-api`).
- Node.js 18+.

## Reference

- [Fern docs](https://buildwithfern.com/learn)
- [Fern CLI reference](https://buildwithfern.com/learn/cli/overview)
- [Claude Code plugins](https://docs.claude.com/en/docs/claude-code/plugins)
