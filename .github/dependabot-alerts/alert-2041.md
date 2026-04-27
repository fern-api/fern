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

- **Package:** postcss (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 8.5.10
- **Patched version:** 8.5.10
- **CVE:** CVE-2026-41305
- **GHSA:** GHSA-qx2v-qp2m-jg93
- **Manifest:** pnpm-lock.yaml

**Summary:**
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output

**Description:**
# PostCSS: XSS via Unescaped `</style>` in CSS Stringify Output

## Summary

PostCSS v8.5.5 (latest) does not escape `</style>` sequences when stringifying CSS ASTs. When user-submitted CSS is parsed and re-stringified for embedding in HTML `<style>` tags, `</style>` in CSS values breaks out of the style context, enabling XSS.

## Proof of Concept

```javascript
const postcss = require('postcss');

// Parse user CSS and re-stringify for page embedding
const userCSS = 'body { content: "</style><script>alert(1)</script><style>"; }';
const ast = postcss.parse(userCSS);
const output = ast.toResult().css;
const html = `<style>${output}</style>`;

console.log(html);
// <style>body { content: "</style><script>alert(1)</script><style>"; }</style>
//
// Browser: </style> closes the style tag, <script> executes
```

**Tested output** (Node.js v22, postcss v8.5.5):
```
Input: body { content: "</style><script>alert(1)</script><style>"; }
Output: body { content: "</style><script>alert(1)</script><style>"; }
Contains </style>: true
```

## Impact

Impact non-bundler use cases since bundlers for XSS on their own. Requires some PostCSS plugin to have malware code, which can inject XSS to website.

## Suggested Fix

Escape `</style` in all stringified output values:
```javascript
output = output.replace(/<\/(style)/gi, '<\\/$1');
```

## Credits
Discovered and reported by [Sunil Kumar](https://tharvid.in) ([@TharVid](https://github.com/TharVid))

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2041)
