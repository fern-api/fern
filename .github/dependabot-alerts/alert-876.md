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

- **Package:** flatted (npm)
- **Severity:** HIGH
- **Vulnerable versions:** < 3.4.0
- **Patched version:** 3.4.0
- **CVE:** CVE-2026-32141
- **GHSA:** GHSA-25h7-pfq9-p65f
- **Manifest:** pnpm-lock.yaml

**Summary:**
flatted vulnerable to unbounded recursion DoS in parse() revive phase

**Description:**
## Summary

flatted's `parse()` function uses a recursive `revive()` phase to resolve circular references in deserialized JSON. When given a crafted payload with deeply nested or self-referential `$` indices, the recursion depth is unbounded, causing a stack overflow that crashes the Node.js process.

## Impact

Denial of Service (DoS). Any application that passes untrusted input to `flatted.parse()` can be crashed by an unauthenticated attacker with a single request.

flatted has ~87M weekly npm downloads and is used as the circular-JSON serialization layer in many caching and logging libraries.

## Proof of Concept

```javascript
const flatted = require('flatted');

// Build deeply nested circular reference chain
const depth = 20000;
const arr = new Array(depth + 1);
arr[0] = '{"a":"1"}';
for (let i = 1; i <= depth; i++) {
  arr[i] = `{"a":"${i + 1}"}`;
}
arr[depth] = '{"a":"leaf"}';

const payload = JSON.stringify(arr);
flatted.parse(payload); // RangeError: Maximum call stack size exceeded
```

## Fix

The maintainer has already merged an iterative (non-recursive) implementation in PR #88, converting the recursive `revive()` to a stack-based loop.

## Affected Versions

All versions prior to the PR #88 fix.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/876)
