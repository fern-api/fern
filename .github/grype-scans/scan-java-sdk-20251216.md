@devin-ai-integration Please remediate the container vulnerabilities found by today's grype scan of the container specified in the summary below.

**Instructions:**
1. Analyze each vulnerability and understand its impact
2. For OS-level vulnerabilities, consider updating the base image or specific packages
3. For Python dependencies, update the affected packages in pyproject.toml/poetry.lock
4. Run tests to ensure the updates don't break anything
5. Build the container locally and re-scan to confirm your changes actually address the CVEs.
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/grype-scans/scan-*.md) as part of your fix

**Vulnerability Details:**


## Summary
- **Container:** java-sdk
- **Scan Date:** 2025-12-16T14:22:51.376Z
- **Total Vulnerabilities:** 71
- **Critical:** 0
- **High:** 0
- **Medium:** 21
- **Low:** 50

## Vulnerabilities

### CVE-2024-52005 (Medium)
- **Package:** git @ 1:2.34.1-1ubuntu1.15 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-52005

No description available

---

### CVE-2024-52005 (Medium)
- **Package:** git-man @ 1:2.34.1-1ubuntu1.15 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-52005

No description available

---

### CVE-2025-59375 (Medium)
- **Package:** libexpat1 @ 2.4.7-1ubuntu0.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-59375

No description available

---

### CVE-2025-66293 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-66293

No description available

---

### CVE-2025-45582 (Medium)
- **Package:** tar @ 1.34+dfsg-1ubuntu0.1.22.04.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-45582

No description available

---

### CVE-2025-8941 (Medium)
- **Package:** libpam-modules @ 1.4.0-11ubuntu2.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-8941

No description available

---

### CVE-2025-8941 (Medium)
- **Package:** libpam-modules-bin @ 1.4.0-11ubuntu2.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-8941

No description available

---

### CVE-2025-8941 (Medium)
- **Package:** libpam-runtime @ 1.4.0-11ubuntu2.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-8941

No description available

---

### CVE-2025-8941 (Medium)
- **Package:** libpam0g @ 1.4.0-11ubuntu2.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-8941

No description available

---

### CVE-2025-64720 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64720

No description available

---

### CVE-2025-65018 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-65018

No description available

---

### CVE-2025-66382 (Medium)
- **Package:** libexpat1 @ 2.4.7-1ubuntu0.6 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-66382

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** bsdutils @ 1:2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** libblkid1 @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** libmount1 @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** libsmartcols1 @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** libuuid1 @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** mount @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-14104 (Medium)
- **Package:** util-linux @ 2.37.2-4ubuntu3.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-14104

No description available

---

### CVE-2025-64505 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64505

No description available

---

### CVE-2025-64506 (Medium)
- **Package:** libpng16-16 @ 1.6.37-3build5 (deb)
- **Status:** fixed
- **Fix available: 1.6.37-3ubuntu0.1**
- **Source:** https://ubuntu.com/security/CVE-2025-64506

No description available

---

### CVE-2024-56433 (Low)
- **Package:** login @ 1:4.8.1-2ubuntu2.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-56433

No description available

---

### CVE-2024-56433 (Low)
- **Package:** passwd @ 1:4.8.1-2ubuntu2.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-56433

No description available

---

### CVE-2024-41996 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-41996

No description available

---

### CVE-2024-41996 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-41996

No description available

---

### CVE-2023-7008 (Low)
- **Package:** libsystemd0 @ 249.11-0ubuntu3.17 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-7008

No description available

---

### CVE-2023-7008 (Low)
- **Package:** libudev1 @ 249.11-0ubuntu3.17 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-7008

No description available

---

### CVE-2021-46848 (Low)
- **Package:** libtasn1-6 @ 4.18.0-4ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2021-46848

No description available

---

### CVE-2024-2236 (Low)
- **Package:** libgcrypt20 @ 1.9.4-3ubuntu3 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2024-2236

No description available

---

### CVE-2022-4899 (Low)
- **Package:** libzstd1 @ 1.4.8+dfsg-3build1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-4899

No description available

---

### CVE-2025-0167 (Low)
- **Package:** curl @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-0167

No description available

---

### CVE-2025-0167 (Low)
- **Package:** libcurl3-gnutls @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-0167

No description available

---

### CVE-2025-0167 (Low)
- **Package:** libcurl4 @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-0167

No description available

---

### CVE-2025-9086 (Low)
- **Package:** curl @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-9086

No description available

---

### CVE-2025-9086 (Low)
- **Package:** libcurl3-gnutls @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-9086

No description available

---

### CVE-2025-9086 (Low)
- **Package:** libcurl4 @ 7.81.0-1ubuntu1.21 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-9086

No description available

---

### CVE-2016-2781 (Low)
- **Package:** coreutils @ 8.32-4.1ubuntu1.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2016-2781

No description available

---

### CVE-2025-8277 (Low)
- **Package:** libssh-4 @ 0.9.6-2ubuntu0.22.04.5 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-8277

No description available

---

### CVE-2022-41409 (Low)
- **Package:** libpcre2-8-0 @ 10.39-3ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-41409

No description available

---

### CVE-2023-50495 (Low)
- **Package:** libncurses6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-50495

No description available

---

### CVE-2023-50495 (Low)
- **Package:** libncursesw6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-50495

No description available

---

### CVE-2023-50495 (Low)
- **Package:** libtinfo6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-50495

No description available

---

### CVE-2023-50495 (Low)
- **Package:** ncurses-base @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-50495

No description available

---

### CVE-2023-50495 (Low)
- **Package:** ncurses-bin @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-50495

No description available

---

### CVE-2022-27943 (Low)
- **Package:** gcc-12-base @ 12.3.0-1ubuntu1~22.04.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-27943

No description available

---

### CVE-2022-27943 (Low)
- **Package:** libgcc-s1 @ 12.3.0-1ubuntu1~22.04.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-27943

No description available

---

### CVE-2022-27943 (Low)
- **Package:** libstdc++6 @ 12.3.0-1ubuntu1~22.04.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-27943

No description available

---

### CVE-2025-27587 (Low)
- **Package:** libssl3 @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-27587

No description available

---

### CVE-2025-27587 (Low)
- **Package:** openssl @ 3.0.2-0ubuntu1.20 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-27587

No description available

---

### CVE-2023-29383 (Low)
- **Package:** login @ 1:4.8.1-2ubuntu2.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-29383

No description available

---

### CVE-2023-29383 (Low)
- **Package:** passwd @ 1:4.8.1-2ubuntu2.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2023-29383

No description available

---

### CVE-2025-5278 (Low)
- **Package:** coreutils @ 8.32-4.1ubuntu1.2 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-5278

No description available

---

### CVE-2025-6141 (Low)
- **Package:** libncurses6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-6141

No description available

---

### CVE-2025-6141 (Low)
- **Package:** libncursesw6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-6141

No description available

---

### CVE-2025-6141 (Low)
- **Package:** libtinfo6 @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-6141

No description available

---

### CVE-2025-6141 (Low)
- **Package:** ncurses-base @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-6141

No description available

---

### CVE-2025-6141 (Low)
- **Package:** ncurses-bin @ 6.3-2ubuntu0.1 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-6141

No description available

---

### CVE-2025-61985 (Low)
- **Package:** openssh-client @ 1:8.9p1-3ubuntu0.13 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-61985

No description available

---

### CVE-2022-3219 (Low)
- **Package:** dirmngr @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gnupg @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gnupg-l10n @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gnupg-utils @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpg @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpg-agent @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpg-wks-client @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpg-wks-server @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpgconf @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpgsm @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2022-3219 (Low)
- **Package:** gpgv @ 2.2.27-3ubuntu2.4 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2022-3219

No description available

---

### CVE-2025-61984 (Low)
- **Package:** openssh-client @ 1:8.9p1-3ubuntu0.13 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-61984

No description available

---

### CVE-2025-9820 (Low)
- **Package:** libgnutls30 @ 3.7.3-4ubuntu1.7 (deb)
- **Status:** not-fixed
- **No fix available yet**
- **Source:** https://ubuntu.com/security/CVE-2025-9820

No description available

---

