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
- **Scan Date:** 2026-03-30T12:09:01.340Z
- **Total Vulnerabilities:** 2
- **Critical:** 0
- **High:** 1
- **Medium:** 1
- **Low:** 0

## Vulnerabilities

### GHSA-6fmv-xxpf-w3cw (High)
- **Package:** plexus-utils @ 3.5.1 (java-archive)
- **Status:** fixed
- **Fix available: 4.0.3**
- **Source:** https://github.com/advisories/GHSA-6fmv-xxpf-w3cw

Plexus-Utils has a Directory Traversal vulnerability in its extractFile method

---

### ALAS2023-2026-1486 (Medium)
- **Package:** freetype @ 2.13.2-5.amzn2023.0.1 (rpm)
- **Status:** fixed
- **Fix available: 2.13.2-5.amzn2023.0.2**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1486.html

An integer overflow in the tt_var_load_item_variation_store function of the Freetype library in versions 2.13.2 and 2.13.3 may allow for an out of bounds read operation when parsing HVAR/VVAR/MVAR tables in OpenType variable fonts. This issue is fixed in version 2.14.2. (CVE-2026-23865)

---

