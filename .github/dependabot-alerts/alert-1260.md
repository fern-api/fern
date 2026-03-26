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

- **Package:** smol-toml (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 1.6.1
- **Patched version:** 1.6.1
- **CVE:** N/A
- **GHSA:** GHSA-v3rj-xjv7-4jmq
- **Manifest:** pnpm-lock.yaml

**Summary:**
smol-toml: Denial of Service via TOML documents containing thousands of consecutive commented lines

**Description:**
### Summary
An attacker can send a maliciously crafted TOML to cause the parser to crash, because of a stack overflow caused by thousands of consecutive commented lines.

The library uses recursion internally while parsing to skip over commented lines, which can be exploited to crash an application that is processing arbitrary TOML documents.

### Proof of concept
```js
require("smol-toml").parse('# comment\n'.repeat(8000) + 'key = "value"')
```

### Impact
Applications which parse arbitrary TOML documents may suffer availability issues if they receive malicious input. If uncaught, the crash may cause the application itself to crash. The impact is deemed minor, as the function is already likely to throw errors on invalid input. Downstream users are supposed to properly handle errors in such situations.

Due to the design of most JavaScript runtimes, the uncontrolled recursion does not lead to excessive memory usage and the execution is quickly aborted.

As a reminder, it is **strongly** advised when working with untrusted user input to expect errors to occur and to appropriately catch them.

### Patches
Version 1.6.1 uses a different approach for parsing comments, which no longer involves recursion.

### Workarounds
Wrap all invocations of `parse` and `stringify` in a try/catch block when dealing with untrusted user input.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1260)
