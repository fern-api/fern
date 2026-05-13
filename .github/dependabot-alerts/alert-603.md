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

- **Package:** cross-spawn (npm)
- **Severity:** HIGH
- **Vulnerable versions:** < 6.0.6
- **Patched version:** 6.0.6
- **CVE:** CVE-2024-21538
- **GHSA:** GHSA-3xgq-45jj-v275
- **Manifest:** pnpm-lock.yaml

**Summary:**
Regular Expression Denial of Service (ReDoS) in cross-spawn

**Description:**
Versions of the package cross-spawn before 7.0.5 are vulnerable to Regular Expression Denial of Service (ReDoS) due to improper input sanitization. An attacker can increase the CPU usage and crash the program by crafting a very large and well crafted string.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/603)
