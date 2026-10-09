# ADR-0010: Nullable-composite promotion and documentation-only consts

**Status:** Accepted — 2026-08-25
**Context:** [ADR-0005](./0005-nullable-union-promotion-via-composition.md) promotes `anyOf: [{type: scalar}, {type: 'null'}]` to a nullable scalar flag, but stops at scalars. The same pydantic encoding covers `Optional[Model]` and `Optional[list[T]]`, which emit `anyOf: [{$ref: Model}, {type: 'null'}]`. Those compositions carry no `type` keyword of their own, so `MethodParameter.param_type` ended up `None`, `coerce_body_param_value` fell through to its `_ => Value::String(raw)` arm, and a user's `--voice-settings '{"stability":0.5}'` reached the API as `"voice_settings": "{\"stability\":0.5}"` — a 422 on every affected route. One customer spec has 131 such properties across 72 endpoints.

Two adjacent lowering defects shared the same blast radius and are decided here as well: array-typed `multipart/form-data` fields were registered as single-value flags (making multi-file requests unreachable even though the wire layer already emits a `Vec<MultipartPart>`), and a `const` on an *optional* property became a real clap default that was materialized into every request body.

## Decision

**1. Promote nullable composites.** `recognize_nullable_composite(schema, component_schemas) -> Option<&OpenApiSchemaObject>` matches a `oneOf`/`anyOf` with **exactly one** null-sentinel branch and **exactly one** other branch, resolves that branch through `$ref`, and returns it when it is object- or array-shaped (`type: object`, `type: array`, or typeless-with-properties/`allOf`, the inheritance idiom). The property is then lowered from the *unwrapped* branch: object branches get `param_type: Some("object")` so the executor parses and validates JSON, array branches keep the existing repeated-flag lowering, and both carry `nullable: true` so ADR-0003's `null` sentinel still sends an explicit `Value::Null`.

Object branches are additionally **recursed into**, so `anyOf: [$ref Model, null]` emits the same dot-notation leaf flags as a bare `$ref: Model`. The dotted flags are the CLI's primary body surface and the JSON shorthand is the fallback; letting that surface depend on whether a field is spelled `Model` or `Optional[Model]` would be an artifact of the encoding rather than a decision. Because pydantic emits the nullable spelling for *every* optional model field, the leaves would otherwise be missing on exactly the specs this promotion serves. The parent flag keeps `nullable: true` so `--voice-settings '{...}'` and `--voice-settings null` both remain valid. Array branches are deliberately not recursed into — they lower to a repeated flag, as a plain `type: array` property does.

Scalar branches deliberately return `None` and stay on `recognize_nullable_union` — it already accepts N same-typed non-null branches, which this recognizer does not. More than one non-null branch is a true union with no single shape to promote, and stays opaque exactly as before.

**2. Array multipart fields are repeatable.** `MultipartField` gains `repeated`, set when the field's schema resolves to `type: array` (inline, behind a `$ref`, or inside a nullable composition). Repeated fields take `ArgAction::Append`, are collected with `try_get_many`, and emit one part per occurrence carrying the same `name` — the encoding multipart uses for a list. `collect_multipart_parts` additionally drains multipart keys out of the `--params` map, so `--params '{"tags":["a","b"]}'` lands in the form body instead of the query string.

**3. A `const` is auto-injected only where the spec requires the property.** For a required property the value is fixed, so demanding the user type it is ceremony and clap's `default_value` stands in for it. For an *optional* property the const becomes `documentation_default_value` (help text only), so omitting the flag omits the field. Injecting it there put properties the user never asked for into every request body, and — for a nested const leaf — collided with the object-shorthand flag of its own parent ("Cannot combine `--a.b` with `--a.b.version`"), making the parent flag unusable. The const still constrains accepted values via `effective_enum_values` either way.

The defaulted-value suppression in `collect_params_from_flags` is also no longer gated on `--json` alone: a defaulted body leaf stands down when the user typed *any* ancestor object-shorthand flag, which is the collision above.

## Consequences

**Positive.**

1. **Nullable objects and arrays round-trip.** The 131 affected properties serialize as JSON, and explicit `null` remains legal where the schema permits it — the workaround of adding a `type` keyword to the spec did not preserve that.
2. **Multi-value multipart requests become expressible** (`--files a.mp3 --files b.mp3`) with no change to the serializer, which already looped over parts.
3. **Request bodies contain only what the user asked for**, on every code path rather than only under `--json`.

**Negative.**

0. **The parent object flag and its leaves stay mutually exclusive** — the executor rejects combining `--a` with `--a.b`. That is pre-existing behavior for `$ref` properties, and recursion brings the nullable spelling under the same rule rather than introducing a new one.
1. **A required const is still injected**, so `--dry-run` shows a property the user did not type. Keeping it is what makes the field omissible at all; the alternative is failing the required check on a value the caller has no freedom over.
2. **Promotion collapses the branch's own metadata**: the unwrapped schema supplies `format`/`enum`, but a `description` on the composition itself still wins over the branch's, matching the pre-existing precedence for `$ref` properties.
3. **`is_repeated_multipart_property` is depth-bounded** (`MAX_MULTIPART_COMPOSITION_DEPTH`), so a pathological composition chain fails closed to a single-value flag rather than recursing.

## Alternatives considered

- **(A) Extend `recognize_nullable_union` to return composites too.** Rejected: its contract is "reduces to one scalar base type" and its N-branch tolerance is only sound for scalars. Two recognizers keep both contracts honest; the composite one is tried only when the scalar one declines.
- **(B) Leave nullable composites typeless and tell users to pass `--json`.** Rejected: `--json` is all-or-nothing for the body, and the per-field flags are the documented surface. It also does not fix the array case, where the flag was additionally non-repeatable.
- **(C) Drop const-derived defaults entirely and mark the property required.** Rejected: it makes callers type a value the schema fixes, and breaks every existing invocation that omits it.
- **(D) Suppress defaulted body leaves unconditionally.** Rejected: a required const would then never reach the body, re-breaking the endpoints ADR-era const injection was added for. Suppression is scoped to the ancestor-shorthand collision and `--json`.

## Related

- `src/openapi/parser.rs` — `recognize_nullable_composite`, `const_defaults`, `is_repeated_multipart_property`
- `src/openapi/commands.rs` — `build_multipart_field_arg` (`ArgAction::Append` when `repeated`)
- `src/openapi/app.rs` — `collect_multipart_parts` / `push_multipart_part`, ancestor-shorthand default suppression
- `src/openapi/executor.rs` — `coerce_body_param_value` (nullable-aware)
- [ADR-0003](./0003-null-sentinel-on-nullable-scalar-body-flags.md) — the `null` sentinel this promotion routes through
- [ADR-0005](./0005-nullable-union-promotion-via-composition.md) — the scalar counterpart
