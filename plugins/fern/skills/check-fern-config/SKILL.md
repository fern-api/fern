---
name: check-fern-config
description: Validate a Fern project's configuration and API definition with `fern check`. Use this when the user reports an error from `fern generate`, sees a mismatched generator version, wants to verify a Fern config is correct, or is about to publish SDKs/docs and wants a pre-flight check.
---

# Check a Fern project

`fern check` validates `fern.config.json`, `generators.yml`, any OpenAPI /
AsyncAPI / Fern definitions, and (if present) `docs.yml`. Treat it as the
TypeScript compiler for a Fern project: run it whenever something is broken
before guessing at fixes.

## Pre-flight

1. Confirm there is a Fern project in the current directory or a parent
   (`fern.config.json` marker). If not, this skill does not apply — invoke
   `init-fern-project` instead.

2. Confirm the `fern` CLI is available:
   ```bash
   fern --version
   ```

## Run the check

Plain run:

```bash
fern check
```

Stricter run (treat warnings as errors — recommended for CI):

```bash
fern check --strict
```

To also validate the docs config in the same run:

```bash
fern docs check
```

## Interpret the output

Fern check produces three categories of output:

- **Errors** — must be fixed. Common ones:
  - Invalid `fern.config.json` (missing `version` or `organization`).
  - `generators.yml` references a generator group that does not exist.
  - OpenAPI spec references a missing schema / parameter / response.
  - Duplicate operation IDs across paths.

- **Warnings** — should be fixed but do not block generation. Common ones:
  - Operations without `summary` or `description`.
  - Schemas without examples.
  - Unused components.

- **Info** — purely advisory (e.g. "consider splitting this large file").

For each error, propose the smallest possible diff. Do not rewrite the user's
spec wholesale.

## When `check` passes but generate still fails

The most common cause is a generator version older than the IR version in
the project. Run:

```bash
fern generator upgrade
```

to bump the locally pinned generators to versions compatible with the
current CLI / IR.
