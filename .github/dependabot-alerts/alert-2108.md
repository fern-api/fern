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

- **Package:** undici (npm)
- **Severity:** LOW
- **Vulnerable versions:** < 6.27.0
- **Patched version:** 6.27.0
- **CVE:** CVE-2026-11525
- **GHSA:** GHSA-g8m3-5g58-fq7m
- **Manifest:** pnpm-lock.yaml

**Summary:**
undici vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching

**Description:**
## Impact

When undici parses a `Set-Cookie` header, it accepts any `SameSite` attribute value that contains `Strict`, `Lax`, or `None` as a substring, rather than the case-insensitive exact match specified by RFC 6265. Non-spec values are silently mapped to one of the three standard tokens:

- `SameSite=NoneOfYourBusiness` is parsed as `None`, the most permissive setting.
- `SameSite=StrictLax` is parsed as `Lax`, a downgrade from `Strict`.

Affected applications are those that consume `Set-Cookie` headers from server responses (for example via undici's `fetch` or proxy code paths) and then forward or rely on the parsed `sameSite` attribute. A malicious or non-compliant server can coerce the consumer's view of a cookie's SameSite policy to a weaker value, silently degrading the SameSite enforcement the cookie is supposed to provide.

This was introduced in undici 5.15.0 when the cookies feature was added.

## Patches

Upgrade to undici v6.27.0, v7.28.0 or v8.5.0.

## Workarounds

After parsing a `Set-Cookie` header, validate that the resulting `sameSite` attribute is one of `'Strict'`, `'Lax'`, or `'None'` (exact, case-insensitive) before forwarding or relying on it.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2108)
