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

- **Package:** basic-ftp (npm)
- **Severity:** CRITICAL
- **Vulnerable versions:** < 5.2.0
- **Patched version:** 5.2.0
- **CVE:** CVE-2026-27699
- **GHSA:** GHSA-5rq4-664w-9x2c
- **Manifest:** pnpm-lock.yaml

**Summary:**
Basic FTP has Path Traversal Vulnerability in its downloadToDir() method

**Description:**
The `basic-ftp` library contains a path traversal vulnerability in the `downloadToDir()` method. A malicious FTP server can send directory listings with filenames containing path traversal sequences (`../`) that cause files to be written outside the intended download directory.


## Source-to-Sink Flow

```
1. SOURCE: FTP server sends LIST response
└─> "-rw-r--r-- 1 user group 1024 Jan 20 12:00 ../../../etc/passwd"

2. PARSER: parseListUnix.ts:100 extracts filename
└─> file.name = "../../../etc/passwd"

3. VALIDATION: parseListUnix.ts:101 checks
└─> if (name === "." || name === "..") ❌ (only filters exact matches)
└─> "../../../etc/passwd" !== "." && !== ".." ✅ PASSES

4. SINK: Client.ts:707 uses filename directly
└─> const localPath = join(localDirPath, file.name)
└─> join("/safe/download", "../../../etc/passwd")
└─> Result: "/safe/download/../../../etc/passwd" → resolves to "/etc/passwd"

5. FILE WRITE: Client.ts:512 opens file
└─> fsOpen(localPath, "w") → writes to /etc/passwd (outside intended directory)
```

## Vulnerable Code

**File**: `src/Client.ts:707`

```typescript
protected async _downloadFromWorkingDir(localDirPath: string): Promise<void> {
await ensureLocalDirectory(localDirPath)
for (const file of await this.list()) {
const localPath = join(localDirPath, file.name) // ⚠️ VULNERABLE
// file.name comes from untrusted FTP server, no sanitization
await this.downloadTo(localPath, file.name)
}
}
```

**Root Cause**:
- Parser validation (`parseListUnix.ts:101`) only filters exact `.` or `..` entries
- No sanitization of `../` sequences in filenames
- `path.join()` doesn't prevent traversal, `fs.open()` resolves paths


# Impact

A malicious FTP server can:
- Write files to arbitrary locations on the client filesystem
- Overwrite critical system files (if user has write access)
- Potentially achieve remote code execution

## Affected Versions

- **Tested**: v5.1.0
- **Likely**: All versions (code pattern exists since initial implementation)

## Mitigation

**Workaround**: Do not use `downloadToDir()` with untrusted FTP servers.

**Fix**: Sanitize filenames before use:

```typescript
import { basename } from 'path'

// In _downloadFromWorkingDir:
const sanitizedName = basename(file.name) // Strip path components
const localPath = join(localDirPath, sanitizedName)
```

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/865)
