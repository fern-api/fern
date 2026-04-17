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
- **Vulnerable versions:** <= 5.2.2
- **Patched version:** 5.3.0
- **CVE:** N/A
- **GHSA:** GHSA-rp42-5vxx-qpwr
- **Manifest:** pnpm-lock.yaml

**Summary:**
basic-ftp vulnerable to denial of service via unbounded memory consumption in Client.list()

**Description:**
### Summary
`basic-ftp@5.2.2` is vulnerable to denial of service through unbounded memory growth while processing directory listings from a remote FTP server. A malicious or compromised server can send an extremely large or never-ending listing response to `Client.list()`, causing the client process to consume memory until it becomes unstable or crashes.

### Details
The issue is in the package's default directory listing flow.

`Client.list()` reaches `dist/Client.js`, where the full listing response is downloaded into a `StringWriter` before parsing:

File: `dist/Client.js:516-527`

```js
async _requestListWithCommand(command) {
    const buffer = new StringWriter_1.StringWriter();
    await (0, transfer_1.downloadTo)(buffer, {
        ftp: this.ftp,
        tracker: this._progressTracker,
        command,
        remotePath: "",
        type: "list"
    });
    const text = buffer.getText(this.ftp.encoding);
    this.ftp.log(text);
    return this.parseList(text);
}
```

The vulnerable sink is `StringWriter`, which grows an in-memory `Buffer` with no limit:

File: `dist/StringWriter.js:5-20`

```js
class StringWriter extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.buf = Buffer.alloc(0);
    }
    _write(chunk, _, callback) {
        if (chunk instanceof Buffer) {
            this.buf = Buffer.concat([this.buf, chunk]);
            callback(null);
        }
        else {
            callback(new Error("StringWriter expects chunks of type 'Buffer'."));
        }
    }
    getText(encoding) {
        return this.buf.toString(encoding);
    }
}
```

The critical operation is:

```js
this.buf = Buffer.concat([this.buf, chunk]);
```

There is no maximum size check, no truncation, and no streaming parser. Because the remote FTP server controls the listing response, it can force the client to keep allocating memory until the process is terminated.

How it happens:

1. An application connects to an attacker-controlled or compromised FTP server.
2. The application calls `client.list()`.
3. The server returns an extremely large or unbounded directory listing.
4. `basic-ftp` buffers the full response in `StringWriter`.
5. Memory grows without bound due to repeated `Buffer.concat(...)` calls.

### PoC
The following PoC exercises the vulnerable buffering primitive directly:

```js
const { StringWriter } = require("basic-ftp/dist/StringWriter.js");

function mb(n) {
  return Math.round(n / 1024 / 1024) + "MB";
}

const writer = new StringWriter();
let wrote = 0;

for (let i = 0; i < 32; i++) {
  const chunk = Buffer.alloc(4 * 1024 * 1024, 0x41);
  writer.write(chunk);
  wrote += chunk.length;

  if ((i + 1) % 8 === 0) {
    const m = process.memoryUsage();
    console.log("written", mb(wrote), "rss", mb(m.rss), "heap", mb(m.heapUsed), "buf", mb(m.arrayBuffers));
  }
}

console.log("final text len", writer.getText("utf8").length);
```

Observed output:

```text
written 32MB rss 116MB heap 4MB buf 64MB
written 64MB rss 296MB heap 4MB buf 240MB
written 96MB rss 340MB heap 3MB buf 284MB
written 128MB rss 436MB heap 3MB buf 376MB
final text len 134217728
```

This demonstrates sustained memory growth in the same code path used to buffer directory listing data.

Supporting files saved alongside this report:

- `poc.js`
- `poc_output.txt`

### Impact
This is a denial-of-service vulnerability affecting applications that use `basic-ftp` to list directories from remote FTP servers.

- Vulnerability class: Memory exhaustion / Denial of Service
- Attack precondition: The victim connects to a malicious or compromised FTP server and performs `Client.list()`
- Impacted users: Any application or service using `basic-ftp@5.2.2` against untrusted FTP endpoints
- Security effect: The attacker can cause excessive memory consumption, process instability, and potential process termination

Recommended remediation:

1. Enforce a maximum listing size.
2. Abort transfers that exceed the configured limit.
3. Prefer incremental or streaming parsing over full-response buffering.

Example defensive check:

```js
if (this.buf.length + chunk.length > MAX_LISTING_BYTES) {
    callback(new Error("FTP listing exceeds maximum allowed size."));
    return;
}
this.buf = Buffer.concat([this.buf, chunk]);
```

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/1734)
