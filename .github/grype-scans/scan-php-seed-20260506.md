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
- **Container:** php-seed
- **Scan Date:** 2026-05-06T12:40:39.772Z
- **Total Vulnerabilities:** 150
- **Critical:** 8
- **High:** 64
- **Medium:** 64
- **Low:** 14

## Vulnerabilities

### CVE-2025-15467 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-15467 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-15467 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-69420 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-69420 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-69420 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### GHSA-4c29-8rgm-jvjj (High)
- **Package:** github.com/moby/buildkit @ v0.24.0 (go-module)
- **Status:** fixed
- **Fix available: 0.28.1**
- **Source:** https://github.com/advisories/GHSA-4c29-8rgm-jvjj

BuildKit's Malicious frontend can cause file escape outside of storage root

---

### CVE-2025-69419 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-69419 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-69419 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### GHSA-mh2q-q3fh-2475 (High)
- **Package:** go.opentelemetry.io/otel @ v1.36.0 (go-module)
- **Status:** fixed
- **Fix available: 1.41.0**
- **Source:** https://github.com/advisories/GHSA-mh2q-q3fh-2475

OpenTelemetry-Go: multi-value `baggage` header extraction causes excessive allocations (remote dos amplification)

---

### CVE-2026-25679 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.8, 1.26.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-25679

url.Parse insufficiently validated the host/authority component and accepted some invalid URLs.

---

### CVE-2025-9086 (High)
- **Package:** libcurl @ 8.14.1-r1 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9086

No description available

---

### CVE-2026-28387 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28387 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28387 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28389 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2026-28389 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2026-28389 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2025-61725 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61725

The ParseAddress function constructs domain-literal address components through repeated string concatenation. When parsing large domain-literal components, this can cause excessive CPU consumption.

---

### CVE-2025-9230 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-9230 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-9230 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-61723 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61723

The processing time for parsing some invalid inputs scales non-linearly with respect to the size of the input. This affects programs which parse untrusted PEM inputs.

---

### CVE-2025-69421 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-69421 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-69421 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-61726 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.12, 1.25.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61726

The net/url package does not set a limit on the number of query parameters in a query. While the maximum size of query parameters in URLs is generally limited by the maximum request header size, the net/http.Request.ParseForm method can parse large URL-encoded forms. Parsing a large form containing many unique query parameters can cause excessive memory consumption.

---

### GHSA-4vrq-3vrq-g6gg (High)
- **Package:** github.com/moby/buildkit @ v0.24.0 (go-module)
- **Status:** fixed
- **Fix available: 0.28.1**
- **Source:** https://github.com/advisories/GHSA-4vrq-3vrq-g6gg

BuildKit Git URL subdir component can cause access to restricted files

---

### CVE-2026-27135 (High)
- **Package:** nghttp2-libs @ 1.65.0-r0 (apk)
- **Status:** fixed
- **Fix available: 1.68.1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-27135

No description available

---

### CVE-2026-28388 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-28388 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-28388 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### GHSA-pc3f-x583-g7j2 (High)
- **Package:** github.com/moby/spdystream @ v0.5.0 (go-module)
- **Status:** fixed
- **Fix available: 0.5.1**
- **Source:** https://github.com/advisories/GHSA-pc3f-x583-g7j2

SpdyStream: DOS on CRI

---

### GHSA-p436-gjf2-799p (High)
- **Package:** github.com/docker/cli @ v28.3.3+incompatible (go-module)
- **Status:** fixed
- **Fix available: 29.2.0**
- **Source:** https://github.com/advisories/GHSA-p436-gjf2-799p

Docker CLI Plugins: Uncontrolled Search Path Element Leads to Local Privilege Escalation on Windows

---

### GHSA-p436-gjf2-799p (High)
- **Package:** github.com/docker/cli @ v28.4.0+incompatible (go-module)
- **Status:** fixed
- **Fix available: 29.2.0**
- **Source:** https://github.com/advisories/GHSA-p436-gjf2-799p

Docker CLI Plugins: Uncontrolled Search Path Element Leads to Local Privilege Escalation on Windows

---

### CVE-2026-40200 (High)
- **Package:** musl @ 1.2.5-r10 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r12**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-40200

No description available

---

### CVE-2026-40200 (High)
- **Package:** musl-utils @ 1.2.5-r10 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r12**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-40200

No description available

---

### CVE-2025-58187 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.9, 1.25.3**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58187

Due to the design of the name constraint checking algorithm, the processing time of some inputs scale non-linearly with respect to the size of the certificate. This affects programs which validate arbitrary certificate chains.

---

### CVE-2026-32281 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32281

Validating certificate chains which use policies is unexpectedly inefficient when certificates in the chain contain a very large number of policy mappings, possibly causing denial of service. This only affects validation of otherwise trusted certificate chains, issued by a root CA in the VerifyOptions.Roots CertPool, or in the system certificate pool.

---

### CVE-2026-32280 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32280

During chain building, the amount of work that is done is not correctly limited when a large number of intermediate certificates are passed in VerifyOptions.Intermediates, which can lead to a denial of service. This affects both direct users of crypto/x509 and users of crypto/tls.

---

### CVE-2026-2673 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-2673

No description available

---

### CVE-2026-2673 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-2673

No description available

---

### CVE-2026-2673 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-2673

No description available

---

### CVE-2026-32283 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32283

If one side of the TLS connection sends multiple key update messages post-handshake in a single record, the connection can deadlock, causing uncontrolled consumption of resources. This can lead to a denial of service. This only affects TLS 1.3.

---

### CVE-2026-31790 (High)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-31790 (High)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-31790 (High)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-27140 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27140

SWIG file names containing 'cgo' and well-crafted payloads could lead to code smuggling and arbitrary code execution at build time due to trust layer bypass.

---

### GHSA-cgrx-mc8f-2prm (High)
- **Package:** github.com/opencontainers/selinux @ v1.12.0 (go-module)
- **Status:** fixed
- **Fix available: 1.13.0**
- **Source:** https://github.com/advisories/GHSA-cgrx-mc8f-2prm

runc container escape and denial of service due to arbitrary write gadgets and procfs write redirects

---

### GHSA-9h8m-3fm2-qjrq (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.35.0 (go-module)
- **Status:** fixed
- **Fix available: 1.40.0**
- **Source:** https://github.com/advisories/GHSA-9h8m-3fm2-qjrq

OpenTelemetry Go SDK Vulnerable to Arbitrary Code Execution via PATH Hijacking

---

### GHSA-9h8m-3fm2-qjrq (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.36.0 (go-module)
- **Status:** fixed
- **Fix available: 1.40.0**
- **Source:** https://github.com/advisories/GHSA-9h8m-3fm2-qjrq

OpenTelemetry Go SDK Vulnerable to Arbitrary Code Execution via PATH Hijacking

---

### CVE-2025-61729 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.11, 1.25.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61729

Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out. Furthermore, the error string is constructed by repeated string concatenation, leading to quadratic runtime. Therefore, a certificate provided by a malicious actor can result in excessive resource consumption.

---

### CVE-2025-61731 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.12, 1.25.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61731

Building a malicious file with cmd/go can cause can cause a write to an attacker-controlled file with partial control of the file content. The "#cgo pkg-config:" directive in a Go source file provides command-line arguments to provide to the Go pkg-config command. An attacker can provide a "--log-file" argument to this directive, causing pkg-config to write to an attacker-controlled location.

---

### CVE-2025-58188 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58188

Validating certificate chains which contain DSA public keys can cause programs to panic, due to a interface cast that assumes they implement the Equal method. This affects programs which validate arbitrary certificate chains.

---

### GHSA-hfvc-g4fc-pqhx (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.35.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-hfvc-g4fc-pqhx

opentelemetry-go: BSD kenv command not using absolute path enables PATH hijacking

---

### GHSA-hfvc-g4fc-pqhx (High)
- **Package:** go.opentelemetry.io/otel/sdk @ v1.36.0 (go-module)
- **Status:** fixed
- **Fix available: 1.43.0**
- **Source:** https://github.com/advisories/GHSA-hfvc-g4fc-pqhx

opentelemetry-go: BSD kenv command not using absolute path enables PATH hijacking

---

### CVE-2025-61732 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.13, 1.25.7**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61732

A discrepancy between how Go and C/C++ comments were parsed allowed for code smuggling into the resulting cgo binary.

---

### CVE-2026-25210 (High)
- **Package:** libexpat @ 2.7.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-25210

No description available

---

### CVE-2026-27144 (High)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27144

The compiler is meant to unwrap pointers which are the operands of a memory move; a no-op interface conversion prevented the compiler from making the correct determination about non-overlapping moves, potentially leading to memory corruption at runtime.

---

### GHSA-pwhc-rpq9-4c8w (High)
- **Package:** github.com/containerd/containerd/v2 @ v2.1.4 (go-module)
- **Status:** fixed
- **Fix available: 2.1.5**
- **Source:** https://github.com/advisories/GHSA-pwhc-rpq9-4c8w

containerd affected by a local privilege escalation via wide permissions on CRI directory

---

### CVE-2026-22796 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2025-10148 (Medium)
- **Package:** libcurl @ 8.14.1-r1 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-10148

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2026-34743 (Medium)
- **Package:** xz @ 5.8.1-r0 (apk)
- **Status:** fixed
- **Fix available: 5.8.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-34743

No description available

---

### CVE-2026-34743 (Medium)
- **Package:** xz-libs @ 5.8.1-r0 (apk)
- **Status:** fixed
- **Fix available: 5.8.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-34743

No description available

---

### GHSA-j5w8-q4qc-rx2x (Medium)
- **Package:** golang.org/x/crypto @ v0.37.0 (go-module)
- **Status:** fixed
- **Fix available: 0.45.0**
- **Source:** https://github.com/advisories/GHSA-j5w8-q4qc-rx2x

golang.org/x/crypto/ssh allows an attacker to cause unbounded memory consumption

---

### GHSA-j5w8-q4qc-rx2x (Medium)
- **Package:** golang.org/x/crypto @ v0.38.0 (go-module)
- **Status:** fixed
- **Fix available: 0.45.0**
- **Source:** https://github.com/advisories/GHSA-j5w8-q4qc-rx2x

golang.org/x/crypto/ssh allows an attacker to cause unbounded memory consumption

---

### CVE-2025-9232 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-58186 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58186

Despite HTTP headers having a default limit of 1MB, the number of cookies that can be parsed does not have a limit. By sending a lot of very small cookies such as "a=;", an attacker can make an HTTP server allocate a large amount of structs, causing large memory consumption.

---

### CVE-2025-58185 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58185

Parsing a maliciously crafted DER payload could allocate large amounts of memory, causing memory exhaustion.

---

### CVE-2025-62408 (Medium)
- **Package:** c-ares @ 1.34.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.34.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-62408

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-47912 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-47912

The Parse function permits values other than IPv6 addresses to be included in square brackets within the host component of a URL. RFC 3986 permits IPv6 addresses to be included within the host component, enclosed within square brackets. For example: "http://[::1]/". IPv4 addresses and hostnames must not appear within square brackets. Parse did not enforce this requirement.

---

### CVE-2026-22795 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### GHSA-jv3w-x3r3-g6rm (Medium)
- **Package:** github.com/containernetworking/plugins @ v1.7.1 (go-module)
- **Status:** fixed
- **Fix available: 1.9.0**
- **Source:** https://github.com/advisories/GHSA-jv3w-x3r3-g6rm

CNA Plugins Portmap nftables backend can intercept non-local traffic

---

### CVE-2025-61728 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.12, 1.25.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61728

archive/zip uses a super-linear file name indexing algorithm that is invoked the first time a file in an archive is opened. This can lead to a denial of service when consuming a maliciously constructed ZIP archive.

---

### CVE-2025-61724 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61724

The Reader.ReadResponse function constructs a response string through repeated string concatenation of lines. When the number of lines in a response is large, this can cause excessive CPU consumption.

---

### CVE-2025-58189 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58189

When Conn.Handshake fails during ALPN negotiation the error contains attacker controlled information (the ALPN protocols sent by the client) which is not escaped.

---

### CVE-2025-58183 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.8, 1.25.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-58183

tar.Reader does not set a maximum size on the number of sparse region data blocks in GNU tar pax 1.0 sparse files. A maliciously-crafted archive containing a large number of sparse regions can cause a Reader to read an unbounded amount of data from the archive into memory. When reading from a compressed source, a small compressed input can result in large allocations.

---

### GHSA-f6x5-jh6r-wrfv (Medium)
- **Package:** golang.org/x/crypto @ v0.37.0 (go-module)
- **Status:** fixed
- **Fix available: 0.45.0**
- **Source:** https://github.com/advisories/GHSA-f6x5-jh6r-wrfv

golang.org/x/crypto/ssh/agent vulnerable to panic if message is malformed due to out of bounds read

---

### GHSA-f6x5-jh6r-wrfv (Medium)
- **Package:** golang.org/x/crypto @ v0.38.0 (go-module)
- **Status:** fixed
- **Fix available: 0.45.0**
- **Source:** https://github.com/advisories/GHSA-f6x5-jh6r-wrfv

golang.org/x/crypto/ssh/agent vulnerable to panic if message is malformed due to out of bounds read

---

### CVE-2026-6042 (Medium)
- **Package:** musl @ 1.2.5-r10 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r11**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-6042

No description available

---

### CVE-2026-6042 (Medium)
- **Package:** musl-utils @ 1.2.5-r10 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r11**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-6042

No description available

---

### CVE-2026-27142 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.8, 1.26.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27142

Actions which insert URLs into the content attribute of HTML meta tags are not escaped. This can allow XSS if the meta tag also has an http-equiv attribute with the value "refresh". A new GODEBUG setting has been added, htmlmetacontenturlescape, which can be used to disable escaping URLs in actions in the meta content attribute which follow "url=" by setting htmlmetacontenturlescape=0.

---

### CVE-2026-32289 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32289

Context was not properly tracked across template branches for JS template literals, leading to possibly incorrect escaping of content when branches were used. Additionally template actions within JS template literals did not properly track the brace depth, leading to incorrect escaping being applied. These issues could cause actions within JS template literals to be incorrectly or improperly escaped, leading to XSS vulnerabilities.

---

### CVE-2026-27171 (Medium)
- **Package:** zlib @ 1.3.1-r2 (apk)
- **Status:** fixed
- **Fix available: 1.3.2-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-27171

No description available

---

### GHSA-2464-8j7c-4cjm (Medium)
- **Package:** github.com/go-viper/mapstructure/v2 @ v2.3.0 (go-module)
- **Status:** fixed
- **Fix available: 2.4.0**
- **Source:** https://github.com/advisories/GHSA-2464-8j7c-4cjm

go-viper's mapstructure May Leak Sensitive Information in Logs When Processing Malformed Data

---

### CVE-2025-61730 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.12, 1.25.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61730

During the TLS 1.3 handshake if multiple messages are sent in records that span encryption level boundaries (for instance the Client Hello and Encrypted Extensions messages), the subsequent messages may be processed before the encryption level changes. This can cause some minor information disclosure if a network-local attacker can inject messages during the handshake.

---

### CVE-2026-32282 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32282

On Linux, if the target of Root.Chmod is replaced with a symlink while the chmod operation is in progress, Chmod can operate on the target of the symlink, even when the target lies outside the root. The Linux fchmodat syscall silently ignores the AT_SYMLINK_NOFOLLOW flag, which Root.Chmod uses to avoid symlink traversal. Root.Chmod checks its target before acting and returns an error if the target is a symlink lying outside the root, so the impact is limited to cases where the target is replaced with a symlink between the check and operation.

---

### CVE-2025-11187 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-11187

No description available

---

### CVE-2025-11187 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-11187

No description available

---

### CVE-2025-11187 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-11187

No description available

---

### GHSA-w8rr-5gcm-pp58 (Medium)
- **Package:** go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp @ v1.35.0 (go-module)
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

### CVE-2025-69418 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### GHSA-m6hq-p25p-ffr2 (Medium)
- **Package:** github.com/containerd/containerd/v2 @ v2.1.4 (go-module)
- **Status:** fixed
- **Fix available: 2.1.5**
- **Source:** https://github.com/advisories/GHSA-m6hq-p25p-ffr2

containerd CRI server: Host memory exhaustion through Attach goroutine leak

---

### CVE-2025-61727 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.11, 1.25.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-61727

An excluded subdomain constraint in a certificate chain does not restrict the usage of wildcard SANs in the leaf certificate. For example a constraint that excludes the subdomain test.example.com does not prevent a leaf certificate from claiming the SAN *.example.com.

---

### CVE-2025-15469 (Medium)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15469

No description available

---

### CVE-2025-15469 (Medium)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15469

No description available

---

### CVE-2025-15469 (Medium)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15469

No description available

---

### CVE-2026-32776 (Medium)
- **Package:** libexpat @ 2.7.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32776

No description available

---

### CVE-2026-32778 (Medium)
- **Package:** libexpat @ 2.7.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32778

No description available

---

### CVE-2026-32777 (Medium)
- **Package:** libexpat @ 2.7.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32777

No description available

---

### CVE-2026-32288 (Medium)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-32288

tar.Reader can allocate an unbounded amount of memory when reading a maliciously-crafted archive containing a large number of sparse regions encoded in the "old GNU sparse map" format.

---

### GHSA-xmrv-pmrh-hhx2 (Medium)
- **Package:** github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream @ v1.6.3 (go-module)
- **Status:** fixed
- **Fix available: 1.7.8**
- **Source:** https://github.com/advisories/GHSA-xmrv-pmrh-hhx2

Denial of Service due to Panic in AWS SDK for Go v2 SDK EventStream Decoder

---

### GHSA-xmrv-pmrh-hhx2 (Medium)
- **Package:** github.com/aws/aws-sdk-go-v2/service/cloudwatchlogs @ v1.32.0 (go-module)
- **Status:** fixed
- **Fix available: 1.65.0**
- **Source:** https://github.com/advisories/GHSA-xmrv-pmrh-hhx2

Denial of Service due to Panic in AWS SDK for Go v2 SDK EventStream Decoder

---

### CVE-2025-46394 (Low)
- **Package:** busybox @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### CVE-2025-46394 (Low)
- **Package:** busybox-binsh @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### CVE-2025-46394 (Low)
- **Package:** ssl_client @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46394

No description available

---

### CVE-2024-58251 (Low)
- **Package:** busybox @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### CVE-2024-58251 (Low)
- **Package:** busybox-binsh @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### CVE-2024-58251 (Low)
- **Package:** ssl_client @ 1.37.0-r18 (apk)
- **Status:** fixed
- **Fix available: 1.37.0-r20**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-58251

No description available

---

### CVE-2025-61985 (Low)
- **Package:** openssh-client-common @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61985

No description available

---

### CVE-2025-61985 (Low)
- **Package:** openssh-client-default @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61985

No description available

---

### CVE-2025-61985 (Low)
- **Package:** openssh-keygen @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61985

No description available

---

### CVE-2025-61984 (Low)
- **Package:** openssh-client-common @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61984

No description available

---

### CVE-2025-61984 (Low)
- **Package:** openssh-client-default @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61984

No description available

---

### CVE-2025-61984 (Low)
- **Package:** openssh-keygen @ 10.0_p1-r9 (apk)
- **Status:** fixed
- **Fix available: 10.0_p1-r10**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-61984

No description available

---

### CVE-2026-27139 (Low)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.8, 1.26.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27139

On Unix platforms, when listing the contents of a directory using File.ReadDir or File.Readdir the returned FileInfo could reference a file outside of the Root in which the File was opened. The impact of this escape is limited to reading metadata provided by lstat from arbitrary locations on the filesystem without permitting reading or writing files outside the root.

---

### CVE-2026-24515 (Low)
- **Package:** libexpat @ 2.7.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-24515

No description available

---

### CVE-2025-58050 (Critical)
- **Package:** pcre2 @ 10.43-r1 (apk)
- **Status:** fixed
- **Fix available: 10.46-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-58050

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** libcrypto3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** libssl3 @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** openssl @ 3.5.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.5.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### GHSA-p77j-4mvh-x3m3 (Critical)
- **Package:** google.golang.org/grpc @ v1.72.2 (go-module)
- **Status:** fixed
- **Fix available: 1.79.3**
- **Source:** https://github.com/advisories/GHSA-p77j-4mvh-x3m3

gRPC-Go has an authorization bypass via missing leading slash in :path

---

### GHSA-p77j-4mvh-x3m3 (Critical)
- **Package:** google.golang.org/grpc @ v1.74.2 (go-module)
- **Status:** fixed
- **Fix available: 1.79.3**
- **Source:** https://github.com/advisories/GHSA-p77j-4mvh-x3m3

gRPC-Go has an authorization bypass via missing leading slash in :path

---

### CVE-2026-27143 (Critical)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.25.9, 1.26.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-27143

Arithmetic over induction variables in loops were not correctly checked for underflow or overflow. As a result, the compiler would allow for invalid indexing to occur at runtime, potentially leading to memory corruption.

---

### CVE-2025-68121 (Critical)
- **Package:** stdlib @ go1.24.7 (go-module)
- **Status:** fixed
- **Fix available: 1.24.13, 1.25.7, 1.26.0-rc.3**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-68121

During session resumption in crypto/tls, if the underlying Config has its ClientCAs or RootCAs fields mutated between the initial handshake and the resumed handshake, the resumed handshake may succeed when it should have failed. This may happen when a user calls Config.Clone and mutates the returned Config, or uses Config.GetConfigForClient. This can cause a client to resume a session with a server that it would not have resumed with during the initial handshake, or cause a server to resume a session with a client that it would not have resumed with during the initial handshake.

---

