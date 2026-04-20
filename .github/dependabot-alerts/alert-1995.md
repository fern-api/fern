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

- **Package:** phpunit/phpunit (composer)
- **Severity:** HIGH
- **Vulnerable versions:** <= 12.5.21
- **Patched version:** 12.5.22
- **CVE:** N/A
- **GHSA:** GHSA-qrr6-mg7r-m243
- **Manifest:** seed/php-model/multi-url-environment-reference/composer.json

**Summary:**
PHPUnit has Argument injection via newline in PHP INI values that are forwarded to child processes

**Description:**
## Impact

PHPUnit forwards PHP INI settings to child processes (used for isolated/PHPT test execution) as `-d name=value` command-line arguments without neutralizing INI metacharacters. Because PHP's INI parser interprets `"` as a string delimiter, `;` as the start of a comment, and most importantly a newline as a directive separator, a value containing a newline is parsed by the child process as multiple INI directives.

An attacker able to influence a single INI value can therefore inject arbitrary additional directives into the child's configuration, including `auto_prepend_file`, `extension`, `disable_functions`, `open_basedir`, and others. Setting `auto_prepend_file` to an attacker-controlled path yields remote code execution in the child process.

Sources of INI values that participate in the attack:

- `<ini name="…" value="…"/>` entries in `phpunit.xml` / `phpunit.xml.dist`
- INI settings inherited from the host PHP runtime via `ini_get_all()`

### Threat Model

Exploitation requires the attacker to control the content of an INI value read by PHPUnit. In practice this means write access to the project's `phpunit.xml`, the host `php.ini`, or the PHP binary's environment. The most realistic exposure is [Poisoned Pipeline Execution](https://owasp.org/www-project-top-10-ci-cd-security-risks/CICD-SEC-04-Poisoned-Pipeline-Execution) (PPE): a pull request from an untrusted contributor that modifies `phpunit.xml` to include a newline-containing INI value, executed by a CI system that runs PHPUnit against the PR without isolation. A malicious newline is not visibly distinguishable from a legitimate value in a typical diff review.

### Affected component

`PHPUnit\Util\PHP\JobRunner::settingsToParameters()`.

## Patches

The fix has two parts:

**1. Reject line-break characters**

Because a newline or carriage return in an INI value has no legitimate use and is the primitive that enables directive injection, any PHP setting value containing `\n` or `\r` is now rejected with an explicit `PhpProcessException`. This follows the same "visibility over silence" principle applied in [CVE-2026-24765](https://github.com/sebastianbergmann/phpunit/security/advisories/GHSA-vvj3-c3rp-c85p): the anomalous state fails loudly in CI output rather than being silently sanitized, giving operators an opportunity to investigate whether it reflects tampering, environment contamination, or an unexpected upstream change.

**2. Quote remaining metacharacters**

Values containing `"` or `;`, both of which have legitimate uses (e.g., regex-valued INI settings such as `ddtrace`'s `datadog.appsec.obfuscation_parameter_value_regexp`), are wrapped in double quotes with inner `"` escaped as `\"`, so PHP's INI parser reads them as literal string contents rather than comment/delimiter tokens. Plain values are forwarded unchanged so that boolean keywords (`On`/`Off`) and bitwise expressions (`E_ALL & ~E_NOTICE`) retain their INI semantics.

## Workarounds

If upgrading is not immediately possible:

- Audit INI values: Ensure no `<ini value="…">` entry in `phpunit.xml` / `phpunit.xml.dist` contains newline, `"`, or `;` characters, and that nothing writes such values into configuration at build time.
- Isolate CI execution of untrusted code: Run PHPUnit against pull requests only in ephemeral, containerized runners that discard filesystem state between jobs; require human review before executing PRs from forks; enforce branch protection on workflows that handle secrets (`pull_request_target` and similar). These mitigations apply to the broader PPE risk class and are effective against this vulnerability as well.
- Restrict who can modify `phpunit.xml`: Treat `phpunit.xml` as security-sensitive in code review, particularly `<ini>` entries.
- Sanitize host INI: Ensure the host PHP's `php.ini` does not contain values with embedded newlines or unescaped metacharacters.

## References

- Fix: https://github.com/sebastianbergmann/phpunit/pull/6592
- Related advisory (same threat class, Poisoned Pipeline Execution): [GHSA-vvj3-c3rp-c85p / CVE-2026-24765](https://github.com/sebastianbergmann/phpunit/security/advisories/GHSA-vvj3-c3rp-c85p)
- OWASP CI/CD Top 10: [CICD-SEC-04 Poisoned Pipeline Execution](https://owasp.org/www-project-top-10-ci-cd-security-risks/CICD-SEC-04-Poisoned-Pipeline-Execution)
- CWE-88: https://cwe.mitre.org/data/definitions/88.html
- CWE-93: https://cwe.mitre.org/data/definitions/93.html

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1995)
