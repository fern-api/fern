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
- **Scan Date:** 2026-03-27T12:19:51.836Z
- **Total Vulnerabilities:** 3
- **Critical:** 0
- **High:** 1
- **Medium:** 2
- **Low:** 0

## Vulnerabilities

### GHSA-c2c7-rcm5-vvqj (High)
- **Package:** picomatch @ 4.0.3 (npm)
- **Status:** fixed
- **Fix available: 4.0.4**
- **Source:** https://github.com/advisories/GHSA-c2c7-rcm5-vvqj

Picomatch has a ReDoS vulnerability via extglob quantifiers

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 5.0.4 (npm)
- **Status:** fixed
- **Fix available: 5.0.5**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### GHSA-3v7f-55p6-f55p (Medium)
- **Package:** picomatch @ 4.0.3 (npm)
- **Status:** fixed
- **Fix available: 4.0.4**
- **Source:** https://github.com/advisories/GHSA-3v7f-55p6-f55p

Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching

---

