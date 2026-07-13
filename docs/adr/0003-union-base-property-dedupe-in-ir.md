# ADR 0003: Compute discriminated-union base-property dedupe facts in the IR

## Status
Accepted — PR [#17041](https://github.com/fern-api/fern/pull/17041) (opened 2026-07-13); merge pending review.

## Context
When a discriminated union has base properties that every variant already carries (e.g. fields lifted
from a shared parent by `infer-discriminated-union-base-properties`), generators emit those fields
twice — once on the union "envelope" and again inside every variant. This forces callers to set the
same field in two places, lets one copy silently win on (de)serialization, and produces non-compiling
examples.

The decision of *which* base properties are redundant was being re-derived independently in up to four
places: the Go model (in Go), the Go dynamic snippet (in TypeScript), the C# model (in TypeScript), and
the C# dynamic snippet (in TypeScript). Because the Go model is Go and the Go snippet is TypeScript,
they cannot share a helper, and the re-derivations had already drifted (the review of the Go
dynamic-snippet PR found ≥4 cases where its rule disagreed with the Go model — pass-by-value,
alias-to-object variants, literals, base-vs-extends). Each consumer also used subtly different
"same type" tests.

The decision itself is language-agnostic: it depends only on the shape of the API (which variants carry
which properties, with which types), not on how any language renders it. The natural place to compute a
language-agnostic fact once is the IR.

## Decision
Compute the base-property redundancy facts once, as a post-build pass over the fully-assembled IR
`types` map, and expose them on both the regular IR and the dynamic IR. Generators read these facts
instead of re-deriving them.

Two derived views are emitted, because the two languages dedupe in opposite directions and need
different aggregations of the same atomic rule (a union base property `W` is *compatibly carried* by a
`samePropertiesAsObject` variant object `O` iff `O` declares a property with the same `wireValue` —
collecting from `O.properties`, `O.extendedProperties`, and following alias chains — whose `valueType`
is **structurally equal** to `W.valueType`):

- **`UnionTypeDeclaration.inheritedBaseProperties`** (View A, for envelope-droppers such as Go):
  per union, the base properties that *every* variant is a `samePropertiesAsObject` object that
  compatibly carries. Go emits one delegating getter on the union that must compile for every
  discriminant case, so it needs *all* variants to carry the field.
- **`ObjectTypeDeclaration.deferredUnionBaseProperties`** (View B, for leaf-droppers such as C#):
  per object used *exclusively* as a union variant, the properties it declares that every owning union
  also declares as a base property with a structurally-equal type. Guard: the object must never be
  referenced outside a union variant (standalone, an `extends` parent, an alias target, an
  undiscriminated-union member, or a plain property type), because leaf-dropping mutates a possibly
  shared object.

Both fields are mirrored on the dynamic IR (`DiscriminatedUnionType.inheritedBaseProperties` and
`ObjectType.deferredUnionBaseProperties`) for the snippet generators. The dynamic converter copies the
pre-computed regular-IR facts rather than recomputing them, so there is genuinely one computation.

Structural equality is the deliberately conservative, language-agnostic definition (a normalized
`JSON.stringify` compare of the two `TypeReference`s). Where a language cannot render a
structurally-equal field (e.g. Go renders literal-typed inherited properties as methods, not
delegatable fields), the generator keeps a thin *local rendering* filter. The guiding principle is
**facts in the IR, policy in the generators**: the IR states which properties are redundant; each
generator decides how (and whether, via its opt-in flag) to collapse the duplication.

The pass runs immediately after `addExtendedPropertiesToIr` (which it depends on) and before
`resolveGlobalParameterApplicability` in `generateIntermediateRepresentation`. The shared computation
lives in one module (`union-base-properties/computeUnionBasePropertyDedupe.ts`). The facts are computed
regardless of any generator flag; the opt-in gating stays in each generator.

The change is additive to the IR schema → minor IR bump (67.11.0 → 67.12.0). No generator consumes the
fields yet; Go and C# are migrated to read them in follow-up PRs.

## Alternatives Considered
- **Leave the decision in each generator.** Rejected: it is the status quo that produced four
  independent, already-drifted re-derivations with no shared source of truth.
- **Emit a single view (View A only) and have C# consume it.** Simpler IR surface, but C# becomes
  strictly less aggressive than its current behavior (it would only dedupe leaves when *every* sibling
  variant carries the field) and would still need a local exclusivity check. Two views let each
  language be exactly as aggressive as it can safely be, from one computation.
- **Bake language-specific rules (e.g. excluding literals) into the IR fact.** Rejected: that would
  make the shared fact Go-specific and could over-restrict other languages. Literals stay in the IR
  fact; a language filters them locally where it cannot render them.

## Consequences
- The dedupe decision exists in exactly one place. Adding a fifth consumer (another language) is "read
  the field," not "re-implement the rule."
- Go currently dedupes on *rendered-Go-type* equality, a superset of structural equality. Reading the
  structural `inheritedBaseProperties` means Go will dedupe strictly fewer cases — a few
  previously-suppressed fields reappear on the envelope. This is safe (it can only keep a field, never
  drop a needed one) and removes the drift bugs, but it is a change to gated output that must be
  validated when Go is migrated.
- Generators consume the *published* IR SDK, not the workspace copy, so the IR minor must publish before
  the Go/C# PRs can bump their IR dependency and consume the fields on CI-green.
- The two views are computed by traversing the full `types` map; the cost is one additional linear pass
  over type declarations at IR-generation time.
