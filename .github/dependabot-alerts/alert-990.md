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

- **Package:** Pygments (pip)
- **Severity:** LOW
- **Vulnerable versions:** <= 2.19.2
- **Patched version:** No patch available
- **CVE:** CVE-2026-4539
- **GHSA:** GHSA-5239-wwwm-4pmq
- **Manifest:** generators/python/poetry.lock

**Summary:**
Pygments has Regular Expression Denial of Service (ReDoS) due to Inefficient Regex for GUID Matching

**Description:**
A security flaw has been discovered in pygments up to 2.19.2. The impacted element is the function AdlLexer of the file pygments/lexers/archetype.py. The manipulation results in inefficient regular expression complexity. The attack is only possible with local access. The exploit has been released to the public and may be used for attacks. The project was informed of the problem early through an issue report but has not responded yet.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/990)
