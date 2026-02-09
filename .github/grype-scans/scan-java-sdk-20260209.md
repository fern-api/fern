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
- **Scan Date:** 2026-02-09T13:33:58.893Z
- **Total Vulnerabilities:** 9
- **Critical:** 0
- **High:** 5
- **Medium:** 2
- **Low:** 2

## Vulnerabilities

### ALAS2023-2026-1406 (High)
- **Package:** openssl-fips-provider-latest @ 1:3.2.2-1.amzn2023.0.3 (rpm)
- **Status:** fixed
- **Fix available: 3.2.2-1.amzn2023.0.4**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1406.html

A flaw was found in OpenSSL. A remote attacker can exploit a stack buffer overflow vulnerability by supplying a crafted Cryptographic Message Syntax (CMS) message with an oversized Initialization Vector (IV) when parsing AuthEnvelopedData structures that use Authenticated Encryption with Associated Data (AEAD) ciphers such as AES-GCM. This can lead to a crash, causing a Denial of Service (DoS), or potentially allow for remote code execution. (CVE-2025-15467)

---

### ALAS2023-2026-1406 (High)
- **Package:** openssl-libs @ 1:3.2.2-1.amzn2023.0.3 (rpm)
- **Status:** fixed
- **Fix available: 3.2.2-1.amzn2023.0.4**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1406.html

A flaw was found in OpenSSL. A remote attacker can exploit a stack buffer overflow vulnerability by supplying a crafted Cryptographic Message Syntax (CMS) message with an oversized Initialization Vector (IV) when parsing AuthEnvelopedData structures that use Authenticated Encryption with Associated Data (AEAD) ciphers such as AES-GCM. This can lead to a crash, causing a Denial of Service (DoS), or potentially allow for remote code execution. (CVE-2025-15467)

---

### ALAS2023-2026-1395 (High)
- **Package:** libtasn1 @ 4.19.0-1.amzn2023.0.5 (rpm)
- **Status:** fixed
- **Fix available: 4.19.0-1.amzn2023.0.6**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1395.html

Stack-based buffer overflow in libtasn1 version: v4.20.0. The function fails to validate the size of input data resulting in a buffer overflow in asn1_expend_octet_string. (CVE-2025-13151)

---

### ALAS2023-2026-1389 (High)
- **Package:** libcap @ 2.73-1.amzn2023.0.5 (rpm)
- **Status:** fixed
- **Fix available: 2.73-1.amzn2023.0.6**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1389.html

net/http: memory exhaustion in Request.ParseForm (CVE-2025-61726)archive/zip: denial of service when parsing arbitrary ZIP archives (CVE-2025-61728)crypto/tls: handshake messages may be processed at the incorrect encryption level (CVE-2025-61730)cmd/go: bypass of flag sanitization can lead to arbitrary code execution (CVE-2025-61731)cmd/go: unexpected code execution when invoking toolchain (CVE-2025-68119)crypto/tls: Config.Clone copies automatically generated session ticket keys, session resumption does not account for the expiration of full certificate chain (CVE-2025-68121)

---

### ALAS2023-2026-1416 (High)
- **Package:** python3-pip-wheel @ 21.3.1-2.amzn2023.0.15 (rpm)
- **Status:** fixed
- **Fix available: 21.3.1-2.amzn2023.0.16**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1416.html

urllib3 is an HTTP client library for Python. urllib3's streaming API is designed for the efficient handling of large HTTP responses by reading the content in chunks, rather than loading the entire response body into memory at once. urllib3 can perform decoding or decompression based on the HTTP `Content-Encoding` header (e.g., `gzip`, `deflate`, `br`, or `zstd`). When using the streaming API, the library decompresses only the necessary bytes, enabling partial content consumption. Starting in version 1.22 and prior to version 2.6.3, for HTTP redirect responses, the library would read the entire response body to drain the connection and decompress the content unnecessarily. This decompression occurred even before any read methods were called, and configured read limits did not restrict the amount of decompressed data. As a result, there was no safeguard against decompression bombs. A malicious server could exploit this to trigger excessive resource consumption on the client. Applications and libraries are affected when they stream content from untrusted sources by setting `preload_content=False` when they do not disable redirects. Users should upgrade to at least urllib3 v2.6.3, in which the library does not decode content of redirect responses when `preload_content=False`. If upgrading is not immediately possible, disable redirects by setting `redirect=False` for requests to untrusted source. (CVE-2026-21441)

---

### ALAS2023-2026-1396 (Medium)
- **Package:** libxml2 @ 2.10.4-1.amzn2023.0.15 (rpm)
- **Status:** fixed
- **Fix available: 2.10.4-1.amzn2023.0.16**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1396.html

A flaw was found in libxml2, an XML parsing library. This uncontrolled recursion vulnerability occurs in the xmlCatalogXMLResolveURI function when an XML catalog contains a delegate URI entry that references itself. A remote attacker could exploit this configuration-dependent issue by providing a specially crafted XML catalog, leading to infinite recursion and call stack exhaustion. This ultimately results in a segmentation fault, causing a Denial of Service (DoS) by crashing affected applications. (CVE-2026-0990)A flaw was found in the libxml2 library. This uncontrolled resource consumption vulnerability occurs when processing XML catalogs that contain repeated <nextCatalog> elements pointing to the same downstream catalog. A remote attacker can exploit this by supplying crafted catalogs, causing the parser to redundantly traverse catalog chains. This leads to excessive CPU consumption and degrades application availability, resulting in a denial-of-service condition. (CVE-2026-0992)

---

### ALAS2023-2026-1390 (Medium)
- **Package:** libpng @ 2:1.6.37-10.amzn2023.0.8 (rpm)
- **Status:** fixed
- **Fix available: 1.6.37-10.amzn2023.0.9**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1390.html

LIBPNG is a reference library for use in applications that read, create, and manipulate PNG (Portable Network Graphics) raster image files. From 1.6.51 to 1.6.53, there is a heap buffer over-read in the libpng simplified API function png_image_finish_read when processing interlaced 16-bit PNGs with 8-bit output format and non-minimal row stride. This is a regression introduced by the fix for CVE-2025-65018. This vulnerability is fixed in 1.6.54. (CVE-2026-22695)LIBPNG is a reference library for use in applications that read, create, and manipulate PNG (Portable Network Graphics) raster image files. From 1.6.26 to 1.6.53, there is an integer truncation in the libpng simplified write API functions png_write_image_16bit and png_write_image_8bit causes heap buffer over-read when the caller provides a negative row stride (for bottom-up image layouts) or a stride exceeding 65535 bytes. The bug was introduced in libpng 1.6.26 (October 2016) by casts added to silence compiler warnings on 16-bit systems. This vulnerability is fixed in 1.6.54. (CVE-2026-22801)

---

### ALAS2023-2026-1397 (Low)
- **Package:** libxml2 @ 2.10.4-1.amzn2023.0.15 (rpm)
- **Status:** fixed
- **Fix available: 2.10.4-1.amzn2023.0.17**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1397.html

A flaw was identified in the RelaxNG parser of libxml2 related to how external schema inclusions are handled. The parser does not enforce a limit on inclusion depth when resolving nested <include> directives. Specially crafted or overly complex schemas can cause excessive recursion during parsing. This may lead to stack exhaustion and application crashes, creating a denial-of-service risk. (CVE-2026-0989)

---

### ALAS2023-2026-1422 (Low)
- **Package:** unzip @ 6.0-57.amzn2023.0.2 (rpm)
- **Status:** fixed
- **Fix available: 6.0-68.amzn2023.0.1**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1422.html

Info-ZIP UnZip 6.0 mishandles the overlapping of files inside a ZIP container, leading to denial of service (resource consumption), aka a "better zip bomb" issue. (CVE-2019-13232)

---

