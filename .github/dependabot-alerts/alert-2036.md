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
- **Vulnerable versions:** <= 3.13.3
- **Patched version:** 3.13.4
- **CVE:** CVE-2026-34525
- **GHSA:** GHSA-c427-h43c-vf67
- **Manifest:** seed/python-sdk/exhaustive/pyproject_extras/poetry.lock

**Summary:**
AIOHTTP accepts duplicate Host headers

**Description:**
### Summary

Multiple Host headers were allowed in aiohttp.

### Impact

Mostly this doesn't affect aiohttp security itself, but if a reverse proxy is applying security rules depending on the target Host, it is theoretically possible that the proxy and aiohttp could process different host names, possibly resulting in bypassing a security check on the proxy and getting a request processed by aiohttp in a privileged sub app when using `Application.add_domain()`.

-----

Patch: https://github.com/aio-libs/aiohttp/commit/e00ca3cca92c465c7913c4beb763a72da9ed8349
Patch: https://github.com/aio-libs/aiohttp/commit/53e2e6fc58b89c6185be7820bd2c9f40216b3000

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2036)
