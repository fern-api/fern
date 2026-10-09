# @fern-api/cli-dynamic-snippets

Renders Fern CLI command snippets in the browser from the dynamic IR, mirroring the other
`@fern-api/<language>-dynamic-snippets` generators. It ports the Fern CLI SDK (Rust) naming and flag
rules to TypeScript so the generated commands match what the `fern-cli-generator` runtime actually
builds — there is no committed catalog.

- `src/naming.ts` — port of the Rust naming/flag rules (`camel_to_kebab`, `tokenize`,
  `strip_tag_prefix` from `openapi/parser.rs`; `resolve_param_flag_name`, `flag_name_is_reserved`,
  `BUILTIN_FLAG_NAMES` from `openapi/commands.rs`; `to_kebab_flag`, `sanitize_flag_name` from
  `text.rs`).
- `src/EndpointSnippetGenerator.ts` — walks the dynamic IR and emits the command, carrying over the
  `--flag` / `--json` / `--params` routing kernel in `src/command.ts`.

## Parity

Flags and command names are derived in TypeScript, so correctness is pinned to the real runtime by
two committed golden artifacts, both asserted by always-run tests (CI's TypeScript image has no Rust
toolchain):

- **Flag parity** — `src/__test__/fixtures/<name>/schema.golden.json` is the runtime's own `--schema`
  output. `src/__test__/parity.test.ts` asserts `resolveParamFlagName` reproduces every flag.
  Regenerate with **`node scripts/generate-schema-golden.mjs`** (requires `cargo`): it rebuilds a
  throwaway CLI binary from each fixture spec against the in-repo `fern-cli-sdk` crate and rewrites the
  golden. Commit the diff.
- **Command-name parity** — `src/__test__/fixtures/<name>/dynamic-ir.json` is the real dynamic IR for
  the fixture spec. `src/__test__/dynamic-ir.e2e.test.ts` runs the generator over it and asserts the
  command path against the `--schema` golden, proving the importer-derived `fernFilepath` +
  `declaration.name` agree with the runtime's Rust-parser command names (including namespaced,
  multi-part paths like `chat v1 send`).
- **Acceptance (dry-run)** — `src/__test__/dryrun.e2e.test.ts` (cargo-gated) feeds every assembled
  command back to the real binary with `--dry-run` and asserts it is accepted. This is what proves the
  `--params` / `--json` / repeated-flag / multipart assembly actually runs — e.g. a nested object body
  sent as `--params '{"Address":{…}}'` is confirmed accepted (no need for the runtime's dotted
  `--address.city` flags). It runs in the cargo-enabled `cli-runtime` CI job and locally; it skips
  where `cargo` is unavailable (CI's TypeScript image).

### Regenerating `dynamic-ir.json`

This package cannot depend on the IR generator (no `generators/* → packages/cli/*` dependency), so the
fixture is produced out of band. From a one-shot test in `packages/cli/generation/ir-generator-tests`:

```ts
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr } from "@fern-api/ir-generator";
import { generateIRFromPath } from "../../ir/__test__/generateAndSnapshotIR.js";
// FIXTURE_DIR = generators/cli/dynamic-snippets/src/__test__/fixtures/twilio-like
const ir = await generateIRFromPath({ absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR), workspaceName: "twilio-like", audiences: { type: "all" } });
const dynamicIr = convertIrToDynamicSnippetsIr({ ir, smartCasing: true, disableExamples: true });
// write JSON.stringify(dynamicIr, null, 2) to FIXTURE_DIR/dynamic-ir.json
```

A change to the importer's command naming surfaces as an `dynamic-ir.e2e.test.ts` failure against the
`--schema` golden, so naming drift is not silent; regenerate both goldens when it happens.

## Known gaps

- **`x-fern-parameter-name` renames are not reproduced.** Flags derive from the parameter's wire name.
  The dynamic IR's SDK-facing name is rewritten by the importer beyond any explicit rename (it drops
  the `X-` prefix from headers, camelizes, etc.) and carries no field distinguishing an
  `x-fern-parameter-name` override from those automatic renames — so a genuine rename cannot be
  reproduced without IR support. Sourcing the flag from the wire name is correct for every other case,
  including headers (`X-Custom-Header` → `--x-custom-header`).
- **Flag-collision winner.** When two parameters resolve to the same flag the runtime sorts by wire
  name and keeps the first; this port keeps whichever it emits first in IR order and drops the rest. It
  never emits a duplicate flag, but for the rare genuine collision the two can pick different winners.
- **Non-ASCII / control-character parameter names are omitted.** Such a name can't be sanitized into a
  flag, so the runtime registers no argument for it — it can be supplied via neither a flag nor
  `--params` (passing it in `--params` panics the CLI, i.e. the operation is effectively unusable in
  the runtime itself). The generator omits the parameter rather than emit a command that fails.
- **Reserved-name multipart fields are omitted.** A multipart field whose name collides with a built-in
  flag (`output`, `format`, `json`, …) gets no flag, and the runtime mis-routes its `--params` value
  into the query string instead of the form body, so it can't be delivered correctly either. The
  generator omits it. (Both this and the non-ASCII case are runtime limitations worth filing upstream.)
- **Binary-name fallback.** When `customConfig.binaryName` is unset, the binary name falls back to the
  workspace name (`generatorConfig.apiName`). The Rust generator falls back to `apiDisplayName`, which
  the dynamic IR does not carry; the workspace name is its closest available analogue.
