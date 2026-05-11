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

- **Package:** @babel/plugin-transform-modules-systemjs (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 7.12.0, <= 7.29.3
- **Patched version:** 7.29.4
- **CVE:** CVE-2026-44728
- **GHSA:** GHSA-fv7c-fp4j-7gwp
- **Manifest:** pnpm-lock.yaml

**Summary:**
@babel/plugin-transform-modules-systemjs generates arbitrary code when compiling malicious input

**Description:**
### Impact

Using Babel to compile code that was specifically crafted by an attacker can cause Babel to generate output code that executes arbitrary code.

Known affected plugins are:
- `@babel/plugin-transform-modules-systemjs`
- `@babel/preset-env` when using the [`modules: "systemjs"` option](https://babel.dev/docs/babel-preset-env#modules), as it delegates to `@babel/plugin-transform-modules-systemjs`

No other plugins under the `@babel` namespace are impacted.

**Users that only compile trusted code are not impacted.**

### Patches

The vulnerability has been fixed in `@babel/plugin-transform-modules-systemjs@7.29.4`.

Babel also released `@babel/preset-env@7.29.5`, updating its `@babel/plugin-transform-modules-systemjs` dependency, to simplify forcing the update if you are using `@babel/preset-env` directly.

### Workarounds

- Pin `@babel/parser` to v7.11.5. The downgrade will completely disable string module name parsing, but it would also disable other new language features and the build pipeline may fail as a result. Only do so if you are working on a legacy codebase and can not upgrade `@babel/plugin-transform-modules-systemjs` to v7.29.4.
- Do not use the `modules: "systemjs"` option, migrate the codebase to native ES Modules or any other module formats.

### Credits
Babel thanks Daniel Cervera for reporting the vulnerability.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2062)
