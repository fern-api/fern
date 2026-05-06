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
- **Container:** pydantic-model-v2
- **Scan Date:** 2026-05-06T12:41:40.720Z
- **Total Vulnerabilities:** 71
- **Critical:** 1
- **High:** 36
- **Medium:** 27
- **Low:** 7

## Vulnerabilities

### CVE-2023-31484 (High)
- **Package:** perl-base @ 5.36.0-7+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 5.36.0-7+deb12u3**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2023-31484

CPAN.pm before 2.35 does not verify TLS certificates when downloading distributions over HTTPS.

---

### CVE-2025-23166 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.19.2, 22.15.1, 23.11.1, 24.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23166

The C++ method SignTraits::DeriveBits() may incorrectly call ThrowException() based on user-supplied inputs when executing in a background thread, crashing the Node.js process. Such cryptographic operations are commonly applied to untrusted inputs. Thus, this mechanism potentially allows an adversary to remotely crash a Node.js runtime.

---

### CVE-2025-31115 (High)
- **Package:** liblzma5 @ 5.4.1-0.2 (deb)
- **Status:** fixed
- **Fix available: 5.4.1-1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-31115

XZ Utils provide a general-purpose data-compression library plus command-line tools. In XZ Utils 5.3.3alpha to 5.8.0, the multithreaded .xz decoder in liblzma has a bug where invalid input can at least result in a crash. The effects include heap use after free and writing to an address based on the null pointer plus an offset. Applications and libraries that use the lzma_stream_decoder_mt function are affected. The bug has been fixed in XZ Utils 5.8.1, and the fix has been committed to the v5.4, v5.6, v5.8, and master branches in the xz Git repository. No new release packages will be made from the old stable branches, but a standalone patch is available that applies to all affected releases.

---

### CVE-2024-56406 (High)
- **Package:** perl-base @ 5.36.0-7+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 5.36.0-7+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-56406

A heap buffer overflow vulnerability was discovered in Perl.   Release branches 5.34, 5.36, 5.38 and 5.40 are affected, including development versions from 5.33.1 through 5.41.10.  When there are non-ASCII bytes in the left-hand-side of the `tr` operator, `S_do_trans_invmap` can overflow the destination pointer `d`.     $ perl -e '$_ = "\x{FF}" x 1000000; tr/\xFF/\x{100}/;'     Segmentation fault (core dumped)  It is believed that this vulnerability can enable Denial of Service and possibly Code Execution attacks on platforms that lack sufficient defenses.

---

### CVE-2025-23083 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.18.2, 22.13.1, 23.6.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23083

With the aid of the diagnostics_channel utility, an event can be hooked into whenever a worker thread is created. This is not limited only to workers but also exposes internal workers, where an instance of them can be fetched, and its constructor can be grabbed and reinstated for malicious usage. 

This vulnerability affects Permission Model users (--permission) on Node.js v20, v22, and v23.

---

### CVE-2025-32990 (High)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u5**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-32990

A heap-buffer-overflow (off-by-one) flaw was found in the GnuTLS software in the template parsing logic within the certtool utility. When it reads certain settings from a template file, it allows an attacker to cause an out-of-bounds (OOB) NULL pointer write, resulting in memory corruption and a denial-of-service (DoS) that could potentially crash the system.

---

### CVE-2025-59465 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-59465

A malformed `HTTP/2 HEADERS` frame with oversized, invalid `HPACK` data can cause Node.js to crash by triggering an unhandled `TLSSocket` error `ECONNRESET`. Instead of safely closing the connection, the process crashes, enabling a remote denial of service. This primarily affects applications that do not attach explicit error handlers to secure sockets, for example:
```
server.on('secureConnection', socket => {
  socket.on('error', err => {
    console.log(err)
  })
})
```

---

### CVE-2025-6020 (High)
- **Package:** libpam-modules @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-6020

A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink attacks and race conditions.

---

### CVE-2025-6020 (High)
- **Package:** libpam-modules-bin @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-6020

A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink attacks and race conditions.

---

### CVE-2025-6020 (High)
- **Package:** libpam-runtime @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-6020

A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink attacks and race conditions.

---

### CVE-2025-6020 (High)
- **Package:** libpam0g @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-6020

A flaw was found in linux-pam. The module pam_namespace may use access user-controlled paths without proper protection, allowing local users to elevate their privileges to root via multiple symlink attacks and race conditions.

---

### GHSA-3xgq-45jj-v275 (High)
- **Package:** cross-spawn @ 7.0.3 (npm)
- **Status:** fixed
- **Fix available: 7.0.5**
- **Source:** https://github.com/advisories/GHSA-3xgq-45jj-v275

Regular Expression Denial of Service (ReDoS) in cross-spawn

---

### CVE-2025-32988 (High)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u5**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-32988

A flaw was found in GnuTLS. A double-free vulnerability exists in GnuTLS due to incorrect ownership handling in the export logic of Subject Alternative Name (SAN) entries containing an otherName. If the type-id OID is invalid or malformed, GnuTLS will call asn1_delete_structure() on an ASN.1 node it does not own, leading to a double-free condition when the parent function or caller later attempts to free the same structure.  This vulnerability can be triggered using only public GnuTLS APIs and may result in denial of service or memory corruption, depending on allocator behavior.

---

### CVE-2025-4802 (High)
- **Package:** libc-bin @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u11**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-4802

Untrusted LD_LIBRARY_PATH environment variable vulnerability in the GNU C Library version 2.27 to 2.38 allows attacker controlled loading of dynamically shared library in statically compiled setuid binaries that call dlopen (including internal dlopen calls after setlocale or calls to NSS functions such as getaddrinfo).

---

### CVE-2025-4802 (High)
- **Package:** libc6 @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u11**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-4802

Untrusted LD_LIBRARY_PATH environment variable vulnerability in the GNU C Library version 2.27 to 2.38 allows attacker controlled loading of dynamically shared library in statically compiled setuid binaries that call dlopen (including internal dlopen calls after setlocale or calls to NSS functions such as getaddrinfo).

---

### CVE-2026-21637 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21637

A flaw in Node.js TLS error handling allows remote attackers to crash or exhaust resources of a TLS server when `pskCallback` or `ALPNCallback` are in use. Synchronous exceptions thrown during these callbacks bypass standard TLS error handling paths (tlsClientError and error), causing either immediate process termination or silent file descriptor leaks that eventually lead to denial of service. Because these callbacks process attacker-controlled input during the TLS handshake, a remote client can repeatedly trigger the issue. This vulnerability affects TLS servers using PSK or ALPN callbacks across Node.js versions where these callbacks throw without being safely wrapped.

---

### GHSA-7r86-cg39-jmmj (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.7**
- **Source:** https://github.com/advisories/GHSA-7r86-cg39-jmmj

minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments

---

### CVE-2025-55131 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55131

A flaw in Node.js's buffer allocation logic can expose uninitialized memory when allocations are interrupted, when using the `vm` module with the timeout option. Under specific timing conditions, buffers allocated with `Buffer.alloc` and other `TypedArray` instances like `Uint8Array` may contain leftover data from previous operations, allowing in-process secrets like tokens or passwords to leak or causing data corruption. While exploitation typically requires precise timing or in-process code execution, it can become remotely exploitable when untrusted input influences workload and timeouts, leading to potential confidentiality and integrity impact.

---

### CVE-2026-21710 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21710

A flaw in Node.js HTTP request handling causes an uncaught `TypeError` when a request is received with a header named `__proto__` and the application accesses `req.headersDistinct`.

When this occurs, `dest["__proto__"]` resolves to `Object.prototype` rather than `undefined`, causing `.push()` to be called on a non-array. This exception is thrown synchronously inside a property getter and cannot be intercepted by `error` event listeners, meaning it cannot be handled without wrapping every `req.headersDistinct` access in a `try/catch`.

* This vulnerability affects all Node.js HTTP servers on **20.x, 22.x, 24.x, and v25.x**

---

### GHSA-3ppc-4f35-3m26 (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.6**
- **Source:** https://github.com/advisories/GHSA-3ppc-4f35-3m26

minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern

---

### CVE-2025-59466 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-59466

We have identified a bug in Node.js error handling where "Maximum call stack size exceeded" errors become uncatchable when `async_hooks.createHook()` is enabled. Instead of reaching `process.on('uncaughtException')`, the process terminates, making the crash unrecoverable. Applications that rely on `AsyncLocalStorage` (v22, v20) or `async_hooks.createHook()` (v24, v22, v20) become vulnerable to denial-of-service crashes triggered by deep recursion under specific conditions.

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

### CVE-2025-68973 (High)
- **Package:** gpgv @ 2.2.40-1.1 (deb)
- **Status:** fixed
- **Fix available: 2.2.40-1.1+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-68973

In GnuPG before 2.4.9, armor_filter in g10/armor.c has two increments of an index variable where one is intended, leading to an out-of-bounds write for crafted input. (For ExtendedLTS, 2.2.51 and later are fixed versions.)

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

### CVE-2024-12243 (Medium)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u4**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-12243

A flaw was found in GnuTLS, which relies on libtasn1 for ASN.1 data processing. Due to an inefficient algorithm in libtasn1, decoding certain DER-encoded certificate data can take excessive time, leading to increased resource consumption. This flaw allows a remote attacker to send a specially crafted certificate, causing GnuTLS to become unresponsive or slow, resulting in a denial-of-service condition.

---

### CVE-2024-12133 (Medium)
- **Package:** libtasn1-6 @ 4.19.0-2 (deb)
- **Status:** fixed
- **Fix available: 4.19.0-2+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-12133

A flaw in libtasn1 causes inefficient handling of specific certificate data. When processing a large number of elements in a certificate, libtasn1 takes much longer than expected, which can slow down or even crash the system. This flaw allows an attacker to send a specially crafted certificate, causing a denial of service attack.

---

### CVE-2025-23085 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 18.20.6, 20.18.2, 22.13.1, 23.6.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23085

A memory leak could occur when a remote peer abruptly closes the socket without sending a GOAWAY notification. Additionally, if an invalid header was detected by nghttp2, causing the connection to be terminated by the peer, the same leak was triggered. This flaw could lead to increased memory consumption and potential denial of service under certain conditions.

This vulnerability affects HTTP/2 Server users on Node.js v18.x, v20.x, v22.x and v23.x.

---

### CVE-2024-22365 (Medium)
- **Package:** libpam-modules @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-22365

linux-pam (aka Linux PAM) before 1.6.0 allows attackers to cause a denial of service (blocked login process) via mkfifo because the openat call (for protect_dir) lacks O_DIRECTORY.

---

### CVE-2024-22365 (Medium)
- **Package:** libpam-modules-bin @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-22365

linux-pam (aka Linux PAM) before 1.6.0 allows attackers to cause a denial of service (blocked login process) via mkfifo because the openat call (for protect_dir) lacks O_DIRECTORY.

---

### CVE-2024-22365 (Medium)
- **Package:** libpam-runtime @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-22365

linux-pam (aka Linux PAM) before 1.6.0 allows attackers to cause a denial of service (blocked login process) via mkfifo because the openat call (for protect_dir) lacks O_DIRECTORY.

---

### CVE-2024-22365 (Medium)
- **Package:** libpam0g @ 1.5.2-6+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 1.5.2-6+deb12u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2024-22365

linux-pam (aka Linux PAM) before 1.6.0 allows attackers to cause a denial of service (blocked login process) via mkfifo because the openat call (for protect_dir) lacks O_DIRECTORY.

---

### CVE-2025-32989 (Medium)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u5**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-32989

A heap-buffer-overread vulnerability was found in GnuTLS in how it handles the Certificate Transparency (CT) Signed Certificate Timestamp (SCT) extension during X.509 certificate parsing. This flaw allows a malicious user to create a certificate containing a malformed SCT extension (OID 1.3.6.1.4.1.11129.2.4.2) that contains sensitive data. This issue leads to the exposure of confidential information when GnuTLS verifies certificates from certain websites when the certificate (SCT) is not checked correctly.

---

### CVE-2025-6395 (Medium)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u5**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-6395

A NULL pointer dereference flaw was found in the GnuTLS software in _gnutls_figure_common_ciphersuite().

---

### CVE-2025-4598 (Medium)
- **Package:** libsystemd0 @ 252.31-1~deb12u1 (deb)
- **Status:** fixed
- **Fix available: 252.38-1~deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-4598

A vulnerability was found in systemd-coredump. This flaw allows an attacker to force a SUID process to crash and replace it with a non-SUID binary to access the original's privileged process coredump, allowing the attacker to read sensitive data, such as /etc/shadow content, loaded by the original process.  A SUID binary or process has a special type of permission, which allows the process to run with the file owner's permissions, regardless of the user executing the binary. This allows the process to access more restricted data than unprivileged users or processes would be able to. An attacker can leverage this flaw by forcing a SUID process to crash and force the Linux kernel to recycle the process PID before systemd-coredump can analyze the /proc/pid/auxv file. If the attacker wins the race condition, they gain access to the original's SUID process coredump file. They can read sensitive content loaded into memory by the original binary, affecting data confidentiality.

---

### CVE-2025-4598 (Medium)
- **Package:** libudev1 @ 252.31-1~deb12u1 (deb)
- **Status:** fixed
- **Fix available: 252.38-1~deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-4598

A vulnerability was found in systemd-coredump. This flaw allows an attacker to force a SUID process to crash and replace it with a non-SUID binary to access the original's privileged process coredump, allowing the attacker to read sensitive data, such as /etc/shadow content, loaded by the original process.  A SUID binary or process has a special type of permission, which allows the process to run with the file owner's permissions, regardless of the user executing the binary. This allows the process to access more restricted data than unprivileged users or processes would be able to. An attacker can leverage this flaw by forcing a SUID process to crash and force the Linux kernel to recycle the process PID before systemd-coredump can analyze the /proc/pid/auxv file. If the attacker wins the race condition, they gain access to the original's SUID process coredump file. They can read sensitive content loaded into memory by the original binary, affecting data confidentiality.

---

### CVE-2025-0395 (Medium)
- **Package:** libc-bin @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u10**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-0395

When the assert() function in the GNU C Library versions 2.13 to 2.40 fails, it does not allocate enough space for the assertion failure message string and size information, which may lead to a buffer overflow if the message string size aligns to page size.

---

### CVE-2025-0395 (Medium)
- **Package:** libc6 @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u10**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-0395

When the assert() function in the GNU C Library versions 2.13 to 2.40 fails, it does not allocate enough space for the assertion failure message string and size information, which may lead to a buffer overflow if the message string size aligns to page size.

---

### CVE-2025-1390 (Medium)
- **Package:** libcap2 @ 1:2.66-4 (deb)
- **Status:** fixed
- **Fix available: 1:2.66-4+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-1390

The PAM module pam_cap.so of libcap configuration supports group names starting with “@”, during actual parsing, configurations not starting with “@” are incorrectly recognized as group names. This may result in nonintended users being granted an inherited capability set, potentially leading to security risks. Attackers can exploit this vulnerability to achieve local privilege escalation on systems where /etc/security/capability.conf is used to configure user inherited privileges by constructing specific usernames.

---

### CVE-2025-14831 (Medium)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u6**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-14831

A flaw was found in GnuTLS. This vulnerability allows a denial of service (DoS) by excessive CPU (Central Processing Unit) and memory consumption via specially crafted malicious certificates containing a large number of name constraints and subject alternative names (SANs).

---

### CVE-2025-40909 (Medium)
- **Package:** perl-base @ 5.36.0-7+deb12u1 (deb)
- **Status:** fixed
- **Fix available: 5.36.0-7+deb12u3**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-40909

Perl threads have a working directory race condition where file operations may target unintended paths.  If a directory handle is open at thread creation, the process-wide current working directory is temporarily changed in order to clone that handle for the new thread, which is visible from any third (or more) thread already running.   This may lead to unintended operations such as loading code or accessing files from unexpected locations, which a local attacker may be able to exploit.  The bug was introduced in commit 11a11ecf4bea72b17d250cfb43c897be1341861e and released in Perl version 5.13.6

---

### CVE-2026-21717 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21717

A flaw in V8's string hashing mechanism causes integer-like strings to be hashed to their numeric value, making hash collisions trivially predictable. By crafting a request that causes many such collisions in V8's internal string table, an attacker can significantly degrade performance of the Node.js process.

The most common trigger is any endpoint that calls `JSON.parse()` on attacker-controlled input, as JSON parsing automatically internalizes short strings into the affected hash table.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x**.

---

### CVE-2026-21713 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21713

A flaw in Node.js HMAC verification uses a non-constant-time comparison when validating user-provided signatures, potentially leaking timing information proportional to the number of matching bytes. Under certain threat models where high-resolution timing measurements are possible, this behavior could be exploited as a timing oracle to infer HMAC values.

Node.js already provides timing-safe comparison primitives used elsewhere in the codebase, indicating this is an oversight rather than an intentional design decision.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x**.

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.3**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### CVE-2026-21714 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21714

A memory leak occurs in Node.js HTTP/2 servers when a client sends WINDOW_UPDATE frames on stream 0 (connection-level) that cause the flow control window to exceed the maximum value of 2³¹-1. The server correctly sends a GOAWAY frame, but the Http2Session object is never cleaned up.

This vulnerability affects HTTP2 users on Node.js 20, 22, 24 and 25.

---

### CVE-2023-4641 (Medium)
- **Package:** login @ 1:4.13+dfsg1-1+b1 (deb)
- **Status:** fixed
- **Fix available: 1:4.13+dfsg1-1+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2023-4641

A flaw was found in shadow-utils. When asking for a new password, shadow-utils asks the password twice. If the password fails on the second attempt, shadow-utils fails in cleaning the buffer used to store the first entry. This may allow an attacker with enough access to retrieve the password from the memory.

---

### CVE-2023-4641 (Medium)
- **Package:** passwd @ 1:4.13+dfsg1-1+b1 (deb)
- **Status:** fixed
- **Fix available: 1:4.13+dfsg1-1+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2023-4641

A flaw was found in shadow-utils. When asking for a new password, shadow-utils asks the password twice. If the password fails on the second attempt, shadow-utils fails in cleaning the buffer used to store the first entry. This may allow an attacker with enough access to retrieve the password from the memory.

---

### CVE-2025-8058 (Medium)
- **Package:** libc-bin @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u13**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-8058

The regcomp function in the GNU C library version from 2.4 to 2.41 is  subject to a double free if some previous allocation fails. It can be  accomplished either by a malloc failure or by using an interposed malloc  that injects random malloc failures. The double free can allow buffer  manipulation depending of how the regex is constructed. This issue  affects all architectures and ABIs supported by the GNU C library.

---

### CVE-2025-8058 (Medium)
- **Package:** libc6 @ 2.36-9+deb12u9 (deb)
- **Status:** fixed
- **Fix available: 2.36-9+deb12u13**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-8058

The regcomp function in the GNU C library version from 2.4 to 2.41 is  subject to a double free if some previous allocation fails. It can be  accomplished either by a malloc failure or by using an interposed malloc  that injects random malloc failures. The double free can allow buffer  manipulation depending of how the regex is constructed. This issue  affects all architectures and ABIs supported by the GNU C library.

---

### CVE-2025-55132 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55132

A flaw in Node.js's permission model allows a file's access and modification timestamps to be changed via `futimes()` even when the process has only read permissions. Unlike `utimes()`, `futimes()` does not apply the expected write-permission checks, which means file metadata can be modified in read-only directories. This behavior could be used to alter timestamps in ways that obscure activity, reducing the reliability of logs. This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

### CVE-2025-9820 (Medium)
- **Package:** libgnutls30 @ 3.7.9-2+deb12u3 (deb)
- **Status:** fixed
- **Fix available: 3.7.9-2+deb12u6**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9820

A flaw was found in the GnuTLS library, specifically in the gnutls_pkcs11_token_init() function that handles PKCS#11 token initialization. When a token label longer than expected is processed, the function writes past the end of a fixed-size stack buffer. This programming error can cause the application using GnuTLS to crash or, in certain conditions, be exploited for code execution. As a result, systems or applications relying on GnuTLS may be vulnerable to a denial of service or local privilege escalation attacks.

---

### GHSA-v2v4-37r5-5v8g (Medium)
- **Package:** ip-address @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 10.1.1**
- **Source:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

ip-address has XSS in Address6 HTML-emitting methods

---

### CVE-2025-23165 (Low)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.19.2, 22.15.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23165

In Node.js, the `ReadFileUtf8` internal binding leaks memory due to a corrupted pointer in `uv_fs_s.file`: a UTF-16 path buffer is allocated but subsequently overwritten when the file descriptor is set. This results in an unrecoverable memory leak on every call. Repeated use can cause unbounded memory growth, leading to a denial of service.

Impact:
* This vulnerability affects APIs relying on `ReadFileUtf8` on Node.js release lines: v20 and v22.

---

### GHSA-v6h2-p8h4-qcjw (Low)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.2**
- **Source:** https://github.com/advisories/GHSA-v6h2-p8h4-qcjw

brace-expansion Regular Expression Denial of Service vulnerability

---

### CVE-2023-29383 (Low)
- **Package:** login @ 1:4.13+dfsg1-1+b1 (deb)
- **Status:** fixed
- **Fix available: 1:4.13+dfsg1-1+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2023-29383

In Shadow 4.13, it is possible to inject control characters into fields provided to the SUID program chfn (change finger). Although it is not possible to exploit this directly (e.g., adding a new user fails because \n is in the block list), it is possible to misrepresent the /etc/passwd file when viewed. Use of \r manipulations and Unicode characters to work around blocking of the : character make it possible to give the impression that a new user has been added. In other words, an adversary may be able to convince a system administrator to take the system offline (an indirect, social-engineered denial of service) by demonstrating that "cat /etc/passwd" shows a rogue user account.

---

### CVE-2023-29383 (Low)
- **Package:** passwd @ 1:4.13+dfsg1-1+b1 (deb)
- **Status:** fixed
- **Fix available: 1:4.13+dfsg1-1+deb12u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2023-29383

In Shadow 4.13, it is possible to inject control characters into fields provided to the SUID program chfn (change finger). Although it is not possible to exploit this directly (e.g., adding a new user fails because \n is in the block list), it is possible to misrepresent the /etc/passwd file when viewed. Use of \r manipulations and Unicode characters to work around blocking of the : character make it possible to give the impression that a new user has been added. In other words, an adversary may be able to convince a system administrator to take the system offline (an indirect, social-engineered denial of service) by demonstrating that "cat /etc/passwd" shows a rogue user account.

---

### GHSA-73rr-hh4g-fpgx (Low)
- **Package:** diff @ 5.2.0 (npm)
- **Status:** fixed
- **Fix available: 5.2.2**
- **Source:** https://github.com/advisories/GHSA-73rr-hh4g-fpgx

jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch

---

### CVE-2026-21715 (Low)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21715

A flaw in Node.js Permission Model filesystem enforcement leaves `fs.realpathSync.native()` without the required read permission checks, while all comparable filesystem functions correctly enforce them.

As a result, code running under `--permission` with restricted `--allow-fs-read` can still use `fs.realpathSync.native()` to check file existence, resolve symlink targets, and enumerate filesystem paths outside of permitted directories.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-read` is intentionally restricted.

---

### CVE-2026-21716 (Low)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21716

An incomplete fix for CVE-2024-36137 leaves `FileHandle.chmod()` and `FileHandle.chown()` in the promises API without the required permission checks, while their callback-based equivalents (`fs.fchmod()`, `fs.fchown()`) were correctly patched.

As a result, code running under `--permission` with restricted `--allow-fs-write` can still use promise-based `FileHandle` methods to modify file permissions and ownership on already-open file descriptors, bypassing the intended write restrictions.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-write` is intentionally restricted.

---

### CVE-2025-55130 (Critical)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55130

A flaw in Node.js’s Permissions model allows attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths. By chaining directories and symlinks, a script granted access only to the current directory can escape the allowed path and read sensitive files. This breaks the expected isolation guarantees and enables arbitrary file read/write, leading to potential system compromise.
This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

