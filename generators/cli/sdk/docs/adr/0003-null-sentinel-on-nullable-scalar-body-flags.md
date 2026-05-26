# ADR-0003: Null sentinel on nullable scalar body flags

**Status:** Accepted — 2026-05-22
**Context:** PR #70 added OpenAPI 3.0 `nullable: true` / 3.1 `type: [..., "null"]` capture into the IR (`JsonSchema.nullable`, `JsonSchemaProperty.nullable`), but no consumer reads the flag — nullable fields are indistinguishable from non-nullable ones on the CLI surface. A nullable body field has three meaningful wire states (absent, value, JSON null) but the CLI today only exposes two. Users who want JSON null must drop to `--json` / `--params`.

## Decision

For body parameters whose schema is nullable **and** whose base type is a scalar (`string`, `integer`, `number`, `boolean`), the CLI accepts a **null sentinel**: the literal string `null` passed as the flag value.

The sentinel is **context-sensitive on the IR's `nullable` flag, not on the input string alone**:

| Parameter `nullable` | `--field null` produces on the wire |
|---|---|
| `true` | JSON `null` |
| `false` | the four-character string `"null"` (status quo — clap-string passthrough) |

The interpretation flip happens in `collect_params_from_flags` (`src/openapi/app.rs`), not in the value parser. The value parser admits the literal `"null"` unconditionally (which it already does for any string-typed flag); the conversion to `serde_json::Value::Null` is gated on `param.nullable && value_source != DefaultValue`.

**Help-text affordance.** Nullable scalar flags render their `value_name` as `<TYPE>|null` (e.g. `--user-id <STRING|null>`, `--priority <NUMBER|null>`). Enum-valued nullable flags add `null` as an additional `PossibleValue` so clap's `[possible values: …]` listing surfaces it.

**Scope boundaries.**

- **Locations.** Body parameters only. `nullable: true` on a path / query / header parameter is captured in the IR but silently not lowered. Wire semantics for null in non-body locations are genuinely ambiguous (HTTP headers have no null; query strings collapse to absent-or-empty depending on serialization style; path parameters are by spec definition required strings).
- **Types.** Scalars only. `type: [array, null]` and `type: [object, null]` retain the existing flag surface (no parent flag for objects; `Append` action for arrays) and require `--json` to express null. Mixing the sentinel with `ArgAction::Append` would mean "append the string `'null'` to the array" today — disambiguating would require a separate flag.
- **`x-fern-default` interaction.** A nullable scalar with an `x-fern-default` keeps three states: omit → default sent; `--field null` → JSON null sent; `--field <value>` → value sent. The existing `value_source: DefaultValue` check in `collect_params_from_flags` already distinguishes default-injected from user-supplied, so the sentinel only converts on user-supplied values.

## Consequences

**Positive.**

1. **No false errors.** A non-nullable string field with `--field null` continues to behave exactly as today (sends the string `"null"`). The new feature is purely additive on nullable fields — no migration risk for existing scripts.
2. **The IR drives behavior, the parser stays simple.** The value parser is unchanged for plain scalars; only `build_enum_value_parser` gains a conditional branch to include `null` as a possible value. The sentinel → JSON-null transformation lives in one place (`collect_params_from_flags`), not duplicated across parsers per type.
3. **Wire path is mostly free.** `set_nested_value` (`src/openapi/executor.rs:2432`) is structural and threads `Value::Null` through to nested objects without change. `coerce_body_param_value` short-circuits on non-`Value::String`, so `Value::Null` flows through type coercion untouched. The one place the wire path needed a code change is the body schema validator (`validate_property`), which previously did strict type-matching that rejected JSON null even for nullable properties — a parallel "honor `prop_schema.nullable`" check was added there.
4. **Help-text noise stays bounded.** `<TYPE>|null` extends the existing `STRING` / `NUMBER` / `BOOLEAN` / `JSON_ARRAY` / `JSON_OBJECT` `value_name` pattern. No new badge competing with `[deprecated]`, `[default: …]`, availability indicators.

**Negative.**

1. **`null` becomes a magic word.** For nullable scalar string fields, the literal four-character string `"null"` can no longer be sent via the per-field flag — it always converts to JSON null. The escape is `--json '{"field": "null"}'`. The case is rare (real-world specs rarely encode "null" as a valid string value for a nullable field) but real.
2. **Per-flag semantics differ silently across operations.** Two `--code` flags on adjacent commands may behave differently based on schema nullability. The `<TYPE>|null` `value_name` is the only `--help`-time signal.
3. **Composite nullables stay on `--json`.** Operations whose body has `type: [object, null]` at the root, or a nullable array somewhere in the tree, still require `--json` to express null. Documented as the escape hatch.

## Alternatives considered

- **(A) Permissive sentinel — `--field null` always means JSON null, regardless of IR.** Cleanest mental model but silently emits JSON null on non-nullable fields, which is a spec violation the CLI could have rejected up-front. Also makes the literal string `"null"` unreachable on *any* string field, even non-nullable ones (regression vs. today). Rejected.
- **(B) Opt-out flag — emit a `--no-<field>` companion for every nullable field.** Unambiguous and clap-native, but on Auth0's 218 nullable properties this doubles the per-operation flag surface in `--help`. The two-flag-per-field model also leaks IR shape into the CLI in a way the single-flag model doesn't. Rejected.
- **(C) Strict gating — `--field null` produces JSON null on nullable fields and errors on non-nullable ones.** Catches more user errors at parse time, but introduces a new error class for what is currently a benign passthrough (`--field null` on a string field works today, would break after the change). Rejected for the regression risk; the silent-passthrough behavior of (D) is more conservative.

## Related

- `src/openapi/parser.rs:782` — `OpenApiSchemaObject::is_nullable()` (3.0 / 3.1 unification)
- `src/openapi/discovery.rs:808` — `MethodParameter` (gains `pub nullable: bool`)
- `src/openapi/parser.rs:2832` — `flatten_body_params_prefix` (emit sites that populate `param.nullable`)
- `src/openapi/commands.rs:436` — `value_name` match (renders `<TYPE>|null`)
- `src/openapi/commands.rs:543` — `build_enum_value_parser` (adds `null` `PossibleValue` for nullable enums)
- `src/openapi/app.rs:2032` — `collect_params_from_flags` (sentinel → `Value::Null` conversion)
- `src/openapi/executor.rs` — `validate_property` (honors `JsonSchemaProperty.nullable` so `Value::Null` passes body validation)
- `cli/openapi-31-fixture/openapi.yaml:33-37` — existing test fixture (`userId: type: [string, null]`)
- [Report: 2026-05-21-oas-3-1-null-and-composition-followups.md](../../../../Patrick/reports/2026-05-21-oas-3-1-null-and-composition-followups.md) — design exploration that this ADR resolves
