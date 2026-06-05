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

- **Package:** aiohttp (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 3.14.0
- **Patched version:** 3.14.0
- **CVE:** CVE-2026-47265
- **GHSA:** GHSA-hg6j-4rv6-33pg
- **Manifest:** seed/python-sdk/basic-auth-pw-omitted/poetry.lock

**Summary:**
AIOHTTP is vulnerable to cross-origin redirect with per-request cookies

**Description:**
### Summary

Cookies set with the `cookies` parameter on requests are sent after following a cross-origin redirect.

### Impact

If a developer uses the `cookies` parameter on a per-request basis then sensitive data might be leaked to an attacker if they manage to control a redirect.

### Workaround

If unable to upgrade, using a `Cookie` header in the `headers` parameter is not vulnerable.

-----

Patch: https://github.com/aio-libs/aiohttp/commit/f54c40851b0d6c4bbdab97ba518a223adda32478

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2081)
