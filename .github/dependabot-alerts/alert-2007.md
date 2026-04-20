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

- **Package:** requests (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 2.33.0
- **Patched version:** 2.33.0
- **CVE:** CVE-2026-25645
- **GHSA:** GHSA-gc5v-m9x4-r6x2
- **Manifest:** seed/python-sdk/exhaustive/deps_with_min_python_version/poetry.lock

**Summary:**
Requests has Insecure Temp File Reuse in its extract_zipped_paths() utility function

**Description:**
### Impact
The `requests.utils.extract_zipped_paths()` utility function uses a predictable filename when extracting files from zip archives into the system temporary directory. If the target file already exists, it is reused without validation. A local attacker with write access to the temp directory could pre-create a malicious file that would be loaded in place of the legitimate one.

### Affected usages
**Standard usage of the Requests library is not affected by this vulnerability.** Only applications that call `extract_zipped_paths()` directly are impacted.

### Remediation
Upgrade to at least Requests 2.33.0, where the library now extracts files to a non-deterministic location.

If developers are unable to upgrade, they can set `TMPDIR` in their environment to a directory with restricted write access.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2007)
