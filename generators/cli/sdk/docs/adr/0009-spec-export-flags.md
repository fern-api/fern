# ADR-0009: `--spec` / `--spec-raw` global flags for API spec export

**Status:** Accepted — 2026-06-26
**Context:** FER-11185 — make embedded API spec exportable from generated CLI binaries.

## Decision

Every generated binary exposes two root-only global flags:

| Flag | Output |
|------|--------|
| `--spec` | Effective spec: source YAML with overlays + overrides merged |
| `--spec-raw` | Source spec: byte-exact embedded YAML before any processing |

Both emit YAML to stdout. Multi-binding CLIs (e.g. OpenAPI + GraphQL) concatenate documents as a `---`-delimited YAML stream.

### Design choices

1. **Root-only, not path-scoped.** Unlike `--schema` (which narrows by resource path), `--spec` always emits the full spec. The flag is meaningful only at the binary root.

2. **Pre-clap intercept.** Flags are sniffed from raw `std::env::args` before clap parses, mirroring `--schema`. This avoids required-arg validation blocking root-only flags.

3. **Trait method with default `None`.** `Binding::spec_document(raw: bool) -> Result<Option<String>, CliError>` defaults to `Ok(None)`, so non-OpenAPI bindings (GraphQL) opt out cleanly without a stub.

4. **Overlay + override merge reuses existing helpers.** The effective-spec path calls `overlay::apply_overlays_to_spec` then `deep_merge_yaml` for overrides — the same pipeline as `build_doc`, stopping before `RestDescription` parsing.

## Consequences

- Users and agents can extract the API spec without access to the source repo or docs site.
- `--spec-raw` enables byte-exact round-tripping for spec management tooling.
- No generator changes required — the flags are handled entirely in the SDK runtime.
