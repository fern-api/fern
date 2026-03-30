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

- **Package:** path-to-regexp (npm)
- **Severity:** HIGH
- **Vulnerable versions:** < 0.1.13
- **Patched version:** 0.1.13
- **CVE:** CVE-2026-4867
- **GHSA:** GHSA-37ch-88jc-xwx2
- **Manifest:** pnpm-lock.yaml

**Summary:**
path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters

**Description:**
### Impact

A bad regular expression is generated any time you have three or more parameters within a single segment, separated by something that is not a period (`.`). For example, `/:a-:b-:c` or `/:a-:b-:c-:d`. The backtrack protection added in `path-to-regexp@0.1.12` only prevents ambiguity for two parameters. With three or more, the generated lookahead does not block single separator characters, so capture groups overlap and cause catastrophic backtracking.

### Patches

Upgrade to [path-to-regexp@0.1.13](https://github.com/pillarjs/path-to-regexp/releases/tag/v.0.1.13)

Custom regex patterns in route definitions (e.g., `/:a-:b([^-/]+)-:c([^-/]+)`) are not affected because they override the default capture group.

### Workarounds

All versions can be patched by providing a custom regular expression for parameters after the first in a single segment. As long as the custom regular expression does not match the text before the parameter, you will be safe. For example, change `/:a-:b-:c` to `/:a-:b([^-/]+)-:c([^-/]+)`.

If paths cannot be rewritten and versions cannot be upgraded, another alternative is to limit the URL length.

### References

- [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j)
- [Detailed blog post: ReDoS the web](https://blakeembrey.com/posts/2024-09-web-redos/)

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1266)
