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
- **Scan Date:** 2026-02-27T13:26:42.450Z
- **Total Vulnerabilities:** 2
- **Critical:** 0
- **High:** 2
- **Medium:** 0
- **Low:** 0

## Vulnerabilities

### GHSA-7r86-cg39-jmmj (High)
- **Package:** minimatch @ 10.2.2 (npm)
- **Status:** fixed
- **Fix available: 10.2.3**
- **Source:** https://github.com/advisories/GHSA-7r86-cg39-jmmj

minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments

---

### GHSA-23c5-xmqv-rm74 (High)
- **Package:** minimatch @ 10.2.2 (npm)
- **Status:** fixed
- **Fix available: 10.2.3**
- **Source:** https://github.com/advisories/GHSA-23c5-xmqv-rm74

minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions

---

