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
- **Container:** typescript-sdk
- **Scan Date:** 2026-05-06T12:42:02.847Z
- **Total Vulnerabilities:** 9
- **Critical:** 0
- **High:** 5
- **Medium:** 4
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

### GHSA-c2c7-rcm5-vvqj (High)
- **Package:** picomatch @ 4.0.3 (npm)
- **Status:** fixed
- **Fix available: 4.0.4**
- **Source:** https://github.com/advisories/GHSA-c2c7-rcm5-vvqj

Picomatch has a ReDoS vulnerability via extglob quantifiers

---

### GHSA-9ppj-qmqm-q256 (High)
- **Package:** tar @ 7.5.9 (npm)
- **Status:** fixed
- **Fix available: 7.5.11**
- **Source:** https://github.com/advisories/GHSA-9ppj-qmqm-q256

node-tar Symlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-qffp-2rhf-9h96 (High)
- **Package:** tar @ 7.5.9 (npm)
- **Status:** fixed
- **Fix available: 7.5.10**
- **Source:** https://github.com/advisories/GHSA-qffp-2rhf-9h96

tar has Hardlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-3v7f-55p6-f55p (Medium)
- **Package:** picomatch @ 4.0.3 (npm)
- **Status:** fixed
- **Fix available: 4.0.4**
- **Source:** https://github.com/advisories/GHSA-3v7f-55p6-f55p

Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 2.0.2 (npm)
- **Status:** fixed
- **Fix available: 2.0.3**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 5.0.3 (npm)
- **Status:** fixed
- **Fix available: 5.0.5**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### GHSA-v2v4-37r5-5v8g (Medium)
- **Package:** ip-address @ 10.1.0 (npm)
- **Status:** fixed
- **Fix available: 10.1.1**
- **Source:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

ip-address has XSS in Address6 HTML-emitting methods

---

