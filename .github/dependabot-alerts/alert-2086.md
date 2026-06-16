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

- **Package:** Starlette (pip)
- **Severity:** LOW
- **Vulnerable versions:** < 1.3.0
- **Patched version:** 1.3.0
- **CVE:** CVE-2026-54282
- **GHSA:** GHSA-jp82-jpqv-5vv3
- **Manifest:** generators/python/poetry.lock

**Summary:**
Starlette: Unvalidated request path concatenated into authority poisons request.url.hostname

**Description:**
### Summary

In affected versions, the HTTP request path is not validated before being used to reconstruct `request.url`. Because `request.url` is rebuilt by concatenating `{scheme}://{host}{path}` and re-parsing the result, a path that does not begin with `/` (for example `@google.com`) moves the authority boundary during re-parsing, so `request.url.hostname` and `request.url.netloc` become attacker-controlled. Code that reads `request.url.hostname` (rather than the `Host` header or `scope`) can therefore be misled into trusting an attacker-supplied host.

### Details

When a client requests a path that does not start with `/`:

```http
GET `@google`.com HTTP/1.1
Host: localhost
```

affected versions reconstruct the URL as `http://localhost@google.com`. Per [RFC 3986 §3.2.1](https://www.rfc-editor.org/rfc/rfc3986.html#section-3.2.1), the substring before `@` in the authority is `userinfo`, so re-parsing yields `username = "localhost"` and `hostname = "google.com"`, with an empty path:

```text
request.url          == "http://localhost@google.com"
request.url.hostname == "google.com"
request.url.path     == ""
```

The root cause is that the path is concatenated directly after the host without a separating `/`, and without validating that it begins with one. Only the `Host` header was validated when constructing `request.url`; the path was not.

This requires an ASGI server that forwards a request-target lacking a leading `/` into `scope["path"]`.

### Impact

Any application running an affected version that uses `request.url`, `request.url.netloc`, or `request.url.hostname` for a security-sensitive decision (host-based authorization, redirect/callback base, SSRF target, cache key, audit log) may be affected, when no fronting proxy or load balancer rejects the malformed request-target first.

Note that this is less exploitable than [GHSA-86qp-5c8j-p5mr](https://github.com/Kludex/starlette/security/advisories/GHSA-86qp-5c8j-p5mr): there, the poison is carried in the `Host` header, so the real path still routes to a valid endpoint while `request.url.path` lies. Here, the poison must be carried in the path itself, and that path (`@google.com`) does not match any registered route, so routing returns `404` and no endpoint handler runs. The exposure is limited to code that reads `request.url` before routing - notably middleware - or in 404/exception handlers.

### Mitigation

Upgrade to a patched version, which prevents the request path from crossing into the URL authority. The request above instead yields `http://localhost/`@google`.com` with `request.url.hostname == "localhost"`.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2086)
