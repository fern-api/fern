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

- **Package:** pytest (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 9.0.3
- **Patched version:** 9.0.3
- **CVE:** CVE-2025-71176
- **GHSA:** GHSA-6w46-j5rx-g56g
- **Manifest:** seed/python-sdk/validation/with-defaults-parameters/poetry.lock

**Summary:**
pytest has vulnerable tmpdir handling

**Description:**
pytest through 9.0.2 on UNIX relies on directories with the `/tmp/pytest-of-{user}` name pattern, which allows local users to cause a denial of service or possibly gain privileges.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2039)
