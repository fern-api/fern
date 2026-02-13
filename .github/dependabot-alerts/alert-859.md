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

- **Package:** qs (npm)
- **Severity:** LOW
- **Vulnerable versions:** >= 6.7.0, <= 6.14.1
- **Patched version:** 6.14.2
- **CVE:** CVE-2026-2391
- **GHSA:** GHSA-w7fw-mjwx-w883
- **Manifest:** pnpm-lock.yaml

**Summary:**
qs's arrayLimit bypass in comma parsing allows denial of service

**Description:**
### Summary
The `arrayLimit` option in qs does not enforce limits for comma-separated values when `comma: true` is enabled, allowing attackers to cause denial-of-service via memory exhaustion. This is a bypass of the array limit enforcement, similar to the bracket notation bypass addressed in GHSA-6rw7-vpxm-498p (CVE-2025-15284).

### Details
When the `comma` option is set to `true` (not the default, but configurable in applications), qs allows parsing comma-separated strings as arrays (e.g., `?param=a,b,c` becomes `['a', 'b', 'c']`). However, the limit check for `arrayLimit` (default: 20) and the optional throwOnLimitExceeded occur after the comma-handling logic in `parseArrayValue`, enabling a bypass. This permits creation of arbitrarily large arrays from a single parameter, leading to excessive memory allocation.

**Vulnerable code** (lib/parse.js: lines ~40-50):
```js
if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    return val.split(',');
}

if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
    throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
}

return val;
```
The `split(',')` returns the array immediately, skipping the subsequent limit check. Downstream merging via `utils.combine` does not prevent allocation, even if it marks overflows for sparse arrays.This discrepancy allows attackers to send a single parameter with millions of commas (e.g., `?param=,,,,,,,,...`), allocating massive arrays in memory without triggering limits. It bypasses the intent of `arrayLimit`, which is enforced correctly for indexed (`a[0]=`) and bracket (`a[]=`) notations (the latter fixed in v6.14.1 per GHSA-6rw7-vpxm-498p).

### PoC
**Test 1 - Basic bypass:**
```
npm install qs
```

```js
const qs = require('qs');

const payload = 'a=' + ','.repeat(25);  // 26 elements after split (bypasses arrayLimit: 5)
const options = { comma: true, arrayLimit: 5, throwOnLimitExceeded: true };

try {
  const result = qs.parse(payload, options);
  console.log(result.a.length);  // Outputs: 26 (bypass successful)
} catch (e) {
  console.log('Limit enforced:', e.message);  // Not thrown
}
```
**Configuration:**
- `comma: true`
- `arrayLimit: 5`
- `throwOnLimitExceeded: true`

Expected: Throws "Array limit exceeded" error.
Actual: Parses successfully, creating an array of length 26.


### Impact
Denial of Service (DoS) via memory exhaustion.

### Suggested Fix
Move the `arrayLimit` check before the comma split in `parseArrayValue`, and enforce it on the resulting array length. Use `currentArrayLength` (already calculated upstream) for consistency with bracket notation fixes.

**Current code** (lib/parse.js: lines ~40-50):
```js
if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    return val.split(',');
}

if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
    throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
}

return val;
```

**Fixed code:**
```js
if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    const splitArray = val.split(',');
    if (splitArray.length > options.arrayLimit - currentArrayLength) {  // Check against remaining limit
        if (options.throwOnLimitExceeded) {
            throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
        } else {
            // Optionally convert to object or truncate, per README
            return splitArray.slice(0, options.arrayLimit - currentArrayLength);
        }
    }
    return splitArray;
}

if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
    throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
}

return val;
```
This aligns behavior with indexed and bracket notations, reuses `currentArrayLength`, and respects `throwOnLimitExceeded`. Update README to note the consistent enforcement.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/859)
