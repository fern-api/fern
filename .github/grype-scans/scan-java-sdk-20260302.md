@devin-ai-integration Please remediate the container vulnerabilities found by today's grype scan of the container specified in the summary below.

**Instructions:**
1. Analyze each vulnerability and understand its impact
2. For OS-level vulnerabilities, consider updating the base image or specific packages
3. For Python dependencies, update the affected packages in pyproject.toml/poetry.lock. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
4. Run tests to ensure the updates don't break anything
5. Build the container locally and re-scan to confirm your changes actually address the CVEs.
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/grype-scans/scan-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Vulnerability Details:**


## Summary
- **Container:** java-sdk
- **Scan Date:** 2026-03-02T12:55:59.223Z
- **Total Vulnerabilities:** 2
- **Critical:** 0
- **High:** 2
- **Medium:** 0
- **Low:** 0

## Vulnerabilities

### GHSA-72hv-8253-57qq (High)
- **Package:** jackson-core @ 2.16.1 (java-archive)
- **Status:** fixed
- **Fix available: 2.18.6**
- **Source:** https://github.com/advisories/GHSA-72hv-8253-57qq

jackson-core: Number Length Constraint Bypass in Async Parser Leads to Potential DoS Condition

---

### GHSA-72hv-8253-57qq (High)
- **Package:** jackson-core @ 2.18.2 (java-archive)
- **Status:** fixed
- **Fix available: 2.18.6**
- **Source:** https://github.com/advisories/GHSA-72hv-8253-57qq

jackson-core: Number Length Constraint Bypass in Async Parser Leads to Potential DoS Condition

---

