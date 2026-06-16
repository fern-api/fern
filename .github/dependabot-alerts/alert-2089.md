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

- **Package:** @babel/core (npm)
- **Severity:** LOW
- **Vulnerable versions:** <= 7.29.0
- **Patched version:** 7.29.6
- **CVE:** CVE-2026-49356
- **GHSA:** GHSA-4x5r-pxfx-6jf8
- **Manifest:** pnpm-lock.yaml

**Summary:**
`@babel`/core: Arbitrary File Read via sourceMappingURL Comment

**Description:**
## Impact

Using `@babel/core` to compile maliciously crafted code can allow ab attacker to read any source map from the system that is running Babel, if these conditions are _all_ true:
- the attacker controls the input source code
- the attacker can read the output source code
- the attacker knows the path of the source map file that they want to read

**Users that only compile trusted code are not impacted.**

## Patches

The vulnerability has been fixed in `@babel/core@7.29.6` and `@babel/core@8.0.0-rc.6`.

## Workarounds

Callers can mitigate the issue without upgrading by setting [`inputSourceMap: false`](https://babeljs.io/docs/options#inputsourcemap) in their Babel options.

Callers can also manually extract the `#sourceMappingURL` comment from the input source code, validate whether the source map that it links to is allowed to be read, and if it is pass an object to `inputSourceMap` (passing `false` when it's not).

## Credits

Thanks Teodor-Cristian Radoi for reporting the vulnerability.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2089)
