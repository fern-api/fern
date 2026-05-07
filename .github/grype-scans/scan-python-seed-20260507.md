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
- **Container:** python-seed
- **Scan Date:** 2026-05-07T11:53:59.324Z
- **Total Vulnerabilities:** 26
- **Critical:** 2
- **High:** 13
- **Medium:** 11
- **Low:** 0

## Vulnerabilities

### GHSA-mh2q-q3fh-2475 (High)
- **Package:** go.opentelemetry.io/otel @ v1.38.0 (go-module)
- **Status:** fixed
- **Fix available: 1.41.0**
- **Source:** https://github.com/advisories/GHSA-mh2q-q3fh-2475

OpenTelemetry-Go: multi-value `baggage` header extraction causes excessive allocations (remote dos amplification)

---

### GHSA-mh2q-q3fh-2475 (High)
- **Package:** go.opentelemetry.io/otel @ v1.40.0 (go-module)
- **Status:** fixed
- **Fix available: 1.41.0**
- **Source:** https://github.com/advisories/GHSA-mh2q-q3fh-2475

OpenTelemetry-Go: multi-value `baggage` header extraction causes excessive allocations (remote dos amplification)

---

### GHSA-78h2-9frx-2jm8 (High)
- **Package:** github.com/go-jose/go-jose/v4 @ v4.1.3 (go-module)
- **Status:** fixed
- **Fix available: 4.1.4**
- **Source:** https://github.com/advisories/GHSA-78h2-9frx-2jm8

Go JOSE Panics in JWE decryption

---

### GHSA-pc3f-x583-g7j2 (High)
- **Package:** github.com/moby/spdystream @ v0.5.0 (go-module)
- **Status:** fixed
- **Fix available: 0.5.1**
- **Source:** https://github.com/advisories/GHSA-pc3f-x583-g7j2

SpdyStream: DOS on CRI

---

### CVE-2026-32281 (High)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32281

Validating certificate chains which use policies is unexpectedly inefficient when certificates in the chain contain a very large number of policy mappings, possibly causing denial of service. This only affects validation of otherwise trusted certificate chains, issued by a root CA in the VerifyOptions.Roots CertPool, or in the system certificate pool.

---

### CVE-2026-32280 (High)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32280

During chain building, the amount of work that is done is not correctly limited when a large number of intermediate certificates are passed in VerifyOptions.Intermediates, which can lead to a denial of service. This affects both direct users of crypto/x509 and users of crypto/tls.

---

### CVE-2026-32283 (High)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32283

If one side of the TLS connection sends multiple key update messages post-handshake in a single record, the connection can deadlock, causing uncontrolled consumption of resources. This can lead to a denial of service. This only affects TLS 1.3.

---

### CVE-2026-27140 (High)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27140

SWIG file names containing 'cgo' and well-crafted payloads could lead to code smuggling and arbitrary code execution at build time due to trust layer bypass.

---

### GHSA-9h8m-3fm2-qjrq (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.38.0 (go-module)
- **Status:** fixed
- **Fix available: 1.40.0**
- **Source:** https://github.com/advisories/GHSA-9h8m-3fm2-qjrq

OpenTelemetry Go SDK Vulnerable to Arbitrary Code Execution via PATH Hijacking

---

### GHSA-hfvc-g4fc-pqhx (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.38.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-hfvc-g4fc-pqhx

opentelemetry-go: BSD kenv command not using absolute path enables PATH hijacking

---

### GHSA-hfvc-g4fc-pqhx (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.40.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-hfvc-g4fc-pqhx

opentelemetry-go: BSD kenv command not using absolute path enables PATH hijacking

---

### GHSA-hfvc-g4fc-pqhx (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.42.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-hfvc-g4fc-pqhx

opentelemetry-go: BSD kenv command not using absolute path enables PATH hijacking

---

### CVE-2026-27144 (High)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27144

The compiler is meant to unwrap pointers which are the operands of a memory move; a no-op interface conversion prevented the compiler from making the correct determination about non-overlapping moves, potentially leading to memory corruption at runtime.

---

### GHSA-vvgc-356p-c3xw (Medium)
- **Package:** golang.org/x/net @ v0.35.0 (go-module)
- **Status:** fixed
- **Fix available: 0.38.0**
- **Source:** https://github.com/advisories/GHSA-vvgc-356p-c3xw

golang.org/x/net vulnerable to Cross-site Scripting

---

### GHSA-qxp5-gwg8-xv66 (Medium)
- **Package:** golang.org/x/net @ v0.35.0 (go-module)
- **Status:** fixed
- **Fix available: 0.36.0**
- **Source:** https://github.com/advisories/GHSA-qxp5-gwg8-xv66

HTTP Proxy bypass using IPv6 Zone IDs in golang.org/x/net

---

### CVE-2026-32289 (Medium)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32289

Context was not properly tracked across template branches for JS template literals, leading to possibly incorrect escaping of content when branches were used. Additionally template actions within JS template literals did not properly track the brace depth, leading to incorrect escaping being applied. These issues could cause actions within JS template literals to be incorrectly or improperly escaped, leading to XSS vulnerabilities.

---

### CVE-2026-32282 (Medium)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32282

On Linux, if the target of Root.Chmod is replaced with a symlink while the chmod operation is in progress, Chmod can operate on the target of the symlink, even when the target lies outside the root. The Linux fchmodat syscall silently ignores the AT_SYMLINK_NOFOLLOW flag, which Root.Chmod uses to avoid symlink traversal. Root.Chmod checks its target before acting and returns an error if the target is a symlink lying outside the root, so the impact is limited to cases where the target is replaced with a symlink between the check and operation.

---

### GHSA-xm5m-wgh2-rrg3 (Medium)
- **Package:** github.com/sigstore/timestamp-authority/v2 @ v2.0.3 (go-module)
- **Status:** fixed
- **Fix available: 2.0.6**
- **Source:** https://github.com/advisories/GHSA-xm5m-wgh2-rrg3

Sigstore Timestamp Authority has Improper Certificate Validation in verifier

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp @ v1.40.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-w8rr-5gcm-pp58

opentelemetry-go: OTLP HTTP exporters read unbounded HTTP response bodies

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp @ v1.42.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-w8rr-5gcm-pp58

opentelemetry-go: OTLP HTTP exporters read unbounded HTTP response bodies

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp @ v1.35.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-w8rr-5gcm-pp58

opentelemetry-go: OTLP HTTP exporters read unbounded HTTP response bodies

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp @ v1.40.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-w8rr-5gcm-pp58

opentelemetry-go: OTLP HTTP exporters read unbounded HTTP response bodies

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp @ v1.42.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-w8rr-5gcm-pp58

opentelemetry-go: OTLP HTTP exporters read unbounded HTTP response bodies

---

### CVE-2026-32288 (Medium)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32288

tar.Reader can allocate an unbounded amount of memory when reading a maliciously-crafted archive containing a large number of sparse regions encoded in the "old GNU sparse map" format.

---

### GHSA-p77j-4mvh-x3m3 (Critical)
- **Package:** google.golang.org/grpc @ v1.78.0 (go-module)
- **Status:** fixed
- **Fix available: 1.79.3**
- **Source:** https://github.com/advisories/GHSA-p77j-4mvh-x3m3

gRPC-Go has an authorization bypass via missing leading slash in :path

---

### CVE-2026-27143 (Critical)
- **Package:** stdlib @ go1.25.8 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27143

Arithmetic over induction variables in loops were not correctly checked for underflow or overflow. As a result, the compiler would allow for invalid indexing to occur at runtime, potentially leading to memory corruption.

---

