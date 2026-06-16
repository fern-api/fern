@devin-ai-integration Please resolve this Dependabot security alert.

**Instructions:**
1. Analyze the vulnerability and understand its impact
2. Update the affected dependency to a secure version. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
3. Ideally resolve this without using an override - prefer updating the dependency directly
4. If an override is absolutely necessary, document why in the PR description
5. Run tests to ensure the update doesn't break anything
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/dependabot-alerts/alert-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Alert Details:**

- **Package:** js-yaml (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** <= 4.1.1
- **Patched version:** 4.2.0
- **CVE:** CVE-2026-53550
- **GHSA:** GHSA-h67p-54hq-rp68
- **Manifest:** pnpm-lock.yaml

**Summary:**
JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases

**Description:**
### Summary
A crafted YAML document can trigger algorithmic CPU exhaustion in `js-yaml` merge-key processing (`<<`) by repeating the same alias many times in a merge sequence.  
This causes quadratic parse-time behavior relative to input size and can block a Node.js worker/event loop for seconds with a relatively small payload (tens of KB), resulting in denial of service.

### Details
The issue is in merge handling inside `lib/loader.js`:

- `storeMappingPair(...)` iterates every element of a merge sequence when key tag is `tag:yaml.org,2002:merge`.
- For each element, it calls `mergeMappings(...)`.
- `mergeMappings(...)` computes `Object.keys(source)` and performs `_hasOwnProperty.call(destination, key)` checks for each key.

When input is of the form:

a: &a {k0:0, k1:0, ..., kK:0}
b: {<<: [*a, *a, *a, ... repeated M times ...]}
all *a entries refer to the same anchored object. After the first merge, subsequent merges are semantically no-ops, but the parser still reprocesses all keys each time.
Resulting work is O(K * M), while input size is O(K + M), giving quadratic scaling as payload grows.
Relevant code path:
lib/loader.js in storeMappingPair(...) merge branch (keyTag === 'tag:yaml.org,2002:merge')
lib/loader.js mergeMappings(...)


### Root cause
File:       lib/loader.js
Function:   storeMappingPair(state, _result, overridableKeys, keyTag, keyNode,
                             valueNode, startLine, startLineStart, startPos)
Lines:      ~359-366

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    }

When the merge value is a sequence (YAML 1.1 <<: [ *a, *a, ... ]), each element
is handed to mergeMappings() without deduplication. mergeMappings() then does

    sourceKeys = Object.keys(source);
    for (index = 0; index < sourceKeys.length; index += 1) {
      key = sourceKeys[index];
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }

Every alias reference in the sequence resolves (by design) to the SAME object
via state.anchorMap. After the first merge, every subsequent merge of that same
reference is a pure no-op semantically, but still performs:

  * one Object.keys(source) call (O(K))
  * K _hasOwnProperty.call checks on the destination

Total: M * K hasOwnProperty checks + M Object.keys allocations, while the final
object and all observable side effects are identical to a single merge.

YAML semantics for `<<:` are idempotent and commutative over duplicate sources,
so collapsing duplicates preserves behavior exactly; this isn't a spec trade-off.


### PoC
Environment:
js-yaml version: 4.1.1
Node.js: v24.5.0
Platform: arm64 macOS (reproduced consistently)
Reproduction script:
Create many keys in one anchored map (&a).
Merge that same alias repeatedly via <<: [*a, *a, ...].
Measure parse time and compare with control payload using single merge (<<: *a).
Observed repeated runs (same machine):
K=M=1000, input 9,909 bytes: ~33–36 ms
K=M=2000, input 20,909 bytes: ~121–123 ms
K=M=4000, input 42,909 bytes: ~524–537 ms
K=M=6000, input 64,909 bytes: ~1,608–1,829 ms
K=M=8000, input 86,909 bytes: ~3,395–3,565 ms
Control (single merge, similar key counts):
K=2000: ~1–2 ms
K=4000: ~3 ms
K=8000: ~5 ms
Also verified: repeated-merge output equals single-merge output (same key count and same JSON), confirming excess time is redundant computation.


### Impact
This is a denial-of-service vulnerability (CPU exhaustion / algorithmic complexity).
Any service parsing untrusted YAML with js-yaml can be impacted, including API backends, CI tools, config processors, and automation services. An attacker can submit crafted YAML to significantly increase CPU time and reduce availability.

### Suggested fix:
Dedupe the merge source list by reference before invoking mergeMappings. Any of
the following are minimal and preserve YAML 1.1 merge semantics:

dedupe in storeMappingPair:

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        var seen = new Set();
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          var src = valueNode[index];
          if (seen.has(src)) continue;   // idempotent; skip redundant alias
          seen.add(src);
          mergeMappings(state, _result, src, overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    }

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2090)
