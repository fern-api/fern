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
- **Container:** python-sdk
- **Scan Date:** 2026-05-07T11:55:31.067Z
- **Total Vulnerabilities:** 124
- **Critical:** 4
- **High:** 58
- **Medium:** 54
- **Low:** 8

## Vulnerabilities

### CVE-2025-15467 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15467

Issue summary: Parsing CMS AuthEnvelopedData or EnvelopedData message with maliciously crafted AEAD parameters can trigger a stack buffer overflow.  Impact summary: A stack buffer overflow may lead to a crash, causing Denial of Service, or potentially remote code execution.  When parsing CMS (Auth)EnvelopedData structures that use AEAD ciphers such as AES-GCM, the IV (Initialization Vector) encoded in the ASN.1 parameters is copied into a fixed-size stack buffer without verifying that its length fits the destination. An attacker can supply a crafted CMS message with an oversized IV, causing a stack-based out-of-bounds write before any authentication or tag verification occurs.  Applications and services that parse untrusted CMS or PKCS#7 content using AEAD ciphers (e.g., S/MIME (Auth)EnvelopedData with AES-GCM) are vulnerable. Because the overflow occurs prior to authentication, no valid key material is required to trigger it. While exploitability to remote code execution depends on platform and toolchain mitigations, the stack-based write primitive represents a severe risk.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3 and 3.0 are vulnerable to this issue.  OpenSSL 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15467 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15467

Issue summary: Parsing CMS AuthEnvelopedData or EnvelopedData message with maliciously crafted AEAD parameters can trigger a stack buffer overflow.  Impact summary: A stack buffer overflow may lead to a crash, causing Denial of Service, or potentially remote code execution.  When parsing CMS (Auth)EnvelopedData structures that use AEAD ciphers such as AES-GCM, the IV (Initialization Vector) encoded in the ASN.1 parameters is copied into a fixed-size stack buffer without verifying that its length fits the destination. An attacker can supply a crafted CMS message with an oversized IV, causing a stack-based out-of-bounds write before any authentication or tag verification occurs.  Applications and services that parse untrusted CMS or PKCS#7 content using AEAD ciphers (e.g., S/MIME (Auth)EnvelopedData with AES-GCM) are vulnerable. Because the overflow occurs prior to authentication, no valid key material is required to trigger it. While exploitability to remote code execution depends on platform and toolchain mitigations, the stack-based write primitive represents a severe risk.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3 and 3.0 are vulnerable to this issue.  OpenSSL 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15467 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15467

Issue summary: Parsing CMS AuthEnvelopedData or EnvelopedData message with maliciously crafted AEAD parameters can trigger a stack buffer overflow.  Impact summary: A stack buffer overflow may lead to a crash, causing Denial of Service, or potentially remote code execution.  When parsing CMS (Auth)EnvelopedData structures that use AEAD ciphers such as AES-GCM, the IV (Initialization Vector) encoded in the ASN.1 parameters is copied into a fixed-size stack buffer without verifying that its length fits the destination. An attacker can supply a crafted CMS message with an oversized IV, causing a stack-based out-of-bounds write before any authentication or tag verification occurs.  Applications and services that parse untrusted CMS or PKCS#7 content using AEAD ciphers (e.g., S/MIME (Auth)EnvelopedData with AES-GCM) are vulnerable. Because the overflow occurs prior to authentication, no valid key material is required to trigger it. While exploitability to remote code execution depends on platform and toolchain mitigations, the stack-based write primitive represents a severe risk.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3 and 3.0 are vulnerable to this issue.  OpenSSL 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-69420 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69420

Issue summary: A type confusion vulnerability exists in the TimeStamp Response verification code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing a malformed TimeStamp Response file.  Impact summary: An application calling TS_RESP_verify_response() with a malformed TimeStamp Response can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The functions ossl_ess_get_signing_cert() and ossl_ess_get_signing_cert_v2() access the signing cert attribute value without validating its type. When the type is not V_ASN1_SEQUENCE, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed TimeStamp Response to an application that verifies timestamp responses. The TimeStamp protocol (RFC 3161) is not widely used and the impact of the exploit is just a Denial of Service. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the TimeStamp Response implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69420 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69420

Issue summary: A type confusion vulnerability exists in the TimeStamp Response verification code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing a malformed TimeStamp Response file.  Impact summary: An application calling TS_RESP_verify_response() with a malformed TimeStamp Response can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The functions ossl_ess_get_signing_cert() and ossl_ess_get_signing_cert_v2() access the signing cert attribute value without validating its type. When the type is not V_ASN1_SEQUENCE, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed TimeStamp Response to an application that verifies timestamp responses. The TimeStamp protocol (RFC 3161) is not widely used and the impact of the exploit is just a Denial of Service. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the TimeStamp Response implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69420 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69420

Issue summary: A type confusion vulnerability exists in the TimeStamp Response verification code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing a malformed TimeStamp Response file.  Impact summary: An application calling TS_RESP_verify_response() with a malformed TimeStamp Response can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The functions ossl_ess_get_signing_cert() and ossl_ess_get_signing_cert_v2() access the signing cert attribute value without validating its type. When the type is not V_ASN1_SEQUENCE, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed TimeStamp Response to an application that verifies timestamp responses. The TimeStamp protocol (RFC 3161) is not widely used and the impact of the exploit is just a Denial of Service. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the TimeStamp Response implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-13836 (High)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.11, 3.14.1, 3.15.0a3**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-13836

When reading an HTTP response from a server, if no read amount is specified, the default behavior will be to use Content-Length. This allows a malicious server to cause the client to read large amounts of data into memory, potentially causing OOM or other DoS.

---

### CVE-2025-59465 (High)
- **Package:** node @ 20.19.4 (binary)
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

### CVE-2025-15281 (High)
- **Package:** libc-bin @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15281

Calling wordexp with WRDE_REUSE in conjunction with WRDE_APPEND in the GNU C Library version 2.0 to version 2.42 may cause the interface to return uninitialized memory in the we_wordv member, which on subsequent calls to wordfree may abort the process.

---

### CVE-2025-15281 (High)
- **Package:** libc6 @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15281

Calling wordexp with WRDE_REUSE in conjunction with WRDE_APPEND in the GNU C Library version 2.0 to version 2.42 may cause the interface to return uninitialized memory in the we_wordv member, which on subsequent calls to wordfree may abort the process.

---

### GHSA-3xgq-45jj-v275 (High)
- **Package:** cross-spawn @ 7.0.3 (npm)
- **Status:** fixed
- **Fix available: 7.0.5**
- **Source:** https://github.com/advisories/GHSA-3xgq-45jj-v275

Regular Expression Denial of Service (ReDoS) in cross-spawn

---

### CVE-2025-69419 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69419

Issue summary: Calling PKCS12_get_friendlyname() function on a maliciously crafted PKCS#12 file with a BMPString (UTF-16BE) friendly name containing non-ASCII BMP code point can trigger a one byte write before the allocated buffer.  Impact summary: The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service.  The OPENSSL_uni2utf8() function performs a two-pass conversion of a PKCS#12 BMPString (UTF-16BE) to UTF-8. In the second pass, when emitting UTF-8 bytes, the helper function bmp_to_utf8() incorrectly forwards the remaining UTF-16 source byte count as the destination buffer capacity to UTF8_putc(). For BMP code points above U+07FF, UTF-8 requires three bytes, but the forwarded capacity can be just two bytes. UTF8_putc() then returns -1, and this negative value is added to the output length without validation, causing the length to become negative. The subsequent trailing NUL byte is then written at a negative offset, causing write outside of heap allocated buffer.  The vulnerability is reachable via the public PKCS12_get_friendlyname() API when parsing attacker-controlled PKCS#12 files. While PKCS12_parse() uses a different code path that avoids this issue, PKCS12_get_friendlyname() directly invokes the vulnerable function. Exploitation requires an attacker to provide a malicious PKCS#12 file to be parsed by the application and the attacker can just trigger a one zero byte write before the allocated buffer. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69419 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69419

Issue summary: Calling PKCS12_get_friendlyname() function on a maliciously crafted PKCS#12 file with a BMPString (UTF-16BE) friendly name containing non-ASCII BMP code point can trigger a one byte write before the allocated buffer.  Impact summary: The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service.  The OPENSSL_uni2utf8() function performs a two-pass conversion of a PKCS#12 BMPString (UTF-16BE) to UTF-8. In the second pass, when emitting UTF-8 bytes, the helper function bmp_to_utf8() incorrectly forwards the remaining UTF-16 source byte count as the destination buffer capacity to UTF8_putc(). For BMP code points above U+07FF, UTF-8 requires three bytes, but the forwarded capacity can be just two bytes. UTF8_putc() then returns -1, and this negative value is added to the output length without validation, causing the length to become negative. The subsequent trailing NUL byte is then written at a negative offset, causing write outside of heap allocated buffer.  The vulnerability is reachable via the public PKCS12_get_friendlyname() API when parsing attacker-controlled PKCS#12 files. While PKCS12_parse() uses a different code path that avoids this issue, PKCS12_get_friendlyname() directly invokes the vulnerable function. Exploitation requires an attacker to provide a malicious PKCS#12 file to be parsed by the application and the attacker can just trigger a one zero byte write before the allocated buffer. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69419 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69419

Issue summary: Calling PKCS12_get_friendlyname() function on a maliciously crafted PKCS#12 file with a BMPString (UTF-16BE) friendly name containing non-ASCII BMP code point can trigger a one byte write before the allocated buffer.  Impact summary: The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service.  The OPENSSL_uni2utf8() function performs a two-pass conversion of a PKCS#12 BMPString (UTF-16BE) to UTF-8. In the second pass, when emitting UTF-8 bytes, the helper function bmp_to_utf8() incorrectly forwards the remaining UTF-16 source byte count as the destination buffer capacity to UTF8_putc(). For BMP code points above U+07FF, UTF-8 requires three bytes, but the forwarded capacity can be just two bytes. UTF8_putc() then returns -1, and this negative value is added to the output length without validation, causing the length to become negative. The subsequent trailing NUL byte is then written at a negative offset, causing write outside of heap allocated buffer.  The vulnerability is reachable via the public PKCS12_get_friendlyname() API when parsing attacker-controlled PKCS#12 files. While PKCS12_parse() uses a different code path that avoids this issue, PKCS12_get_friendlyname() directly invokes the vulnerable function. Exploitation requires an attacker to provide a malicious PKCS#12 file to be parsed by the application and the attacker can just trigger a one zero byte write before the allocated buffer. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2026-28387 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28387

Issue summary: An uncommon configuration of clients performing DANE TLSA-based server authentication, when paired with uncommon server DANE TLSA records, may result in a use-after-free and/or double-free on the client side.  Impact summary: A use after free can have a range of potential consequences such as the corruption of valid data, crashes or execution of arbitrary code.  However, the issue only affects clients that make use of TLSA records with both the PKIX-TA(0/PKIX-EE(1) certificate usages and the DANE-TA(2) certificate usage.  By far the most common deployment of DANE is in SMTP MTAs for which RFC7672 recommends that clients treat as 'unusable' any TLSA records that have the PKIX certificate usages.  These SMTP (or other similar) clients are not vulnerable to this issue.  Conversely, any clients that support only the PKIX usages, and ignore the DANE-TA(2) usage are also not vulnerable.  The client would also need to be communicating with a server that publishes a TLSA RRset with both types of TLSA records.  No FIPS modules are affected by this issue, the problem code is outside the FIPS module boundary.

---

### CVE-2026-28387 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28387

Issue summary: An uncommon configuration of clients performing DANE TLSA-based server authentication, when paired with uncommon server DANE TLSA records, may result in a use-after-free and/or double-free on the client side.  Impact summary: A use after free can have a range of potential consequences such as the corruption of valid data, crashes or execution of arbitrary code.  However, the issue only affects clients that make use of TLSA records with both the PKIX-TA(0/PKIX-EE(1) certificate usages and the DANE-TA(2) certificate usage.  By far the most common deployment of DANE is in SMTP MTAs for which RFC7672 recommends that clients treat as 'unusable' any TLSA records that have the PKIX certificate usages.  These SMTP (or other similar) clients are not vulnerable to this issue.  Conversely, any clients that support only the PKIX usages, and ignore the DANE-TA(2) usage are also not vulnerable.  The client would also need to be communicating with a server that publishes a TLSA RRset with both types of TLSA records.  No FIPS modules are affected by this issue, the problem code is outside the FIPS module boundary.

---

### CVE-2026-28387 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28387

Issue summary: An uncommon configuration of clients performing DANE TLSA-based server authentication, when paired with uncommon server DANE TLSA records, may result in a use-after-free and/or double-free on the client side.  Impact summary: A use after free can have a range of potential consequences such as the corruption of valid data, crashes or execution of arbitrary code.  However, the issue only affects clients that make use of TLSA records with both the PKIX-TA(0/PKIX-EE(1) certificate usages and the DANE-TA(2) certificate usage.  By far the most common deployment of DANE is in SMTP MTAs for which RFC7672 recommends that clients treat as 'unusable' any TLSA records that have the PKIX certificate usages.  These SMTP (or other similar) clients are not vulnerable to this issue.  Conversely, any clients that support only the PKIX usages, and ignore the DANE-TA(2) usage are also not vulnerable.  The client would also need to be communicating with a server that publishes a TLSA RRset with both types of TLSA records.  No FIPS modules are affected by this issue, the problem code is outside the FIPS module boundary.

---

### CVE-2025-9230 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9230

Issue summary: An application trying to decrypt CMS messages encrypted using password based encryption can trigger an out-of-bounds read and write.  Impact summary: This out-of-bounds read may trigger a crash which leads to Denial of Service for an application. The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service or Execution of attacker-supplied code.  Although the consequences of a successful exploit of this vulnerability could be severe, the probability that the attacker would be able to perform it is low. Besides, password based (PWRI) encryption support in CMS messages is very rarely used. For that reason the issue was assessed as Moderate severity according to our Security Policy.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-9230 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9230

Issue summary: An application trying to decrypt CMS messages encrypted using password based encryption can trigger an out-of-bounds read and write.  Impact summary: This out-of-bounds read may trigger a crash which leads to Denial of Service for an application. The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service or Execution of attacker-supplied code.  Although the consequences of a successful exploit of this vulnerability could be severe, the probability that the attacker would be able to perform it is low. Besides, password based (PWRI) encryption support in CMS messages is very rarely used. For that reason the issue was assessed as Moderate severity according to our Security Policy.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-9230 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9230

Issue summary: An application trying to decrypt CMS messages encrypted using password based encryption can trigger an out-of-bounds read and write.  Impact summary: This out-of-bounds read may trigger a crash which leads to Denial of Service for an application. The out-of-bounds write can cause a memory corruption which can have various consequences including a Denial of Service or Execution of attacker-supplied code.  Although the consequences of a successful exploit of this vulnerability could be severe, the probability that the attacker would be able to perform it is low. Besides, password based (PWRI) encryption support in CMS messages is very rarely used. For that reason the issue was assessed as Moderate severity according to our Security Policy.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the CMS implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-21637 (High)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21637

A flaw in Node.js TLS error handling allows remote attackers to crash or exhaust resources of a TLS server when `pskCallback` or `ALPNCallback` are in use. Synchronous exceptions thrown during these callbacks bypass standard TLS error handling paths (tlsClientError and error), causing either immediate process termination or silent file descriptor leaks that eventually lead to denial of service. Because these callbacks process attacker-controlled input during the TLS handshake, a remote client can repeatedly trigger the issue. This vulnerability affects TLS servers using PSK or ALPN callbacks across Node.js versions where these callbacks throw without being safely wrapped.

---

### CVE-2026-28389 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28389

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyAgreeRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyAgreeRecipientInfo is processed, the optional parameters field of KeyEncryptionAlgorithmIdentifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28390 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28390

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyTransportRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyTransportRecipientInfo with RSA-OAEP encryption is processed, the optional parameters field of RSA-OAEP SourceFunc algorithm identifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28389 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28389

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyAgreeRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyAgreeRecipientInfo is processed, the optional parameters field of KeyEncryptionAlgorithmIdentifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28390 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28390

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyTransportRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyTransportRecipientInfo with RSA-OAEP encryption is processed, the optional parameters field of RSA-OAEP SourceFunc algorithm identifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28389 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28389

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyAgreeRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyAgreeRecipientInfo is processed, the optional parameters field of KeyEncryptionAlgorithmIdentifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28390 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28390

Issue summary: During processing of a crafted CMS EnvelopedData message with KeyTransportRecipientInfo a NULL pointer dereference can happen.  Impact summary: Applications that process attacker-controlled CMS data may crash before authentication or cryptographic operations occur resulting in Denial of Service.  When a CMS EnvelopedData message that uses KeyTransportRecipientInfo with RSA-OAEP encryption is processed, the optional parameters field of RSA-OAEP SourceFunc algorithm identifier is examined without checking for its presence. This results in a NULL pointer dereference if the field is missing.  Applications and services that call CMS_decrypt() on untrusted input (e.g., S/MIME processing or CMS-based protocols) are vulnerable.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-69421 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69421

Issue summary: Processing a malformed PKCS#12 file can trigger a NULL pointer dereference in the PKCS12_item_decrypt_d2i_ex() function.  Impact summary: A NULL pointer dereference can trigger a crash which leads to Denial of Service for an application processing PKCS#12 files.  The PKCS12_item_decrypt_d2i_ex() function does not check whether the oct parameter is NULL before dereferencing it. When called from PKCS12_unpack_p7encdata() with a malformed PKCS#12 file, this parameter can be NULL, causing a crash. The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure.  Exploiting this issue requires an attacker to provide a malformed PKCS#12 file to an application that processes it. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-69421 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69421

Issue summary: Processing a malformed PKCS#12 file can trigger a NULL pointer dereference in the PKCS12_item_decrypt_d2i_ex() function.  Impact summary: A NULL pointer dereference can trigger a crash which leads to Denial of Service for an application processing PKCS#12 files.  The PKCS12_item_decrypt_d2i_ex() function does not check whether the oct parameter is NULL before dereferencing it. When called from PKCS12_unpack_p7encdata() with a malformed PKCS#12 file, this parameter can be NULL, causing a crash. The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure.  Exploiting this issue requires an attacker to provide a malformed PKCS#12 file to an application that processes it. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-69421 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69421

Issue summary: Processing a malformed PKCS#12 file can trigger a NULL pointer dereference in the PKCS12_item_decrypt_d2i_ex() function.  Impact summary: A NULL pointer dereference can trigger a crash which leads to Denial of Service for an application processing PKCS#12 files.  The PKCS12_item_decrypt_d2i_ex() function does not check whether the oct parameter is NULL before dereferencing it. When called from PKCS12_unpack_p7encdata() with a malformed PKCS#12 file, this parameter can be NULL, causing a crash. The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure.  Exploiting this issue requires an attacker to provide a malformed PKCS#12 file to an application that processes it. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### GHSA-7r86-cg39-jmmj (High)
- **Package:** minimatch @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 9.0.7**
- **Source:** https://github.com/advisories/GHSA-7r86-cg39-jmmj

minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments

---

### CVE-2025-55131 (High)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55131

A flaw in Node.js's buffer allocation logic can expose uninitialized memory when allocations are interrupted, when using the `vm` module with the timeout option. Under specific timing conditions, buffers allocated with `Buffer.alloc` and other `TypedArray` instances like `Uint8Array` may contain leftover data from previous operations, allowing in-process secrets like tokens or passwords to leak or causing data corruption. While exploitation typically requires precise timing or in-process code execution, it can become remotely exploitable when untrusted input influences workload and timeouts, leading to potential confidentiality and integrity impact.

---

### CVE-2026-21710 (High)
- **Package:** node @ 20.19.4 (binary)
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
- **Package:** node @ 20.19.4 (binary)
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
- **Package:** glob @ 10.4.2 (npm)
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

### CVE-2026-0915 (High)
- **Package:** libc-bin @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-0915

Calling getnetbyaddr or getnetbyaddr_r with a configured nsswitch.conf that specifies the library's DNS backend for networks and queries for a zero-valued network in the GNU C Library version 2.0 to version 2.42 can leak stack contents to the configured DNS resolver.

---

### CVE-2026-0915 (High)
- **Package:** libc6 @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-0915

Calling getnetbyaddr or getnetbyaddr_r with a configured nsswitch.conf that specifies the library's DNS backend for networks and queries for a zero-valued network in the GNU C Library version 2.0 to version 2.42 can leak stack contents to the configured DNS resolver.

---

### CVE-2026-28388 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28388

Issue summary: When a delta CRL that contains a Delta CRL Indicator extension is processed a NULL pointer dereference might happen if the required CRL Number extension is missing.  Impact summary: A NULL pointer dereference can trigger a crash which leads to a Denial of Service for an application.  When CRL processing and delta CRL processing is enabled during X.509 certificate verification, the delta CRL processing does not check whether the CRL Number extension is NULL before dereferencing it. When a malformed delta CRL file is being processed, this parameter can be NULL, causing a NULL pointer dereference.  Exploiting this issue requires the X509_V_FLAG_USE_DELTAS flag to be enabled in the verification context, the certificate being verified to contain a freshestCRL extension or the base CRL to have the EXFLAG_FRESHEST flag set, and an attacker to provide a malformed CRL to an application that processes it.  The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28388 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28388

Issue summary: When a delta CRL that contains a Delta CRL Indicator extension is processed a NULL pointer dereference might happen if the required CRL Number extension is missing.  Impact summary: A NULL pointer dereference can trigger a crash which leads to a Denial of Service for an application.  When CRL processing and delta CRL processing is enabled during X.509 certificate verification, the delta CRL processing does not check whether the CRL Number extension is NULL before dereferencing it. When a malformed delta CRL file is being processed, this parameter can be NULL, causing a NULL pointer dereference.  Exploiting this issue requires the X509_V_FLAG_USE_DELTAS flag to be enabled in the verification context, the certificate being verified to contain a freshestCRL extension or the base CRL to have the EXFLAG_FRESHEST flag set, and an attacker to provide a malformed CRL to an application that processes it.  The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-28388 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-28388

Issue summary: When a delta CRL that contains a Delta CRL Indicator extension is processed a NULL pointer dereference might happen if the required CRL Number extension is missing.  Impact summary: A NULL pointer dereference can trigger a crash which leads to a Denial of Service for an application.  When CRL processing and delta CRL processing is enabled during X.509 certificate verification, the delta CRL processing does not check whether the CRL Number extension is NULL before dereferencing it. When a malformed delta CRL file is being processed, this parameter can be NULL, causing a NULL pointer dereference.  Exploiting this issue requires the X509_V_FLAG_USE_DELTAS flag to be enabled in the verification context, the certificate being verified to contain a freshestCRL extension or the base CRL to have the EXFLAG_FRESHEST flag set, and an attacker to provide a malformed CRL to an application that processes it.  The vulnerability is limited to Denial of Service and cannot be escalated to achieve code execution or memory disclosure. For that reason the issue was assessed as Low severity according to our Security Policy.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-2219 (High)
- **Package:** dpkg @ 1.22.21 (deb)
- **Status:** fixed
- **Fix available: 1.22.22**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-2219

It was discovered that dpkg-deb (a component of dpkg, the Debian package management system) does not properly validate the end of the data stream when uncompressing a zstd-compressed .deb archive, which may result in denial of service (infinite loop spinning the CPU).

---

### CVE-2026-2673 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-2673

Issue summary: An OpenSSL TLS 1.3 server may fail to negotiate the expected preferred key exchange group when its key exchange group configuration includes the default by using the 'DEFAULT' keyword.  Impact summary: A less preferred key exchange may be used even when a more preferred group is supported by both client and server, if the group was not included among the client's initial predicated keyshares. This will sometimes be the case with the new hybrid post-quantum groups, if the client chooses to defer their use until specifically requested by the server.  If an OpenSSL TLS 1.3 server's configuration uses the 'DEFAULT' keyword to interpolate the built-in default group list into its own configuration, perhaps adding or removing specific elements, then an implementation defect causes the 'DEFAULT' list to lose its 'tuple' structure, and all server-supported groups were treated as a single sufficiently secure 'tuple', with the server not sending a Hello Retry Request (HRR) even when a group in a more preferred tuple was mutually supported.  As a result, the client and server might fail to negotiate a mutually supported post-quantum key agreement group, such as 'X25519MLKEM768', if the client's configuration results in only 'classical' groups (such as 'X25519' being the only ones in the client's initial keyshare prediction).  OpenSSL 3.5 and later support a new syntax for selecting the most preferred TLS 1.3 key agreement group on TLS servers.  The old syntax had a single 'flat' list of groups, and treated all the supported groups as sufficiently secure. If any of the keyshares predicted by the client were supported by the server the most preferred among these was selected, even if other groups supported by the client, but not included in the list of predicted keyshares would have been more preferred, if included.  The new syntax partitions the groups into distinct 'tuples' of roughly equivalent security.  Within each tuple the most preferred group included among the client's predicted keyshares is chosen, but if the client supports a group from a more preferred tuple, but did not predict any corresponding keyshares, the server will ask the client to retry the ClientHello (by issuing a Hello Retry Request or HRR) with the most preferred mutually supported group.  The above works as expected when the server's configuration uses the built-in default group list, or explicitly defines its own list by directly defining the various desired groups and group 'tuples'.  No OpenSSL FIPS modules are affected by this issue, the code in question lies outside the FIPS boundary.  OpenSSL 3.6 and 3.5 are vulnerable to this issue.  OpenSSL 3.6 users should upgrade to OpenSSL 3.6.2 once it is released. OpenSSL 3.5 users should upgrade to OpenSSL 3.5.6 once it is released.  OpenSSL 3.4, 3.3, 3.0, 1.0.2 and 1.1.1 are not affected by this issue.

---

### CVE-2026-2673 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-2673

Issue summary: An OpenSSL TLS 1.3 server may fail to negotiate the expected preferred key exchange group when its key exchange group configuration includes the default by using the 'DEFAULT' keyword.  Impact summary: A less preferred key exchange may be used even when a more preferred group is supported by both client and server, if the group was not included among the client's initial predicated keyshares. This will sometimes be the case with the new hybrid post-quantum groups, if the client chooses to defer their use until specifically requested by the server.  If an OpenSSL TLS 1.3 server's configuration uses the 'DEFAULT' keyword to interpolate the built-in default group list into its own configuration, perhaps adding or removing specific elements, then an implementation defect causes the 'DEFAULT' list to lose its 'tuple' structure, and all server-supported groups were treated as a single sufficiently secure 'tuple', with the server not sending a Hello Retry Request (HRR) even when a group in a more preferred tuple was mutually supported.  As a result, the client and server might fail to negotiate a mutually supported post-quantum key agreement group, such as 'X25519MLKEM768', if the client's configuration results in only 'classical' groups (such as 'X25519' being the only ones in the client's initial keyshare prediction).  OpenSSL 3.5 and later support a new syntax for selecting the most preferred TLS 1.3 key agreement group on TLS servers.  The old syntax had a single 'flat' list of groups, and treated all the supported groups as sufficiently secure. If any of the keyshares predicted by the client were supported by the server the most preferred among these was selected, even if other groups supported by the client, but not included in the list of predicted keyshares would have been more preferred, if included.  The new syntax partitions the groups into distinct 'tuples' of roughly equivalent security.  Within each tuple the most preferred group included among the client's predicted keyshares is chosen, but if the client supports a group from a more preferred tuple, but did not predict any corresponding keyshares, the server will ask the client to retry the ClientHello (by issuing a Hello Retry Request or HRR) with the most preferred mutually supported group.  The above works as expected when the server's configuration uses the built-in default group list, or explicitly defines its own list by directly defining the various desired groups and group 'tuples'.  No OpenSSL FIPS modules are affected by this issue, the code in question lies outside the FIPS boundary.  OpenSSL 3.6 and 3.5 are vulnerable to this issue.  OpenSSL 3.6 users should upgrade to OpenSSL 3.6.2 once it is released. OpenSSL 3.5 users should upgrade to OpenSSL 3.5.6 once it is released.  OpenSSL 3.4, 3.3, 3.0, 1.0.2 and 1.1.1 are not affected by this issue.

---

### CVE-2026-2673 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-2673

Issue summary: An OpenSSL TLS 1.3 server may fail to negotiate the expected preferred key exchange group when its key exchange group configuration includes the default by using the 'DEFAULT' keyword.  Impact summary: A less preferred key exchange may be used even when a more preferred group is supported by both client and server, if the group was not included among the client's initial predicated keyshares. This will sometimes be the case with the new hybrid post-quantum groups, if the client chooses to defer their use until specifically requested by the server.  If an OpenSSL TLS 1.3 server's configuration uses the 'DEFAULT' keyword to interpolate the built-in default group list into its own configuration, perhaps adding or removing specific elements, then an implementation defect causes the 'DEFAULT' list to lose its 'tuple' structure, and all server-supported groups were treated as a single sufficiently secure 'tuple', with the server not sending a Hello Retry Request (HRR) even when a group in a more preferred tuple was mutually supported.  As a result, the client and server might fail to negotiate a mutually supported post-quantum key agreement group, such as 'X25519MLKEM768', if the client's configuration results in only 'classical' groups (such as 'X25519' being the only ones in the client's initial keyshare prediction).  OpenSSL 3.5 and later support a new syntax for selecting the most preferred TLS 1.3 key agreement group on TLS servers.  The old syntax had a single 'flat' list of groups, and treated all the supported groups as sufficiently secure. If any of the keyshares predicted by the client were supported by the server the most preferred among these was selected, even if other groups supported by the client, but not included in the list of predicted keyshares would have been more preferred, if included.  The new syntax partitions the groups into distinct 'tuples' of roughly equivalent security.  Within each tuple the most preferred group included among the client's predicted keyshares is chosen, but if the client supports a group from a more preferred tuple, but did not predict any corresponding keyshares, the server will ask the client to retry the ClientHello (by issuing a Hello Retry Request or HRR) with the most preferred mutually supported group.  The above works as expected when the server's configuration uses the built-in default group list, or explicitly defines its own list by directly defining the various desired groups and group 'tuples'.  No OpenSSL FIPS modules are affected by this issue, the code in question lies outside the FIPS boundary.  OpenSSL 3.6 and 3.5 are vulnerable to this issue.  OpenSSL 3.6 users should upgrade to OpenSSL 3.6.2 once it is released. OpenSSL 3.5 users should upgrade to OpenSSL 3.5.6 once it is released.  OpenSSL 3.4, 3.3, 3.0, 1.0.2 and 1.1.1 are not affected by this issue.

---

### CVE-2026-31790 (High)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31790

Issue summary: Applications using RSASVE key encapsulation to establish a secret encryption key can send contents of an uninitialized memory buffer to a malicious peer.  Impact summary: The uninitialized buffer might contain sensitive data from the previous execution of the application process which leads to sensitive data leakage to an attacker.  RSA_public_encrypt() returns the number of bytes written on success and -1 on error. The affected code tests only whether the return value is non-zero. As a result, if RSA encryption fails, encapsulation can still return success to the caller, set the output lengths, and leave the caller to use the contents of the ciphertext buffer as if a valid KEM ciphertext had been produced.  If applications use EVP_PKEY_encapsulate() with RSA/RSASVE on an attacker-supplied invalid RSA public key without first validating that key, then this may cause stale or uninitialized contents of the caller-provided ciphertext buffer to be disclosed to the attacker in place of the KEM ciphertext.  As a workaround calling EVP_PKEY_public_check() or EVP_PKEY_public_check_quick() before EVP_PKEY_encapsulate() will mitigate the issue.  The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.1 and 3.0 are affected by this issue.

---

### CVE-2026-31790 (High)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31790

Issue summary: Applications using RSASVE key encapsulation to establish a secret encryption key can send contents of an uninitialized memory buffer to a malicious peer.  Impact summary: The uninitialized buffer might contain sensitive data from the previous execution of the application process which leads to sensitive data leakage to an attacker.  RSA_public_encrypt() returns the number of bytes written on success and -1 on error. The affected code tests only whether the return value is non-zero. As a result, if RSA encryption fails, encapsulation can still return success to the caller, set the output lengths, and leave the caller to use the contents of the ciphertext buffer as if a valid KEM ciphertext had been produced.  If applications use EVP_PKEY_encapsulate() with RSA/RSASVE on an attacker-supplied invalid RSA public key without first validating that key, then this may cause stale or uninitialized contents of the caller-provided ciphertext buffer to be disclosed to the attacker in place of the KEM ciphertext.  As a workaround calling EVP_PKEY_public_check() or EVP_PKEY_public_check_quick() before EVP_PKEY_encapsulate() will mitigate the issue.  The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.1 and 3.0 are affected by this issue.

---

### CVE-2026-31790 (High)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31790

Issue summary: Applications using RSASVE key encapsulation to establish a secret encryption key can send contents of an uninitialized memory buffer to a malicious peer.  Impact summary: The uninitialized buffer might contain sensitive data from the previous execution of the application process which leads to sensitive data leakage to an attacker.  RSA_public_encrypt() returns the number of bytes written on success and -1 on error. The affected code tests only whether the return value is non-zero. As a result, if RSA encryption fails, encapsulation can still return success to the caller, set the output lengths, and leave the caller to use the contents of the ciphertext buffer as if a valid KEM ciphertext had been produced.  If applications use EVP_PKEY_encapsulate() with RSA/RSASVE on an attacker-supplied invalid RSA public key without first validating that key, then this may cause stale or uninitialized contents of the caller-provided ciphertext buffer to be disclosed to the attacker in place of the KEM ciphertext.  As a workaround calling EVP_PKEY_public_check() or EVP_PKEY_public_check_quick() before EVP_PKEY_encapsulate() will mitigate the issue.  The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.1 and 3.0 are affected by this issue.

---

### GHSA-2599-h6xx-hpxp (High)
- **Package:** poetry @ 1.8.5 (python)
- **Status:** fixed
- **Fix available: 2.3.3**
- **Source:** https://github.com/advisories/GHSA-2599-h6xx-hpxp

Poetry Has Wheel Path Traversal Which Can Lead to Arbitrary File Write

---

### CVE-2026-0861 (High)
- **Package:** libc-bin @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-0861

Passing too large an alignment to the memalign suite of functions (memalign, posix_memalign, aligned_alloc) in the GNU C Library version 2.30 to 2.42 may result in an integer overflow, which could consequently result in a heap corruption.  Note that the attacker must have control over both, the size as well as the alignment arguments of the memalign function to be able to exploit this.  The size parameter must be close enough to PTRDIFF_MAX so as to overflow size_t along with the large alignment argument.  This limits the malicious inputs for the alignment for memalign to the range [1<<62+ 1, 1<<63] and exactly 1<<63 for posix_memalign and aligned_alloc.  Typically the alignment argument passed to such functions is a known constrained quantity (e.g. page size, block size, struct sizes) and is not attacker controlled, because of which this may not be easily exploitable in practice.  An application bug could potentially result in the input alignment being too large, e.g. due to a different buffer overflow or integer overflow in the application or its dependent libraries, but that is again an uncommon usage pattern given typical sources of alignments.

---

### CVE-2026-0861 (High)
- **Package:** libc6 @ 2.41-12 (deb)
- **Status:** fixed
- **Fix available: 2.41-12+deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-0861

Passing too large an alignment to the memalign suite of functions (memalign, posix_memalign, aligned_alloc) in the GNU C Library version 2.30 to 2.42 may result in an integer overflow, which could consequently result in a heap corruption.  Note that the attacker must have control over both, the size as well as the alignment arguments of the memalign function to be able to exploit this.  The size parameter must be close enough to PTRDIFF_MAX so as to overflow size_t along with the large alignment argument.  This limits the malicious inputs for the alignment for memalign to the range [1<<62+ 1, 1<<63] and exactly 1<<63 for posix_memalign and aligned_alloc.  Typically the alignment argument passed to such functions is a known constrained quantity (e.g. page size, block size, struct sizes) and is not attacker controlled, because of which this may not be easily exploitable in practice.  An application bug could potentially result in the input alignment being too large, e.g. due to a different buffer overflow or integer overflow in the application or its dependent libraries, but that is again an uncommon usage pattern given typical sources of alignments.

---

### GHSA-r6q2-hw4h-h46w (High)
- **Package:** tar @ 6.2.1 (npm)
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

### GHSA-qffp-2rhf-9h96 (High)
- **Package:** tar @ 6.2.1 (npm)
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

### GHSA-8qq5-rm4j-mr97 (High)
- **Package:** tar @ 6.2.1 (npm)
- **Status:** fixed
- **Fix available: 7.5.3**
- **Source:** https://github.com/advisories/GHSA-8qq5-rm4j-mr97

node-tar is Vulnerable to Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization

---

### CVE-2026-0672 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.10.20, 3.11.15, 3.12.13, 3.13.12, 3.14.3, 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-0672

When using http.cookies.Morsel, user-controlled cookie values and parameters can allow injecting HTTP headers into messages. Patch rejects all control characters within cookie names, values, and parameters.

---

### CVE-2026-0865 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.10.20, 3.11.15, 3.12.13, 3.13.12, 3.14.3, 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-0865

User-controlled header names and values containing newlines can allow injecting HTTP headers.

---

### CVE-2025-8291 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.9.24, 3.10.19, 3.11.14, 3.12.12, 3.13.10, 3.14.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-8291

The 'zipfile' module would not check the validity of the ZIP64 End of
Central Directory (EOCD) Locator record offset value would not be used to
locate the ZIP64 EOCD record, instead the ZIP64 EOCD record would be
assumed to be the previous record in the ZIP archive. This could be abused
to create ZIP archives that are handled differently by the 'zipfile' module
compared to other ZIP implementations.


Remediation maintains this behavior, but checks that the offset specified
in the ZIP64 EOCD Locator record matches the expected value.

---

### CVE-2026-22796 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22796

Issue summary: A type confusion vulnerability exists in the signature verification of signed PKCS#7 data where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing malformed PKCS#7 data.  Impact summary: An application performing signature verification of PKCS#7 data or calling directly the PKCS7_digest_from_attributes() function can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The function PKCS7_digest_from_attributes() accesses the message digest attribute value without validating its type. When the type is not V_ASN1_OCTET_STRING, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed signed PKCS#7 to an application that verifies it. The impact of the exploit is just a Denial of Service, the PKCS7 API is legacy and applications should be using the CMS API instead. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#7 parsing implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2026-22796 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22796

Issue summary: A type confusion vulnerability exists in the signature verification of signed PKCS#7 data where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing malformed PKCS#7 data.  Impact summary: An application performing signature verification of PKCS#7 data or calling directly the PKCS7_digest_from_attributes() function can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The function PKCS7_digest_from_attributes() accesses the message digest attribute value without validating its type. When the type is not V_ASN1_OCTET_STRING, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed signed PKCS#7 to an application that verifies it. The impact of the exploit is just a Denial of Service, the PKCS7 API is legacy and applications should be using the CMS API instead. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#7 parsing implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2026-22796 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22796

Issue summary: A type confusion vulnerability exists in the signature verification of signed PKCS#7 data where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid or NULL pointer dereference when processing malformed PKCS#7 data.  Impact summary: An application performing signature verification of PKCS#7 data or calling directly the PKCS7_digest_from_attributes() function can be caused to dereference an invalid or NULL pointer when reading, resulting in a Denial of Service.  The function PKCS7_digest_from_attributes() accesses the message digest attribute value without validating its type. When the type is not V_ASN1_OCTET_STRING, this results in accessing invalid memory through the ASN1_TYPE union, causing a crash.  Exploiting this vulnerability requires an attacker to provide a malformed signed PKCS#7 to an application that verifies it. The impact of the exploit is just a Denial of Service, the PKCS7 API is legacy and applications should be using the CMS API instead. For these reasons the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS#7 parsing implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-12084 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.11, 3.14.2, 3.15.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-12084

When building nested elements using xml.dom.minidom methods such as appendChild() that have a dependency on _clear_id_cache() the algorithm is quadratic. Availability can be impacted when building excessively nested documents.

---

### CVE-2025-15366 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-15366

The imaplib module, when passed a user-controlled command, can have additional commands injected using newlines. Mitigation rejects commands containing control characters.

---

### CVE-2025-15367 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-15367

The poplib module, when passed a user-controlled command, can have
additional commands injected using newlines. Mitigation rejects commands
containing control characters.

---

### CVE-2025-66199 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-66199

Issue summary: A TLS 1.3 connection using certificate compression can be forced to allocate a large buffer before decompression without checking against the configured certificate size limit.  Impact summary: An attacker can cause per-connection memory allocations of up to approximately 22 MiB and extra CPU work, potentially leading to service degradation or resource exhaustion (Denial of Service).  In affected configurations, the peer-supplied uncompressed certificate length from a CompressedCertificate message is used to grow a heap buffer prior to decompression. This length is not bounded by the max_cert_list setting, which otherwise constrains certificate message sizes. An attacker can exploit this to cause large per-connection allocations followed by handshake failure. No memory corruption or information disclosure occurs.  This issue only affects builds where TLS 1.3 certificate compression is compiled in (i.e., not OPENSSL_NO_COMP_ALG) and at least one compression algorithm (brotli, zlib, or zstd) is available, and where the compression extension is negotiated. Both clients receiving a server CompressedCertificate and servers in mutual TLS scenarios receiving a client CompressedCertificate are affected. Servers that do not request client certificates are not vulnerable to client-initiated attacks.  Users can mitigate this issue by setting SSL_OP_NO_RX_CERTIFICATE_COMPRESSION to disable receiving compressed certificates.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the TLS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-66199 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-66199

Issue summary: A TLS 1.3 connection using certificate compression can be forced to allocate a large buffer before decompression without checking against the configured certificate size limit.  Impact summary: An attacker can cause per-connection memory allocations of up to approximately 22 MiB and extra CPU work, potentially leading to service degradation or resource exhaustion (Denial of Service).  In affected configurations, the peer-supplied uncompressed certificate length from a CompressedCertificate message is used to grow a heap buffer prior to decompression. This length is not bounded by the max_cert_list setting, which otherwise constrains certificate message sizes. An attacker can exploit this to cause large per-connection allocations followed by handshake failure. No memory corruption or information disclosure occurs.  This issue only affects builds where TLS 1.3 certificate compression is compiled in (i.e., not OPENSSL_NO_COMP_ALG) and at least one compression algorithm (brotli, zlib, or zstd) is available, and where the compression extension is negotiated. Both clients receiving a server CompressedCertificate and servers in mutual TLS scenarios receiving a client CompressedCertificate are affected. Servers that do not request client certificates are not vulnerable to client-initiated attacks.  Users can mitigate this issue by setting SSL_OP_NO_RX_CERTIFICATE_COMPRESSION to disable receiving compressed certificates.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the TLS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-66199 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-66199

Issue summary: A TLS 1.3 connection using certificate compression can be forced to allocate a large buffer before decompression without checking against the configured certificate size limit.  Impact summary: An attacker can cause per-connection memory allocations of up to approximately 22 MiB and extra CPU work, potentially leading to service degradation or resource exhaustion (Denial of Service).  In affected configurations, the peer-supplied uncompressed certificate length from a CompressedCertificate message is used to grow a heap buffer prior to decompression. This length is not bounded by the max_cert_list setting, which otherwise constrains certificate message sizes. An attacker can exploit this to cause large per-connection allocations followed by handshake failure. No memory corruption or information disclosure occurs.  This issue only affects builds where TLS 1.3 certificate compression is compiled in (i.e., not OPENSSL_NO_COMP_ALG) and at least one compression algorithm (brotli, zlib, or zstd) is available, and where the compression extension is negotiated. Both clients receiving a server CompressedCertificate and servers in mutual TLS scenarios receiving a client CompressedCertificate are affected. Servers that do not request client certificates are not vulnerable to client-initiated attacks.  Users can mitigate this issue by setting SSL_OP_NO_RX_CERTIFICATE_COMPRESSION to disable receiving compressed certificates.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the TLS implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-7709 (Medium)
- **Package:** libsqlite3-0 @ 3.46.1-7 (deb)
- **Status:** fixed
- **Fix available: 3.46.1-7+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-7709

An integer overflow exists in the  FTS5 https://sqlite.org/fts5.html  extension. It occurs when the size of an array of tombstone pointers is calculated and truncated into a 32-bit integer. A pointer to partially controlled data can then be written out of bounds.

---

### CVE-2025-15282 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.10.20, 3.11.15, 3.12.13, 3.13.12, 3.14.3, 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-15282

User-controlled data URLs parsed by urllib.request.DataHandler allow injecting headers through newlines in the data URL mediatype.

---

### CVE-2026-1299 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.10.20, 3.11.15, 3.12.13, 3.13.12, 3.14.3, 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-1299

The 
email module, specifically the "BytesGenerator" class, didn’t properly quote newlines for email headers when 
serializing an email message allowing for header injection when an email
 is serialized. This is only applicable if using "LiteralHeader" writing headers that don't respect email folding rules, the new behavior will reject the incorrectly folded headers in "BytesGenerator".

---

### CVE-2026-3644 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a8**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-3644

The fix for CVE-2026-0672, which rejected control characters in http.cookies.Morsel, was incomplete. The Morsel.update(), |= operator, and unpickling paths were not patched, allowing control characters to bypass input validation. Additionally, BaseCookie.js_output() lacked the output validation applied to BaseCookie.output().

---

### CVE-2025-9232 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9232

Issue summary: An application using the OpenSSL HTTP client API functions may trigger an out-of-bounds read if the 'no_proxy' environment variable is set and the host portion of the authority component of the HTTP URL is an IPv6 address.  Impact summary: An out-of-bounds read can trigger a crash which leads to Denial of Service for an application.  The OpenSSL HTTP client API functions can be used directly by applications but they are also used by the OCSP client functions and CMP (Certificate Management Protocol) client implementation in OpenSSL. However the URLs used by these implementations are unlikely to be controlled by an attacker.  In this vulnerable code the out of bounds read can only trigger a crash. Furthermore the vulnerability requires an attacker-controlled URL to be passed from an application to the OpenSSL function and the user has to have a 'no_proxy' environment variable set. For the aforementioned reasons the issue was assessed as Low severity.  The vulnerable code was introduced in the following patch releases: 3.0.16, 3.1.8, 3.2.4, 3.3.3, 3.4.0 and 3.5.0.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the HTTP client implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-9232 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9232

Issue summary: An application using the OpenSSL HTTP client API functions may trigger an out-of-bounds read if the 'no_proxy' environment variable is set and the host portion of the authority component of the HTTP URL is an IPv6 address.  Impact summary: An out-of-bounds read can trigger a crash which leads to Denial of Service for an application.  The OpenSSL HTTP client API functions can be used directly by applications but they are also used by the OCSP client functions and CMP (Certificate Management Protocol) client implementation in OpenSSL. However the URLs used by these implementations are unlikely to be controlled by an attacker.  In this vulnerable code the out of bounds read can only trigger a crash. Furthermore the vulnerability requires an attacker-controlled URL to be passed from an application to the OpenSSL function and the user has to have a 'no_proxy' environment variable set. For the aforementioned reasons the issue was assessed as Low severity.  The vulnerable code was introduced in the following patch releases: 3.0.16, 3.1.8, 3.2.4, 3.3.3, 3.4.0 and 3.5.0.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the HTTP client implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-9232 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9232

Issue summary: An application using the OpenSSL HTTP client API functions may trigger an out-of-bounds read if the 'no_proxy' environment variable is set and the host portion of the authority component of the HTTP URL is an IPv6 address.  Impact summary: An out-of-bounds read can trigger a crash which leads to Denial of Service for an application.  The OpenSSL HTTP client API functions can be used directly by applications but they are also used by the OCSP client functions and CMP (Certificate Management Protocol) client implementation in OpenSSL. However the URLs used by these implementations are unlikely to be controlled by an attacker.  In this vulnerable code the out of bounds read can only trigger a crash. Furthermore the vulnerability requires an attacker-controlled URL to be passed from an application to the OpenSSL function and the user has to have a 'no_proxy' environment variable set. For the aforementioned reasons the issue was assessed as Low severity.  The vulnerable code was introduced in the following patch releases: 3.0.16, 3.1.8, 3.2.4, 3.3.3, 3.4.0 and 3.5.0.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as the HTTP client implementation is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-11468 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.10.20, 3.11.15, 3.12.13, 3.13.12, 3.14.3, 3.15.0a6**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-11468

When folding a long comment in an email header containing exclusively unfoldable characters, the parenthesis would not be preserved. This could be used for injecting headers into email messages where addresses are user-controlled and not sanitized.

---

### CVE-2026-21717 (Medium)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21717

A flaw in V8's string hashing mechanism causes integer-like strings to be hashed to their numeric value, making hash collisions trivially predictable. By crafting a request that causes many such collisions in V8's internal string table, an attacker can significantly degrade performance of the Node.js process.

The most common trigger is any endpoint that calls `JSON.parse()` on attacker-controlled input, as JSON parsing automatically internalizes short strings into the affected hash table.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x**.

---

### CVE-2026-4224 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a8**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-4224

When an Expat parser with a registered ElementDeclHandler parses an inline
document type definition containing a deeply nested content model a C stack
overflow occurs.

---

### CVE-2026-21713 (Medium)
- **Package:** node @ 20.19.4 (binary)
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

### CVE-2026-3446 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a8**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-3446

When calling base64.b64decode() or related functions the decoding process would stop after encountering the first padded quad regardless of whether there was more information to be processed. This can lead to data being accepted which may be processed differently by other implementations. Use "validate=True" to enable stricter processing of base64 data.

---

### CVE-2025-68160 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-68160

Issue summary: Writing large, newline-free data into a BIO chain using the line-buffering filter where the next BIO performs short writes can trigger a heap-based out-of-bounds write.  Impact summary: This out-of-bounds write can cause memory corruption which typically results in a crash, leading to Denial of Service for an application.  The line-buffering BIO filter (BIO_f_linebuffer) is not used by default in TLS/SSL data paths. In OpenSSL command-line applications, it is typically only pushed onto stdout/stderr on VMS systems. Third-party applications that explicitly use this filter with a BIO chain that can short-write and that write large, newline-free data influenced by an attacker would be affected. However, the circumstances where this could happen are unlikely to be under attacker control, and BIO_f_linebuffer is unlikely to be handling non-curated data controlled by an attacker. For that reason the issue was assessed as Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the BIO implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-68160 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-68160

Issue summary: Writing large, newline-free data into a BIO chain using the line-buffering filter where the next BIO performs short writes can trigger a heap-based out-of-bounds write.  Impact summary: This out-of-bounds write can cause memory corruption which typically results in a crash, leading to Denial of Service for an application.  The line-buffering BIO filter (BIO_f_linebuffer) is not used by default in TLS/SSL data paths. In OpenSSL command-line applications, it is typically only pushed onto stdout/stderr on VMS systems. Third-party applications that explicitly use this filter with a BIO chain that can short-write and that write large, newline-free data influenced by an attacker would be affected. However, the circumstances where this could happen are unlikely to be under attacker control, and BIO_f_linebuffer is unlikely to be handling non-curated data controlled by an attacker. For that reason the issue was assessed as Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the BIO implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-68160 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-68160

Issue summary: Writing large, newline-free data into a BIO chain using the line-buffering filter where the next BIO performs short writes can trigger a heap-based out-of-bounds write.  Impact summary: This out-of-bounds write can cause memory corruption which typically results in a crash, leading to Denial of Service for an application.  The line-buffering BIO filter (BIO_f_linebuffer) is not used by default in TLS/SSL data paths. In OpenSSL command-line applications, it is typically only pushed onto stdout/stderr on VMS systems. Third-party applications that explicitly use this filter with a BIO chain that can short-write and that write large, newline-free data influenced by an attacker would be affected. However, the circumstances where this could happen are unlikely to be under attacker control, and BIO_f_linebuffer is unlikely to be handling non-curated data controlled by an attacker. For that reason the issue was assessed as Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the BIO implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are vulnerable to this issue.

---

### CVE-2025-6075 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.9.25, 3.10.20, 3.11.15, 3.12.13, 3.13.10, 3.14.1, 3.15.0a2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-6075

If the value passed to os.path.expandvars() is user-controlled a 
performance degradation is possible when expanding environment 
variables.

---

### CVE-2025-9231 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9231

Issue summary: A timing side-channel which could potentially allow remote recovery of the private key exists in the SM2 algorithm implementation on 64 bit ARM platforms.  Impact summary: A timing side-channel in SM2 signature computations on 64 bit ARM platforms could allow recovering the private key by an attacker..  While remote key recovery over a network was not attempted by the reporter, timing measurements revealed a timing signal which may allow such an attack.  OpenSSL does not directly support certificates with SM2 keys in TLS, and so this CVE is not relevant in most TLS contexts.  However, given that it is possible to add support for such certificates via a custom provider, coupled with the fact that in such a custom provider context the private key may be recoverable via remote timing measurements, we consider this to be a Moderate severity issue.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as SM2 is not an approved algorithm.

---

### CVE-2025-9231 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9231

Issue summary: A timing side-channel which could potentially allow remote recovery of the private key exists in the SM2 algorithm implementation on 64 bit ARM platforms.  Impact summary: A timing side-channel in SM2 signature computations on 64 bit ARM platforms could allow recovering the private key by an attacker..  While remote key recovery over a network was not attempted by the reporter, timing measurements revealed a timing signal which may allow such an attack.  OpenSSL does not directly support certificates with SM2 keys in TLS, and so this CVE is not relevant in most TLS contexts.  However, given that it is possible to add support for such certificates via a custom provider, coupled with the fact that in such a custom provider context the private key may be recoverable via remote timing measurements, we consider this to be a Moderate severity issue.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as SM2 is not an approved algorithm.

---

### CVE-2025-9231 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.1-1+deb13u1**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-9231

Issue summary: A timing side-channel which could potentially allow remote recovery of the private key exists in the SM2 algorithm implementation on 64 bit ARM platforms.  Impact summary: A timing side-channel in SM2 signature computations on 64 bit ARM platforms could allow recovering the private key by an attacker..  While remote key recovery over a network was not attempted by the reporter, timing measurements revealed a timing signal which may allow such an attack.  OpenSSL does not directly support certificates with SM2 keys in TLS, and so this CVE is not relevant in most TLS contexts.  However, given that it is possible to add support for such certificates via a custom provider, coupled with the fact that in such a custom provider context the private key may be recoverable via remote timing measurements, we consider this to be a Moderate severity issue.  The FIPS modules in 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected by this issue, as SM2 is not an approved algorithm.

---

### CVE-2025-15468 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15468

Issue summary: If an application using the SSL_CIPHER_find() function in a QUIC protocol client or server receives an unknown cipher suite from the peer, a NULL dereference occurs.  Impact summary: A NULL pointer dereference leads to abnormal termination of the running process causing Denial of Service.  Some applications call SSL_CIPHER_find() from the client_hello_cb callback on the cipher ID received from the peer. If this is done with an SSL object implementing the QUIC protocol, NULL pointer dereference will happen if the examined cipher ID is unknown or unsupported.  As it is not very common to call this function in applications using the QUIC  protocol and the worst outcome is Denial of Service, the issue was assessed as Low severity.  The vulnerable code was introduced in the 3.2 version with the addition of the QUIC protocol support.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the QUIC implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15468 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15468

Issue summary: If an application using the SSL_CIPHER_find() function in a QUIC protocol client or server receives an unknown cipher suite from the peer, a NULL dereference occurs.  Impact summary: A NULL pointer dereference leads to abnormal termination of the running process causing Denial of Service.  Some applications call SSL_CIPHER_find() from the client_hello_cb callback on the cipher ID received from the peer. If this is done with an SSL object implementing the QUIC protocol, NULL pointer dereference will happen if the examined cipher ID is unknown or unsupported.  As it is not very common to call this function in applications using the QUIC  protocol and the worst outcome is Denial of Service, the issue was assessed as Low severity.  The vulnerable code was introduced in the 3.2 version with the addition of the QUIC protocol support.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the QUIC implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15468 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15468

Issue summary: If an application using the SSL_CIPHER_find() function in a QUIC protocol client or server receives an unknown cipher suite from the peer, a NULL dereference occurs.  Impact summary: A NULL pointer dereference leads to abnormal termination of the running process causing Denial of Service.  Some applications call SSL_CIPHER_find() from the client_hello_cb callback on the cipher ID received from the peer. If this is done with an SSL object implementing the QUIC protocol, NULL pointer dereference will happen if the examined cipher ID is unknown or unsupported.  As it is not very common to call this function in applications using the QUIC  protocol and the worst outcome is Denial of Service, the issue was assessed as Low severity.  The vulnerable code was introduced in the 3.2 version with the addition of the QUIC protocol support.  The FIPS modules in 3.6, 3.5, 3.4 and 3.3 are not affected by this issue, as the QUIC implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4 and 3.3 are vulnerable to this issue.  OpenSSL 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### GHSA-4xh5-x5gv-qwph (Medium)
- **Package:** pip @ 25.2 (python)
- **Status:** fixed
- **Fix available: 25.3**
- **Source:** https://github.com/advisories/GHSA-4xh5-x5gv-qwph

pip's fallback tar extraction doesn't check symbolic links point to extraction directory

---

### CVE-2026-22795 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22795

Issue summary: An invalid or NULL pointer dereference can happen in an application processing a malformed PKCS#12 file.  Impact summary: An application processing a malformed PKCS#12 file can be caused to dereference an invalid or NULL pointer on memory read, resulting in a Denial of Service.  A type confusion vulnerability exists in PKCS#12 parsing code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid pointer read.  The location is constrained to a 1-byte address space, meaning any attempted pointer manipulation can only target addresses between 0x00 and 0xFF. This range corresponds to the zero page, which is unmapped on most modern operating systems and will reliably result in a crash, leading only to a Denial of Service. Exploiting this issue also requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For these reasons, the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2026-22795 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22795

Issue summary: An invalid or NULL pointer dereference can happen in an application processing a malformed PKCS#12 file.  Impact summary: An application processing a malformed PKCS#12 file can be caused to dereference an invalid or NULL pointer on memory read, resulting in a Denial of Service.  A type confusion vulnerability exists in PKCS#12 parsing code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid pointer read.  The location is constrained to a 1-byte address space, meaning any attempted pointer manipulation can only target addresses between 0x00 and 0xFF. This range corresponds to the zero page, which is unmapped on most modern operating systems and will reliably result in a crash, leading only to a Denial of Service. Exploiting this issue also requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For these reasons, the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2026-22795 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-22795

Issue summary: An invalid or NULL pointer dereference can happen in an application processing a malformed PKCS#12 file.  Impact summary: An application processing a malformed PKCS#12 file can be caused to dereference an invalid or NULL pointer on memory read, resulting in a Denial of Service.  A type confusion vulnerability exists in PKCS#12 parsing code where an ASN1_TYPE union member is accessed without first validating the type, causing an invalid pointer read.  The location is constrained to a 1-byte address space, meaning any attempted pointer manipulation can only target addresses between 0x00 and 0xFF. This range corresponds to the zero page, which is unmapped on most modern operating systems and will reliably result in a crash, leading only to a Denial of Service. Exploiting this issue also requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For these reasons, the issue was assessed as Low severity.  The FIPS modules in 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the PKCS12 implementation is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.  OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-13837 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.10, 3.14.1, 3.15.0a3**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-13837

When loading a plist file, the plistlib module reads data in size specified by the file itself, meaning a malicious file can cause OOM and DoS issues

---

### CVE-2026-2297 (Medium)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a7**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-2297

The import hook in CPython that handles legacy *.pyc files (SourcelessFileLoader) is incorrectly handled in FileLoader (a base class) and so does not use io.open_code() to read the .pyc files. sys.audit handlers for this audit event therefore do not fire.

---

### CVE-2026-21714 (Medium)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21714

A memory leak occurs in Node.js HTTP/2 servers when a client sends WINDOW_UPDATE frames on stream 0 (connection-level) that cause the flow control window to exceed the maximum value of 2³¹-1. The server correctly sends a GOAWAY frame, but the Http2Session object is never cleaned up.

This vulnerability affects HTTP2 users on Node.js 20, 22, 24 and 25.

---

### GHSA-jp4c-xjxw-mgf9 (Medium)
- **Package:** pip @ 25.2 (python)
- **Status:** fixed
- **Fix available: 26.1**
- **Source:** https://github.com/advisories/GHSA-jp4c-xjxw-mgf9

pip Vulnerable to Inclusion of Functionality from Untrusted Control Sphere

---

### CVE-2025-55132 (Medium)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55132

A flaw in Node.js's permission model allows a file's access and modification timestamps to be changed via `futimes()` even when the process has only read permissions. Unlike `utimes()`, `futimes()` does not apply the expected write-permission checks, which means file metadata can be modified in read-only directories. This behavior could be used to alter timestamps in ways that obscure activity, reducing the reliability of logs. This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

### CVE-2025-11187 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-11187

Issue summary: PBMAC1 parameters in PKCS#12 files are missing validation which can trigger a stack-based buffer overflow, invalid pointer or NULL pointer dereference during MAC verification.  Impact summary: The stack buffer overflow or NULL pointer dereference may cause a crash leading to Denial of Service for an application that parses untrusted PKCS#12 files. The buffer overflow may also potentially enable code execution depending on platform mitigations.  When verifying a PKCS#12 file that uses PBMAC1 for the MAC, the PBKDF2 salt and keylength parameters from the file are used without validation. If the value of keylength exceeds the size of the fixed stack buffer used for the derived key (64 bytes), the key derivation will overflow the buffer. The overflow length is attacker-controlled. Also, if the salt parameter is not an OCTET STRING type this can lead to invalid or NULL pointer dereference.  Exploiting this issue requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For this reason the issue was assessed as Moderate severity.  The FIPS modules in 3.6, 3.5 and 3.4 are not affected by this issue, as PKCS#12 processing is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5 and 3.4 are vulnerable to this issue.  OpenSSL 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue as they do not support PBMAC1 in PKCS#12.

---

### CVE-2025-11187 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-11187

Issue summary: PBMAC1 parameters in PKCS#12 files are missing validation which can trigger a stack-based buffer overflow, invalid pointer or NULL pointer dereference during MAC verification.  Impact summary: The stack buffer overflow or NULL pointer dereference may cause a crash leading to Denial of Service for an application that parses untrusted PKCS#12 files. The buffer overflow may also potentially enable code execution depending on platform mitigations.  When verifying a PKCS#12 file that uses PBMAC1 for the MAC, the PBKDF2 salt and keylength parameters from the file are used without validation. If the value of keylength exceeds the size of the fixed stack buffer used for the derived key (64 bytes), the key derivation will overflow the buffer. The overflow length is attacker-controlled. Also, if the salt parameter is not an OCTET STRING type this can lead to invalid or NULL pointer dereference.  Exploiting this issue requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For this reason the issue was assessed as Moderate severity.  The FIPS modules in 3.6, 3.5 and 3.4 are not affected by this issue, as PKCS#12 processing is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5 and 3.4 are vulnerable to this issue.  OpenSSL 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue as they do not support PBMAC1 in PKCS#12.

---

### CVE-2025-11187 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-11187

Issue summary: PBMAC1 parameters in PKCS#12 files are missing validation which can trigger a stack-based buffer overflow, invalid pointer or NULL pointer dereference during MAC verification.  Impact summary: The stack buffer overflow or NULL pointer dereference may cause a crash leading to Denial of Service for an application that parses untrusted PKCS#12 files. The buffer overflow may also potentially enable code execution depending on platform mitigations.  When verifying a PKCS#12 file that uses PBMAC1 for the MAC, the PBKDF2 salt and keylength parameters from the file are used without validation. If the value of keylength exceeds the size of the fixed stack buffer used for the derived key (64 bytes), the key derivation will overflow the buffer. The overflow length is attacker-controlled. Also, if the salt parameter is not an OCTET STRING type this can lead to invalid or NULL pointer dereference.  Exploiting this issue requires a user or application to process a maliciously crafted PKCS#12 file. It is uncommon to accept untrusted PKCS#12 files in applications as they are usually used to store private keys which are trusted by definition. For this reason the issue was assessed as Moderate severity.  The FIPS modules in 3.6, 3.5 and 3.4 are not affected by this issue, as PKCS#12 processing is outside the OpenSSL FIPS module boundary.  OpenSSL 3.6, 3.5 and 3.4 are vulnerable to this issue.  OpenSSL 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue as they do not support PBMAC1 in PKCS#12.

---

### CVE-2025-69418 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69418

Issue summary: When using the low-level OCB API directly with AES-NI or<br>other hardware-accelerated code paths, inputs whose length is not a multiple<br>of 16 bytes can leave the final partial block unencrypted and unauthenticated.<br><br>Impact summary: The trailing 1-15 bytes of a message may be exposed in<br>cleartext on encryption and are not covered by the authentication tag,<br>allowing an attacker to read or tamper with those bytes without detection.<br><br>The low-level OCB encrypt and decrypt routines in the hardware-accelerated<br>stream path process full 16-byte blocks but do not advance the input/output<br>pointers. The subsequent tail-handling code then operates on the original<br>base pointers, effectively reprocessing the beginning of the buffer while<br>leaving the actual trailing bytes unprocessed. The authentication checksum<br>also excludes the true tail bytes.<br><br>However, typical OpenSSL consumers using EVP are not affected because the<br>higher-level EVP and provider OCB implementations split inputs so that full<br>blocks and trailing partial blocks are processed in separate calls, avoiding<br>the problematic code path. Additionally, TLS does not use OCB ciphersuites.<br>The vulnerability only affects applications that call the low-level<br>CRYPTO_ocb128_encrypt() or CRYPTO_ocb128_decrypt() functions directly with<br>non-block-aligned lengths in a single call on hardware-accelerated builds.<br>For these reasons the issue was assessed as Low severity.<br><br>The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected<br>by this issue, as OCB mode is not a FIPS-approved algorithm.<br><br>OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.<br><br>OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69418 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69418

Issue summary: When using the low-level OCB API directly with AES-NI or<br>other hardware-accelerated code paths, inputs whose length is not a multiple<br>of 16 bytes can leave the final partial block unencrypted and unauthenticated.<br><br>Impact summary: The trailing 1-15 bytes of a message may be exposed in<br>cleartext on encryption and are not covered by the authentication tag,<br>allowing an attacker to read or tamper with those bytes without detection.<br><br>The low-level OCB encrypt and decrypt routines in the hardware-accelerated<br>stream path process full 16-byte blocks but do not advance the input/output<br>pointers. The subsequent tail-handling code then operates on the original<br>base pointers, effectively reprocessing the beginning of the buffer while<br>leaving the actual trailing bytes unprocessed. The authentication checksum<br>also excludes the true tail bytes.<br><br>However, typical OpenSSL consumers using EVP are not affected because the<br>higher-level EVP and provider OCB implementations split inputs so that full<br>blocks and trailing partial blocks are processed in separate calls, avoiding<br>the problematic code path. Additionally, TLS does not use OCB ciphersuites.<br>The vulnerability only affects applications that call the low-level<br>CRYPTO_ocb128_encrypt() or CRYPTO_ocb128_decrypt() functions directly with<br>non-block-aligned lengths in a single call on hardware-accelerated builds.<br>For these reasons the issue was assessed as Low severity.<br><br>The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected<br>by this issue, as OCB mode is not a FIPS-approved algorithm.<br><br>OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.<br><br>OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-69418 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-69418

Issue summary: When using the low-level OCB API directly with AES-NI or<br>other hardware-accelerated code paths, inputs whose length is not a multiple<br>of 16 bytes can leave the final partial block unencrypted and unauthenticated.<br><br>Impact summary: The trailing 1-15 bytes of a message may be exposed in<br>cleartext on encryption and are not covered by the authentication tag,<br>allowing an attacker to read or tamper with those bytes without detection.<br><br>The low-level OCB encrypt and decrypt routines in the hardware-accelerated<br>stream path process full 16-byte blocks but do not advance the input/output<br>pointers. The subsequent tail-handling code then operates on the original<br>base pointers, effectively reprocessing the beginning of the buffer while<br>leaving the actual trailing bytes unprocessed. The authentication checksum<br>also excludes the true tail bytes.<br><br>However, typical OpenSSL consumers using EVP are not affected because the<br>higher-level EVP and provider OCB implementations split inputs so that full<br>blocks and trailing partial blocks are processed in separate calls, avoiding<br>the problematic code path. Additionally, TLS does not use OCB ciphersuites.<br>The vulnerability only affects applications that call the low-level<br>CRYPTO_ocb128_encrypt() or CRYPTO_ocb128_decrypt() functions directly with<br>non-block-aligned lengths in a single call on hardware-accelerated builds.<br>For these reasons the issue was assessed as Low severity.<br><br>The FIPS modules in 3.6, 3.5, 3.4, 3.3, 3.2, 3.1 and 3.0 are not affected<br>by this issue, as OCB mode is not a FIPS-approved algorithm.<br><br>OpenSSL 3.6, 3.5, 3.4, 3.3, 3.0 and 1.1.1 are vulnerable to this issue.<br><br>OpenSSL 1.0.2 is not affected by this issue.

---

### CVE-2025-15469 (Medium)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15469

Issue summary: The 'openssl dgst' command-line tool silently truncates input data to 16MB when using one-shot signing algorithms and reports success instead of an error.  Impact summary: A user signing or verifying files larger than 16MB with one-shot algorithms (such as Ed25519, Ed448, or ML-DSA) may believe the entire file is authenticated while trailing data beyond 16MB remains unauthenticated.  When the 'openssl dgst' command is used with algorithms that only support one-shot signing (Ed25519, Ed448, ML-DSA-44, ML-DSA-65, ML-DSA-87), the input is buffered with a 16MB limit. If the input exceeds this limit, the tool silently truncates to the first 16MB and continues without signaling an error, contrary to what the documentation states. This creates an integrity gap where trailing bytes can be modified without detection if both signing and verification are performed using the same affected codepath.  The issue affects only the command-line tool behavior. Verifiers that process the full message using library APIs will reject the signature, so the risk primarily affects workflows that both sign and verify with the affected 'openssl dgst' command. Streaming digest algorithms for 'openssl dgst' and library users are unaffected.  The FIPS modules in 3.5 and 3.6 are not affected by this issue, as the command-line tools are outside the OpenSSL FIPS module boundary.  OpenSSL 3.5 and 3.6 are vulnerable to this issue.  OpenSSL 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15469 (Medium)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15469

Issue summary: The 'openssl dgst' command-line tool silently truncates input data to 16MB when using one-shot signing algorithms and reports success instead of an error.  Impact summary: A user signing or verifying files larger than 16MB with one-shot algorithms (such as Ed25519, Ed448, or ML-DSA) may believe the entire file is authenticated while trailing data beyond 16MB remains unauthenticated.  When the 'openssl dgst' command is used with algorithms that only support one-shot signing (Ed25519, Ed448, ML-DSA-44, ML-DSA-65, ML-DSA-87), the input is buffered with a 16MB limit. If the input exceeds this limit, the tool silently truncates to the first 16MB and continues without signaling an error, contrary to what the documentation states. This creates an integrity gap where trailing bytes can be modified without detection if both signing and verification are performed using the same affected codepath.  The issue affects only the command-line tool behavior. Verifiers that process the full message using library APIs will reject the signature, so the risk primarily affects workflows that both sign and verify with the affected 'openssl dgst' command. Streaming digest algorithms for 'openssl dgst' and library users are unaffected.  The FIPS modules in 3.5 and 3.6 are not affected by this issue, as the command-line tools are outside the OpenSSL FIPS module boundary.  OpenSSL 3.5 and 3.6 are vulnerable to this issue.  OpenSSL 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### CVE-2025-15469 (Medium)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.4-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2025-15469

Issue summary: The 'openssl dgst' command-line tool silently truncates input data to 16MB when using one-shot signing algorithms and reports success instead of an error.  Impact summary: A user signing or verifying files larger than 16MB with one-shot algorithms (such as Ed25519, Ed448, or ML-DSA) may believe the entire file is authenticated while trailing data beyond 16MB remains unauthenticated.  When the 'openssl dgst' command is used with algorithms that only support one-shot signing (Ed25519, Ed448, ML-DSA-44, ML-DSA-65, ML-DSA-87), the input is buffered with a 16MB limit. If the input exceeds this limit, the tool silently truncates to the first 16MB and continues without signaling an error, contrary to what the documentation states. This creates an integrity gap where trailing bytes can be modified without detection if both signing and verification are performed using the same affected codepath.  The issue affects only the command-line tool behavior. Verifiers that process the full message using library APIs will reject the signature, so the risk primarily affects workflows that both sign and verify with the affected 'openssl dgst' command. Streaming digest algorithms for 'openssl dgst' and library users are unaffected.  The FIPS modules in 3.5 and 3.6 are not affected by this issue, as the command-line tools are outside the OpenSSL FIPS module boundary.  OpenSSL 3.5 and 3.6 are vulnerable to this issue.  OpenSSL 3.4, 3.3, 3.0, 1.1.1 and 1.0.2 are not affected by this issue.

---

### GHSA-v2v4-37r5-5v8g (Medium)
- **Package:** ip-address @ 9.0.5 (npm)
- **Status:** fixed
- **Fix available: 10.1.1**
- **Source:** https://github.com/advisories/GHSA-v2v4-37r5-5v8g

ip-address has XSS in Address6 HTML-emitting methods

---

### GHSA-v6h2-p8h4-qcjw (Low)
- **Package:** brace-expansion @ 2.0.1 (npm)
- **Status:** fixed
- **Fix available: 2.0.2**
- **Source:** https://github.com/advisories/GHSA-v6h2-p8h4-qcjw

brace-expansion Regular Expression Denial of Service vulnerability

---

### GHSA-73h3-mf4w-8647 (Low)
- **Package:** poetry @ 1.8.5 (python)
- **Status:** fixed
- **Fix available: 2.3.4**
- **Source:** https://github.com/advisories/GHSA-73h3-mf4w-8647

Poetry has Path Traversal in tar extraction on Python 3.10.0 - 3.10.12 and 3.11.0 - 3.11.4

---

### GHSA-6vgw-5pg2-w6jp (Low)
- **Package:** pip @ 25.2 (python)
- **Status:** fixed
- **Fix available: 26.0**
- **Source:** https://github.com/advisories/GHSA-6vgw-5pg2-w6jp

pip Path Traversal vulnerability

---

### GHSA-73rr-hh4g-fpgx (Low)
- **Package:** diff @ 5.2.0 (npm)
- **Status:** fixed
- **Fix available: 5.2.2**
- **Source:** https://github.com/advisories/GHSA-73rr-hh4g-fpgx

jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch

---

### CVE-2026-4519 (Low)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a8**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-4519

The webbrowser.open() API would accept leading dashes in the URL which 
could be handled as command line options for certain web browsers. New 
behavior rejects leading dashes. Users are recommended to sanitize URLs 
prior to passing to webbrowser.open().

---

### CVE-2025-13462 (Low)
- **Package:** python @ 3.13.7 (binary)
- **Status:** fixed
- **Fix available: 3.13.13, 3.14.4, 3.15.0a8**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-13462

The "tarfile" module would still apply normalization of AREGTYPE (\x00) blocks to DIRTYPE, even while processing a multi-block member such as GNUTYPE_LONGNAME or GNUTYPE_LONGLINK. This could result in a crafted tar archive being misinterpreted by the tarfile module compared to other implementations.

---

### CVE-2026-21715 (Low)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21715

A flaw in Node.js Permission Model filesystem enforcement leaves `fs.realpathSync.native()` without the required read permission checks, while all comparable filesystem functions correctly enforce them.

As a result, code running under `--permission` with restricted `--allow-fs-read` can still use `fs.realpathSync.native()` to check file existence, resolve symlink targets, and enumerate filesystem paths outside of permitted directories.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-read` is intentionally restricted.

---

### CVE-2026-21716 (Low)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 22.22.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21716

An incomplete fix for CVE-2024-36137 leaves `FileHandle.chmod()` and `FileHandle.chown()` in the promises API without the required permission checks, while their callback-based equivalents (`fs.fchmod()`, `fs.fchown()`) were correctly patched.

As a result, code running under `--permission` with restricted `--allow-fs-write` can still use promise-based `FileHandle` methods to modify file permissions and ownership on already-open file descriptors, bypassing the intended write restrictions.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-write` is intentionally restricted.

---

### CVE-2026-31789 (Critical)
- **Package:** libssl3t64 @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31789

Issue summary: Converting an excessively large OCTET STRING value to a hexadecimal string leads to a heap buffer overflow on 32 bit platforms.  Impact summary: A heap buffer overflow may lead to a crash or possibly an attacker controlled code execution or other undefined behavior.  If an attacker can supply a crafted X.509 certificate with an excessively large OCTET STRING value in extensions such as the Subject Key Identifier (SKID) or Authority Key Identifier (AKID) which are being converted to hex, the size of the buffer needed for the result is calculated as multiplication of the input length by 3. On 32 bit platforms, this multiplication may overflow resulting in the allocation of a smaller buffer and a heap buffer overflow.  Applications and services that print or log contents of untrusted X.509 certificates are vulnerable to this issue. As the certificates would have to have sizes of over 1 Gigabyte, printing or logging such certificates is a fairly unlikely operation and only 32 bit platforms are affected, this issue was assigned Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-31789 (Critical)
- **Package:** openssl @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31789

Issue summary: Converting an excessively large OCTET STRING value to a hexadecimal string leads to a heap buffer overflow on 32 bit platforms.  Impact summary: A heap buffer overflow may lead to a crash or possibly an attacker controlled code execution or other undefined behavior.  If an attacker can supply a crafted X.509 certificate with an excessively large OCTET STRING value in extensions such as the Subject Key Identifier (SKID) or Authority Key Identifier (AKID) which are being converted to hex, the size of the buffer needed for the result is calculated as multiplication of the input length by 3. On 32 bit platforms, this multiplication may overflow resulting in the allocation of a smaller buffer and a heap buffer overflow.  Applications and services that print or log contents of untrusted X.509 certificates are vulnerable to this issue. As the certificates would have to have sizes of over 1 Gigabyte, printing or logging such certificates is a fairly unlikely operation and only 32 bit platforms are affected, this issue was assigned Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2026-31789 (Critical)
- **Package:** openssl-provider-legacy @ 3.5.1-1 (deb)
- **Status:** fixed
- **Fix available: 3.5.5-1~deb13u2**
- **Source:** https://security-tracker.debian.org/tracker/CVE-2026-31789

Issue summary: Converting an excessively large OCTET STRING value to a hexadecimal string leads to a heap buffer overflow on 32 bit platforms.  Impact summary: A heap buffer overflow may lead to a crash or possibly an attacker controlled code execution or other undefined behavior.  If an attacker can supply a crafted X.509 certificate with an excessively large OCTET STRING value in extensions such as the Subject Key Identifier (SKID) or Authority Key Identifier (AKID) which are being converted to hex, the size of the buffer needed for the result is calculated as multiplication of the input length by 3. On 32 bit platforms, this multiplication may overflow resulting in the allocation of a smaller buffer and a heap buffer overflow.  Applications and services that print or log contents of untrusted X.509 certificates are vulnerable to this issue. As the certificates would have to have sizes of over 1 Gigabyte, printing or logging such certificates is a fairly unlikely operation and only 32 bit platforms are affected, this issue was assigned Low severity.  The FIPS modules in 3.6, 3.5, 3.4, 3.3 and 3.0 are not affected by this issue, as the affected code is outside the OpenSSL FIPS module boundary.

---

### CVE-2025-55130 (Critical)
- **Package:** node @ 20.19.4 (binary)
- **Status:** fixed
- **Fix available: 20.20.0, 22.22.0, 24.13.0, 25.3.0**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2025-55130

A flaw in Node.js’s Permissions model allows attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths. By chaining directories and symlinks, a script granted access only to the current directory can escape the allowed path and read sensitive files. This breaks the expected isolation guarantees and enables arbitrary file read/write, leading to potential system compromise.
This vulnerability affects users of the permission model on Node.js v20,  v22,  v24, and v25.

---

