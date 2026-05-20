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

- **Package:** idna (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 3.15
- **Patched version:** 3.15
- **CVE:** CVE-2026-45409
- **GHSA:** GHSA-65pc-fj4g-8rjx
- **Manifest:** seed/python-sdk/basic-auth-pw-omitted/poetry.lock

**Summary:**
Internationalized Domain Names in Applications (IDNA): Specially crafted inputs to idna.encode() can bypass CVE-2024-3651 fix

**Description:**
This is the same issue as CVE-2024-3651, however the original remediation in 2024 was not a complete fix. Payloads such as `"\u0660" * N` or `"\u30fb" * N + "\u6f22"` utilize the `valid_contexto` function prior to length rejection, and for high values of `N` will take a long time to process.

### Impact
A specially crafted argument to the `idna.encode()` function could consume significant resources. This may lead to a denial-of-service.

### Patches
Starting in version 3.14, the function rejects long inputs as soon as practicable prior to any further processing to minimize resource consumption. In version 3.15, this approach was extended to lesser used alternate functions (i.e. per-label conversions and codec support).

### Workarounds
Domain names cannot exceed 253 characters in length, if this length limit is enforced prior to passing the domain to the `idna.encode()` function it should no longer consume significant resources. This is triggered by arbitrarily large inputs that would not occur in normal usage, but may be passed to the library assuming there is no preliminary input validation by the higher-level application.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2074)
