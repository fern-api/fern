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

- **Package:** starlette (pip)
- **Severity:** HIGH
- **Vulnerable versions:** >= 0.4.1, < 1.3.1
- **Patched version:** 1.3.1
- **CVE:** CVE-2026-54283
- **GHSA:** GHSA-82w8-qh3p-5jfq
- **Manifest:** generators/python/poetry.lock

**Summary:**
Starlette: request.form() limits silently ignored for application/x-www-form-urlencoded enable DoS

**Description:**
### Summary
`request.form()` accepts `max_fields` and `max_part_size` to bound resource consumption while parsing form data. These limits are enforced for `multipart/form-data`, but silently ignored for `application/x-www-form-urlencoded`. An unauthenticated attacker can therefore send a urlencoded body with an arbitrarily large number of fields or an arbitrarily large field, even when the application configured limits it believed would apply.

### Details
`request.form()` dispatches to a different parser depending on the `Content-Type`. For `multipart/form-data` the `max_files`, `max_fields`, and `max_part_size` limits are forwarded to the parser, but for `application/x-www-form-urlencoded` the parser is constructed without them. It has no `max_fields` or `max_part_size` parameter to receive them, and it appends every field with no count check and accumulates each field's name and value with no size check. The configured limits are therefore both unreachable and unenforced for url-encoded bodies.

Because the url-encoded parser does its work synchronously between stream reads, the two attack shapes have different effects:

- **Field count** drives CPU and event-loop blocking. A body of ~1,000,000 fields (a sub-10MB payload such as `f0=v&f1=v&...`) blocks the worker's event loop for several seconds while parsing, during which the worker serves no other request.
- **Field size** drives memory. A single large field value (e.g. a 50MB value) is buffered in full to build the `FormData`, forcing memory allocation proportional to the request body.

The equivalent `multipart/form-data` request is correctly rejected with `400 Too many fields` / `400 Field exceeded maximum size`.

### Impact
This Denial of service (DoS) vulnerability affects all applications built with Starlette (or FastAPI) that call `request.form()` on `application/x-www-form-urlencoded` requests. A single request with a very large number of fields blocks the event loop for several seconds, and a single request with a very large field forces unbounded memory allocation; in either case, parallel requests can render the service unusable. A reverse proxy that enforces a request body size limit reduces but does not eliminate the exposure, since a sub-10MB body is already enough to block the event loop.

### Mitigation
Upgrade to a patched version, which forwards `max_fields` and `max_part_size` to the url-encoded parser and enforces them while parsing, raising before the oversized field or excess fields are accumulated. The defaults match `multipart/form-data` (`max_fields=1000`, `max_part_size=1MB`) and can be customized via `request.form(max_fields=..., max_part_size=...)`.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2087)
