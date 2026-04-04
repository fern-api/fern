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

- **Package:** defu (npm)
- **Severity:** HIGH
- **Vulnerable versions:** <= 6.1.4
- **Patched version:** 6.1.5
- **CVE:** CVE-2026-35209
- **GHSA:** GHSA-737v-mqg7-c878
- **Manifest:** pnpm-lock.yaml

**Summary:**
defu: Prototype pollution via `__proto__` key in defaults argument

**Description:**
### Impact

Applications that pass unsanitized user input (e.g. parsed JSON request bodies, database records, or config files from untrusted sources) as the first argument to `defu()` are vulnerable to prototype pollution.

A crafted payload containing a `__proto__` key can override intended default values in the merged result:

```js
import { defu } from 'defu'

const userInput = JSON.parse('{"__proto__":{"isAdmin":true}}')
const config = defu(userInput, { isAdmin: false })

config.isAdmin // true — attacker overrides the server default
```

### Root Cause

The internal `_defu` function used `Object.assign({}, defaults)` to copy the defaults object. `Object.assign` invokes the `__proto__` setter, which replaces the resulting object's `[[Prototype]]` with attacker-controlled values. Properties inherited from the polluted prototype then bypass the existing `__proto__` key guard in the `for...in` loop and land in the final result.

### Fix

Replace `Object.assign({}, defaults)` with object spread (`{ ...defaults }`), which uses `[[DefineOwnProperty]]` and does not invoke the `__proto__` setter.

### Affected Versions

<= 6.1.4

### Credits

Reported by [@BlackHatExploitation](https://github.com/BlackHatExploitation)

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1408)
