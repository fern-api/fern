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

- **Package:** turbo (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** <= 2.9.13
- **Patched version:** 2.9.14
- **CVE:** CVE-2026-45773
- **GHSA:** GHSA-hcf7-66rw-9f5r
- **Manifest:** pnpm-lock.yaml

**Summary:**
Trubo: Login callback CSRF/session fixation

**Description:**
### Impact

Turborepo's self-hosted login and SSO browser flows did not validate a CSRF state value on the localhost callback. While the CLI was waiting for authentication, a malicious web page could send a request to the local callback server with an attacker-controlled token. If accepted before the legitimate callback, the CLI could complete login with the wrong credentials.

This affects users authenticating the `turbo` CLI against self-hosted remote cache/auth endpoints. Vercel-hosted login flows using device authorization are not affected.

### Fix

The login and SSO redirect flows now generate a random state value, include it in the browser authentication URL, and require the same value on the localhost callback before accepting a token. Callbacks with a missing or mismatched state are rejected.

### Workarounds

If you cannot upgrade immediately, avoid browser-based self-hosted `turbo login` or SSO flows on machines that may load untrusted web content during authentication. Use a pre-provisioned token or environment-based authentication instead.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2077)
