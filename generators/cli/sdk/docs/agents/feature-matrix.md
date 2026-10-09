# Feature-matrix wire suite (FER-10569)

The canonical home for wire-level coverage of the SDK-vs-CLI feature matrix.
One test per matrix cell, encoding-exact assertions on what the CLI puts on
the wire, and an `#[ignore]`-based living gap report so unsupported cells are
honestly tracked without making CI red.

## What lives where

| Artifact | Role |
|---|---|
| `tests/feature_matrix_wire.rs` | **Source of truth.** One `#[tokio::test]` per cell. Cells that pass guard against regression; cells the CLI doesn't yet handle correctly are `#[ignore = "<gap text>"]`'d. |
| `src/bin/feature-matrix-fixture/openapi.yaml` | The catalog. One operation per cell, `operationId` naming the spec-side cell, grouped by area via `x-fern-sdk-group-name` (`query` / `path` / `header` / `server` / `body` / `upload` / `auth` / `retries` / `response` / `pagination` / `streaming` / `variables`). Test function names mostly mirror the `operationId`; some elaborate the specific behavior under test. |
| `src/bin/feature-matrix-fixture/main.rs` | Binary wired with the three auth schemes that area `auth`'s per-op `security:` routing dispatches into. |
| `src/bin/feature-matrix-fixture/README.md` | Internal-only doc. Embeds the auto-generated snapshot of the current gap list. |
| `scripts/list-feature-matrix-gaps.sh` | Regenerates the snapshot from the test binary's own output. Only writer of the `<!-- BEGIN/END gap-snapshot -->` block; idempotent; can't drift. |
| `tests/feature_matrix_fixture_smoke.rs` | Smoke: binary builds, spec loads, group surface appears in `--help`. |

The `feature-matrix-fixture` binary is **internal-only**. It's not in the
cargo-dist release set, not in the bundled CLIs list in `AGENTS.md`, and not
part of any code-generator snapshot a customer receives.

## Conventions

- **Oracle = OpenAPI / RFC semantics.** Spec rules define what "correct"
  serialization is. The Fern SDK Generator Features Matrix only prioritizes
  which cells to cover — it never changes an expected value.
- **Encoding-exact.** Assertions go through `captured_raw_query` /
  `captured_raw_path` / `captured_header` / `captured_body_bytes` (defined in
  `tests/common/mod.rs`), which read `Url::query()` / `Url::path()` / raw
  header bytes / raw body bytes as sent. Wiremock's decoding matchers are
  reserved for response-content (tier-1-style) assertions.
- **End-to-end via the binary.** Tests drive the CLI binary against a
  `wiremock::MockServer` — so cells expose both serializer gaps and CLI
  input-coercion gaps (a cell is "supported" only if a user can actually
  produce the correct wire output, not just if the underlying serializer
  could).
- **Reds are `#[ignore]`'d, never weakened.** When a cell fails, wrap the
  test with `#[ignore = "<descriptive gap text>"]`. Don't soften the
  assertion to make it pass.

## Adding a cell

1. **Add an operation** to `src/bin/feature-matrix-fixture/openapi.yaml` under
   the matching area. `operationId` IS the cell name; group with
   `x-fern-sdk-group-name: [<area>]`; `x-fern-sdk-method-name: <cell>` is the
   CLI subcommand.
2. **Write the test** in `tests/feature_matrix_wire.rs`. Assert the
   **spec-correct** wire output, encoding-exact, using the `captured_raw_*`
   helpers. Mirror the area's existing cells for the boilerplate shape.
3. **Run it.** `cargo test --test feature_matrix_wire`. If it passes, it
   stays an active regression guard. If it fails, wrap the function with
   `#[ignore = "<descriptive gap text>"]` — the text should tell a future
   contributor what's wrong and roughly where to fix it.
4. **Refresh the snapshot.** `./scripts/list-feature-matrix-gaps.sh` to
   regenerate the gap list block in `src/bin/feature-matrix-fixture/README.md`.

## Fixing a cell

1. Implement the fix in `src/openapi/`.
2. Delete the `#[ignore]` attribute from the corresponding test in
   `tests/feature_matrix_wire.rs`.
3. `cargo test --test feature_matrix_wire` — the (now-active) cell must
   pass.
4. `./scripts/list-feature-matrix-gaps.sh` — refresh the snapshot.
5. Commit: the `src/openapi/` change, the test (`#[ignore]` removed), the
   regenerated README, and a changeset.

## Listing the gaps

The README's `<!-- BEGIN/END gap-snapshot -->` block is the browsable view on
GitHub. To regenerate or to see live, on-demand output:

```bash
./scripts/list-feature-matrix-gaps.sh
# or, raw, without writing to the README:
cargo test --test feature_matrix_wire -- --ignored
```

Both read straight from the test binary, so neither can drift from the live
`#[ignore = "..."]` reason strings.
