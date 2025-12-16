@devin-ai-integration Please remediate the container vulnerabilities found by today's grype scan of the container specified in the summary below.

**Instructions:**
1. Analyze each vulnerability and understand its impact
2. For OS-level vulnerabilities, consider updating the base image or specific packages
3. For Python dependencies, update the affected packages in pyproject.toml/poetry.lock
4. Run tests to ensure the updates don't break anything
5. Build the container locally and re-scan to confirm your changes actually address the CVEs.
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/grype-scans/scan-*.md) as part of your fix

**Vulnerability Details:**


## Summary
- **Container:** java-sdk
- **Scan Date:** 2025-12-16T14:38:56.200Z
- **Total Vulnerabilities:** 4
- **Critical:** 0
- **High:** 0
- **Medium:** 4
- **Low:** 0

## Vulnerabilities

### CVE-2025-64720 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64720

No description available

---

### CVE-2025-65018 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-65018

No description available

---

### CVE-2025-64505 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64505

No description available

---

### CVE-2025-64506 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64506

No description available

---

