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
- **Container:** java-sdk
- **Scan Date:** 2026-02-20T15:05:02.098Z
- **Total Vulnerabilities:** 8
- **Critical:** 0
- **High:** 2
- **Medium:** 4
- **Low:** 2

## Vulnerabilities

### ALAS2023-2026-1427 (High)
- **Package:** gnupg2-minimal @ 2.3.7-1.amzn2023.0.6 (rpm)
- **Status:** fixed
- **Fix available: 2.3.7-1.amzn2023.0.7**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1427.html

In GnuPG before 2.5.17, a stack-based buffer overflow exists in tpm2daemon during handling of the PKDECRYPT command for TPM-backed RSA and ECC keys. (CVE-2026-24882)

---

### GHSA-83g3-92jg-28cx (High)
- **Package:** tar @ 7.5.7 (npm)
- **Status:** fixed
- **Fix available: 7.5.8**
- **Source:** https://github.com/advisories/GHSA-83g3-92jg-28cx

Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction

---

### ALAS2023-2026-1375 (Medium)
- **Package:** curl-minimal @ 8.15.0-4.amzn2023.0.1 (rpm)
- **Status:** fixed
- **Fix available: 8.17.0-1.amzn2023.0.1**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1375.html

No QUIC certificate pinning with GnuTLSNOTE: https://curl.se/docs/CVE-2025-13034.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/3210101088dfa3d6a125d213226b092f2f866722 (curl-8_8_0)NOTE: Fixed by: https://github.com/curl/curl/commit/3d91ca8cdb3b434226e743946d428b4dd3acf2c9 (rc-8_18_0-1, curl-8_18_0) (CVE-2025-13034)broken TLS options for threaded LDAPSNOTE: https://curl.se/docs/CVE-2025-14017.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/ccba0d10b6baf5c73cae8cf4fb3f29f0f55c5a34 (curl-7_17_0)NOTE: Fixed by: https://github.com/curl/curl/commit/39d1976b7f709a516e3243338ebc0443bdd8d56d (rc-8_18_0-1, curl-8_18_0)NOTE: Built with OpenLDAP (only affects the legacy LDAP support) (CVE-2025-14017)bearer token leak on cross-protocol redirectNOTE: https://curl.se/docs/CVE-2025-14524.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/06c1bea72faabb6fad4b7ef818aafaa336c9a7aa (curl-7_33_0)NOTE: Fixed by: https://github.com/curl/curl/commit/1a822275d333dc6da6043497160fd04c8fa48640 (rc-8_18_0-2, curl-8_18_0) (CVE-2025-14524)OpenSSL partial chain store policy bypassNOTE: https://curl.se/docs/CVE-2025-14819.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/3c16697ebd796f799227be293e8689aec5f8190d (curl-7_87_0)NOTE: Fixed by: https://github.com/curl/curl/commit/cd046f6c93b39d673a58c18648d8906e954c4f5d (rc-8_18_0-3, curl-8_18_0) (CVE-2025-14819)libssh global knownhost overrideNOTE: https://curl.se/docs/CVE-2025-15079.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/c92d2e14cfb0db662f958effd2ac86f995cf1b5a (curl-7_58_0)NOTE: Fixed by: https://github.com/curl/curl/commit/adca486c125d9a6d9565b9607a19dce803a8b479 (rc-8_18_0-3, curl-8_18_0)NOTE: Debian builds with libssh2 for SSH backend (CVE-2025-15079)libssh key passphrase bypass without agent setNOTE: https://curl.se/docs/CVE-2025-15224.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/c92d2e14cfb0db662f958effd2ac86f995cf1b5a (curl-7_58_0)NOTE: Fixed by: https://github.com/curl/curl/commit/16d5f2a5660c61cc27bd5f1c7f512391d1c927aa (curl-8_18_0)NOTE: Debian builds with libssh2 for SSH backend (CVE-2025-15224)

---

### ALAS2023-2026-1375 (Medium)
- **Package:** libcurl-minimal @ 8.15.0-4.amzn2023.0.1 (rpm)
- **Status:** fixed
- **Fix available: 8.17.0-1.amzn2023.0.1**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1375.html

No QUIC certificate pinning with GnuTLSNOTE: https://curl.se/docs/CVE-2025-13034.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/3210101088dfa3d6a125d213226b092f2f866722 (curl-8_8_0)NOTE: Fixed by: https://github.com/curl/curl/commit/3d91ca8cdb3b434226e743946d428b4dd3acf2c9 (rc-8_18_0-1, curl-8_18_0) (CVE-2025-13034)broken TLS options for threaded LDAPSNOTE: https://curl.se/docs/CVE-2025-14017.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/ccba0d10b6baf5c73cae8cf4fb3f29f0f55c5a34 (curl-7_17_0)NOTE: Fixed by: https://github.com/curl/curl/commit/39d1976b7f709a516e3243338ebc0443bdd8d56d (rc-8_18_0-1, curl-8_18_0)NOTE: Built with OpenLDAP (only affects the legacy LDAP support) (CVE-2025-14017)bearer token leak on cross-protocol redirectNOTE: https://curl.se/docs/CVE-2025-14524.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/06c1bea72faabb6fad4b7ef818aafaa336c9a7aa (curl-7_33_0)NOTE: Fixed by: https://github.com/curl/curl/commit/1a822275d333dc6da6043497160fd04c8fa48640 (rc-8_18_0-2, curl-8_18_0) (CVE-2025-14524)OpenSSL partial chain store policy bypassNOTE: https://curl.se/docs/CVE-2025-14819.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/3c16697ebd796f799227be293e8689aec5f8190d (curl-7_87_0)NOTE: Fixed by: https://github.com/curl/curl/commit/cd046f6c93b39d673a58c18648d8906e954c4f5d (rc-8_18_0-3, curl-8_18_0) (CVE-2025-14819)libssh global knownhost overrideNOTE: https://curl.se/docs/CVE-2025-15079.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/c92d2e14cfb0db662f958effd2ac86f995cf1b5a (curl-7_58_0)NOTE: Fixed by: https://github.com/curl/curl/commit/adca486c125d9a6d9565b9607a19dce803a8b479 (rc-8_18_0-3, curl-8_18_0)NOTE: Debian builds with libssh2 for SSH backend (CVE-2025-15079)libssh key passphrase bypass without agent setNOTE: https://curl.se/docs/CVE-2025-15224.htmlNOTE: Introduced with: https://github.com/curl/curl/commit/c92d2e14cfb0db662f958effd2ac86f995cf1b5a (curl-7_58_0)NOTE: Fixed by: https://github.com/curl/curl/commit/16d5f2a5660c61cc27bd5f1c7f512391d1c927aa (curl-8_18_0)NOTE: Debian builds with libssh2 for SSH backend (CVE-2025-15224)

---

### ALAS2023-2026-1426 (Medium)
- **Package:** alsa-lib @ 1.2.7.2-1.amzn2023.0.2 (rpm)
- **Status:** fixed
- **Fix available: 1.2.7.2-1.amzn2023.0.3**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1426.html

alsa-lib versions 1.2.2 up to and including 1.2.15.2, prior to commit 5f7fe33, contain a heap-based buffer overflow in the topology mixer control decoder. The tplg_decode_control_mixer1() function reads the num_channels field from untrusted .tplg data and uses it as a loop bound without validating it against the fixed-size channel array (SND_TPLG_MAX_CHAN). A crafted topology file with an excessive num_channels value can cause out-of-bounds heap writes, leading to a crash. (CVE-2026-25068)

---

### ALAS2023-2026-1425 (Medium)
- **Package:** expat @ 2.6.3-1.amzn2023.0.3 (rpm)
- **Status:** fixed
- **Fix available: 2.6.3-1.amzn2023.0.4**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1425.html

In libexpat before 2.7.4, the doContent function does not properly determine the buffer size bufSize because there is no integer overflow check for tag buffer reallocation. (CVE-2026-25210)

---

### ALAS2023-2026-1441 (Low)
- **Package:** openssh @ 8.7p1-8.amzn2023.0.15 (rpm)
- **Status:** fixed
- **Fix available: 8.7p1-8.amzn2023.0.16**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1441.html

ssh in OpenSSH before 10.1 allows control characters in usernames that originate from certain possibly untrusted sources, potentially leading to code execution when a ProxyCommand is used. The untrusted sources are the command line and %-sequence expansion of a configuration file. (A configuration file that provides a complete literal username is not categorized as an untrusted source.) (CVE-2025-61984)ssh in OpenSSH before 10.1 allows the '\0' character in an ssh:// URI, potentially leading to code execution when a ProxyCommand is used. (CVE-2025-61985)

---

### ALAS2023-2026-1441 (Low)
- **Package:** openssh-clients @ 8.7p1-8.amzn2023.0.15 (rpm)
- **Status:** fixed
- **Fix available: 8.7p1-8.amzn2023.0.16**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1441.html

ssh in OpenSSH before 10.1 allows control characters in usernames that originate from certain possibly untrusted sources, potentially leading to code execution when a ProxyCommand is used. The untrusted sources are the command line and %-sequence expansion of a configuration file. (A configuration file that provides a complete literal username is not categorized as an untrusted source.) (CVE-2025-61984)ssh in OpenSSH before 10.1 allows the '\0' character in an ssh:// URI, potentially leading to code execution when a ProxyCommand is used. (CVE-2025-61985)

---

