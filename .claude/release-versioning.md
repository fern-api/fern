# Changelog Infrastructure

**Source of truth:** `release-config.json` (see `release-config.schema.json`). Each **`software`** entry defines:

- **`softwareDirectory`**: repo paths under this tree are **that** product’s surface area.
- **`changelogFolder`**: where changelog files for that product live.

## What you should do

When your change touches files **under** a given entry’s **`softwareDirectory`**, add or update an **unreleased** changelog file under:

```text
{changelogFolder}/unreleased/
```

Use the **`changelogFolder`** value from `release-config.json` for that software key. Do **not** hand-edit **`versions.yml`**; versioning and rolling releases are handled by **automation**, not by running local release commands.

**Automation:** `.github/workflows/release-software.yml` drives the release pipeline (including when changes land on `main` under the configured changelog paths). Your job in a PR is to leave correct **`unreleased/`** entries so that workflow can run.

## Mapping (from `release-config.json`)

If a path falls under **`softwareDirectory`**, use the matching **`changelogFolder`/unreleased** column. **If anything here disagrees with `release-config.json`, follow the file on disk.**


| Key | `softwareDirectory` | Add changelogs under |
|-----|---------------------|----------------------|
| `cli` | `packages/cli` | `packages/cli/cli/changes/unreleased/` |
| `csharp` | `generators/csharp` | `generators/csharp/sdk/changes/unreleased/` |
| `go` | `generators/go` | `generators/go/sdk/changes/unreleased/` |
| `java` | `generators/java` | `generators/java/sdk/changes/unreleased/` |
| `php` | `generators/php` | `generators/php/sdk/changes/unreleased/` |
| `python` | `generators/python` | `generators/python/sdk/changes/unreleased/` |
| `ruby-v2` | `generators/ruby-v2` | `generators/ruby-v2/sdk/changes/unreleased/` |
| `rust` | `generators/rust` | `generators/rust/sdk/changes/unreleased/` |
| `swift` | `generators/swift` | `generators/swift/sdk/changes/unreleased/` |
| `typescript` | `generators/typescript` | `generators/typescript/sdk/changes/unreleased/` |
| `cli-generator` | `generators/cli` | `generators/cli/changes/unreleased/` |
| `generator-cli` | `packages/generator-cli` | `packages/generator-cli/changes/unreleased/` |

Pick the narrowest matching **`softwareDirectory`** when several could apply (e.g. generator-only work under `generators/python/...` uses the Python generator row, not CLI). If a single PR spans multiple **`softwareDirectory`** trees, add a changelog file in **each** corresponding **`changelogFolder/unreleased/`**.

## Changelog file format

1. Copy **`.template.yml`** from that product’s `changes/unreleased/` if you need a starting point.
2. Use a new filename that describes the change (e.g. `fix-streaming-timeout.yml`).
3. Each file is a **YAML array** of objects. Only these fields are allowed (see **`fern-changes-yml.schema.json`**):
   - **`summary`**: string (multi-line `|` allowed).
   - **`type`**: `fix` | `chore` | `feat` | `internal`

Those types drive semver bumps when releases run (`fix`/`chore` → patch, `feat`/`internal` → minor). The automated release flow does **not** produce major version bumps. To ship a major release, a human edits the relevant `versions.yml` directly so the breaking change is explicitly acknowledged in review. The validator rejects `type: break` in `unreleased/`.

## Cross-product propagation (`propagatesTo`)

Some products embed another product's output. For example, the CLI Generator bundles the Rust SDK Generator's generated code. When the Rust SDK ships a fix, the CLI Generator must also release a new version with that fix.

**`propagatesTo`** in `release-config.json` automates this. When a software entry with `propagatesTo` is released, the release script creates an auto-generated changelog entry (`auto-propagated-from-<source>.yml`) in each target's `unreleased/` folder. The entry inherits the highest severity type from the source so the target receives at least a matching semver bump.

Current propagation relationships:

| Source | Propagates to |
|--------|--------------|
| `rust` | `cli-generator` |

**You do not need to manually add a CLI Generator changelog entry when only the Rust SDK changes.** The automation handles it. If your PR also changes CLI Generator code (under `generators/cli/`), add a separate changelog entry as usual — the propagated entry will be combined with it during release.
