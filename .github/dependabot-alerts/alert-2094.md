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

- **Package:** form-data (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 4.0.0, < 4.0.6
- **Patched version:** 4.0.6
- **CVE:** CVE-2026-12143
- **GHSA:** GHSA-hmw2-7cc7-3qxx
- **Manifest:** pnpm-lock.yaml

**Summary:**
form-data: CRLF injection in form-data via unescaped multipart field names and filenames

**Description:**
## Summary

`form-data` builds `multipart/form-data` request bodies. Through v4.0.5, the `field` name passed to `FormData#append` and the `filename` option are concatenated directly into the `Content-Disposition` header with no escaping of CR (`\r`), LF (`\n`), or `"`. An application that uses **untrusted input as a field name or filename** therefore lets an attacker terminate the header line and either inject additional headers or smuggle whole additional multipart parts into the request the application forwards to a backend.

This is CWE-93 (CRLF injection). It is a divergence from how browsers and the WHATWG HTML spec serialize form-data (they escape these characters), so the fix is to match that behavior. Severity is **conditional**: it depends on the consuming application passing attacker-controlled data as a field name or filename. Applications that only use fixed/trusted field names are not affected.

## Details

In `lib/form_data.js`, `_multiPartHeader` builds the part header as:

```javascript
'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || [])
```

and `_getContentDisposition` builds `filename="' + filename + '"'`. Neither escapes control characters, so a `\r\n` in `field`/`filename` ends the header line. The same applies to `"`, which can break out of the quoted parameter.

### Proof of concept

```javascript
const FormData = require('form-data');
const form = new FormData();
form.append('email"\r\nX-Injected: true\r\nfake="', 'user@example.com');
console.log(form.getBuffer().toString());
```

Before the fix this emits an injected `X-Injected: true` header line. A field name that also includes `--<boundary>` sequences can introduce additional parts (e.g. an extra `name="is_admin"` field), which a downstream parser accepts as legitimate.

## Impact

For an application that uses untrusted field names/filenames:

- **Field injection / override (integrity).** Inject or override fields the backend trusts (e.g. `is_admin`, `role`) — the primary demonstrated impact.
- **Header injection** into the generated multipart part.

Claims of guaranteed privilege escalation, authentication bypass, high confidentiality impact, and availability impact are application-dependent downstream consequences, not properties of `form-data` itself, and are not demonstrated by the PoC.

### Severity

The demonstrated, library-attributable impact is integrity (field/header injection); there is no demonstrated confidentiality disclosure or availability impact in `form-data` itself, and exploitation requires the consuming app to feed untrusted data into field names/filenames. A Moderate (≈5.3, `I:L`) rating is also defensible given that precondition.

## Patch

Fixed in **4.0.6**, **3.0.5**, and **2.5.6**. Users on older 0.x/1.x/2.x releases should upgrade to 2.5.6 or later.

The fix escapes `\r`, `\n`, and `"` as `%0D`, `%0A`, and `%22` in field names and filenames, matching the WHATWG HTML `multipart/form-data` encoding algorithm that browsers implement. This neutralizes the injection while leaving ordinary field names (including `name[0]`, dotted, and unicode names) unchanged.

## Workaround

Until upgrading, validate or reject field names/filenames that contain control characters before calling `append`:

```javascript
if (/[\r\n]/.test(field)) { throw new Error('invalid field name'); }
```

## Credit

Reported by [yueyueL](https://github.com/yueyueL).

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2094)
