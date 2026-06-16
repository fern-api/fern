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

- **Package:** @opentelemetry/core (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 2.8.0
- **Patched version:** 2.8.0
- **CVE:** CVE-2026-54285
- **GHSA:** GHSA-8988-4f7v-96qf
- **Manifest:** pnpm-lock.yaml

**Summary:**
OpenTelemetry Core: Unbounded memory allocation in W3C Baggage propagation

**Description:**
## Overview

`W3CBaggagePropagator.extract()` in `@opentelemetry/core` does not enforce size limits when parsing inbound `baggage` HTTP headers. The W3C Baggage specification recommends a maximum of 8,192 bytes and 180 entries; these limits were only enforced on the outbound (`inject()`) path, not on the inbound (`extract()`) path. Parsing oversized baggage causes memory allocation proportional to the header size without any cap.

## Impact

The practical availability impact for most Node.js deployments is limited. Node.js enforces a default `--max-http-header-size` of 16,384 bytes on the total combined size of all HTTP headers, constraining what an external attacker can deliver before the propagator is reached. Additionally, the header is already in memory (parsed by the HTTP layer) by the time it reaches the propagator - the additional allocation is the overhead of splitting into entry objects, not an unbounded read.

The risk is higher when transport-layer limits are absent - e.g., non-HTTP transports (messaging systems, custom `TextMapGetter` implementations) or deployments that have raised `--max-http-header-size`.

## Remediation

Update `@opentelemetry/core` to version 2.8.0 or later. The fix enforces limits consistent with the W3C Baggage specification at the propagator level:

- Maximum total baggage size: 8,192 bytes
- Maximum number of entries: 180
- Maximum per-entry size: 4,096 bytes

Headers that exceed these limits are truncated at the point the limit is reached.

## Workarounds

Ensure header size limits are configured at the server or gateway level. The default Node.js HTTP header limit (16 KB) mitigates external attack vectors independently of this fix. For non-HTTP transports receiving baggage from untrusted sources, validate input size before passing it to the propagator.

## References

- [W3C Baggage Specification - Limits](https://www.w3.org/TR/baggage/#limits)
- opentelemetry-java: [GHSA-rcgg-9c38-7xpx](https://github.com/open-telemetry/opentelemetry-java/security/advisories/GHSA-rcgg-9c38-7xpx)
- opentelemetry-go: [GHSA-mh2q-q3fh-2475](https://github.com/open-telemetry/opentelemetry-go/security/advisories/GHSA-mh2q-q3fh-2475)

## Credit

Reported by tonghuaroot.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2095)
