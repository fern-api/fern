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

- **Package:** follow-redirects (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** <= 1.15.11
- **Patched version:** 1.16.0
- **CVE:** N/A
- **GHSA:** GHSA-r4q5-vmmm-2653
- **Manifest:** pnpm-lock.yaml

**Summary:**
follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets

**Description:**
## Summary

When an HTTP request follows a cross-domain redirect (301/302/307/308), `follow-redirects` only strips `authorization`, `proxy-authorization`, and `cookie` headers (matched by regex at index.js:469-476). Any custom authentication header (e.g., `X-API-Key`, `X-Auth-Token`, `Api-Key`, `Token`) is forwarded verbatim to the redirect target.

Since `follow-redirects` is the redirect-handling dependency for **axios** (105K+ stars), this vulnerability affects the entire axios ecosystem.

## Affected Code

`index.js`, lines 469-476:

```javascript
if (redirectUrl.protocol !== currentUrlParts.protocol &&
   redirectUrl.protocol !== "https:" ||
   redirectUrl.host !== currentHost &&
   !isSubdomain(redirectUrl.host, currentHost)) {
  removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
}
```

The regex only matches `authorization`, `proxy-authorization`, and `cookie`. Custom headers like `X-API-Key` are not matched.

## Attack Scenario

1. App uses axios with custom auth header: `headers: { 'X-API-Key': 'sk-live-secret123' }`
2. Server returns `302 Location: https://evil.com/steal`
3. follow-redirects sends `X-API-Key: sk-live-secret123` to `evil.com`
4. Attacker captures the API key

## Impact

Any custom auth header set via axios leaks on cross-domain redirect. Extremely common pattern. Affects all axios users in Node.js.

## Suggested Fix

Add a `sensitiveHeaders` option that users can extend, or strip ALL non-standard headers on cross-domain redirect.

## Disclosure

Source code review, manually verified. Found 2026-03-20.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1731)
