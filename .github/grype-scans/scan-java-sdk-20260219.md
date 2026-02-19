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
- **Scan Date:** 2026-02-19T13:32:59.095Z
- **Total Vulnerabilities:** 2
- **Critical:** 0
- **High:** 2
- **Medium:** 0
- **Low:** 0

## Vulnerabilities

### GHSA-3ppc-4f35-3m26 (High)
- **Package:** minimatch @ 10.1.2 (npm)
- **Status:** fixed
- **Fix available: 10.2.1**
- **Source:** https://github.com/advisories/GHSA-3ppc-4f35-3m26

minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern

---

### GHSA-83g3-92jg-28cx (High)
- **Package:** tar @ 7.5.7 (npm)
- **Status:** fixed
- **Fix available: 7.5.8**
- **Source:** https://github.com/advisories/GHSA-83g3-92jg-28cx

Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction

---

