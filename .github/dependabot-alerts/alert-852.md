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

- **Package:** @isaacs/brace-expansion (npm)
- **Severity:** CRITICAL
- **Vulnerable versions:** <= 5.0.0
- **Patched version:** 5.0.1
- **CVE:** N/A
- **GHSA:** GHSA-7h2j-956f-4vf2
- **Manifest:** pnpm-lock.yaml

**Summary:**
@isaacs/brace-expansion has Uncontrolled Resource Consumption

**Description:**
### Summary

`@isaacs/brace-expansion` is vulnerable to a Denial of Service (DoS) issue caused by unbounded brace range expansion. When an attacker provides a pattern containing repeated numeric brace ranges, the library attempts to eagerly generate every possible combination synchronously. Because the expansion grows exponentially, even a small input can consume excessive CPU and memory and may crash the Node.js process.

### Details

The vulnerability occurs because `@isaacs/brace-expansion` expands brace expressions without any upper bound or complexity limit. Expansion is performed eagerly and synchronously, meaning the full result set is generated before returning control to the caller.

For example, the following input:

```
{0..99}{0..99}{0..99}{0..99}{0..99}
```

produces:

```
100^5 = 10,000,000,000 combinations
```

This exponential growth can quickly overwhelm the event loop and heap memory, resulting in process termination.

### Proof of Concept

The following script reliably triggers the issue.

Create `poc.js`:

```js
const { expand } = require('@isaacs/brace-expansion');

const pattern = '{0..99}{0..99}{0..99}{0..99}{0..99}';

console.log('Starting expansion...');
expand(pattern);
```

Run it:

```bash
node poc.js
```

The process will freeze and typically crash with an error such as:

```
FATAL ERROR: JavaScript heap out of memory
```

### Impact

This is a denial of service vulnerability. Any application or downstream dependency that uses `@isaacs/brace-expansion` on untrusted input may be vulnerable to a single-request crash.

An attacker does not require authentication and can use a very small payload to:

* Trigger exponential computation
* Exhaust memory and CPU resources
* Block the event loop
* Crash Node.js services relying on this library

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/852)
