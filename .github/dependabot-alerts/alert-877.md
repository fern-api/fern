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

- **Package:** yauzl (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 3.2.1
- **Patched version:** 3.2.1
- **CVE:** CVE-2026-31988
- **GHSA:** GHSA-gmq8-994r-jv83
- **Manifest:** pnpm-lock.yaml

**Summary:**
yauzl contains an off-by-one error

**Description:**
yauzl (aka Yet Another Unzip Library) version 3.2.0 for Node.js contains an off-by-one error in the NTFS extended timestamp extra field parser within the getLastModDate() function. The while loop condition checks cursor < data.length + 4 instead of cursor + 4 <= data.length, allowing readUInt16LE() to read past the buffer boundary. A remote attacker can cause a denial of service (process crash via ERR_OUT_OF_RANGE exception) by sending a crafted zip file with a malformed NTFS extra field. This affects any Node.js application that processes zip file uploads and calls entry.getLastModDate() on parsed entries. Fixed in version 3.2.1.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/877)
