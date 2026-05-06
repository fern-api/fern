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
- **Container:** ruby-sdk
- **Scan Date:** 2026-05-06T12:42:22.215Z
- **Total Vulnerabilities:** 78
- **Critical:** 2
- **High:** 39
- **Medium:** 26
- **Low:** 11

## Vulnerabilities

### CVE-2025-15467 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-15467 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-69420 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-69420 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### GHSA-q339-8rmv-2mhv (High)
- **Package:** erb @ 4.0.3 (gem)
- **Status:** fixed
- **Fix available: 4.0.3.1**
- **Source:** https://github.com/advisories/GHSA-q339-8rmv-2mhv

ERB has an @_init deserialization guard bypass via def_module / def_method / def_class

---

### CVE-2025-69419 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-69419 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2026-28387 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28387 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28389 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2026-28389 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2025-9230 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-9230 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-69421 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-69421 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### GHSA-7r86-cg39-jmmj (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.7**
- **Source:** https://github.com/advisories/GHSA-7r86-cg39-jmmj

minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments

---

### GHSA-3ppc-4f35-3m26 (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.6**
- **Source:** https://github.com/advisories/GHSA-3ppc-4f35-3m26

minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern

---

### GHSA-23c5-xmqv-rm74 (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.7**
- **Source:** https://github.com/advisories/GHSA-23c5-xmqv-rm74

minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions

---

### GHSA-5j98-mcp5-4vw2 (High)
- **Package:** glob @ 10.4.5 (npm)
- **Status:** fixed
- **Fix available: 10.5.0**
- **Source:** https://github.com/advisories/GHSA-5j98-mcp5-4vw2

glob CLI: Command injection via -c/--cmd executes matches with shell:true

---

### GHSA-34x7-hfp2-rc4v (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.7**
- **Source:** https://github.com/advisories/GHSA-34x7-hfp2-rc4v

node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal

---

### GHSA-34x7-hfp2-rc4v (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.7**
- **Source:** https://github.com/advisories/GHSA-34x7-hfp2-rc4v

node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal

---

### CVE-2026-28388 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-28388 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-40200 (High)
- **Package:** musl-utils @ 1.2.5-r1 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r3**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-40200

No description available

---

### CVE-2026-31790 (High)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-31790 (High)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### GHSA-r6q2-hw4h-h46w (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.4**
- **Source:** https://github.com/advisories/GHSA-r6q2-hw4h-h46w

Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS

---

### GHSA-r6q2-hw4h-h46w (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.4**
- **Source:** https://github.com/advisories/GHSA-r6q2-hw4h-h46w

Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS

---

### GHSA-9ppj-qmqm-q256 (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.11**
- **Source:** https://github.com/advisories/GHSA-9ppj-qmqm-q256

node-tar Symlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-9ppj-qmqm-q256 (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.11**
- **Source:** https://github.com/advisories/GHSA-9ppj-qmqm-q256

node-tar Symlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-qffp-2rhf-9h96 (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.10**
- **Source:** https://github.com/advisories/GHSA-qffp-2rhf-9h96

tar has Hardlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-qffp-2rhf-9h96 (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.10**
- **Source:** https://github.com/advisories/GHSA-qffp-2rhf-9h96

tar has Hardlink Path Traversal via Drive-Relative Linkpath

---

### GHSA-83g3-92jg-28cx (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.8**
- **Source:** https://github.com/advisories/GHSA-83g3-92jg-28cx

Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction

---

### GHSA-83g3-92jg-28cx (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.8**
- **Source:** https://github.com/advisories/GHSA-83g3-92jg-28cx

Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction

---

### GHSA-8qq5-rm4j-mr97 (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.3**
- **Source:** https://github.com/advisories/GHSA-8qq5-rm4j-mr97

node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization

---

### GHSA-8qq5-rm4j-mr97 (High)
- **Package:** tar @ 7.4.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.3**
- **Source:** https://github.com/advisories/GHSA-8qq5-rm4j-mr97

node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization

---

### GHSA-vcgp-9326-pqcp (High)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.24**
- **Source:** https://github.com/advisories/GHSA-vcgp-9326-pqcp

net-imap vulnerable to STARTTLS stripping via invalid response timing

---

### GHSA-j3g3-5qv5-52mj (Medium)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.20**
- **Source:** https://github.com/advisories/GHSA-j3g3-5qv5-52mj

net-imap rubygem vulnerable to possible DoS by memory exhaustion

---

### CVE-2026-22796 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### GHSA-xh69-987w-hrp8 (Medium)
- **Package:** resolv @ 0.3.0 (gem)
- **Status:** fixed
- **Fix available: 0.3.1**
- **Source:** https://github.com/advisories/GHSA-xh69-987w-hrp8

resolv vulnerable to DoS via insufficient DNS domain name length validation

---

### CVE-2025-66199 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.3**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### CVE-2025-68160 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### GHSA-g857-hhfv-j68w (Medium)
- **Package:** zlib @ 3.1.1 (gem)
- **Status:** fixed
- **Fix available: 3.1.2**
- **Source:** https://github.com/advisories/GHSA-g857-hhfv-j68w

Buffer Overflow in Zlib::GzipReader ungetc via large input leads to memory corruption

---

### CVE-2026-6042 (Medium)
- **Package:** musl-utils @ 1.2.5-r1 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-6042

No description available

---

### CVE-2026-27171 (Medium)
- **Package:** zlib @ 1.3.1-r1 (apk)
- **Status:** fixed
- **Fix available: 1.3.2-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-27171

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### GHSA-v2v4-37r5-5v8g (Medium)
- **Package:** ip-address @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 10.1.1**
- **Source:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

ip-address has XSS in Address6 HTML-emitting methods

---

### GHSA-75xq-5h9v-w6px (Medium)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.24**
- **Source:** https://github.com/advisories/GHSA-75xq-5h9v-w6px

net-imap vulnerable to command Injection via unvalidated Symbol inputs

---

### GHSA-87pf-fpwv-p7m7 (Medium)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.24**
- **Source:** https://github.com/advisories/GHSA-87pf-fpwv-p7m7

net-imap vulnerable to denial of service via high iteration count for `SCRAM-*` authentication

---

### GHSA-hm49-wcqc-g2xg (Medium)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.24**
- **Source:** https://github.com/advisories/GHSA-hm49-wcqc-g2xg

net-imap vulnerable to command Injection via "raw" arguments to multiple commands

---

### CVE-2025-46394 (Low)
- **Package:** busybox @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### CVE-2025-46394 (Low)
- **Package:** busybox-binsh @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### CVE-2025-46394 (Low)
- **Package:** ssl_client @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### GHSA-v6h2-p8h4-qcjw (Low)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.2**
- **Source:** https://github.com/advisories/GHSA-v6h2-p8h4-qcjw

brace-expansion Regular Expression Denial of Service vulnerability

---

### CVE-2024-58251 (Low)
- **Package:** busybox @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### CVE-2024-58251 (Low)
- **Package:** busybox-binsh @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### CVE-2024-58251 (Low)
- **Package:** ssl_client @ 1.36.1-r29 (apk)
- **Status:** fixed
- **Fix available: 1.36.1-r31**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### GHSA-73rr-hh4g-fpgx (Low)
- **Package:** diff @ 5.2.0 (npm)
- **Status:** fixed
- **Fix available: 5.2.2**
- **Source:** https://github.com/advisories/GHSA-73rr-hh4g-fpgx

jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch

---

### GHSA-c2f4-jgmc-q2r5 (Low)
- **Package:** rexml @ 3.3.9 (gem)
- **Status:** fixed
- **Fix available: 3.4.2**
- **Source:** https://github.com/advisories/GHSA-c2f4-jgmc-q2r5

REXML has DoS condition when parsing malformed XML file

---

### GHSA-j4pr-3wm6-xx2r (Low)
- **Package:** uri @ 0.13.2 (gem)
- **Status:** fixed
- **Fix available: 0.13.3**
- **Source:** https://github.com/advisories/GHSA-j4pr-3wm6-xx2r

URI Credential Leakage Bypass over CVE-2025-27221

---

### GHSA-q2mw-fvj9-vvcw (Low)
- **Package:** net-imap @ 0.4.19 (gem)
- **Status:** fixed
- **Fix available: 0.4.24**
- **Source:** https://github.com/advisories/GHSA-q2mw-fvj9-vvcw

net-imap has quadratic complexity when reading response literals

---

### CVE-2026-31789 (Critical)
- **Package:** libcrypto3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** libssl3 @ 3.3.3-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

