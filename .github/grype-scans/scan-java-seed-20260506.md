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
- **Container:** java-seed
- **Scan Date:** 2026-05-06T12:41:01.210Z
- **Total Vulnerabilities:** 15
- **Critical:** 0
- **High:** 4
- **Medium:** 5
- **Low:** 6

## Vulnerabilities

### CVE-2026-22016 (High)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22016

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JAXP).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized access to critical data or complete access to all Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 7.5 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N).

---

### CVE-2026-22016 (High)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22016

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JAXP).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized access to critical data or complete access to all Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 7.5 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N).

---

### CVE-2026-34282 (High)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-34282

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Networking).  Supported versions that are affected are Oracle Java SE: 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a hang or frequently repeatable crash (complete DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 7.5 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H).

---

### CVE-2026-34282 (High)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-34282

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Networking).  Supported versions that are affected are Oracle Java SE: 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a hang or frequently repeatable crash (complete DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 7.5 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H).

---

### CVE-2026-22013 (Medium)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22013

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JGSS).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks require human interaction from a person other than the attacker. Successful attacks of this vulnerability can result in  unauthorized access to critical data or complete access to all Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. This vulnerability does not apply to Java deployments, typically in servers, that load and run only trusted code (e.g., code installed by an administrator). CVSS 3.1 Base Score 5.3 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N).

---

### CVE-2026-22013 (Medium)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22013

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JGSS).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks require human interaction from a person other than the attacker. Successful attacks of this vulnerability can result in  unauthorized access to critical data or complete access to all Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. This vulnerability does not apply to Java deployments, typically in servers, that load and run only trusted code (e.g., code installed by an administrator). CVSS 3.1 Base Score 5.3 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N).

---

### CVE-2026-22021 (Medium)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22021

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JSSE).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via HTTPS to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a partial denial of service (partial DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 5.3 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L).

---

### CVE-2026-22021 (Medium)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22021

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: JSSE).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Easily exploitable vulnerability allows unauthenticated attacker with network access via HTTPS to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a partial denial of service (partial DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 5.3 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L).

---

### CVE-2026-23865 (Medium)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-23865

An integer overflow in the tt_var_load_item_variation_store function of the Freetype library in versions 2.13.2 and 2.13.3 may allow for an out of bounds read operation when parsing HVAR/VVAR/MVAR tables in OpenType variable fonts. This issue is fixed in version 2.14.2.

---

### CVE-2026-22018 (Low)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22018

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Libraries).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a partial denial of service (partial DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 3.7 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L).

---

### CVE-2026-22018 (Low)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22018

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Libraries).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with network access via multiple protocols to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in unauthorized ability to cause a partial denial of service (partial DOS) of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 3.7 (Availability impacts).  CVSS Vector: (CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L).

---

### CVE-2026-22007 (Low)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22007

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Security).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with logon to the infrastructure where Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition executes to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 2.9 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:L/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N).

---

### CVE-2026-34268 (Low)
- **Package:** openjdk @ 1.8.0_482-b08 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-34268

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Security).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with logon to the infrastructure where Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition executes to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 2.9 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:L/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N).

---

### CVE-2026-22007 (Low)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-22007

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Security).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with logon to the infrastructure where Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition executes to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 2.9 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:L/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N).

---

### CVE-2026-34268 (Low)
- **Package:** openjdk @ 11.0.30+7 (binary)
- **Status:** fixed
- **Fix available: 1.8.0_492, 8.0.492, 11.0.31, 17.0.19, 21.0.11, 25.0.3, 26.0.1**
- **Source:** https://nvd.nist.gov/vuln/detail/CVE-2026-34268

Vulnerability in the Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition product of Oracle Java SE (component: Security).  Supported versions that are affected are Oracle Java SE: 8u481, 8u481-b50, 8u481-perf, 11.0.30, 17.0.18, 21.0.10, 25.0.2, 26; Oracle GraalVM for JDK: 17.0.18 and  21.0.10; Oracle GraalVM Enterprise Edition: 21.3.17. Difficult to exploit vulnerability allows unauthenticated attacker with logon to the infrastructure where Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition executes to compromise Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition.  Successful attacks of this vulnerability can result in  unauthorized read access to a subset of Oracle Java SE, Oracle GraalVM for JDK, Oracle GraalVM Enterprise Edition accessible data. Note: This vulnerability can be exploited by using APIs in the specified Component, e.g., through a web service which supplies data to the APIs. This vulnerability also applies to Java deployments, typically in clients running sandboxed Java Web Start applications or sandboxed Java applets, that load and run untrusted code (e.g., code that comes from the internet) and rely on the Java sandbox for security. CVSS 3.1 Base Score 2.9 (Confidentiality impacts).  CVSS Vector: (CVSS:3.1/AV:L/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N).

---

