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
- **Vulnerable versions:** <= 3.14.0
- **Patched version:** 3.14.1
- **CVE:** CVE-2026-54274
- **GHSA:** GHSA-xcgm-r5h9-7989
- **Manifest:** seed/python-sdk/basic-auth-pw-omitted/poetry.lock

**Summary:**
aiohttp: Incomplete websocket frame payloads bypass memory limits

**Description:**
### Summary

If an attacker sends large incomplete websocket frame payloads, it may be possible to bypass the usual size limits on memory use.

### Impact

If a web application has WebSocket endpoints, it may be possible for an attacker to execute a DoS attack through excessive memory use.

-----

Patch: https://github.com/aio-libs/aiohttp/commit/14b6ee851fb16ec199acb950de0c82d476799e7d

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2104)
