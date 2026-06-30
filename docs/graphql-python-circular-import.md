# Known issue: Python GraphQL SDK circular import (Relay connections)

**Status:** Open — diagnosed, not yet fixed. **GraphQL-converter-only bug** (not a Python-generator bug, not a `main` bug). TypeScript is unaffected.

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

Reproduces on the `python-graphql` seed fixture (schema with a Relay
`PostConnection`). The TypeScript `ts-graphql` SDK does **not** have this problem.

### Why CI didn't catch it
`compile`, snapshots, and `convertIRtoJsonSchema` all check *generated text*; none
import the SDK and call it. There were no GraphQL pytest tests, so `client.query`
was never exercised at runtime. The hand-written runtime test that surfaced it is
held out of the fixture until this is fixed.

## The import cycle

For a Relay connection, the generated type modules form a cycle via eager imports:

```
seed/types/post.py            from .user import User            (Post.author: User)
seed/types/user.py            from .post_connection import …    (User.posts: PostConnection)
seed/types/post_connection.py from .post_edge import PostEdge   (PostConnection.edges: [PostEdge])
seed/types/post_edge.py       from .post import Post            (PostEdge.node: Post)  ← cycle closes
```

`query/client.py` does `from ..types.post import Post`, starting
`post → user → post_connection → post_edge → post`; `post` is still initializing
when `post_edge` imports it → `ImportError`.

## Root cause — the GraphQL converter leaves `referencedTypes` empty

`packages/cli/api-importers/graphql/src/ir-conversion/convertGraphQLTypes.ts`
(`makeTypeDeclaration`) hardcodes:

```ts
referencedTypes: new Set<string>(),
```

`referencedTypes` is what the Python generator uses to detect cyclic dependencies
and emit forward references (`if TYPE_CHECKING:` + string annotation +
`model_rebuild()`) that break the import cycle. Empty → no cycle detected → eager
imports → crash.

### Why this is GraphQL-only and never surfaced before
The normal IR pipeline computes `referencedTypes` as the **transitive closure** of
referenced types — `getReferencedTypesFromRawDeclaration`
(`packages/cli/generation/ir-generator/src/converters/type-declarations/getReferencedTypesFromRawDeclaration.ts`,
lines ~148-173) recurses into each referenced type's declaration with a shared
`seenTypeNames`, accumulating everything reachable. Empirically confirmed on a
committed IR dump (e.g. `irs/generics.json` `Movie` has `referencedTypes` larger
than its direct property refs).

Because it's transitive, the Python generator's existing cycle detection
(`generators/python/src/fern_python/generators/context/pydantic_generator_context_impl.py`:
`does_type_reference_other_type` → `do_types_reference_each_other` →
`get_types_in_cycle_with`, consumed by `fern_aware_pydantic_model.py:163`)
**already handles N-cycles correctly**: for the 4-cycle, `post.referenced_types`
(transitive) contains `post_edge` and vice-versa, so they're detected as
in-cycle and deferred. This is why every OpenAPI / Fern-definition SDK — including
the `circular-references` / `circular-references-advanced` fixtures — works.

The GraphQL converter is the only producer that bypassed this: it set
`referencedTypes` to an empty set instead of computing it. **So the Python
generator is not buggy, and this is not a pre-existing `main` issue — it is purely
our GraphQL converter producing incomplete IR.**

## The fix (converter-only, low risk)

In `convertGraphQLTypes.ts`, populate `referencedTypes` with the **transitive
closure** of each type's referenced named typeIds (matching the normal pipeline),
not an empty set and not just direct refs:

1. Build the direct-reference graph for all generated GraphQL types (walk each
   shape's object properties / containers / union members → named `typeId`s).
2. Compute the transitive closure per type (DFS/BFS over that graph, dedup with a
   seen-set to handle cycles).
3. Set each declaration's `referencedTypes` to its closure.

This belongs on the **GraphQL IR branch** (`graphql-ir-pipeline`), not a `main`
branch — the defect is entirely in our converter. **No Python-generator change is
needed** (the generator already breaks N-cycles given correct `referencedTypes`),
so there is no cross-SDK blast radius.

> Note: a prior attempt populated only *direct* referenced typeIds. That is
> output-neutral but **insufficient** — the 4-cycle has no direct 2-cycle, so the
> generator's detection needs the *transitive* set to see that `post` and
> `post_edge` are mutually reachable. The closure is the key detail.

### Verification plan
1. Implement the transitive-closure computation in the converter.
2. Regenerate `python-graphql`; confirm `post_edge.py` now uses
   `if TYPE_CHECKING: from .post import Post` + `node: "Post"`.
3. Run a runtime test: `from seed import SeedApi; client.query.viewer()` (mock the
   transport with `httpx.MockTransport`) — should no longer raise `ImportError`.
4. Confirm `ts-graphql` output is unchanged and the regular Python fixtures still
   pass (the converter change only affects GraphQL-derived types).

## Current state
- **TypeScript**: works; runtime wire test committed on `graphql-sdk-pipeline`.
- **Python**: reverted to pre-fix state pending the converter transitive-closure
  fix above. The held runtime test (`tests/custom/test_client.py`) is ready to
  enable once it lands.
