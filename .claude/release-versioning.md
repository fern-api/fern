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
| `ruby` | `generators/ruby` | `generators/ruby/sdk/changes/unreleased/` |
| `ruby-v2` | `generators/ruby-v2` | `generators/ruby-v2/sdk/changes/unreleased/` |
| `rust` | `generators/rust` | `generators/rust/sdk/changes/unreleased/` |
| `swift` | `generators/swift` | `generators/swift/sdk/changes/unreleased/` |
| `typescript` | `generators/typescript` | `generators/typescript/sdk/changes/unreleased/` |

Pick the narrowest matching **`softwareDirectory`** when several could apply (e.g. generator-only work under `generators/python/...` uses the Python generator row, not CLI). If a single PR spans multiple **`softwareDirectory`** trees, add a changelog file in **each** corresponding **`changelogFolder/unreleased/`**.

## Changelog file format

1. Copy **`.template.yml`** from that product’s `changes/unreleased/` if you need a starting point.
2. Use a new filename that describes the change (e.g. `fix-streaming-timeout.yml`).
3. Each file is a **YAML array** of objects. Only these fields are allowed (see **`fern-changes-yml.schema.json`**):
   - **`summary`**: string (multi-line `|` allowed).
   - **`type`**: `fix` | `chore` | `feat` | `internal` | `break`

Those types drive semver bumps when releases run (`fix`/`chore` → patch, `feat`/`internal` → minor, `break` → major). You do not need to bump versions yourself.
