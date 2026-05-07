@devin-ai-integration Please remediate the container vulnerabilities found by today's grype scan of the container specified in the summary below.

**Instructions:**
1. Analyze each vulnerability and understand its impact
2. For OS-level vulnerabilities, consider updating the base image or specific packages
3. For Python dependencies, update the affected packages in pyproject.toml/poetry.lock. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
4. Run tests to ensure the updates don't break anything
5. Build the container locally and re-scan to confirm your changes actually address the CVEs.
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/grype-scans/scan-*.md) as part of your fix
8. Update the PR title, if needed, to pass CI checks

**Vulnerability Details:**


## Summary
- **Container:** csharp-seed
- **Scan Date:** 2026-05-07T11:54:47.052Z
- **Total Vulnerabilities:** 3
- **Critical:** 0
- **High:** 3
- **Medium:** 0
- **Low:** 0

## Vulnerabilities

### GHSA-7jgj-8wvc-jh57 (High)
- **Package:** System.Net.Http @ 4.3.0 (dotnet)
- **Status:** fixed
- **Fix available: 4.3.4**
- **Source:** https://github.com/advisories/GHSA-7jgj-8wvc-jh57

.NET Core Information Disclosure

---

### GHSA-37gx-xxp4-5rgx (High)
- **Package:** System.Security.Cryptography.Xml @ 10.0.5 (dotnet)
- **Status:** fixed
- **Fix available: 10.0.6**
- **Source:** https://github.com/advisories/GHSA-37gx-xxp4-5rgx

Microsoft Security Advisory CVE-2026-33116 – .NET, .NET Framework, and Visual Studio Denial of Service Vulnerability

---

### GHSA-w3x6-4m5h-cxqf (High)
- **Package:** System.Security.Cryptography.Xml @ 10.0.5 (dotnet)
- **Status:** fixed
- **Fix available: 10.0.6**
- **Source:** https://github.com/advisories/GHSA-w3x6-4m5h-cxqf

Microsoft Security Advisory CVE-2026-26171 – .NET Denial of Service Vulnerability

---

