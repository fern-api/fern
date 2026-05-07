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
- **Container:** php-sdk
- **Scan Date:** 2026-05-07T11:55:04.449Z
- **Total Vulnerabilities:** 234
- **Critical:** 13
- **High:** 116
- **Medium:** 86
- **Low:** 19

## Vulnerabilities

### CVE-2025-48384 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48384

No description available

---

### CVE-2025-48384 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48384

No description available

---

### CVE-2025-0665 (High)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0665

No description available

---

### CVE-2025-0665 (High)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0665

No description available

---

### CVE-2024-52006 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-52006

No description available

---

### CVE-2024-52006 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-52006

No description available

---

### CVE-2024-11234 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.31, 8.2.26, 8.3.14**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-11234

In PHP versions 8.1.* before 8.1.31, 8.2.* before 8.2.26, 8.3.* before 8.3.14, when using streams with configured proxy and "request_fulluri" option, the URI is not properly sanitized which can lead to HTTP request smuggling and allow the attacker to use the proxy to perform arbitrary HTTP requests originating from the server, thus potentially gaining access to resources not normally available to the external user.

---

### CVE-2025-15467 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-15467 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-15467 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15467

No description available

---

### CVE-2025-4330 (High)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4330

No description available

---

### CVE-2025-4330 (High)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4330

No description available

---

### CVE-2025-4330 (High)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4330

No description available

---

### CVE-2025-4330 (High)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4330

No description available

---

### CVE-2024-8176 (High)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-8176

No description available

---

### CVE-2024-11233 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.31, 8.2.26, 8.3.14**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-11233

In PHP versions 8.1.* before 8.1.31, 8.2.* before 8.2.26, 8.3.* before 8.3.14, due to an error in convert.quoted-printable-decode filter certain data can lead to buffer overread by one byte, which can in certain circumstances lead to crashes or disclose content of other memory areas.

---

### CVE-2024-11235 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-11235

In PHP versions 8.3.* before 8.3.19 and 8.4.* before 8.4.5, a code sequence involving __set handler or ??=  operator and exceptions can lead to a use-after-free vulnerability. If the third party can control the memory layout leading to this, for example by supplying specially crafted inputs to the script, it could lead to remote code execution.

---

### CVE-2025-1736 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.32, 8.2.28, 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1736

In PHP from 8.1.* before 8.1.32, from 8.2.* before 8.2.28, from 8.3.* before 8.3.19, from 8.4.* before 8.4.5, when user-supplied headers are sent, the insufficient validation of the end-of-line characters may prevent certain headers from being sent or lead to certain headers be misinterpreted.

---

### CVE-2025-5399 (High)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-5399

No description available

---

### CVE-2025-5399 (High)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-5399

No description available

---

### CVE-2025-0725 (High)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0725

No description available

---

### CVE-2025-0725 (High)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0725

No description available

---

### CVE-2025-23166 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.19.2, 22.15.1, 23.11.1, 24.0.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23166

The C++ method SignTraits::DeriveBits() may incorrectly call ThrowException() based on user-supplied inputs when executing in a background thread, crashing the Node.js process. Such cryptographic operations are commonly applied to untrusted inputs. Thus, this mechanism potentially allows an adversary to remotely crash a Node.js runtime.

---

### CVE-2025-69420 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-69420 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-69420 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69420

No description available

---

### CVE-2025-31115 (High)
- **Package:** xz @ 5.6.2-r0 (apk)
- **Status:** fixed
- **Fix available: 5.6.2-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-31115

No description available

---

### CVE-2025-31115 (High)
- **Package:** xz-libs @ 5.6.2-r0 (apk)
- **Status:** fixed
- **Fix available: 5.6.2-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-31115

No description available

---

### CVE-2025-4138 (High)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4138

No description available

---

### CVE-2025-4138 (High)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4138

No description available

---

### CVE-2025-4138 (High)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4138

No description available

---

### CVE-2025-4138 (High)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4138

No description available

---

### CVE-2024-12254 (High)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12254

No description available

---

### CVE-2024-12254 (High)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12254

No description available

---

### CVE-2024-12254 (High)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12254

No description available

---

### CVE-2024-12254 (High)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12254

No description available

---

### CVE-2025-24928 (High)
- **Package:** libxml2 @ 2.12.7-r0 (apk)
- **Status:** fixed
- **Fix available: 2.12.7-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-24928

No description available

---

### CVE-2025-29087 (High)
- **Package:** sqlite-libs @ 3.45.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.45.3-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-29087

No description available

---

### CVE-2025-48385 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48385

No description available

---

### CVE-2025-48385 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48385

No description available

---

### CVE-2025-32414 (High)
- **Package:** libxml2 @ 2.12.7-r0 (apk)
- **Status:** fixed
- **Fix available: 2.12.10-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-32414

No description available

---

### CVE-2025-1735 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.33, 8.2.29, 8.3.23, 8.4.10**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1735

In PHP versions:8.1.* before 8.1.33, 8.2.* before 8.2.29, 8.3.* before 8.3.23, 8.4.* pgsql and pdo_pgsql escaping functions do not check if the underlying quoting functions returned errors. This could cause crashes if Postgres server rejects the string as invalid.

---

### CVE-2025-23083 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.18.2, 22.13.1, 23.6.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23083

With the aid of the diagnostics_channel utility, an event can be hooked into whenever a worker thread is created. This is not limited only to workers but also exposes internal workers, where an instance of them can be fetched, and its constructor can be grabbed and reinstated for malicious usage. 

This vulnerability affects Permission Model users (--permission) on Node.js v20, v22, and v23.

---

### CVE-2025-27113 (High)
- **Package:** libxml2 @ 2.12.7-r0 (apk)
- **Status:** fixed
- **Fix available: 2.12.7-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-27113

No description available

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

### CVE-2024-45720 (High)
- **Package:** subversion @ 1.14.3-r2 (apk)
- **Status:** fixed
- **Fix available: 1.14.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-45720

No description available

---

### CVE-2024-45720 (High)
- **Package:** subversion-libs @ 1.14.3-r2 (apk)
- **Status:** fixed
- **Fix available: 1.14.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-45720

No description available

---

### CVE-2025-32415 (High)
- **Package:** libxml2 @ 2.12.7-r0 (apk)
- **Status:** fixed
- **Fix available: 2.12.10-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-32415

No description available

---

### CVE-2025-14177 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.34, 8.2.30, 8.3.29, 8.4.16, 8.5.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-14177

In PHP versions:8.1.* before 8.1.34, 8.2.* before 8.2.30, 8.3.* before 8.3.29, 8.4.* before 8.4.16, 8.5.* before 8.5.1, the getimagesize() function may leak uninitialized heap memory into the APPn segments (e.g., APP1) when reading images in multi-chunk mode (such as via php://filter). This occurs due to a bug in php_read_stream_all_chunks() that overwrites the buffer without advancing the pointer, leaving tail bytes uninitialized. This may lead to information disclosure of sensitive heap data and affect the confidentiality of the target server.

---

### GHSA-3xgq-45jj-v275 (High)
- **Package:** cross-spawn @ 7.0.3 (npm)
- **Status:** fixed
- **Fix available: 7.0.5**
- **Source:** https://github.com/advisories/GHSA-3xgq-45jj-v275

Regular Expression Denial of Service (ReDoS) in cross-spawn

---

### CVE-2024-9287 (High)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9287

No description available

---

### CVE-2024-9287 (High)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9287

No description available

---

### CVE-2024-9287 (High)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9287

No description available

---

### CVE-2024-9287 (High)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.8-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9287

No description available

---

### CVE-2025-69419 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-69419 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-69419 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69419

No description available

---

### CVE-2025-59375 (High)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.2-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-59375

No description available

---

### CVE-2025-9086 (High)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9086

No description available

---

### CVE-2025-9086 (High)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9086

No description available

---

### CVE-2026-28387 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28387 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-28387 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28387

No description available

---

### CVE-2026-40261 (High)
- **Package:** composer @ 2.7.9 (php-composer)
- **Status:** fixed
- **Fix available: 2.2.27, 2.9.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-40261

Composer is a dependency manager for PHP. Versions 1.0 through 2.2.26 and 2.3 through 2.9.5 contain a command injection vulnerability in the Perforce::syncCodeBase() method, which appends the $sourceReference parameter to a shell command without proper escaping, and additionally in the Perforce::generateP4Command() method as in GHSA-wg36-wvj6-r67p / CVE-2026-40176, which interpolates user-supplied Perforce connection parameters (port, user, client) from the source url field without proper escaping. An attacker can inject arbitrary commands through crafted source reference or source url values containing shell metacharacters, even if Perforce is not installed. Unlike CVE-2026-40176, the source reference and url are provided as part of package metadata, meaning any compromised or malicious Composer repository can serve package metadata declaring perforce as a source type with malicious values. This vulnerability is exploitable when installing or updating dependencies from source, including the default behavior when installing dev-prefixed versions. This issue has been fixed in Composer 2.2.27 (2.2 LTS) and 2.9.6 (mainline). If developers are unable to immediately update, they can avoid installing dependencies from source by using --prefer-dist or the preferred-install: dist config setting, and only use trusted Composer repositories as a workaround.

---

### CVE-2025-9230 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-9230 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2025-9230 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9230

No description available

---

### CVE-2026-21637 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21637

A flaw in Node.js TLS error handling allows remote attackers to crash or exhaust resources of a TLS server when `pskCallback` or `ALPNCallback` are in use. Synchronous exceptions thrown during these callbacks bypass standard TLS error handling paths (tlsClientError and error), causing either immediate process termination or silent file descriptor leaks that eventually lead to denial of service. Because these callbacks process attacker-controlled input during the TLS handshake, a remote client can repeatedly trigger the issue. This vulnerability affects TLS servers using PSK or ALPN callbacks across Node.js versions where these callbacks throw without being safely wrapped.

---

### CVE-2025-14180 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.34, 8.2.30, 8.3.29, 8.4.16, 8.5.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-14180

In PHP versions 8.1.* before 8.1.34, 8.2.* before 8.2.30, 8.3.* before 8.3.29, 8.4.* before 8.4.16, 8.5.* before 8.5.1 when using the PDO PostgreSQL driver with PDO::ATTR_EMULATE_PREPARES enabled, an invalid character sequence (such as \x99) in a prepared statement parameter may cause the quoting function PQescapeStringConn to return NULL, leading to a null pointer dereference in pdo_parse_params() function. This may lead to crashes (segmentation fault) and affect the availability of the target server.

---

### CVE-2026-28389 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2026-28389 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2026-28389 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28389

No description available

---

### CVE-2026-28390 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28390

No description available

---

### CVE-2025-46835 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46835

No description available

---

### CVE-2025-46835 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46835

No description available

---

### CVE-2025-69421 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-69421 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69421

No description available

---

### CVE-2025-69421 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
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

### CVE-2025-46334 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46334

No description available

---

### CVE-2025-46334 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-46334

No description available

---

### CVE-2025-55131 (High)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55131

A flaw in Node.js's buffer allocation logic can expose uninitialized memory when allocations are interrupted, when using the `vm` module with the timeout option. Under specific timing conditions, buffers allocated with `Buffer.alloc` and other `TypedArray` instances like `Uint8Array` may contain leftover data from previous operations, allowing in-process secrets like tokens or passwords to leak or causing data corruption. While exploitation typically requires precise timing or in-process code execution, it can become remotely exploitable when untrusted input influences workload and timeouts, leading to potential confidentiality and integrity impact.

---

### CVE-2025-26519 (High)
- **Package:** musl @ 1.2.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26519

No description available

---

### CVE-2025-26519 (High)
- **Package:** musl-utils @ 1.2.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26519

No description available

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

### CVE-2025-27614 (High)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-27614

No description available

---

### CVE-2025-27614 (High)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-27614

No description available

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

### CVE-2025-14178 (High)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.34, 8.2.30, 8.3.29, 8.4.16, 8.5.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-14178

In PHP versions:8.1.* before 8.1.34, 8.2.* before 8.2.30, 8.3.* before 8.3.29, 8.4.* before 8.4.16, 8.5.* before 8.5.1, a heap buffer overflow occurs in array_merge() when the total element count of packed arrays exceeds 32-bit limits or HT_MAX_SIZE, due to an integer overflow in the precomputation of element counts using zend_hash_num_elements(). This may lead to memory corruption or crashes and affect the integrity and availability of the target server.

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
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-28388 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-28388 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-28388

No description available

---

### CVE-2026-40200 (High)
- **Package:** musl @ 1.2.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r3**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-40200

No description available

---

### CVE-2026-40200 (High)
- **Package:** musl-utils @ 1.2.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r3**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-40200

No description available

---

### CVE-2026-31790 (High)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-31790 (High)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-31790 (High)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31790

No description available

---

### CVE-2026-40176 (High)
- **Package:** composer @ 2.7.9 (php-composer)
- **Status:** fixed
- **Fix available: 2.2.27, 2.9.6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-40176

Composer is a dependency manager for PHP. Versions 1.0 through 2.2.26 and 2.3 through 2.9.5 contain a command injection vulnerability in the Perforce::generateP4Command() method, which constructs shell commands by interpolating user-supplied Perforce connection parameters (port, user, client) without proper escaping. An attacker can inject arbitrary commands through these values in a malicious composer.json declaring a Perforce VCS repository, leading to command execution in the context of the user running Composer, even if Perforce is not installed. VCS repositories are only loaded from the root composer.json or the composer config directory, so this cannot be exploited through composer.json files of packages installed as dependencies. Users are at risk if they run Composer commands on untrusted projects with attacker-supplied composer.json files. This issue has been fixed in Composer 2.2.27 (2.2 LTS) and 2.9.6 (mainline).

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

### CVE-2026-25210 (High)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-25210

No description available

---

### CVE-2025-26465 (Medium)
- **Package:** openssh-client-common @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26465

No description available

---

### CVE-2025-26465 (Medium)
- **Package:** openssh-client-default @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26465

No description available

---

### CVE-2025-26465 (Medium)
- **Package:** openssh-keygen @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26465

No description available

---

### CVE-2025-26466 (Medium)
- **Package:** openssh-client-common @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26466

No description available

---

### CVE-2025-26466 (Medium)
- **Package:** openssh-client-default @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26466

No description available

---

### CVE-2025-26466 (Medium)
- **Package:** openssh-keygen @ 9.7_p1-r4 (apk)
- **Status:** fixed
- **Fix available: 9.7_p1-r5**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-26466

No description available

---

### CVE-2024-46901 (Medium)
- **Package:** subversion @ 1.14.3-r2 (apk)
- **Status:** fixed
- **Fix available: 1.14.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-46901

No description available

---

### CVE-2024-46901 (Medium)
- **Package:** subversion-libs @ 1.14.3-r2 (apk)
- **Status:** fixed
- **Fix available: 1.14.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-46901

No description available

---

### CVE-2025-0938 (Medium)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.9-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0938

No description available

---

### CVE-2025-0938 (Medium)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.9-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0938

No description available

---

### CVE-2025-0938 (Medium)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.9-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0938

No description available

---

### CVE-2025-0938 (Medium)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.9-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0938

No description available

---

### CVE-2024-50349 (Medium)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-50349

No description available

---

### CVE-2024-50349 (Medium)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-50349

No description available

---

### CVE-2024-9681 (Medium)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.11.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9681

No description available

---

### CVE-2024-9681 (Medium)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.11.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9681

No description available

---

### CVE-2024-9143 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9143

No description available

---

### CVE-2024-9143 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9143

No description available

---

### CVE-2024-9143 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-9143

No description available

---

### CVE-2025-1734 (Medium)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.32, 8.2.28, 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1734

In PHP from 8.1.* before 8.1.32, from 8.2.* before 8.2.28, from 8.3.* before 8.3.19, from 8.4.* before 8.4.5, when receiving headers from HTTP server, the headers missing a colon (:) are treated as valid headers even though they are not. This may confuse applications into accepting invalid headers.

---

### CVE-2024-12797 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12797

No description available

---

### CVE-2024-12797 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12797

No description available

---

### CVE-2024-12797 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12797

No description available

---

### CVE-2024-8929 (Medium)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.31, 8.2.24, 8.3.14**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-8929

In PHP versions 8.1.* before 8.1.31, 8.2.* before 8.2.26, 8.3.* before 8.3.14, a hostile MySQL server can cause the client to disclose the content of its heap containing data from other SQL requests and possible other data belonging to different users of the same server.

---

### CVE-2024-12718 (Medium)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12718

No description available

---

### CVE-2024-12718 (Medium)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12718

No description available

---

### CVE-2024-12718 (Medium)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12718

No description available

---

### CVE-2024-12718 (Medium)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-12718

No description available

---

### CVE-2024-8096 (Medium)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.10.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-8096

No description available

---

### CVE-2024-8096 (Medium)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.10.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-8096

No description available

---

### CVE-2025-6491 (Medium)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.33, 8.2.29, 8.3.23, 8.4.10**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-6491

In PHP versions:8.1.* before 8.1.33, 8.2.* before 8.2.29, 8.3.* before 8.3.23, 8.4.* before 8.4.10 when parsing XML data in SOAP extensions, overly large (>2Gb) XML namespace prefix may lead to null pointer dereference. This may lead to crashes and affect the availability of the target server.

---

### CVE-2025-4516 (Medium)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.10-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4516

No description available

---

### CVE-2025-4516 (Medium)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.10-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4516

No description available

---

### CVE-2025-4516 (Medium)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.10-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4516

No description available

---

### CVE-2025-4516 (Medium)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.10-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4516

No description available

---

### CVE-2025-23085 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 18.20.6, 20.18.2, 22.13.1, 23.6.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-23085

A memory leak could occur when a remote peer abruptly closes the socket without sending a GOAWAY notification. Additionally, if an invalid header was detected by nghttp2, causing the connection to be terminated by the peer, the same leak was triggered. This flaw could lead to increased memory consumption and potential denial of service under certain conditions.

This vulnerability affects HTTP/2 Server users on Node.js v18.x, v20.x, v22.x and v23.x.

---

### CVE-2024-50602 (Medium)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.6.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-50602

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2026-22796 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22796

No description available

---

### CVE-2025-10148 (Medium)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-10148

No description available

---

### CVE-2025-10148 (Medium)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.14.1-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-10148

No description available

---

### CVE-2025-1219 (Medium)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.32, 8.2.28, 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1219

In PHP from 8.1.* before 8.1.32, from 8.2.* before 8.2.28, from 8.3.* before 8.3.19, from 8.4.* before 8.4.5, when requesting a HTTP resource using the DOM or SimpleXML extensions, the wrong content-type header is used to determine the charset when the requested resource performs a redirect. This may cause the resulting document to be parsed incorrectly or bypass validations.

---

### CVE-2025-66199 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2025-66199 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-66199

No description available

---

### CVE-2024-13176 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-13176

No description available

---

### CVE-2024-13176 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-13176

No description available

---

### CVE-2024-13176 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.2-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-13176

No description available

---

### CVE-2026-34743 (Medium)
- **Package:** xz @ 5.6.2-r0 (apk)
- **Status:** fixed
- **Fix available: 5.8.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-34743

No description available

---

### CVE-2026-34743 (Medium)
- **Package:** xz-libs @ 5.6.2-r0 (apk)
- **Status:** fixed
- **Fix available: 5.8.3-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-34743

No description available

---

### CVE-2025-1220 (Medium)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.33, 8.2.29, 8.3.23, 8.4.10**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1220

In PHP versions:8.1.* before 8.1.33, 8.2.* before 8.2.29, 8.3.* before 8.3.23, 8.4.* before 8.4.10 some functions like fsockopen() lack validation that the hostname supplied does not contain null characters. This may lead to other functions like parse_url() treat the hostname in different way, thus opening way to security problems if the user code implements access checks before access using such functions.

---

### CVE-2025-9232 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

---

### CVE-2025-9232 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9232

No description available

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

### CVE-2025-48386 (Medium)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48386

No description available

---

### CVE-2025-48386 (Medium)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-48386

No description available

---

### GHSA-f886-m6hf-6m8v (Medium)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.3**
- **Source:** https://github.com/advisories/GHSA-f886-m6hf-6m8v

brace-expansion: Zero-step sequence causes process hang and memory exhaustion

---

### CVE-2025-67746 (Medium)
- **Package:** composer @ 2.7.9 (php-composer)
- **Status:** fixed
- **Fix available: 2.2.26, 2.9.3**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-67746

Composer is a dependency manager for PHP. In versions on the 2.x branch prior to 2.2.26 and 2.9.3, attackers controlling remote sources that Composer downloads from might in some way inject ANSI control characters in the terminal output of various Composer commands, causing mangled output and potentially leading to confusion or DoS of the terminal application. There is no proven exploit and this has thus a low severity but we still publish a CVE as it has potential for abuse, and we want to be on the safe side informing users that they should upgrade. Versions 2.2.26 and 2.9.3 contain a patch for the issue.

---

### CVE-2025-68160 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-68160 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-68160

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-9231 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-9231

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2025-15468 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-15468

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-22795 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-22795

No description available

---

### CVE-2026-21714 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21714

A memory leak occurs in Node.js HTTP/2 servers when a client sends WINDOW_UPDATE frames on stream 0 (connection-level) that cause the flow control window to exceed the maximum value of 2³¹-1. The server correctly sends a GOAWAY frame, but the Http2Session object is never cleaned up.

This vulnerability affects HTTP2 users on Node.js 20, 22, 24 and 25.

---

### CVE-2026-6042 (Medium)
- **Package:** musl @ 1.2.5-r0 (apk)
- **Status:** fixed
- **Fix available: 1.2.5-r2**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-6042

No description available

---

### CVE-2026-6042 (Medium)
- **Package:** musl-utils @ 1.2.5-r0 (apk)
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

### CVE-2025-55132 (Medium)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55132

A flaw in Node.js's permission model allows a file's access and modification timestamps to be changed via `futimes()` even when the process has only read permissions. Unlike `utimes()`, `futimes()` does not apply the expected write-permission checks, which means file metadata can be modified in read-only directories. This behavior could be used to alter timestamps in ways that obscure activity, reducing the reliability of logs. This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

### CVE-2025-69277 (Medium)
- **Package:** libsodium @ 1.0.19-r0 (apk)
- **Status:** fixed
- **Fix available: 1.0.19-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69277

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2025-69418 (Medium)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.6-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-69418

No description available

---

### CVE-2026-32776 (Medium)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32776

No description available

---

### CVE-2026-32778 (Medium)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32778

No description available

---

### CVE-2026-32777 (Medium)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.5-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-32777

No description available

---

### GHSA-v2v4-37r5-5v8g (Medium)
- **Package:** ip-address @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 10.1.1**
- **Source:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

ip-address has XSS in Address6 HTML-emitting methods

---

### CVE-2024-11053 (Low)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.11.1-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-11053

No description available

---

### CVE-2024-11053 (Low)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.11.1-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-11053

No description available

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

### CVE-2025-0167 (Low)
- **Package:** curl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0167

No description available

---

### CVE-2025-0167 (Low)
- **Package:** libcurl @ 8.9.1-r2 (apk)
- **Status:** fixed
- **Fix available: 8.12.0-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-0167

No description available

---

### CVE-2025-1217 (Low)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.32, 8.2.28, 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1217

In PHP from 8.1.* before 8.1.32, from 8.2.* before 8.2.28, from 8.3.* before 8.3.19, from 8.4.* before 8.4.5, when http request module parses HTTP response obtained from a server, folded headers are parsed incorrectly, which may lead to misinterpreting the response and using incorrect headers, MIME types, etc.

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

### CVE-2025-27613 (Low)
- **Package:** git @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-27613

No description available

---

### CVE-2025-27613 (Low)
- **Package:** git-init-template @ 2.45.2-r0 (apk)
- **Status:** fixed
- **Fix available: 2.45.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-27613

No description available

---

### GHSA-73rr-hh4g-fpgx (Low)
- **Package:** diff @ 5.2.0 (npm)
- **Status:** fixed
- **Fix available: 5.2.2**
- **Source:** https://github.com/advisories/GHSA-73rr-hh4g-fpgx

jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch

---

### CVE-2026-24515 (Low)
- **Package:** libexpat @ 2.6.3-r0 (apk)
- **Status:** fixed
- **Fix available: 2.7.4-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-24515

No description available

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

### CVE-2025-6965 (Critical)
- **Package:** sqlite-libs @ 3.45.3-r1 (apk)
- **Status:** fixed
- **Fix available: 3.45.3-r3**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-6965

No description available

---

### CVE-2025-1861 (Critical)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.32, 8.2.28, 8.3.19, 8.4.5**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-1861

In PHP from 8.1.* before 8.1.32, from 8.2.* before 8.2.28, from 8.3.* before 8.3.19, from 8.4.* before 8.4.5, when parsing HTTP redirect in the response to an HTTP request, there is currently limit on the location value size caused by limited size of the location buffer to 1024. However as per RFC9110, the limit is recommended to be 8000. This may lead to incorrect URL truncation and redirecting to a wrong location.

---

### CVE-2024-11236 (Critical)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.31, 8.2.26, 8.3.14**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-11236

In PHP versions 8.1.* before 8.1.31, 8.2.* before 8.2.26, 8.3.* before 8.3.14, uncontrolled long string inputs to ldap_escape() function on 32-bit systems can cause an integer overflow, resulting in an out-of-bounds write.

---

### CVE-2025-4517 (Critical)
- **Package:** pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4517

No description available

---

### CVE-2025-4517 (Critical)
- **Package:** python3 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4517

No description available

---

### CVE-2025-4517 (Critical)
- **Package:** python3-pyc @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4517

No description available

---

### CVE-2025-4517 (Critical)
- **Package:** python3-pycache-pyc0 @ 3.12.6-r0 (apk)
- **Status:** fixed
- **Fix available: 3.12.11-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2025-4517

No description available

---

### CVE-2024-8932 (Critical)
- **Package:** php-cli @ 8.3.12 (binary)
- **Status:** fixed
- **Fix available: 8.1.31, 8.2.26, 8.3.14**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2024-8932

In PHP versions 8.1.* before 8.1.31, 8.2.* before 8.2.26, 8.3.* before 8.3.14, uncontrolled long string inputs to ldap_escape() function on 32-bit systems can cause an integer overflow, resulting in an out-of-bounds write.

---

### CVE-2024-56171 (Critical)
- **Package:** libxml2 @ 2.12.7-r0 (apk)
- **Status:** fixed
- **Fix available: 2.12.7-r1**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2024-56171

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** libcrypto3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** libssl3 @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2026-31789 (Critical)
- **Package:** openssl @ 3.3.2-r0 (apk)
- **Status:** fixed
- **Fix available: 3.3.7-r0**
- **Source:** https://security.alpinelinux.org/vuln/CVE-2026-31789

No description available

---

### CVE-2025-55130 (Critical)
- **Package:** node @ 22.12.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55130

A flaw in Node.js’s Permissions model allows attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths. By chaining directories and symlinks, a script granted access only to the current directory can escape the allowed path and read sensitive files. This breaks the expected isolation guarantees and enables arbitrary file read/write, leading to potential system compromise.
This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

