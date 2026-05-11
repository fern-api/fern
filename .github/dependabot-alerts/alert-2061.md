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

- **Package:** fast-uri (npm)
- **Severity:** HIGH
- **Vulnerable versions:** <= 3.1.1
- **Patched version:** 3.1.2
- **CVE:** CVE-2026-6322
- **GHSA:** GHSA-v39h-62p7-jpjc
- **Manifest:** pnpm-lock.yaml

**Summary:**
fast-uri vulnerable to host confusion via percent-encoded authority delimiters

**Description:**
### Impact

`fast-uri` v3.1.1 and earlier decodes percent-encoded authority delimiters (`%40` as `@`, `%3A` as `:`) inside the host component and serializes them back as raw characters. This changes the URI structure, turning a hostname into userinfo plus a different host.

For example, `http://trusted.com%40evil.com/` normalizes to `http://trusted.com@evil.com/`, which reparses as host `evil.com` with userinfo `trusted.com`.

Applications that normalize untrusted URLs before host allowlist checks, redirect validation, or outbound request routing can be steered to a different authority than the original URL appeared to contain.

### Patches

Upgrade to `fast-uri` >= 3.1.2.

### Workarounds

None. Upgrade to the patched version.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2061)
