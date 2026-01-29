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
- **Scan Date:** 2026-01-29T21:41:28.190Z
- **Total Vulnerabilities:** 29
- **Critical:** 0
- **High:** 7
- **Medium:** 6
- **Low:** 16

## Vulnerabilities

### CVE-2025-59465 (High)
- **Package:** node @ 23.11.1 (binary)
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

### CVE-2026-21945 (High)
- **Package:** openjdk @ 11.0.29+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_482, 8.0.482, 11.0.30, 17.0.18, 21.0.10, 25.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21945

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Security).  Supported versions that are affected are Oracle Java SE: 8u471, 8u471-b50, 8u471-perf, 11.0.29, 17.0.17, 21.0.9, 25.0.1; Oracle GraalVM for JDK: 17.0.17 and  21.0.9; Oracle GraalVM Enterprise Edition: 21.3.16. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a hang or frequently repeatable crash (complete DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. This vulnerability does not apply to Java deployments, typically in servers, that load and run only trusted code (e.g., code installed by an administrator). CVSS 3.1 Base Score 7.5 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H).

---

### CVE-2026-21932 (High)
- **Package:** openjdk @ 11.0.29+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_482, 8.0.482, 11.0.30, 17.0.18, 21.0.10, 25.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21932

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: AWT, JavaFX).  Supported versions that are affected are Oracle Java SE: 8u471, 8u471-b50, 8u471-perf, 11.0.29, 17.0.17, 21.0.9, 25.0.1; Oracle GraalVM for JDK: 17.0.17 and  21.0.9; Oracle GraalVM Enterprise Edition: 21.3.16. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks require human interaction from a person other than the attacker and while the vulnerability is in Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition, attacks may significantly impact additional products (scope change). Successful attacks of this vulnerability can result in  unauthorized creation, deletion or modification access to critical data or all Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. This vulnerability does not apply to Java deployments, typically in servers, that load and run only trusted code (e.g., code installed by an administrator). CVSS 3.1 Base Score 7.4 (Integrity impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:N/I:H/A:N).

---

### GHSA-34x7-hfp2-rc4v (High)
- **Package:** tar @ 7.5.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.7**
- **Source:** https://github.com/advisories/GHSA-34x7-hfp2-rc4v

node-tar Vulnerable to Arbitrary File Creation/Overwrite via Hardlink Path Traversal

---

### CVE-2025-55131 (High)
- **Package:** node @ 23.11.1 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55131

A flaw in Node.js's buffer allocation logic can expose uninitialized memory when allocations are interrupted, when using the `vm` module with the timeout option. Under specific timing conditions, buffers allocated with `Buffer.alloc` and other `TypedArray` instances like `Uint8Array` may contain leftover data from previous operations, allowing in-process secrets like tokens or passwords to leak or causing data corruption. While exploitation typically requires precise timing or in-process code execution, it can become remotely exploitable when untrusted input influences workload and timeouts, leading to potential confidentiality and integrity impact.

---

### GHSA-r6q2-hw4h-h46w (High)
- **Package:** tar @ 7.5.3 (npm)
- **Status:** fixed
- **Fix available: 7.5.4**
- **Source:** https://github.com/advisories/GHSA-r6q2-hw4h-h46w

Race Condition in node-tar Path Reservations via Unicode Ligature Collisions on macOS APFS

---

### CVE-2025-55130 (High)
- **Package:** node @ 23.11.1 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55130

A flaw in Node.js’s Permissions model allows attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths. By chaining directories and symlinks, a script granted access only to the current directory can escape the allowed path and read sensitive files. This breaks the expected isolation guarantees and enables arbitrary file read/write, leading to potential system compromise.
This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

### CVE-2025-15467 (Medium)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-15467

No description available

---

### CVE-2025-15467 (Medium)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-15467

No description available

---

### CVE-2026-21925 (Medium)
- **Package:** openjdk @ 11.0.29+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_482, 8.0.482, 11.0.30, 17.0.18, 21.0.10, 25.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21925

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: RMI).  Supported versions that are affected are Oracle Java SE: 8u471, 8u471-b50, 8u471-perf, 11.0.29, 17.0.17, 21.0.9, 25.0.1; Oracle GraalVM for JDK: 17.0.17 and  21.0.9; Oracle GraalVM Enterprise Edition: 21.3.16. Difficult to exploit vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized update, insert or delete access to some of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data as well as  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 4.8 (Confidentiality and Integrity impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N).

---

### CVE-2026-21933 (Medium)
- **Package:** openjdk @ 11.0.29+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_482, 8.0.482, 11.0.30, 17.0.18, 21.0.10, 25.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21933

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Networking).  Supported versions that are affected are Oracle Java SE: 8u471, 8u471-b50, 8u471-perf, 11.0.29, 17.0.17, 21.0.9, 25.0.1; Oracle GraalVM for JDK: 17.0.17 and  21.0.9; Oracle GraalVM Enterprise Edition: 21.3.16. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks require human interaction from a person other than the attacker and while the vulnerability is in Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition, attacks may significantly impact additional products (scope change). Successful attacks of this vulnerability can result in  unauthorized update, insert or delete access to some of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data as well as  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 6.1 (Confidentiality and Integrity impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N).

---

### CVE-2026-21637 (Medium)
- **Package:** node @ 23.11.1 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21637

A flaw in Node.js TLS error handling allows remote attackers to crash or exhaust resources of a TLS server when `pskCallback` or `ALPNCallback` are in use. Synchronous exceptions thrown during these callbacks bypass standard TLS error handling paths (tlsClientError and error), causing either immediate process termination or silent file descriptor leaks that eventually lead to denial of service. Because these callbacks process attacker-controlled input during the TLS handshake, a remote client can repeatedly trigger the issue. This vulnerability affects TLS servers using PSK or ALPN callbacks across Node.js versions where these callbacks throw without being safely wrapped.

---

### CVE-2025-59466 (Medium)
- **Package:** node @ 23.11.1 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-59466

We have identified a bug in Node.js error handling where "Maximum call stack size exceeded" errors become uncatchable when `async_hooks.createHook()` is enabled. Instead of reaching `process.on('uncaughtException')`, the process terminates, making the crash unrecoverable. Applications that rely on `AsyncLocalStorage` (v22, v20) or `async_hooks.createHook()` (v24, v22, v20) become vulnerable to denial-of-service crashes triggered by deep recursion under specific conditions.

---

### CVE-2026-22796 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2026-22796

No description available

---

### CVE-2026-22795 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2026-22795

No description available

---

### CVE-2025-69420 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69420

No description available

---

### CVE-2025-69420 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69420

No description available

---

### CVE-2025-69419 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69419

No description available

---

### CVE-2025-69419 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69419

No description available

---

### CVE-2025-68160 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-68160

No description available

---

### CVE-2025-69421 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69421

No description available

---

### CVE-2025-69421 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69421

No description available

---

### CVE-2025-69418 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** fixed
- **Fix available: 3.0.2-0ubuntu1.21**
- **Source:** https://ubuntu.com/security/CVE-2025-69418

No description available

---

### GHSA-qqpg-mvqg-649v (Low)
- **Package:** logback-core @ 1.3.16 (java-archive)
- **Status:** fixed
- **Fix available: 1.5.25**
- **Source:** https://github.com/advisories/GHSA-qqpg-mvqg-649v

Logback allows an attacker to instantiate classes already present on the class path

---

### CVE-2025-55132 (Low)
- **Package:** node @ 23.11.1 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55132

A flaw in Node.js's permission model allows a file's access and modification timestamps to be changed via `futimes()` even when the process has only read permissions. Unlike `utimes()`, `futimes()` does not apply the expected write-permission checks, which means file metadata can be modified in read-only directories. This behavior could be used to alter timestamps in ways that obscure activity, reducing the reliability of logs. This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

