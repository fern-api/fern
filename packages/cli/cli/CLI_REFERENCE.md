# Fern CLI Command Reference

Complete internal reference for all commands registered in the Fern CLI (`cli.ts` and `cliV2.ts`).

## User-facing commands

These commands are visible in `fern --help` output.

### `fern init`

Initializes a new Fern workspace in the current directory. Creates the `fern/` folder structure with configuration files and either a sample Fern Definition or an imported OpenAPI spec.

```
fern init [--api] [--docs] [--organization <org>] [--openapi <path/url>] [--fern-definition] [--mintlify <path>] [--readme <url>]
```

| Flag | Description |
|------|-------------|
| `--api` | Initialize an API workspace (default behavior) |
| `--docs` | Initialize a documentation website with a sample `docs.yml` |
| `--organization` | Set the organization name (prompts interactively if omitted) |
| `--openapi` | Import from an existing OpenAPI spec (local file path or URL) |
| `--fern-definition` | Use a sample Fern Definition instead of OpenAPI |
| `--mintlify` | Migrate from a Mintlify docs site by pointing to a `mint.json` file |
| `--readme` | Migrate from a Readme-generated docs site by providing the site URL (requires local Chromium) |

### `fern check`

Validates your API definition (Fern Definition or OpenAPI) and Fern configuration files (`fern.config.json`, `generators.yml`, `docs.yml`). Produces no output on success; logs errors on failure.

```
fern check [--api <api>] [--warnings] [--broken-links] [--strict-broken-links] [--local] [--from-openapi] [--json]
```

| Flag | Description |
|------|-------------|
| `--api` | Validate only the specified API workspace |
| `--warnings` | Log warnings in addition to errors |
| `--broken-links` | Log a warning if broken links are found in docs |
| `--strict-broken-links` | Fail with non-zero exit if broken links are found |
| `--local` | Run validation locally without sending data to Fern API |
| `--from-openapi` | Use the new parser to go directly from OpenAPI to IR |
| `--json` | Output results as JSON to stdout |

### `fern generate`

Runs the Fern compiler to generate SDKs or documentation. For SDKs, it compiles the API definition into an Intermediate Representation (IR) and sends it to the configured generators. For docs, it builds and publishes the documentation site.

```
fern generate [--group <group>] [--api <api>] [--docs [name]] [--instance <url>] [--preview] [--version <version>] [--local] [--force] [--fernignore <path>] [--generator <name>] [--runner docker|podman] [--broken-links] [--strict-broken-links] [--disable-snippets] [--disable-dynamic-snippets]
```

| Flag | Description |
|------|-------------|
| `--group` | Run a specific generator group or alias from `generators.yml` |
| `--api` | Target a specific API workspace when multiple exist |
| `--docs` | Generate documentation instead of SDKs |
| `--instance` | Specify the docs instance URL to generate for |
| `--preview` | Generate into a local `.preview/` folder without publishing |
| `--version` | Set the SDK version number (e.g. `2.11.0`) |
| `--local` | Run generators locally using Docker instead of Fern cloud |
| `--force` | Skip confirmation prompts (useful for CI/CD) |
| `--fernignore` | Use a custom `.fernignore` file path |
| `--generator` | Run only a specific generator by name |
| `--runner` | Choose container runtime: `docker` or `podman` |
| `--broken-links` | Warn on broken links in docs generation |
| `--strict-broken-links` | Fail on broken links in docs generation |
| `--disable-snippets` | Disable code snippets in docs generation |
| `--disable-dynamic-snippets` | Disable dynamic SDK snippets in docs generation |

### `fern upgrade`

Upgrades the Fern CLI version pinned in `fern.config.json` to the latest release. Also upgrades generators in `generators.yml` to their minimum-compatible versions and runs any necessary migrations.

```
fern upgrade [--version <version>] [--from <version>] [--yes]
```

| Flag | Description |
|------|-------------|
| `--version` | Target a specific version instead of latest |
| `--from` | Manually specify the version to migrate from (for running migrations from an older CLI) |
| `--yes` | Automatically answer yes to migration prompts |

### `fern downgrade <version>`

Downgrades the Fern CLI version pinned in `fern.config.json` to the specified version. Useful when a newer version introduces a regression.

```
fern downgrade <version>
```

### `fern self-update [version]`

Updates the globally installed Fern CLI binary to the latest (or specified) version. Detects the package manager used for installation (npm, pnpm, yarn, bun, brew) and runs the appropriate update command.

```
fern self-update [version] [--dry-run]
```

| Flag | Description |
|------|-------------|
| `--dry-run` | Show the update command that would be executed without running it |

### `fern login`

Authenticates with Fern via GitHub or Google. Stores credentials locally for subsequent CLI operations that require authentication (e.g. `fern generate`, `fern token`).

```
fern login [--device-code]
```

| Flag | Description |
|------|-------------|
| `--device-code` | Use device code authorization flow (for environments without a browser) |

### `fern logout`

Clears locally stored Fern authentication credentials. After logging out, `fern login` must be run again to access authenticated features.

```
fern logout
```

### `fern token`

Generates a Fern API token for the current organization. Used to authenticate CI/CD pipelines for `fern generate` without interactive login.

```
fern token [--organization <org>]
```

| Flag | Description |
|------|-------------|
| `--organization` | Specify the organization (defaults to the one in `fern.config.json`) |

### `fern add <generator>`

Adds a new generator entry to `generators.yml`. Creates the generator group if it doesn't exist.

```
fern add <generator> [--api <api>] [--group <group>]
```

| Flag | Description |
|------|-------------|
| `--api` | Target a specific API workspace |
| `--group` | Add the generator to a specific group |

### `fern export <output-path>`

Exports the API definition as an OpenAPI spec file. Converts from Fern Definition or other formats into standard OpenAPI JSON or YAML.

```
fern export <output-path> [--api <api>] [--indent <number>]
```

| Flag | Description |
|------|-------------|
| `--api` | Export a specific API workspace |
| `--indent` | Indentation width in spaces (default: 2) |

### `fern format`

Formats all Fern Definition YAML files in the workspace. In CI mode, checks formatting without modifying files and exits with non-zero status if files are incorrectly formatted.

```
fern format [--ci] [--api <api>]
```

| Flag | Description |
|------|-------------|
| `--ci` | Fail with non-zero exit status if files aren't correctly formatted (no auto-fix) |
| `--api` | Format only the specified API workspace |

### `fern diff`

Compares two versions of an API's Intermediate Representation and reports the differences. Useful for understanding what changed between API versions or generator versions.

```
fern diff --from <path> --to <path> [--from-version <version>] [--from-generator-version <version>] [--to-generator-version <version>] [--quiet]
```

| Flag | Description |
|------|-------------|
| `--from` | Path to the previous version IR file (required) |
| `--to` | Path to the next version IR file (required) |
| `--from-version` | Semantic version label for the previous API version |
| `--from-generator-version` | Previous generator version (must be paired with `--to-generator-version`) |
| `--to-generator-version` | Next generator version (must be paired with `--from-generator-version`) |
| `--quiet` | Suppress stderr output |

### `fern write-definition`

Converts an OpenAPI specification into a Fern Definition. Reads from `fern/openapi/` and writes the converted definition to `fern/.definition/`. The generated definition can then be used as input for SDK generation by renaming it to `definition/` and removing the `openapi/` folder.

```
fern write-definition [--api <api>] [--language <lang>] [--preserve-schemas]
```

| Flag | Description |
|------|-------------|
| `--api` | Convert only the specified API workspace |
| `--language` | Write the definition optimized for a particular SDK language |
| `--preserve-schemas` | Preserve potentially unsafe schema IDs in the generated definition |

### `fern write-translation`

Generates translation directories for each language defined in `docs.yml`. Creates localized copies of documentation content, optionally calling the translation service to translate content.

```
fern write-translation [--stub]
```

| Flag | Description |
|------|-------------|
| `--stub` / `-s` | Return content as-is without calling the translation service (useful for scaffolding) |

### `fern jsonschema <path-to-output>`

Generates a JSON Schema file for a specific type defined in your Fern Definition. Useful for integrating Fern-defined types with JSON Schema-aware tools and validators.

```
fern jsonschema <path-to-output> --type <type-name> [--api <api>]
```

| Flag | Description |
|------|-------------|
| `--type` | The type to generate schema for, e.g. `MySchema` or `mypackage.MySchema` (required) |
| `--api` | Target a specific API workspace |

### `fern api update`

Pulls the latest OpenAPI spec from the `origin` URL configured in `generators.yml` and updates the local spec file. Automates keeping local API specs in sync with a remote source of truth.

```
fern api update [--api <api>] [--indent <number>]
```

| Flag | Description |
|------|-------------|
| `--api` | Update only the specified API (defaults to all APIs with an `origin`) |
| `--indent` | Indentation width in spaces (default: 2) |

### `fern docs dev`

Starts a local development server for previewing documentation. Downloads and runs the Fern docs bundle locally with hot-reload support. Automatically picks an available port starting from 3000.

```
fern docs dev [--port <number>] [--broken-links] [--beta] [--legacy] [--backend-port <number>] [--force-download]
```

| Flag | Description |
|------|-------------|
| `--port` | Specify the frontend port (auto-selects from 3000-3010 if omitted) |
| `--broken-links` | Check for broken links during preview |
| `--legacy` | Run the legacy development server |
| `--backend-port` | Specify the backend server port |
| `--force-download` | Force re-download of the docs preview bundle (clears cache) |

### `fern docs diff`

Generates visual diffs (side-by-side screenshots) comparing pages between a preview deployment and the production docs site. Intended for use in GitHub Actions to review documentation changes before merging.

```
fern docs diff <preview-url> <files..> [--output <dir>]
```

| Flag | Description |
|------|-------------|
| `<preview-url>` | The preview deployment URL |
| `<files..>` | One or more MDX file paths to diff |
| `--output` | Output directory for diff images (default: `.fern/diff`) |

### `fern docs broken-links`

Validates all internal links in your documentation configuration and content. Reports any links that point to non-existent pages or anchors.

```
fern docs broken-links [--strict]
```

| Flag | Description |
|------|-------------|
| `--strict` | Fail with non-zero exit status if broken links are found |

### `fern docs preview list`

Lists all active preview deployments for your organization, with pagination support.

```
fern docs preview list [--limit <number>] [--page <number>]
```

| Flag | Description |
|------|-------------|
| `--limit` | Number of preview deployments per page |
| `--page` | Page number (starts at 1) |

### `fern docs preview delete <url>`

Deletes a specific preview deployment created with `fern generate --docs --preview`.

```
fern docs preview delete <url>
```

### `fern overrides compare`

Compares two OpenAPI specs (an original and a modified version) and generates an overrides file capturing the differences. Useful for creating overrides from manual spec edits.

```
fern overrides compare <original> <modified> [--output <path>]
```

| Flag | Description |
|------|-------------|
| `<original>` | Path to the original OpenAPI spec |
| `<modified>` | Path to the modified OpenAPI spec |
| `--output` / `-o` | Path to write the overrides file (defaults to `<original>-overrides.yml`) |

### `fern overrides write`

Generates a basic OpenAPI overrides file that stubs out all endpoints (and optionally models) from your spec. Provides a starting point for adding custom overrides like request/response examples.

```
fern overrides write [--api <api>] [--exclude-models]
```

| Flag | Description |
|------|-------------|
| `--api` | Target a specific API workspace |
| `--exclude-models` | Also stub models in addition to endpoints |

### `fern generator upgrade`

Updates SDK generators in `generators.yml` to their latest compatible versions. Checks each generator against the Fern registry for available updates and applies them.

```
fern generator upgrade [--list] [--generator <name>] [--group <group>] [--api <api>] [--include-major] [--yes] [--channel <channel>]
```

| Flag | Description |
|------|-------------|
| `--list` | Show available upgrades without applying them |
| `--generator` | Upgrade only a specific generator type (e.g. `fernapi/fern-typescript-sdk`) |
| `--group` | Upgrade generators within a specific group |
| `--api` | Upgrade generators for a specific API workspace |
| `--include-major` | Include major version upgrades (skipped by default to avoid breaking changes) |
| `--yes` / `-y` | Automatically answer yes to prompts |
| `--channel` | Release channel to use for upgrades |

## Hidden / internal commands

These commands have their description set to `false`, hiding them from `fern --help`. They are used internally by Fern infrastructure, CI pipelines, or are in beta/deprecated.

### `fern ir <path-to-output>`

Generates the Fern Intermediate Representation (IR) — the canonical JSON data structure that all generators consume. Used for debugging generator input, developing new generators, or inspecting what the compiler produces from an API definition.

```
fern ir <path-to-output> [--api <api>] [--version <version>] [--language <lang>] [--audience <audience...>] [--smart-casing] [--from-openapi] [--disable-examples]
```

### `fern openapi-ir <path-to-output>`

Generates the OpenAPI-specific Intermediate Representation. This is a lower-level IR that preserves more OpenAPI-native structures before they're fully transformed into the standard Fern IR. Used for debugging the OpenAPI import pipeline.

```
fern openapi-ir <path-to-output> [--api <api>] [--language <lang>]
```

### `fern dynamic-ir <path-to-output>`

Generates a "dynamic" IR variant used for producing dynamic code snippets in documentation. Contains the information needed to generate language-specific usage examples at render time.

```
fern dynamic-ir <path-to-output> [--api <api>] [--version <version>] [--language <lang>] [--audience <audience...>] [--smart-casing] [--disable-examples]
```

### `fern fdr <path-to-output>`

Generates the Fern Docs Registry (FDR) API definition — the format consumed by the Fern documentation hosting service. This is the bridge between your API definition and the rendered API reference docs.

```
fern fdr <path-to-output> [--api <api>] [--audience <audience...>] [--v2] [--from-openapi]
```

### `fern register`

Registers API workspaces with the Fern cloud registry (v1). Used internally by CI pipelines for API definition storage and versioning. Requires authentication.

```
fern register [--api <api>] [--version <version>]
```

### `fern register-v2`

Registers API workspaces with the Fern cloud registry using the v2 protocol. Updated version of `fern register` with improved registration flow.

```
fern register-v2 [--api <api>]
```

### `fern test`

Runs SDK tests against a locally-started mock server. Spins up a mock server based on your API definition, then executes the configured test command for the specified SDK language. Used to validate that generated SDKs correctly call the API.

```
fern test [--api <api>] [--command <cmd>] [--language <lang>]
```

### `fern mock`

Starts a standalone mock HTTP server based on your API definition. Returns generated example responses for each endpoint. Useful for SDK development and integration testing without a real backend.

```
fern mock [--api <api>] [--port <number>]
```

### `fern sdk-diff <from-dir> <to-dir>`

Compares two directories containing SDK code and uses AI to generate a human-readable summary of the differences along with a suggested semantic version bump (`MAJOR`, `MINOR`, or `PATCH`).

```
fern sdk-diff <from-dir> <to-dir> [--json]
```

### `fern organization`

Outputs the organization name from `fern.config.json`. Used by CI scripts that need the org name programmatically.

```
fern organization [--output <path>]
```

### `fern generator list`

Lists all generators configured across your `generators.yml` files. Supports filtering by generator type, group, API, and output mode. Used by CI pipelines for dynamic generator discovery.

```
fern generator list [--output <path>] [--generators <name...>] [--groups <group...>] [--apis <api...>] [--include-mode <mode...>] [--exclude-mode <mode...>]
```

### `fern generator get`

Retrieves metadata for a specific generator instance, such as its version, language, or target repository. Used by CI scripts to extract generator configuration details.

```
fern generator get --generator <name> --group <group> [--api <api>] [--version] [--language] [--repository] [--output <path>]
```

### `fern write-overrides`

**Deprecated.** Alias for `fern overrides write`. Logs a deprecation warning and delegates to the new command.

```
fern write-overrides [--api <api>] [--exclude-models]
```

### `fern write-docs-definition <output-path>`

Serializes the resolved documentation workspace (navigation, pages, API references, assets) to a JSON file. Used internally by the docs build pipeline.

```
fern write-docs-definition <output-path>
```

### `fern docs md generate`

**[Beta]** Generates MDX documentation pages from library source code. Requires a `libraries` configuration section in `docs.yml`. Produces API reference pages for non-HTTP libraries (e.g. SDKs used as libraries).

```
fern docs md generate [--library <name>]
```

### `fern api enrich <openapi>`

Merges an OpenAPI spec with an overrides/enrichment file (e.g. `ai_examples_overrides.yml`) and writes the combined output. Used internally to inject AI-generated examples into API specs.

```
fern api enrich <openapi> --file <overrides-path> --output <output-path>
```

### `fern beta`

Pass-through to the CLI v2 runtime. Forwards all arguments after `beta` to the experimental v2 command handler. Used for testing new CLI features before they graduate to the main command set.

```
fern beta <...args>
```

### `fern protoc-gen-fern`

A protobuf compiler plugin that converts Protocol Buffer definitions into Fern IR. Reads a `CodeGeneratorRequest` from stdin and writes a `CodeGeneratorResponse` to stdout. Invoked automatically by `protoc` or `buf` when configured as a plugin.

```
fern protoc-gen-fern
```

### `fern replay init`

Initializes the Replay system for a generated SDK repository. Replay enables 3-way merges that preserve manual user edits across regeneration cycles. Scans commit history to find the last generation commit and creates a `.fern/replay.lock` file.

```
fern replay init [--group <group>] [--api <api>] [--github <owner/repo>] [--token <token>] [--dry-run] [--max-commits <n>] [--force]
```

### `fern replay resolve`

Resolves pending Replay patches after SDK regeneration. Applies unresolved patches to the working tree, checks for conflict markers, and commits the resolution. Run iteratively — first to apply patches, then again after manually resolving conflicts.

```
fern replay resolve [directory] [--no-check-markers]
```

### `fern completion`

Generates a shell completion script for the Fern CLI. Outputs a script that can be sourced in bash/zsh for tab-completion of commands, flags, and arguments.

```
fern completion
```
