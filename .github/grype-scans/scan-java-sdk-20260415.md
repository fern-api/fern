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
- **Scan Date:** 2026-04-15T11:24:13.001Z
- **Total Vulnerabilities:** 3
- **Critical:** 0
- **High:** 3
- **Medium:** 0
- **Low:** 0

## Vulnerabilities

### ALAS2023-2026-1583 (High)
- **Package:** python3 @ 3.9.25-1.amzn2023.0.3 (rpm)
- **Status:** fixed
- **Fix available: 3.9.25-1.amzn2023.0.4**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1583.html

When folding a long comment in an email header containing exclusively unfoldable characters, the parenthesis would not be preserved. This could be used for injecting headers into email messages where addresses are user-controlled and not sanitized. (CVE-2025-11468)User-controlled data URLs parsed by urllib.request.DataHandler allow injecting headers through newlines in the data URL mediatype. (CVE-2025-15282)When using http.cookies.Morsel, user-controlled cookie values and parameters can allow injecting HTTP headers into messages. Patch rejects all control characters within cookie names, values, and parameters. (CVE-2026-0672)User-controlled header names and values containing newlines can allow injecting HTTP headers. (CVE-2026-0865)The email module, specifically the "BytesGenerator" class, didn't properly quote newlines for email headers when serializing an email message allowing for header injection when an email is serialized. This is only applicable if using "LiteralHeader" writing headers that don't respect email folding rules, the new behavior will reject the incorrectly folded headers in "BytesGenerator". (CVE-2026-1299)The import hook in CPython that handles legacy *.pyc files (SourcelessFileLoader) is incorrectly handled in FileLoader (a base class) and so does not use io.open_code() to read the .pyc files. sys.audit handlers for this audit event therefore do not fire. (CVE-2026-2297)When an Expat parser with a registered ElementDeclHandler parses an inlinedocument type definition containing a deeply nested content model a C stackoverflow occurs. (CVE-2026-4224)The webbrowser.open() API would accept leading dashes in the URL whichcould be handled as command line options for certain web browsers. Newbehavior rejects leading dashes. Users are recommended to sanitize URLsprior to passing to webbrowser.open(). (CVE-2026-4519)

---

### ALAS2023-2026-1583 (High)
- **Package:** python3-libs @ 3.9.25-1.amzn2023.0.3 (rpm)
- **Status:** fixed
- **Fix available: 3.9.25-1.amzn2023.0.4**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1583.html

When folding a long comment in an email header containing exclusively unfoldable characters, the parenthesis would not be preserved. This could be used for injecting headers into email messages where addresses are user-controlled and not sanitized. (CVE-2025-11468)User-controlled data URLs parsed by urllib.request.DataHandler allow injecting headers through newlines in the data URL mediatype. (CVE-2025-15282)When using http.cookies.Morsel, user-controlled cookie values and parameters can allow injecting HTTP headers into messages. Patch rejects all control characters within cookie names, values, and parameters. (CVE-2026-0672)User-controlled header names and values containing newlines can allow injecting HTTP headers. (CVE-2026-0865)The email module, specifically the "BytesGenerator" class, didn't properly quote newlines for email headers when serializing an email message allowing for header injection when an email is serialized. This is only applicable if using "LiteralHeader" writing headers that don't respect email folding rules, the new behavior will reject the incorrectly folded headers in "BytesGenerator". (CVE-2026-1299)The import hook in CPython that handles legacy *.pyc files (SourcelessFileLoader) is incorrectly handled in FileLoader (a base class) and so does not use io.open_code() to read the .pyc files. sys.audit handlers for this audit event therefore do not fire. (CVE-2026-2297)When an Expat parser with a registered ElementDeclHandler parses an inlinedocument type definition containing a deeply nested content model a C stackoverflow occurs. (CVE-2026-4224)The webbrowser.open() API would accept leading dashes in the URL whichcould be handled as command line options for certain web browsers. Newbehavior rejects leading dashes. Users are recommended to sanitize URLsprior to passing to webbrowser.open(). (CVE-2026-4519)

---

### ALAS2023-2026-1542 (High)
- **Package:** libnghttp2 @ 1.59.0-3.amzn2023.0.1 (rpm)
- **Status:** fixed
- **Fix available: 1.59.0-3.amzn2023.0.2**
- **Source:** https://alas.aws.amazon.com/AL2023/ALAS2023-2026-1542.html

nghttp2 is an implementation of the Hypertext Transfer Protocol version 2 in C. Prior to version 1.68.1, the nghttp2 library stops reading the incoming data when user facing public API `nghttp2_session_terminate_session` or `nghttp2_session_terminate_session2` is called by the application. They might be called internally by the library when it detects the situation that is subject to connection error. Due to the missing internal state validation, the library keeps reading the rest of the data after one of those APIs is called. Then receiving a malformed frame that causes FRAME_SIZE_ERROR causes assertion failure. nghttp2 v1.68.1 adds missing state validation to avoid assertion failure. No known workarounds are available. (CVE-2026-27135)

---

