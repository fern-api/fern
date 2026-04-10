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
- **Scan Date:** 2026-04-10T12:13:28.003Z
- **Total Vulnerabilities:** 7
- **Critical:** 0
- **High:** 1
- **Medium:** 4
- **Low:** 2

## Vulnerabilities

### CVE-2026-21710 (High)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21710

A flaw in Node.js HTTP request handling causes an uncaught `TypeError` when a request is received with a header named `__proto__` and the application accesses `req.headersDistinct`.

When this occurs, `dest["__proto__"]` resolves to `Object.prototype` rather than `undefined`, causing `.push()` to be called on a non-array. This exception is thrown synchronously inside a property getter and cannot be intercepted by `error` event listeners, meaning it cannot be handled without wrapping every `req.headersDistinct` access in a `try/catch`.

* This vulnerability affects all Node.js HTTP servers on **20.x, 22.x, 24.x, and v25.x**

---

### CVE-2026-21717 (Medium)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21717

A flaw in V8's string hashing mechanism causes integer-like strings to be hashed to their numeric value, making hash collisions trivially predictable. By crafting a request that causes many such collisions in V8's internal string table, an attacker can significantly degrade performance of the Node.js process.

The most common trigger is any endpoint that calls `JSON.parse()` on attacker-controlled input, as JSON parsing automatically internalizes short strings into the affected hash table.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x**.

---

### CVE-2026-21713 (Medium)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21713

A flaw in Node.js HMAC verification uses a non-constant-time comparison when validating user-provided signatures, potentially leaking timing information proportional to the number of matching bytes. Under certain threat models where high-resolution timing measurements are possible, this behavior could be exploited as a timing oracle to infer HMAC values.

Node.js already provides timing-safe comparison primitives used elsewhere in the codebase, indicating this is an oversight rather than an intentional design decision.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x**.

---

### CVE-2026-21714 (Medium)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21714

A memory leak occurs in Node.js HTTP/2 servers when a client sends WINDOW_UPDATE frames on stream 0 (connection-level) that cause the flow control window to exceed the maximum value of 2³¹-1. The server correctly sends a GOAWAY frame, but the Http2Session object is never cleaned up.

This vulnerability affects HTTP2 users on Node.js 20, 22, 24 and 25.

---

### CVE-2026-21712 (Medium)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21712

A flaw in Node.js URL processing causes an assertion failure in native code when `url.format()` is called with a malformed internationalized domain name (IDN) containing invalid characters, crashing the Node.js process.

---

### CVE-2026-21715 (Low)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21715

A flaw in Node.js Permission Model filesystem enforcement leaves `fs.realpathSync.native()` without the required read permission checks, while all comparable filesystem functions correctly enforce them.

As a result, code running under `--permission` with restricted `--allow-fs-read` can still use `fs.realpathSync.native()` to check file existence, resolve symlink targets, and enumerate filesystem paths outside of permitted directories.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-read` is intentionally restricted.

---

### CVE-2026-21716 (Low)
- **Package:** node @ 24.13.0 (binary)
- **Status:** fixed
- **Fix available: 20.20.2, 24.14.1, 25.8.2**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-21716

An incomplete fix for CVE-2024-36137 leaves `FileHandle.chmod()` and `FileHandle.chown()` in the promises API without the required permission checks, while their callback-based equivalents (`fs.fchmod()`, `fs.fchown()`) were correctly patched.

As a result, code running under `--permission` with restricted `--allow-fs-write` can still use promise-based `FileHandle` methods to modify file permissions and ownership on already-open file descriptors, bypassing the intended write restrictions.

This vulnerability affects **20.x, 22.x, 24.x, and 25.x** processes using the Permission Model where `--allow-fs-write` is intentionally restricted.

---

