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
- **Scan Date:** 2026-05-06T12:41:31.351Z
- **Total Vulnerabilities:** 35
- **Critical:** 3
- **High:** 4
- **Medium:** 19
- **Low:** 9

## Vulnerabilities

### GHSA-hxrm-9w7p-39cc (High)
- **Package:** Microsoft.AspNetCore.Http @ 2.1.1-rtm-30846 (dotnet)
- **Status:** fixed
- **Fix available: 2.1.22**
- **Source:** https://github.com/advisories/GHSA-hxrm-9w7p-39cc

Cookie parsing failure

---

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

### GHSA-q834-8qmm-v933 (Medium)
- **Package:** OpenTelemetry.Exporter.OpenTelemetryProtocol @ 1.14.0.1849 (dotnet)
- **Status:** fixed
- **Fix available: 1.15.2**
- **Source:** https://github.com/advisories/GHSA-q834-8qmm-v933

OpenTelemetry dotnet: OTLP exporter reads unbounded HTTP response bodies

---

### GHSA-g94r-2vxg-569j (Medium)
- **Package:** OpenTelemetry.Api @ 1.14.0.1849 (dotnet)
- **Status:** fixed
- **Fix available: 1.15.3**
- **Source:** https://github.com/advisories/GHSA-g94r-2vxg-569j

OpenTelemetry dotnet: Excessive memory allocation when parsing OpenTelemetry propagation headers

---

### CVE-2026-27135 (Medium)
- **Package:** libnghttp2-14 @ 1.59.0-1ubuntu0.2 (deb)
- **Status:** fixed
- **Fix available: 1.59.0-1ubuntu0.3**
- **Source:** https://ubuntu.com/security/CVE-2026-27135

No description available

---

### GHSA-mr8r-92fq-pj8p (Medium)
- **Package:** OpenTelemetry.Exporter.OpenTelemetryProtocol @ 1.14.0.1849 (dotnet)
- **Status:** fixed
- **Fix available: 1.15.3**
- **Source:** https://github.com/advisories/GHSA-mr8r-92fq-pj8p

OpenTelemetry dotnet: Unbounded `grpc-status-details-bin` parsing in OTLP/gRPC retry handling

---

### CVE-2026-4878 (Medium)
- **Package:** libcap2 @ 1:2.66-5ubuntu2.2 (deb)
- **Status:** fixed
- **Fix available: 1:2.66-5ubuntu2.4**
- **Source:** https://ubuntu.com/security/CVE-2026-4878

No description available

---

### CVE-2026-5958 (Medium)
- **Package:** sed @ 4.9-2build1 (deb)
- **Status:** fixed
- **Fix available: 4.9-2ubuntu0.24.04.1**
- **Source:** https://ubuntu.com/security/CVE-2026-5958

No description available

---

### GHSA-4625-4j76-fww9 (Medium)
- **Package:** OpenTelemetry.Exporter.OpenTelemetryProtocol @ 1.14.0.1849 (dotnet)
- **Status:** fixed
- **Fix available: 1.15.3**
- **Source:** https://github.com/advisories/GHSA-4625-4j76-fww9

OpenTelemetry's disk retry default temp path enables local blob injection via OTLP Exporter

---

### CVE-2026-5545 (Medium)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5545

No description available

---

### CVE-2026-6253 (Medium)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6253

No description available

---

### CVE-2026-6429 (Medium)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6429

No description available

---

### CVE-2026-7168 (Medium)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-7168

No description available

---

### CVE-2026-5545 (Medium)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5545

No description available

---

### CVE-2026-6253 (Medium)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6253

No description available

---

### CVE-2026-6429 (Medium)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6429

No description available

---

### CVE-2026-7168 (Medium)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-7168

No description available

---

### CVE-2026-5545 (Medium)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5545

No description available

---

### CVE-2026-6253 (Medium)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6253

No description available

---

### CVE-2026-6429 (Medium)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6429

No description available

---

### CVE-2026-7168 (Medium)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-7168

No description available

---

### CVE-2026-4873 (Low)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-4873

No description available

---

### CVE-2026-5773 (Low)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5773

No description available

---

### CVE-2026-6276 (Low)
- **Package:** curl @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6276

No description available

---

### CVE-2026-4873 (Low)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-4873

No description available

---

### CVE-2026-5773 (Low)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5773

No description available

---

### CVE-2026-6276 (Low)
- **Package:** libcurl3t64-gnutls @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6276

No description available

---

### CVE-2026-4873 (Low)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-4873

No description available

---

### CVE-2026-5773 (Low)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-5773

No description available

---

### CVE-2026-6276 (Low)
- **Package:** libcurl4t64 @ 8.5.0-2ubuntu10.8 (deb)
- **Status:** fixed
- **Fix available: 8.5.0-2ubuntu10.9**
- **Source:** https://ubuntu.com/security/CVE-2026-6276

No description available

---

### GHSA-ghhp-997w-qr28 (Critical)
- **Package:** System.Text.Encodings.Web @ 4.6.26515.06 (dotnet)
- **Status:** fixed
- **Fix available: 4.7.2**
- **Source:** https://github.com/advisories/GHSA-ghhp-997w-qr28

.NET Core Remote Code Execution Vulnerability

---

### GHSA-ghhp-997w-qr28 (Critical)
- **Package:** System.Text.Encodings.Web @ 4.6.29812.01 (dotnet)
- **Status:** fixed
- **Fix available: 4.7.2**
- **Source:** https://github.com/advisories/GHSA-ghhp-997w-qr28

.NET Core Remote Code Execution Vulnerability

---

### GHSA-5rrx-jjjq-q2r5 (Critical)
- **Package:** Microsoft.AspNetCore.Server.Kestrel.Core @ 2.3.0-rtm-2620489 (dotnet)
- **Status:** fixed
- **Fix available: 2.3.6**
- **Source:** https://github.com/advisories/GHSA-5rrx-jjjq-q2r5

Microsoft Security Advisory CVE-2025-55315: .NET Security Feature Bypass Vulnerability

---

