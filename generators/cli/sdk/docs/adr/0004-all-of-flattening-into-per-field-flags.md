# ADR-0004: `allOf` flattening into per-field flags

**Status:** Accepted — 2026-05-28
**Context:** PR #70 added IR capture of `oneOf`/`anyOf`/`allOf` composition on both `JsonSchema` (root) and `JsonSchemaProperty` (nested), but no downstream consumer reads it. Of the 325 `allOf` occurrences in Box's bundled spec — the largest composition user in our corpus — none reach the CLI flag surface today. Bodies typed as `allOf: [Base, {extras}]` (the standard inheritance / mixin pattern) fall through to `--json` only. Report `~/reports/2026-05-21-oas-3-1-null-and-composition-followups.md` enumerates the gap and proposes per-PR phasing; this ADR resolves the design for the first phase.

## Decision

`allOf` is lowered into per-field flags **consumer-side**, in `flatten_body_params_prefix` (`src/openapi/parser.rs`) for the flag surface and in `validate_property` / `validate_properties` (`src/openapi/executor.rs`) for body validation. A small shared helper, `merge_all_of_properties(schema, component_schemas) -> (properties, required)`, walks each branch recursively, resolving `$ref`s through the existing `component_schemas` map, and returns the merged property bag plus the union of `required` arrays. Both consumer sites call this helper instead of reading `obj.properties` and `obj.required` directly.

The IR (`JsonSchema`, `JsonSchemaProperty`) keeps `all_of` populated with the raw branches. Parser-side merge was rejected (see below) to preserve round-trip-ability and to keep the blast radius bounded.

### Merge semantics

| Concern | Rule |
|---|---|
| Property identity | Properties are merged in order; if branch *N+1* declares a property already declared by branch *N*, branch *N+1*'s schema replaces it (last-branch-wins). |
| Required arrays | Union of every branch's `required: [...]`. Properties marked required by any branch are required overall. |
| `$ref` branches | Resolved through `component_schemas` before merging. Resolution failures (unknown ref) skip the branch with a `tracing::warn!`. |
| Nested `allOf` | Branches that are themselves `{allOf: [...]}` recurse with the same rule. |
| Overlap diagnostic | When a property name appears in more than one branch, emit a `tracing::warn!` with the operation id, property name, and branches involved — surfaces silently-overlapping specs without failing the build. |

### Depth budget

`allOf` does not consume from `MAX_BODY_DEPTH = 3`. Crossing into a branch is free; only crossing into a nested **object property** (a real dot in the flag name) decrements the budget. Rationale: `allOf` doesn't add a layer in the user's mental model — there is no dot, no nesting visible at the flag level — so charging it against a depth budget tuned for *user-visible* nesting would falsely cap real specs.

To bound pathological cases (cyclic `$ref` chains via `Foo: {allOf: [{$ref: 'Foo'}, ...]}`), the helper enforces a separate safety cap of **8 levels of consecutive `allOf` recursion**. Hitting the cap stops recursion at that branch and logs `tracing::warn!`; the surrounding flattener proceeds with whatever was already merged.

### Root-level vs property-level

`flatten_body_params_prefix` today early-returns when `schema.schema_type() != Some("object")`. After this change, it also enters when `!schema.all_of.is_empty()` — a request body whose top-level schema is `{allOf: [...]}` (no `type:`) flattens via the same path as a property-level `allOf`. No new entry point; the existing recursion just sees one more shape it knows how to handle.

## Consequences

**Positive.**

1. **Box's 325 `allOf` occurrences become flag-accessible.** The dominant pattern (`allOf: [{$ref: Base}, {inline extras}]`) flattens to `--id`, `--created-at`, `--extra` instead of `--json '{...}'`. Validates against the same `$ref` resolution path the rest of the parser already uses.
2. **Consumer-side lowering keeps the IR literal.** Future consumers (skill emitter, a hypothetical spec round-tripper, debug introspection) still see the original `all_of` branches. The merge is computed where it's consumed.
3. **Shared helper prevents drift.** Flag generation and body validation can't disagree about what `allOf` means — they read the same merged view from the same function.
4. **Validator stays honest.** Without the validator update, `--meta.created-at` would generate a body the validator then rejects (because `meta`'s `properties` is empty in the IR). Updating both sites in lockstep eliminates the asymmetry.

**Negative.**

1. **Duplicated walk between flag layer and validator.** Both call the same helper, but each maintains its own recursion stack and re-resolves `$ref`s. The cost is modest (Box's typical allOf is 2–3 branches) but real. Acceptable in exchange for keeping the openapi path self-contained per AGENTS.md's no-shared-abstractions-across-protocols rule.
2. **Last-branch-wins is a convention, not a JSON Schema requirement.** JSON Schema's formal `allOf` semantics is intersection — every constraint applies. We approximate intersection with a sensible default for the common case (`[Base, {overlay}]`) and warn on overlap. Specs that lean on intersection-of-types (`allOf: [{type: number}, {minimum: 0}]`) work correctly; specs that declare the same property name with genuinely conflicting types lose information. The `tracing::warn!` surfaces this when it happens.
3. **No discriminator yet.** This ADR does not address `oneOf` / `anyOf` (covered separately by ADR-0005 for the nullable-union case, and deferred by `~/reports/2026-05-28-true-union-composition-followup.md` for true unions). Bodies that are a `oneOf` at the root still require `--json`.
4. **Pathological cycle handling is depth-based, not visited-set.** A spec with `Foo: {allOf: [{$ref: Foo}]}` stops at level 8 instead of being detected as cyclic. Acceptable: cyclic `allOf` is a spec bug, the warning surfaces it, and the bound is small.

## Alternatives considered

- **(A) Parser-side lowering — merge `allOf` into `JsonSchema.properties` at conversion time.** Cleaner long-term: every consumer sees a flat IR, no walk needed. Rejected because it loses the raw composition shape from the IR (no round-trip), and the conversion functions don't currently take `component_schemas`, so threading it through `convert_schema_object` / `convert_schema_property` is a bigger blast radius than the consumer-side change. Reconsider when a second consumer (skill emitter, schema explorer) needs the same walk.
- **(B) First-branch-wins on property overlap.** Symmetric to last-wins but counter-intuitive: real specs put the base type first and the overlay second precisely because the overlay is meant to add/refine. First-wins would mean a `description` overlay never reaches the flag's help text. Rejected.
- **(C) Hard error on duplicate property name across branches.** Safest interpretation of JSON Schema's intersection semantics. Rejected because a single conflict anywhere in Box's 325 allOf occurrences would sink the surrounding operation entirely — the failure mode is too broad for what is usually a benign overlap.
- **(D) Hybrid IR: merge into a synthetic `merged_properties` field, keep `all_of` populated.** Gives both views. Rejected for adding IR memory and forcing every consumer to choose which view to read. The single-source-of-truth via shared helper is simpler.
- **(E) Charge `allOf` against `MAX_BODY_DEPTH`.** Conservative, but `MAX_BODY_DEPTH = 3` is tuned for user-visible dot-notation depth, and Box-style nested `allOf: [Base, allOf: [...], extras]` would exhaust the budget before reaching real properties — producing *fewer* flags than the no-composition case. Rejected.

## Related

- `src/openapi/parser.rs:1735` — `convert_composition_branches` (raw IR capture, unchanged)
- `src/openapi/parser.rs:2889` — `flatten_body_params_prefix` (gains `merge_all_of_properties` call before/within the property loop)
- `src/openapi/executor.rs:2611` — `validate_properties` (gains merged-properties view for `allOf`-typed schemas)
- `src/openapi/executor.rs:2652` — `validate_property` (descends into merged view, not raw `properties`)
- `cli/feature-matrix-fixture/openapi.yaml` — body-area cells `body_all_of` (root-level $ref + inline + duplicate-property), `body_all_of_nested` (property-level allOf, dot-notation), `body_one_of_true_union` (`#[ignore]`'d gap — see ADR-0005 and the followup report)
- `tests/feature_matrix_wire.rs` — encoding-exact wire tests against the cells above
- [ADR-0003](./0003-null-sentinel-on-nullable-scalar-body-flags.md) — null sentinel that ADR-0005's promotion plugs into
- [ADR-0005](./0005-nullable-union-promotion-via-composition.md) — companion decision for `oneOf` / `anyOf` shapes that reduce to a nullable scalar
- [Report: 2026-05-21-oas-3-1-null-and-composition-followups.md](../../../../Patrick/reports/2026-05-21-oas-3-1-null-and-composition-followups.md) — design exploration that this ADR resolves
- [Report: 2026-05-28-true-union-composition-followup.md](../../../../Patrick/reports/2026-05-28-true-union-composition-followup.md) — deferred work for true `oneOf` / `anyOf` unions
