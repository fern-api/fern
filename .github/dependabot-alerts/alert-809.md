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
- **Severity:** HIGH
- **Vulnerable versions:** < 6.14.1
- **Patched version:** 6.14.1
- **CVE:** CVE-2025-15284
- **GHSA:** GHSA-6rw7-vpxm-498p
- **Manifest:** packages/cli/configuration/package.json

**Summary:**
qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion

**Description:**
### Summary

The `arrayLimit` option in qs does not enforce limits for bracket notation (`a[]=1&a[]=2`), allowing attackers to cause denial-of-service via memory exhaustion. Applications using `arrayLimit` for DoS protection are vulnerable.

### Details

The `arrayLimit` option only checks limits for indexed notation (`a[0]=1&a[1]=2`) but completely bypasses it for bracket notation (`a[]=1&a[]=2`).

**Vulnerable code** (`lib/parse.js:159-162`):
```javascript
if (root === '[]' && options.parseArrays) {
    obj = utils.combine([], leaf);  // No arrayLimit check
}
```

**Working code** (`lib/parse.js:175`):
```javascript
else if (index <= options.arrayLimit) {  // Limit checked here
    obj = [];
    obj[index] = leaf;
}
```

The bracket notation handler at line 159 uses `utils.combine([], leaf)` without validating against `options.arrayLimit`, while indexed notation at line 175 checks `index <= options.arrayLimit` before creating arrays.

### PoC

**Test 1 - Basic bypass:**
```bash
npm install qs
```

```javascript
const qs = require('qs');
const result = qs.parse('a[]=1&a[]=2&a[]=3&a[]=4&a[]=5&a[]=6', { arrayLimit: 5 });
console.log(result.a.length);  // Output: 6 (should be max 5)
```

**Test 2 - DoS demonstration:**
```javascript
const qs = require('qs');
const attack = 'a[]=' + Array(10000).fill('x').join('&a[]=');
const result = qs.parse(attack, { arrayLimit: 100 });
console.log(result.a.length);  // Output: 10000 (should be max 100)
```

**Configuration:**
- `arrayLimit: 5` (test 1) or `arrayLimit: 100` (test 2)
- Use bracket notation: `a[]=value` (not indexed `a[0]=value`)

### Impact

Denial of Service via memory exhaustion. Affects applications using `qs.parse()` with user-controlled input and `arrayLimit` for protection.

**Attack scenario:**
1. Attacker sends HTTP request: `GET /api/search?filters[]=x&filters[]=x&...&filters[]=x` (100,000+ times)
2. Application parses with `qs.parse(query, { arrayLimit: 100 })`
3. qs ignores limit, parses all 100,000 elements into array
4. Server memory exhausted → application crashes or becomes unresponsive
5. Service unavailable for all users

**Real-world impact:**
- Single malicious request can crash server
- No authentication required
- Easy to automate and scale
- Affects any endpoint parsing query strings with bracket notation

### Suggested Fix

Add `arrayLimit` validation to the bracket notation handler. The code already calculates `currentArrayLength` at line 147-151, but it's not used in the bracket notation handler at line 159.

**Current code** (`lib/parse.js:159-162`):
```javascript
if (root === '[]' && options.parseArrays) {
    obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
        ? []
        : utils.combine([], leaf);  // No arrayLimit check
}
```

**Fixed code**:
```javascript
if (root === '[]' && options.parseArrays) {
    // Use currentArrayLength already calculated at line 147-151
    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
    }
    
    // If limit exceeded and not throwing, convert to object (consistent with indexed notation behavior)
    if (currentArrayLength >= options.arrayLimit) {
        obj = options.plainObjects ? { __proto__: null } : {};
        obj[currentArrayLength] = leaf;
    } else {
        obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
            ? []
            : utils.combine([], leaf);
    }
}
```

This makes bracket notation behaviour consistent with indexed notation, enforcing `arrayLimit` and converting to object when limit is exceeded (per README documentation).

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/809)
