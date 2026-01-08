@devin-ai-integration Please resolve this Dependabot security alert.

**Instructions:**
1. Analyze the vulnerability and understand its impact
2. Update the affected dependency to a secure version. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
3. Ideally resolve this without using an override - prefer updating the dependency directly
4. If an override is absolutely necessary, document why in the PR description
5. Run tests to ensure the update doesn't break anything
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/dependabot-alerts/alert-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Alert Details:**

- **Package:** urllib3 (pip)
- **Severity:** HIGH
- **Vulnerable versions:** >= 1.22, < 2.6.3
- **Patched version:** 2.6.3
- **CVE:** CVE-2026-21441
- **GHSA:** GHSA-38jv-5279-wg99
- **Manifest:** seed/python-sdk/exhaustive/wire-tests-custom-client-name/poetry.lock

**Summary:**
Decompression-bomb safeguards bypassed when following HTTP redirects (streaming API)

**Description:**
### Impact

urllib3's [streaming API](https://urllib3.readthedocs.io/en/2.6.2/advanced-usage.html#streaming-and-i-o) is designed for the efficient handling of large HTTP responses by reading the content in chunks, rather than loading the entire response body into memory at once.

urllib3 can perform decoding or decompression based on the HTTP `Content-Encoding` header (e.g., `gzip`, `deflate`, `br`, or `zstd`). When using the streaming API, the library decompresses only the necessary bytes, enabling partial content consumption.

However, for HTTP redirect responses, the library would read the entire response body to drain the connection and decompress the content unnecessarily. This decompression occurred even before any read methods were called, and configured read limits did not restrict the amount of decompressed data. As a result, there was no safeguard against decompression bombs. A malicious server could exploit this to trigger excessive resource consumption on the client (high CPU usage and large memory allocations for decompressed data; CWE-409).

### Affected usages

Applications and libraries using urllib3 version 2.6.2 and earlier to stream content from untrusted sources by setting `preload_content=False` when they do not disable redirects.


### Remediation

Upgrade to at least urllib3 v2.6.3 in which the library does not decode content of redirect responses when `preload_content=False`.

If upgrading is not immediately possible, disable [redirects](https://urllib3.readthedocs.io/en/2.6.2/user-guide.html#retrying-requests) by setting `redirect=False` for requests to untrusted source.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/832)
