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

- **Package:** brace-expansion (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 5.0.0, < 5.0.6
- **Patched version:** 5.0.6
- **CVE:** CVE-2026-45149
- **GHSA:** GHSA-jxxr-4gwj-5jf2
- **Manifest:** pnpm-lock.yaml

**Summary:**
brace-expansion: Large numeric range defeats documented `max` DoS protection

**Description:**
The `max` option was being applied too late:

When expanding a single large numeric range like `{1..10000000}`, the sequence generation loop generates all 10 million intermediate elements before the `max` limit is applied With `max=10`, the output is correctly limited to 10 items, but the process still allocates `~505 MB` and spends `~800ms` building the full intermediate array.

### Workaround

Ensure the string to be expanded doesn't contain more values than the desired `max` item count.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2071)
