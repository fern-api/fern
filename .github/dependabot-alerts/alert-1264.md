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

- **Package:** picomatch (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 2.3.2
- **Patched version:** 2.3.2
- **CVE:** CVE-2026-33672
- **GHSA:** GHSA-3v7f-55p6-f55p
- **Manifest:** pnpm-lock.yaml

**Summary:**
Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching

**Description:**
### Impact
picomatch is vulnerable to a **method injection vulnerability (CWE-1321)** affecting the `POSIX_REGEX_SOURCE` object. Because the object inherits from `Object.prototype`, specially crafted POSIX bracket expressions (e.g., `[[:constructor:]]`) can reference inherited method names. These methods are implicitly converted to strings and injected into the generated regular expression.

This leads to **incorrect glob matching behavior (integrity impact)**, where patterns may match unintended filenames. The issue does **not enable remote code execution**, but it can cause security-relevant logic errors in applications that rely on glob matching for filtering, validation, or access control.

All users of affected `picomatch` versions that process untrusted or user-controlled glob patterns are potentially impacted.

### Patches

This issue is fixed in picomatch 4.0.4, 3.0.2 and 2.3.2.

Users should upgrade to one of these versions or later, depending on their supported release line.

### Workarounds

If upgrading is not immediately possible, avoid passing untrusted glob patterns to picomatch.

Possible mitigations include:
- Sanitizing or rejecting untrusted glob patterns, especially those containing POSIX character classes like `[[:...:]]`.
- Avoiding the use of POSIX bracket expressions if user input is involved.
- Manually patching the library by modifying `POSIX_REGEX_SOURCE` to use a null prototype:

  ```js
  const POSIX_REGEX_SOURCE = {
    __proto__: null,
    alnum: 'a-zA-Z0-9',
    alpha: 'a-zA-Z',
    // ... rest unchanged
  };
  
### Resources

- fix for similar issue: https://github.com/micromatch/picomatch/pull/144
- picomatch repository https://github.com/micromatch/picomatch

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1264)
