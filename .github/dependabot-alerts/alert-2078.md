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

- **Package:** qs (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 6.11.1, <= 6.15.1
- **Patched version:** 6.15.2
- **CVE:** CVE-2026-8723
- **GHSA:** GHSA-q8mj-m7cp-5q26
- **Manifest:** pnpm-lock.yaml

**Summary:**
qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set

**Description:**
### Summary

`qs.stringify` throws `TypeError` when called with `arrayFormat: 'comma'` and `encodeValuesOnly: true` on an array containing `null` or `undefined`. The throw is synchronous and not handled by any of qs's null-related options (`skipNulls`, `strictNullHandling`).

### Details

In the comma + `encodeValuesOnly` branch, `lib/stringify.js:145` mapped the array through the raw encoder before joining:

```js
obj = utils.maybeMap(obj, encoder);
```

`utils.encode` (`lib/utils.js:195`) reads `str.length` with no null guard, so a `null` or `undefined` element throws `TypeError`. `skipNulls` and `strictNullHandling` are both checked in the per-element loop below this line and never get a chance to run.

Same class of bug as the filter-array path fixed in 0c180a4. The vulnerable shape of the comma + `encodeValuesOnly` branch was introduced in 4c4b23d ("encode comma values more consistently", PR #463, 2023-01-19), first released in v6.11.1.

#### PoC

```js
const qs = require('qs');

qs.stringify({ a: [null, 'b'] },      { arrayFormat: 'comma', encodeValuesOnly: true });
qs.stringify({ a: [undefined, 'b'] }, { arrayFormat: 'comma', encodeValuesOnly: true });
qs.stringify({ a: [null] },           { arrayFormat: 'comma', encodeValuesOnly: true });
// TypeError: Cannot read properties of null (reading 'length')
//     at encode (lib/utils.js:195:13)
//     at Object.maybeMap (lib/utils.js:322:37)
//     at stringify (lib/stringify.js:145:25)
```

#### Fix

`lib/stringify.js:145`, applied in 21f80b3 on `main`:

```diff
- obj = utils.maybeMap(obj, encoder);
+ obj = utils.maybeMap(obj, function (v) {
+     return v == null ? v : encoder(v);
+ });
```

`null` and `undefined` now pass through `maybeMap` unchanged and reach the `join(',')` step as-is. For `{ a: [null, 'b'] }` this produces `a=,b`, matching the non-`encodeValuesOnly` comma path (which already joins before encoding and produces `a=%2Cb` for the same input). Single-element `[null]` arrays still collapse via the existing `obj.join(',') || null` and remain subject to `skipNulls` / `strictNullHandling` in the main loop.

### Affected versions

`>=6.11.1 <=6.15.1`

The vulnerable code shape was introduced in 4c4b23d and first shipped in v6.11.1. Earlier versions — including all of 6.7.x, 6.8.x, 6.9.x, 6.10.x, and 6.11.0 — implemented the comma + `encodeValuesOnly` path differently (joining before encoding) and are not affected. Empirically verified across released versions.

### Impact

Application code that calls `qs.stringify` with both `arrayFormat: 'comma'` and `encodeValuesOnly: true` (both non-default) on input that may contain a `null` or `undefined` array element will throw synchronously instead of producing a query string. In a typical Node.js HTTP framework (Express, Fastify, Koa, hapi) the sync throw is caught by the framework's error boundary and the affected request returns a 500; the worker process does not exit and subsequent requests are unaffected. The "kills the worker process" framing applies only to call sites outside a request-handler error boundary (background jobs, startup paths, stream pipelines) or to deployments with framework error handling explicitly disabled.

The vulnerable input is a `null` or `undefined` entry inside an array; this is reachable from JSON request bodies or from application code constructing arrays from user input, but not from standard HTML form submissions (which produce strings or omitted fields, not literal `null`).

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2078)
