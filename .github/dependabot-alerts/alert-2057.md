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

- **Package:** simple-git (npm)
- **Severity:** HIGH
- **Vulnerable versions:** < 3.36.0
- **Patched version:** 3.36.0
- **CVE:** CVE-2026-6951
- **GHSA:** GHSA-hffm-xvc3-vprc
- **Manifest:** pnpm-lock.yaml

**Summary:**
simple-git is vulnerable to Remote Code Execution

**Description:**
Versions of the package simple-git before 3.36.0 are vulnerable to Remote Code Execution (RCE) due to an incomplete fix for [CVE-2022-25912](https://security.snyk.io/vuln/SNYK-JS-SIMPLEGIT-3112221) that blocks the -c option but not the equivalent --config form. If untrusted input can reach the options argument passed to simple-git, an attacker may still achieve remote code execution by enabling protocol.ext.allow=always and using an ext:: clone source.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2057)
