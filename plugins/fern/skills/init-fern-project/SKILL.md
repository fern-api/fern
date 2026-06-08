---
name: init-fern-project
description: Initialize a Fern project from an existing OpenAPI spec, AsyncAPI document, or gRPC proto. Use this when the user wants to set up Fern, generate SDKs from an API definition, or asks to "use Fern" on a project that does not yet have a `fern.config.json` / `fern.yml` file.
---

# Initialize a Fern project

You scaffold a new Fern project in the current working directory. Fern is a CLI
that turns API definitions into SDKs and documentation. The output of this
skill is a `fern/` directory with a valid `fern.config.json`, `generators.yml`,
and a copy (or reference) of the user's API spec.

## Pre-flight

1. Check that the `fern` CLI is installed:

   ```bash
   fern --version
   ```

   If it is not installed, ask the user to install it:

   ```bash
   npm install -g fern-api
   ```

   Do not try to install it globally yourself without confirmation.

2. Look for an existing API definition the user wants to use. In priority order:
   - An `openapi.yml`, `openapi.yaml`, or `openapi.json` in the repo root or `openapi/`, `api/`, `spec/`, or `specs/` directories.
   - An `asyncapi.yml` / `asyncapi.json`.
   - A `*.proto` file.
   - A URL the user provided.

   If none of the above exist and the user has not pointed to one, ask them
   which API spec to use before proceeding.

3. Check whether `fern.config.json` already exists. If it does, **stop** and
   confirm with the user before overwriting — `fern init` would clobber it.

## Run the wizard

Prefer the non-interactive flow so Claude can drive it:

```bash
fern init --org <org-slug> --api <path-or-url-to-spec> --yes
```

- `<org-slug>` should be a short, kebab-case identifier. Use the GitHub org or
  npm scope if you can infer one; otherwise ask the user.
- `<path-or-url-to-spec>` is the path or URL discovered in step 2.

If `--api` is omitted, Fern will scaffold a sample Petstore spec — that is
fine for a tutorial but almost never what the user wants.

## After init

The wizard creates:

```
fern/
├── fern.config.json     # CLI version + org
├── generators.yml       # which SDKs / docs to generate
└── openapi/             # (or the spec path the user chose)
    └── openapi.yml
```

Tell the user what was created and offer the obvious next steps:

1. Validate the project:
   ```bash
   fern check
   ```
2. Generate the first SDK:
   ```bash
   fern sdk generate --target typescript
   ```
3. Read the docs at https://buildwithfern.com/learn.

If the user wants docs, follow up by invoking the `scaffold-docs-site` skill.
If the user wants SDKs in specific languages, follow up with `generate-sdk`.
