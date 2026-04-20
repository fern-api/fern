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

- **Package:** langchain (pip)
- **Severity:** LOW
- **Vulnerable versions:** < 0.2.0
- **Patched version:** 0.2.0
- **CVE:** CVE-2024-8309
- **GHSA:** GHSA-45pg-36p6-83v9
- **Manifest:** seed/python-sdk/exhaustive/deps_with_min_python_version/poetry.lock

**Summary:**
Langchain SQL Injection vulnerability

**Description:**
A vulnerability in the GraphCypherQAChain class of langchain-ai/langchain version 0.2.5 allows for SQL injection through prompt injection. This vulnerability can lead to unauthorized data manipulation, data exfiltration, denial of service (DoS) by deleting all data, breaches in multi-tenant security environments, and data integrity issues. Attackers can create, update, or delete nodes and relationships without proper authorization, extract sensitive data, disrupt services, access data across different tenants, and compromise the integrity of the database.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2006)
