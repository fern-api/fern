# Known issue: Python GraphQL SDK circular import (Relay connections)

**Status:** Open — diagnosed, not yet fixed. TypeScript is unaffected.

## Symptom

A generated Python GraphQL SDK raises `ImportError` on normal use as soon as the
`query`/`mutation`/`subscription` namespace is touched:

```python
from seed import SeedApi
client = SeedApi(base_url=..., token=...)
client.query.viewer()
# ImportError: cannot import name 'Post' from partially initialized module
#              'seed.types.post' (most likely due to a circular import)
```

It reproduces on the `python-graphql` seed fixture (schema with a Relay
`PostConnection`). The TypeScript `ts-graphql` SDK does **not** have this problem
(its runtime wire test passes), so this is Python-generator-specific.

### Why CI didn't catch it
- `compile`, snapshot tests, and `convertIRtoJsonSchema` all check *generated text*; they never import the SDK and call it.
- There were no GraphQL pytest tests, so `client.query` was never exercised at runtime. The hand-written runtime test that surfaced this is held out of the `python-graphql` fixture precisely because it would (correctly) fail until this is fixed.

## The import cycle

For a schema with a Relay connection, the generated type modules form a 4-node cycle, all via **eager module-level imports**:

```
seed/types/post.py            from .user import User            (Post.author: User)
seed/types/user.py            from .post_connection import …    (User.posts: PostConnection)
seed/types/post_connection.py from .post_edge import PostEdge   (PostConnection.edges: [PostEdge])
seed/types/post_edge.py       from .post import Post            (PostEdge.node: Post)  ← cycle closes
```

`query/client.py` does `from ..types.post import Post`, which kicks off
`post → user → post_connection → post_edge → post`, and `post` is still
mid-initialization when `post_edge` imports it → `ImportError`.

## Root cause (two layers)

### Layer 1 — converter leaves `referencedTypes` empty (prerequisite)
`packages/cli/api-importers/graphql/src/ir-conversion/convertGraphQLTypes.ts`
(`makeTypeDeclaration`) hardcodes:

```ts
referencedTypes: new Set<string>(),
```

The normal IR pipeline computes this per declaration
(`packages/cli/generation/ir-generator/src/converters/type-declarations/getReferencedTypesFromRawDeclaration.ts`,
used by `convertTypeDeclaration.ts`). Generators rely on `referencedTypes` to
detect cyclic dependencies; with it empty, the Python generator can't detect
*any* GraphQL type cycle.

**Fix (necessary, but not sufficient):** compute `referencedTypes` from the shape
— walk object properties / containers / union members and collect the named
`typeId`s. This is a contained converter change and is **output-neutral** for the
existing fixtures (verified: regenerating `ts-graphql` and `python-graphql` with it
produced 0 changes), because Layer 2 below still blocks the actual deferral.

### Layer 2 — Python generator only detects *direct 2-cycles* (the real gap)
`generators/python/src/fern_python/generators/context/pydantic_generator_context_impl.py`:

- `does_type_reference_other_type(a, b)` → `b in a.referenced_types` (line ~259, `get_referenced_types_of_type_declaration` returns `type_declaration.referenced_types`, which is **direct**, not a transitive closure).
- `do_types_reference_each_other(a, b)` → `a→b AND b→a` (direct only).
- `get_types_in_cycle_with(type_id)` (consumed by `fern_aware_pydantic_model.py:163` to decide forward-ref/`TYPE_CHECKING` deferral) and `_types_with_non_union_self_referencing_dependencies` (built at lines ~56-68) therefore only catch **direct A↔B 2-cycles**.

The Relay cycle is a **4-cycle with no 2-cycle inside it** (`Post→User`, `User→PostConnection`, … — no pair references each other directly), so the deferral never triggers and the imports stay eager.

> Note: the docstring on `get_types_in_cycle_with` claims "directly or transitively," but the implementation is direct-only. This is a **general** Python-generator limitation — any N-cycle (N>2) with no embedded 2-cycle is affected. GraphQL/Relay just makes such cycles common; a hand-written Fern definition could hit it too.

## Proposed fix

Both layers are required:

1. **Converter (`convertGraphQLTypes.ts`)** — populate `referencedTypes` (direct named typeIds from the shape). Contained, low-risk, output-neutral today.

2. **Python generator (`pydantic_generator_context_impl.py`)** — make cycle detection transitive. Compute strongly-connected components (or transitive reachability) over the `referenced_types` graph once at init, and have `do_types_reference_each_other` / `get_types_in_cycle_with` / the self-referencing-dependency map return true when two types are in the same SCC. Then `PostEdge.node: Post` (and the other edges) emit deferred imports (`if TYPE_CHECKING: from .post import Post` + string annotation `node: "Post"` + the existing `model_rebuild()`), breaking the import cycle.

### Risk
Layer 2 changes import structure for **every** Python SDK that contains an N-cycle, not just GraphQL. It must be validated against the full Python seed fixture suite (especially `circular-references`, `circular-references-advanced`) to confirm no regressions and that imports still resolve. This is why it should be done as a focused, separately-verified change rather than bundled into the GraphQL feature PRs.

### Verification plan
1. Apply both layers.
2. `pnpm seed test --generator python-sdk` across all fixtures — confirm determinism (no unexpected diffs) and that the `circular-references*` fixtures still pass their wire tests.
3. Regenerate `python-graphql`; confirm `post_edge.py` now uses `if TYPE_CHECKING` + forward-ref.
4. Enable the held runtime test (`tests/custom/test_client.py`, fernignore-protected) that imports `from seed import SeedApi` and calls `client.query.viewer()` — it should pass.
5. Confirm the TypeScript path is unaffected.

## Current state
- **TypeScript**: works; runtime wire test committed on the `graphql-sdk-pipeline` branch.
- **Python**: the circular-import fix was reverted out of the feature branches (kept at pre-fix state) pending the focused Layer-2 generator change described above.
