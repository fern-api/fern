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

- **Package:** langchain-community (pip)
- **Severity:** HIGH
- **Vulnerable versions:** < 0.2.4
- **Patched version:** 0.2.4
- **CVE:** CVE-2024-5998
- **GHSA:** GHSA-f2jm-rw3h-6phg
- **Manifest:** seed/python-sdk/exhaustive/extra_dependencies/poetry.lock

**Summary:**
LangChain pickle deserialization of untrusted data

**Description:**
A vulnerability in the `FAISS.deserialize_from_bytes` function of langchain-ai/langchain allows for pickle deserialization of untrusted data. This can lead to the execution of arbitrary commands via the `os.system` function. The issue affects versions prior to 0.2.4.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2012)
