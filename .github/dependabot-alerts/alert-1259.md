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

- **Package:** yaml (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 2.0.0, < 2.8.3
- **Patched version:** 2.8.3
- **CVE:** CVE-2026-33532
- **GHSA:** GHSA-48c2-rrv3-qjmp
- **Manifest:** pnpm-lock.yaml

**Summary:**
yaml is vulnerable to Stack Overflow via deeply nested YAML collections

**Description:**
Parsing a YAML document with `yaml` may throw a RangeError due to a stack overflow.

The node resolution/composition phase uses recursive function calls without a depth bound. An attacker who can supply YAML for parsing can trigger a `RangeError: Maximum call stack size exceeded` with a small payload (~2–10 KB). The `RangeError` is not a `YAMLParseError`, so applications that only catch YAML-specific errors will encounter an unexpected exception type. Depending on the host application's exception handling, this can fail requests or terminate the Node.js process.

Flow sequences allow deep nesting with minimal bytes (2 bytes per level: one `[` and one `]`). On the default Node.js stack, approximately 1,000–5,000 levels of nesting (2–10 KB input) exhaust the call stack. The exact threshold is environment-dependent (Node.js version, stack size, call stack depth at invocation).

Note: the library's `Parser` (CST phase) uses a stack-based iterative approach and is not affected. Only the compose/resolve phase uses actual call-stack recursion.

All three public parsing APIs are affected: `YAML.parse()`, `YAML.parseDocument()`, and `YAML.parseAllDocuments()`.

### PoC

```javascript
const YAML = require('yaml');

// ~10 KB payload: 5000 levels of nested flow sequences
const payload = '['.repeat(5000) + '1' + ']'.repeat(5000);

try {
  YAML.parse(payload);
} catch (e) {
  console.log(e.constructor.name); // RangeError (NOT YAMLParseError)
  console.log(e.message);          // Maximum call stack size exceeded
}
```

Test environment: Node.js v24.12.0, macOS darwin arm64

| Version | Nesting Depth | Input Size | Result |
|---|---|---|---|
| 1.0.0 | 5,000 | 10,001 B | RangeError |
| 1.10.2 | 5,000 | 10,001 B | RangeError |
| 2.0.0 | 5,000 | 10,001 B | RangeError |
| 2.8.2 | 5,000 | 10,001 B | RangeError |
| 2.8.3 | 5,000 | 10,001 B | YAMLParseError |

Depth threshold on yaml 2.8.2:

| Nesting Depth | Input Size | Result |
|---|---|---|
| 500 | 1,001 B | Parses successfully |
| 1,000 | 2,001 B | RangeError (threshold varies by stack size) |
| 5,000 | 10,001 B | RangeError |

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1259)
