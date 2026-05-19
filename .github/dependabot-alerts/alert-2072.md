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
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 8.0.0, < 8.20.1
- **Patched version:** 8.20.1
- **CVE:** CVE-2026-45736
- **GHSA:** GHSA-58qx-3vcg-4xpx
- **Manifest:** pnpm-lock.yaml

**Summary:**
ws: Uninitialized memory disclosure

**Description:**
### Impact

The `websocket.close()` implementation is vulnerable to uninitialized memory disclosure when a `TypedArray` is passed as the reason argument.

### Proof of concept

```js
import { deepStrictEqual } from 'node:assert';
import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer(
  { port: 0, skipUTF8Validation: true },
  function () {
    const { port } = wss.address();
    const ws = new WebSocket(`ws://localhost:${port}`, {
      skipUTF8Validation: true
    });

    ws.on('close', function (code, reason) {
      deepStrictEqual(reason, Buffer.alloc(80));
    });
  }
);

wss.on('connection', function (ws) {
  ws.close(1000, new Float32Array(20));
});
```

### Patches

The vulnerability was fixed in ws@8.20.1 (https://github.com/websockets/ws/commit/c0327ec15a54d701eb6ccefaa8bef328cfc03086).

### Credits

Credit for the private and responsible disclosure of this issue goes to [Nikita Skovoroda](https://github.com/ChALkeR).

### Remarks

Although the calculated CVSS severity is medium, the actual severity is believed to be low, as the flaw is only exploitable through misuse that is unlikely in practice.

### Resources

- https://github.com/advisories/GHSA-58qx-3vcg-4xpx
- https://www.cve.org/CVERecord?id=CVE-2026-45736

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2072)
