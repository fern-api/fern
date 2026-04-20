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

- **Package:** urllib3 (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 2.0.0, < 2.2.2
- **Patched version:** 2.2.2
- **CVE:** CVE-2024-37891
- **GHSA:** GHSA-34jh-p97f-mpxf
- **Manifest:** seed/python-sdk/exhaustive/extra_dev_dependencies/poetry.lock

**Summary:**
urllib3's Proxy-Authorization request header isn't stripped during cross-origin redirects

**Description:**
When using urllib3's proxy support with `ProxyManager`, the `Proxy-Authorization` header is only sent to the configured proxy, as expected.

However, when sending HTTP requests *without* using urllib3's proxy support, it's possible to accidentally configure the `Proxy-Authorization` header even though it won't have any effect as the request is not using a forwarding proxy or a tunneling proxy. In those cases, urllib3 doesn't treat the `Proxy-Authorization` HTTP header as one carrying authentication material and thus doesn't strip the header on cross-origin redirects.

Because this is a highly unlikely scenario, we believe the severity of this vulnerability is low for almost all users. Out of an abundance of caution urllib3 will automatically strip the `Proxy-Authorization` header during cross-origin redirects to avoid the small chance that users are doing this on accident.

Users should use urllib3's proxy support or disable automatic redirects to achieve safe processing of the `Proxy-Authorization` header, but we still decided to strip the header by default in order to further protect users who aren't using the correct approach.

## Affected usages

We believe the number of usages affected by this advisory is low. It requires all of the following to be true to be exploited:

* Setting the `Proxy-Authorization` header without using urllib3's built-in proxy support.
* Not disabling HTTP redirects.
* Either not using an HTTPS origin server or for the proxy or target origin to redirect to a malicious origin.

## Remediation

* Using the `Proxy-Authorization` header with urllib3's `ProxyManager`.
* Disabling HTTP redirects using `redirects=False` when sending requests.
* Not using the `Proxy-Authorization` header.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2017)
