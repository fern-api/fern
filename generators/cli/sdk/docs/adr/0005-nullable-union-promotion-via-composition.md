# ADR-0005: Nullable-union promotion via composition

**Status:** Accepted — 2026-05-28
**Context:** Pydantic emits nullable scalars as `anyOf: [{type: T}, {type: 'null'}]`, not as `nullable: true` or `type: [T, 'null']`. Devin's bundled spec has 59 such anyOfs — every one of them is the pydantic nullable encoding, not a true type union. Without recognition, these stay opaque to the flag layer despite being structurally equivalent to schemas that ADR-0003 already lowers to a `--field <TYPE|null>` flag with a null sentinel. This ADR defines the recognition rule and routes the result through the existing sentinel path.

## Decision

A composition is **promoted to a nullable scalar** when *all* of the following hold:

1. The composition is `oneOf` or `anyOf` (not `allOf` — intersection-with-null has no inhabitants).
2. **Exactly one branch is a "null sentinel":** either `{type: 'null'}` (3.1) or a standalone `{nullable: true}` with no other type-bearing fields (3.0).
3. **All other branches reduce to the same scalar base type** (`string` / `integer` / `number` / `boolean`). A branch may be either an inline `{type: scalar}` or a `{$ref: X}` where `X` resolves through `component_schemas` to a scalar component schema.

When promoted, the property is treated exactly as a nullable scalar of that base type: `MethodParameter.nullable = true`, `param_type = Some("<base>")`, and the existing `--field <TYPE|null>` rendering, null-sentinel input parsing, and `Value::Null` request-body injection from ADR-0003 all apply unchanged.

Promotion happens in `flatten_body_params_prefix` (which has `component_schemas` in hand for `$ref` resolution) via a new helper `recognize_nullable_union(schema, component_schemas) -> Option<&str>` returning `Some(base_type)` on a match or `None`. The intrinsic `is_nullable()` method on `OpenApiSchemaObject` stays narrow (3.0 `nullable: true` and 3.1 `type: [..., 'null']` only) — composition awareness is an additive helper, not a method override, because the recognizer needs the resolution context that `OpenApiSchemaObject` doesn't carry.

For the body validator, `validate_property` (`src/openapi/executor.rs`) gains a parallel check: when `value.is_null()` and the property is not intrinsically nullable, also accept null if `prop_schema.one_of` or `prop_schema.any_of` contains a branch whose `prop_type == Some("null")`. The validator does not need to verify that the *other* branches are all the same scalar — by the time we're validating a `Value::Null`, the null branch alone is sufficient to permit it. This avoids threading `component_schemas` into the validator.

## Consequences

**Positive.**

1. **Devin's 59 anyOf-nullable properties become flag-accessible.** Each one renders as `--<field> <STRING|null>` (or the appropriate scalar) instead of falling through to `--json`. Same UX as 3.1 `type: [string, 'null']` or 3.0 `nullable: true`.
2. **Reuses ADR-0003's path end-to-end.** Help-text affordance (`<TYPE>|null`), null-sentinel input parsing, `Value::Null` injection in `collect_params_from_flags`, validator tolerance — all unchanged. The promotion is a recognition step; downstream code never has to know the nullability came from composition.
3. **Recognition is purely additive.** Schemas that don't match the recognition rule fall through to today's behavior — typeless `VALUE` flag for property-level unions, `--json` fallback for root-level unions. No regressions for true unions; this ADR doesn't claim to handle them.
4. **Validator update doesn't take `component_schemas`.** By checking `prop_schema.one_of` / `prop_schema.any_of` for a `{type: 'null'}` branch directly, the validator stays self-contained — the composition data is already on `JsonSchemaProperty`. Only the flag layer needs the resolution context.

**Negative.**

1. **Recognition shape is narrow by design.** A composition like `anyOf: [{type: string}, {type: integer}, {type: 'null'}]` (three branches, two non-null with different types) is *not* promoted. It's a true union with a null variant — neither the existing `MethodParameter` model (single `param_type`) nor ADR-0003's sentinel handle multi-typed scalars. Stays opaque. The narrow rule is intentional; loosening it requires a separate design pass (see the deferred follow-up report).
2. **`$ref` resolution to a scalar costs a lookup per branch.** Cheap (HashMap lookup against `component_schemas`) but means recognition can fail silently if the ref is unresolvable. The flattener already tolerates unresolvable refs elsewhere; this is consistent but worth flagging.
3. **`oneOf` and `anyOf` are treated identically for promotion purposes.** The JSON Schema distinction (exactly-one vs at-least-one branch matches) is irrelevant for `T | null` — both shapes describe "value is either T or null" with identical wire semantics. We pick the laxer interpretation (treat both as the same nullable T). Spec authors who meant something more subtle by `oneOf` vs `anyOf` for a `T | null` shape lose that distinction. The case is hypothetical; flagged for completeness.
4. **A property whose two non-null branches resolve to the same scalar via different routes (one inline `{type: string}`, one `{$ref: NonEmptyString}` where NonEmptyString is `{type: string, minLength: 1}`) loses the `minLength: 1` constraint after promotion.** We collapse both branches to `string`, but `MethodParameter` doesn't carry minLength. Same trade-off the existing 3.1 `type: [string, 'null']` path makes — string constraints aren't enforced client-side today.

## Alternatives considered

- **(A) Strict 2-branch shape only — `[scalar, null]`, no N-branch matching.** Equivalent to the chosen rule for Devin's corpus (all 2-branch). Rejected because N-branch with one null *and* identical non-null types (e.g. `anyOf: [{type: string}, {$ref: AlsoString}, {type: 'null'}]`) is a small extension that costs nothing and helps specs that name some of their scalar types.
- **(B) Only inline scalar branches — no `$ref` resolution.** Simpler, stays purely structural. Rejected for cutting off the `{$ref: NonEmptyString}` case, which is a real pattern in specs that don't inline every scalar (we've seen it occasionally; rare in our corpus but worth supporting in one PR since the cost is one `component_schemas.get()`).
- **(C) Loose recognition — any composition reducing to a scalar via further composition.** A branch could itself be `{allOf: [...]}` reducing to a scalar. Rejected: edge cases multiply, recognition becomes a small graph traversal, and we've never seen the pattern. If it appears, extend the recognizer then.
- **(D) Extend `OpenApiSchemaObject::is_nullable()` to also check `one_of` / `any_of`.** Concise: one method, every call site benefits. Rejected because the recognizer needs `component_schemas` for `$ref` branches, which `is_nullable()` doesn't take. Two methods (intrinsic vs composition-aware) keeps each one's contract clean. Callers that need both call both.
- **(E) Recognize the promotion at IR-construction time in `convert_schema_property`.** Would let downstream consumers see a unified nullable bit. Rejected for the same reason as ADR-0004's consumer-side choice: `convert_schema_property` doesn't have `component_schemas`, so the recognizer would have to inline the resolution logic or be downgraded to the "no `$ref` resolution" case (B). Consumer-side keeps the resolution where the data lives.

## Related

- `src/openapi/parser.rs:783` — `OpenApiSchemaObject::is_nullable()` (intrinsic, unchanged)
- `src/openapi/parser.rs:2889` — `flatten_body_params_prefix` (gains `recognize_nullable_union` call)
- `src/openapi/parser.rs:2879` — `is_scalar_nullable` (extended: also returns true for promoted compositions)
- `src/openapi/executor.rs:2668` — `validate_property` null-shortcut (extended: also accepts null when `one_of` / `any_of` contains a null branch)
- `src/openapi/discovery.rs` — `JsonSchemaProperty.one_of` / `any_of` (raw IR fields, unchanged; validator reads them directly)
- `cli/openapi-31-fixture/openapi.yaml:108-113` — existing fixture (`role: oneOf: [admin const, user const, null]`) exercising the 3.1-distinct parser surface
- `cli/feature-matrix-fixture/openapi.yaml` — body-area cells `body_nullable_union_any_of` (Devin / pydantic pattern) and `body_nullable_union_one_of_ref` ($ref non-null branch)
- `tests/feature_matrix_wire.rs` — encoding-exact wire tests for the promoted shapes; both null sentinel and concrete-value round-trips
- [ADR-0003](./0003-null-sentinel-on-nullable-scalar-body-flags.md) — null sentinel that this promotion routes through
- [ADR-0004](./0004-all-of-flattening-into-per-field-flags.md) — companion decision for `allOf` flattening (different composition kind, same lowering site)
- [Report: 2026-05-21-oas-3-1-null-and-composition-followups.md](../../../../Patrick/reports/2026-05-21-oas-3-1-null-and-composition-followups.md) — original design exploration
- [Report: 2026-05-28-true-union-composition-followup.md](../../../../Patrick/reports/2026-05-28-true-union-composition-followup.md) — deferred true-union work (`oneOf` with multiple non-null branches, root-level union bodies, discriminator splits)
