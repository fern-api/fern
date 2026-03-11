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

- **Package:** file-type (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 13.0.0, < 21.3.1
- **Patched version:** 21.3.1
- **CVE:** CVE-2026-31808
- **GHSA:** GHSA-5v7r-6r5c-r473
- **Manifest:** pnpm-lock.yaml

**Summary:**
file-type affected by infinite loop in ASF parser on malformed input with zero-size sub-header

**Description:**
### Impact
A denial of service vulnerability exists in the ASF (WMV/WMA) file type detection parser. When parsing a crafted input where an ASF sub-header has a `size` field of zero, the parser enters an infinite loop. The `payload` value becomes negative (-24), causing `tokenizer.ignore(payload)` to move the read position backwards, so the same sub-header is read repeatedly forever.

Any application that uses `file-type` to detect the type of untrusted/attacker-controlled input is affected. An attacker can stall the Node.js event loop with a 55-byte payload.

### Patches
Fixed in version 21.3.1. Users should upgrade to >= 21.3.1.

### Workarounds
Validate or limit the size of input buffers before passing them to `file-type`, or run file type detection in a worker thread with a timeout.

### References
- Fix commit: 319abf871b50ba2fa221b4a7050059f1ae096f4f

### Reporter

crnkovic@lokvica.com

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/872)
