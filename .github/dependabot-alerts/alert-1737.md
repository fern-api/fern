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

- **Package:** langchain-openai (pip)
- **Severity:** LOW
- **Vulnerable versions:** < 1.1.14
- **Patched version:** 1.1.14
- **CVE:** N/A
- **GHSA:** GHSA-r7w7-9xr2-qq2r
- **Manifest:** seed/python-sdk/exhaustive/deps_with_min_python_version/poetry.lock

**Summary:**
langchain-openai: Image token counting SSRF protection can be bypassed via DNS rebinding

**Description:**
## Summary

`langchain-openai`'s `_url_to_size()` helper (used by `get_num_tokens_from_messages` for image token counting) validated URLs for SSRF protection and then fetched them in a separate network operation with independent DNS resolution. This left a TOCTOU / DNS rebinding window: an attacker-controlled hostname could resolve to a public IP during validation and then to a private/localhost IP during the actual fetch.

The practical impact is limited because the fetched response body is passed directly to Pillow's `Image.open()` to extract dimensions — the response content is never returned, logged, or otherwise exposed to the caller. An attacker cannot exfiltrate data from internal services through this path. A potential risk is blind probing (inferring whether an internal host/port is open based on timing or error behavior).

## Affected versions

- `langchain-openai` < 1.1.14

## Patched versions

- `langchain-openai` >= 1.1.14 (requires `langchain-core` >= 1.2.31)

## Affected code

**File:** `libs/partners/openai/langchain_openai/chat_models/base.py` — `_url_to_size()`

The vulnerable pattern was a validate-then-fetch with separate DNS resolution:

```python
validate_safe_url(image_source, allow_private=False, allow_http=True)
# ... separate network operation with independent DNS resolution ...
response = httpx.get(image_source, timeout=timeout)
```

## Fix

The fix replaces the validate-then-fetch pattern with an SSRF-safe httpx transport (`SSRFSafeSyncTransport` from `langchain-core`) that:

- Resolves DNS once and validates all returned IPs against a policy (private ranges, cloud metadata, localhost, k8s internal DNS)
- Pins the connection to the validated IP, eliminating the DNS rebinding window
- Disables redirect following to prevent redirect-based SSRF bypasses

This fix was released in langchain-openai 1.1.14.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1737)
