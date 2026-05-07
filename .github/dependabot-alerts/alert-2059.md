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
- **Vulnerable versions:** <= 5.3.0
- **Patched version:** 5.3.1
- **CVE:** CVE-2026-44240
- **GHSA:** GHSA-rpmf-866q-6p89
- **Manifest:** pnpm-lock.yaml

**Summary:**
basic-ftp allows a malicious FTP server to cause client-side denial of service via unbounded multiline control response buffering

**Description:**
## Summary

`basic-ftp` is vulnerable to client-side denial of service when parsing FTP control-channel multiline responses.

A malicious or compromised FTP server can send an unterminated multiline response during the initial FTP banner phase, before authentication. The client keeps appending attacker-controlled data into `FtpContext._partialResponse` and repeatedly reparses the accumulated buffer without enforcing a maximum control response size.

As a result, an application using `basic-ftp` can remain stuck in `connect()` while memory and CPU usage grow under attacker-controlled input. This can lead to process-level denial of service, container OOM kills, worker restarts, queue backlog, or service degradation in applications that automatically connect to FTP endpoints.

---

## Details

### Root cause

The root cause is that incomplete FTP multiline control responses are buffered without an upper bound.

`FtpContext` stores incomplete control-channel data in `_partialResponse`:


https://github.com/patrickjuchli/basic-ftp/blob/50827c73ca6c1d786c97276e47be8a33d0f2277d/src/FtpContext.ts#L63-L64


Incoming control-channel data is handled in `_onControlSocketData`. The implementation concatenates the previous incomplete response with the new chunk, parses the entire accumulated string, and stores `parsed.rest` back into `_partialResponse`:


https://github.com/patrickjuchli/basic-ftp/blob/50827c73ca6c1d786c97276e47be8a33d0f2277d/src/FtpContext.ts#L328-L340


The relevant flow is:


completeResponse = this._partialResponse + chunk
parsed = parseControlResponse(completeResponse)
this._partialResponse = parsed.rest


There is no maximum size check before concatenating, before parsing, or before storing `parsed.rest`.

The parser accepts incomplete multiline responses and returns the entire unterminated multiline group as `rest`:


https://github.com/patrickjuchli/basic-ftp/blob/50827c73ca6c1d786c97276e47be8a33d0f2277d/src/parseControlResponse.ts#L15-L43


If a server starts a multiline FTP response:


220-malicious banner starts


but never sends the terminating line:


220 ready


then `parseControlResponse()` treats the accumulated multiline data as incomplete and returns it as `rest`.

Because `_onControlSocketData()` feeds `_partialResponse + chunk` back into the parser on every new data event, the client repeatedly reparses a growing attacker-controlled buffer. This creates both memory growth and increasing parsing work.

### Why this is security-relevant

The vulnerable component is a client library. The attacker does not need to authenticate to the victim system and does not need valid FTP credentials.

The attack occurs automatically when an application using `basic-ftp` connects to a malicious or compromised FTP server. The malicious response is sent as the FTP server banner before login. No additional user interaction is required after the application initiates a normal FTP connection.

This is realistic for applications that use FTP for:

- scheduled imports or exports
- customer-provided FTP endpoints
- backup or synchronization jobs
- CI/CD artifact mirroring
- document ingestion pipelines
- legacy business integrations

In those environments, one malicious or compromised FTP endpoint can cause the Node.js process using `basic-ftp` to consume excessive memory and CPU or remain stuck in a pending connection state.

---

## Proof of Concept

The PoC uses a local malicious FTP server that accepts a victim connection and sends an unterminated multiline FTP banner. The banner starts with `220-`, but the server never sends the required terminating `220 ` line.

### Reproduction steps

From the root of the `basic-ftp` project:

```bash
npm ci
npm run buildOnly
```

[poc_control_parser_direct.js](https://github.com/user-attachments/files/27051425/poc_control_parser_direct.js)

```bash
CHUNKS=1000 node poc_control_parser_direct.js | tee poc-results/parser_direct_1000.log
```

[parser_direct_1000.log](https://github.com/user-attachments/files/27051430/parser_direct_1000.log)

Run the end-to-end malicious FTP server PoC:

[poc_control_multiline_dos.js](https://github.com/user-attachments/files/27051385/poc_control_multiline_dos.js)

```bash
CHUNK_SIZE=8192 CHUNKS=1000 DELAY_MS=1 node poc_control_multiline_dos.js | tee poc-results/control_multiline_dos_1000.log
```

[control_multiline_dos_1000.log](https://github.com/user-attachments/files/27051397/control_multiline_dos_1000.log)

### Observed result: parser-only PoC

```text
[basic-ftp parseControlResponse incomplete multiline DoS]
Input fed: 7.81 MiB
Retained rest: 7.81 MiB
Initial rss/heap: 54.77 MiB 3.69 MiB
Final   rss/heap: 141.64 MiB 80.77 MiB
```

This shows that `parseControlResponse()` retained the full unterminated multiline response as `rest`.

The retained buffer grew to `7.81 MiB`. Heap usage increased from `3.69 MiB` to `80.77 MiB`, and RSS increased from `54.77 MiB` to `141.64 MiB`.

### Observed result: end-to-end malicious FTP server PoC

```text
[server] listening on 127.0.0.1:34429
[server] victim connected
[progress] chunks=850 sent=6.6 MiB partialResponse=6.6 MiB heapUsed=227.5 MiB rss=292.4 MiB
[progress] chunks=900 sent=7.0 MiB partialResponse=7.0 MiB heapUsed=213.1 MiB rss=278.0 MiB
[final-before-close] chunks=1000 sent=7.8 MiB partialResponse=7.8 MiB heapUsed=82.1 MiB rss=146.8 MiB
[result] client connect() is still pending because the multiline response never terminated
```

Only `7.8 MiB` of malicious control-channel data was sent. The client retained `7.8 MiB` in `_partialResponse`, showed large memory spikes, and remained pending inside `connect()` because the multiline response was never terminated.

---

## Expected behavior

The client should enforce a maximum size for incomplete FTP control responses. If the accumulated multiline response exceeds a safe limit, the client should close the connection and reject the active task with an error.

The client should not allow a remote FTP server to make `_partialResponse` grow without bound.

---

## Actual behavior

A malicious FTP server can keep the client in a pending connection state by sending an unterminated multiline control response. `basic-ftp` continues buffering and reparsing the accumulated data without a maximum response size.

---

## Impact

A malicious or compromised FTP server can cause denial of service in applications using `basic-ftp`.

Possible real-world impact includes:

- Node.js process memory exhaustion
- container OOM kill
- worker crash or restart loop
- event loop CPU pressure due to repeated reparsing
- stuck FTP jobs
- queue backlog in scheduled import/export systems
- degraded availability of services relying on automated FTP ingestion

---

## Threat model

The attacker controls, compromises, or can impersonate an FTP server that a victim application connects to.

Examples:

1. A SaaS application allows customers to configure external FTP endpoints for automated imports.
2. A backend job periodically pulls files from partner FTP servers.
3. A document ingestion pipeline connects to FTP endpoints supplied by external users.
4. A legacy integration uses FTP for scheduled synchronization.
5. A build or deployment pipeline mirrors artifacts from an FTP server.

In each case, the victim application initiates a normal FTP connection. The malicious server sends an unterminated multiline banner before authentication. The vulnerable client then buffers and reparses the response indefinitely.

No FTP credentials are required for exploitation because the attack happens before login.

---

## Suggested fix

Introduce a maximum control response buffer size, especially for incomplete multiline responses.

Recommended changes:

- Add a `maxControlResponseBytes` or `maxControlResponseLength` limit.
- Enforce the limit before or immediately after appending new control-channel data.
- Close the connection and reject the active task when the limit is exceeded.
- Add regression tests for unterminated multiline responses.

Example defensive logic:

```text
if (completeResponse.length > maxControlResponseLength) {
    closeWithError(new Error("FTP control response exceeded maximum allowed size"))
}
```

A regression test should verify that a response beginning with `220-` and never terminating with `220 ` is rejected after the configured size limit instead of being retained indefinitely.

---

## Suggested regression test scenario

A test server should:

1. Accept a client connection.
2. Send an FTP multiline response opener such as `220-malicious banner\r\n`.
3. Continue sending additional lines without ever sending the terminating `220 ` line.
4. Verify that the client rejects the connection once the configured response-size limit is exceeded.
5. Verify that `_partialResponse` does not grow without bound.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2059)
