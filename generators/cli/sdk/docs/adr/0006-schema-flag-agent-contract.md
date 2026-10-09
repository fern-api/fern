# ADR-0006: `--schema` is the agent-facing contract, not an OpenAPI mirror

**Status:** Accepted — 2026-06-11
**Context:** PR #169 introduced the `--schema` global flag as a machine-readable counterpart to `--help`. The initial shape mirrored what was easy to render from the IR — `{operation, httpMethod, path, description, parameters}` at the per-op view, a flat list of those at root/resource. As LLM-agent use of the CLI matured, that shape proved a poor fit: it surfaced HTTP-execution detail an agent never uses, omitted request-body schemas and response schemas entirely, and inherited OpenAPI's narrow meaning of `parameters` even though body fields are part of the agent's input surface. This ADR resolves the contract `--schema` exposes to agents.

## Decision

`--schema` is designed for agents driving the CLI, not for humans reading API docs. Its top-level shape is:

| Scope | Output |
|---|---|
| Root (`<bin> --schema`) | `{sdkVariables, globalFlags, operations}` — each operation is `{operation, description, availability?}` |
| Resource (`<bin> <res> --schema`) | Array of operation summaries, same shape as the root `operations` entries |
| Operation (`<bin> <res> <method> --schema`) | `{operation, description, availability?, input, output?, defaultSelection?, paginable?, binaryResponse?, streaming?}` |

The principle is **agent-aligned, not OpenAPI-aligned**: every field exists because an agent reading the doc would otherwise have to discover its content by trial-and-error. Fields the agent doesn't need (`httpMethod`, `path`) are dropped at every scope.

### Per-op envelope

`input` and `output` are the canonical halves of the contract — *everything the agent supplies, everything it receives back*. Both are JSON-Schema-shaped (`{type: "object", properties, required}`).

`input.properties` mirrors the CLI's **flag surface**, not the wire shape. Query, path, header, and body fields are siblings of the property bag, distinguished by a `location` discriminator (`"query"`, `"path"`, `"header"`, `"body"`). Body fields appear individually after `allOf` flattening (per ADR-0004), so an agent reading `input.properties` knows exactly which `--<flag>`s exist without separately reasoning about which fields got flattened.

`output` is the fully-inlined JSON Schema of the operation's canonical 2xx response. `$ref`s are dereferenced against `RestDescription.schemas` and inlined; cycles break by leaving a `$ref` pointer at the second encounter of the same ref in a chain. OpenAPI only — GraphQL ops omit `output` until the introspection parser is extended to lower return types into `JsonSchema`-shaped IR. GraphQL ops carry `defaultSelection` instead (the GraphQL fragment string the CLI sends by default), which is faithful to what the IR knows and signals to the agent which fields it will receive without overpromising a JSON-Schema response shape.

### Per-property contents under `input.properties`

Each property carries every piece of metadata an agent needs to issue a correct invocation:

| Field | Source / meaning |
|---|---|
| `type` | JSON Schema type |
| `description` | Spec description |
| `location` | `"query"` / `"path"` / `"header"` / `"body"` |
| `enum`, `x-fern-enum` | Allowed values, plus per-value display names/descriptions when overridden |
| `default` | Client-side default (from `x-fern-default`) — what the CLI substitutes on the wire |
| `serverDefault` | Server-side default (from OpenAPI's `default:` keyword) — documentation hint for what the API does on omission |
| `format` | OpenAPI `format` (`date-time`, `uuid`, etc.) |
| `nullable` | Whether the literal `null` is a valid flag value (ADR-0003 null sentinel) |
| `deprecated` | Per-param deprecation flag |
| `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum` | Numeric bound constraints (`minLength` / `maxLength` / `pattern` are NOT yet surfaced — the parser does not capture them today; see *Known gaps* below) |
| `examples` | Concrete examples (uncapped for now; revisit if real specs bloat output) |
| `availability` | Lowered `x-fern-availability` |
| `binding`, `variable`, `globalFlag`, `envVar` | Present only when the param is bound to an `x-fern-sdk-variable`; tells the agent to resolve via the root global flag / env var, not a per-op flag |
| Nested JSON Schema | For body fields that didn't flatten (e.g. free-form objects, true unions) — the property's `type: "object"` carries the full nested schema inline |

### Capability hints

The CLI exposes affordances the spec doesn't describe: pagination, binary downloads, streaming, dry-run. Per-op capability hints make these deterministically discoverable:

- `paginable: {kind, ...kind-specific fields}` — structured, present only when the op is paginable. The shape depends on `kind`: cursor (`cursorParam` / `nextCursorPath` / `resultsPath`), offset (`offsetParam` / `resultsPath` plus optional `stepParam` / `hasNextPagePath`), uri / path / custom (each with the dotted-paths the executor uses).
- `binaryResponse: true` — present only when the op has a binary 2xx
- `streaming: {format, terminator?}` — structured, present only when the op streams its response. `format` is one of `"sse"`, `"json"`, `"text"`; `terminator` is the optional sentinel line.

False booleans are omitted to keep the JSON tight. The root-level `globalFlags` array lists every CLI-harness flag available on every operation — `--schema`, `--dry-run`, `--format`, `--base-url`, `--quiet` — each with a description. Per-op flags (`--page-all`, `--output PATH`) are intentionally **NOT** in `globalFlags`; they surface via the per-op capability hints above so an agent can tell which ops actually support them.

### Known gaps

- **String constraints (`minLength` / `maxLength` / `pattern`)** are not yet surfaced. `OpenApiSchemaObject` does not capture them in the parser, so the IR has nowhere to hold them. Adding them is a parser + IR change scoped for a follow-up. Until then, agents must learn these constraints from server validation failures.
- **GraphQL `output`** is omitted; GraphQL ops carry `defaultSelection` instead (per *Per-op envelope* above). When the GraphQL introspection parser is extended to lower return types into `JsonSchema`-shaped IR, `output` will join on the GraphQL side.

## Consequences

**Positive.**

1. **Agents can drive the CLI in one round-trip.** Read `--schema` for an operation → produce a correct invocation. No second lookups, no trial-and-error on pagination/binary/streaming flags, no constructing JSON from a wire-shape that lies about the flag surface.
2. **`input.properties` is the single source of truth for the flag surface.** The same `merge_all_of_properties` helper that powers the command builder and the body validator (ADR-0004) powers the `--schema` renderer. Three consumers, one lowered view — drift-resistant by construction.
3. **`input`/`output` naming sidesteps OpenAPI's `parameters` ambiguity.** OpenAPI uses `parameters` for the narrow "non-body" set. Calling the agent's full input bag `parameters` would lie about body inclusion. `input`/`output` is CLI-native, symmetric, language-neutral.
4. **GraphQL parity without overpromising.** GraphQL ops emit `defaultSelection` rather than a fake `output` schema. When the introspection parser is later extended to lower return types, `output` joins on the GraphQL side and `defaultSelection` becomes complementary (showing which fields are *selected* from the available shape).
5. **The contract is documented as a contract.** CONTEXT.md's Language section names every canonical term (`input`, `output`, `location`, `defaultSelection`, `globalFlags`, `sdkVariables`) and flags the two genuine ambiguities (`parameters`, `default`). Future agents and contributors read one place to learn the vocabulary.

**Negative.**

1. **`--schema` output size grows.** Inlining response schemas with cycle detection, per-property constraints, and capability hints all add bytes. Tolerable in exchange for self-containedness — the agent's alternative is multiple round-trips or empirical discovery. Revisit if real specs produce pathological output (deeply recursive types, hundreds of inline examples).
2. **Renderer is a third consumer of `merge_all_of_properties`.** Adds a maintenance surface — when the flattening rules change (e.g. when `oneOf` lands per ADR-0005's deferred follow-up), the `--schema` renderer must update in lockstep with the command builder and validator. Acceptable: the helper exists precisely so all three stay aligned.
3. **`output` is OpenAPI-only at ship.** GraphQL agents get `defaultSelection` instead of a JSON Schema, which is information-rich but structurally asymmetric. Documented; intentional; revisitable when the parser extension lands.
4. **`globalFlags` and capability hints couple `--schema` to the CLI harness.** A spec-derived field (`input`) and a harness-derived field (`globalFlags`) now share one document. The coupling is one-way (the schema describes what the harness exposes), and the alternative — splitting into two docs — costs the agent a second call.

## Alternatives considered

- **(A) Keep `parameters` as the per-op input key and add `responseSchema` for output.** The path of least change. Rejected because `parameters` inherits OpenAPI's narrow meaning (excludes body), and adding body fields to it under that name guarantees confusion. `input`/`output` is symmetric and CLI-native.
- **(B) Three top-level per-op keys: `parameters`, `requestBody`, `responseSchema`.** Mirrors OpenAPI's own model exactly. Rejected: the agent then has to read three buckets and figure out which flag maps to which. With `input.properties` keyed by `location`, the agent reads one bag and knows everything.
- **(C) `input.properties` mirrors the wire shape (body as a nested object), not the flag surface.** Smaller JSON output. Rejected because the CLI flattens body fields into individual `--<flag>`s — a wire-shape mirror lies about the surface the agent can drive. An agent reading `body.user.name` and trying `--body '<JSON>'` would find no such flag.
- **(D) Render `output` with a `$defs` map (JSON Schema 2020-12 style) instead of full inlining.** Compact, no duplication, no cycle worries. Rejected: most response schemas are shallow enough that duplication isn't a problem, and the agent gets a single self-contained blob without a second lookup table. Cycle detection (leave `$ref` pointer on re-entry) covers the pathological cases.
- **(E) Polymorphic `output`: object (JSON Schema) for OpenAPI, string (GraphQL fragment) for GraphQL.** Rejected: the agent loses the simple "is `output` present? then it's a JSON Schema" check, and downstream tooling has to type-check. Separate sibling field (`defaultSelection`) keeps each shape pure.
- **(F) Omit `output` for GraphQL entirely until the parser extension lands.** Rejected because `defaultSelection` is sitting in the IR today and gives the agent real, actionable response-shape information. Strictly worse for the agent than (E)'s rejected polymorphism but worse than the chosen sibling-field approach.
- **(G) Keep `httpMethod` and `path` for human debugging.** Rejected: the design principle is "what the agent needs to use the command." HTTP plumbing is execution detail the CLI handles, not contract the agent uses. Debuggers can still read the spec directly.
- **(H) Brutalist `{input, output}`-only per-op shape — drop `operation`, `description`, `availability` too.** Rejected: `operation` makes the JSON self-describing when cached, `description` is a confirmation signal that the agent landed on the right op, and `availability` is a guardrail. All three are cheap.
- **(I) Skip capability hints; document `--page-all`/`--dry-run`/etc. in `--help` only.** Rejected: an agent doing pagination would have to trial-and-error to figure out that `--page-all` works on `list-events` but not `get-event`. Hints make this deterministic.
- **(J) Surface `examples` capped at N per property or N bytes total.** Deferred — trust spec authors for now and revisit if real specs bloat the output.

## Related

- `src/openapi/help.rs` — OpenAPI `--schema` renderer (the implementation surface this ADR governs)
- `src/graphql/help.rs` — GraphQL `--schema` renderer (companion path, kept independent per *Architecture: Code Generation Model*)
- `src/openapi/parser.rs::flatten_body_params_prefix` — produces the flat body-flag surface `input.properties` mirrors
- `src/openapi/parser.rs::merge_all_of_properties` — the shared lowering helper now consumed by command builder, validator, and the `--schema` renderer
- [ADR-0003](./0003-null-sentinel-on-nullable-scalar-body-flags.md) — `nullable` semantics surfaced per-property
- [ADR-0004](./0004-all-of-flattening-into-per-field-flags.md) — defines the flag surface `input.properties` mirrors
- [ADR-0005](./0005-nullable-union-promotion-via-composition.md) — informs which body fields end up flat vs nested in `input.properties`
- CONTEXT.md `## Language` section — canonical glossary for `--schema`, `input`, `output`, `defaultSelection`, `location`, `globalFlags`, `sdkVariables`, and the flagged `parameters` / `default` ambiguities
