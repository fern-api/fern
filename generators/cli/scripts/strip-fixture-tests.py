#!/usr/bin/env python3
"""Strip fixture-dependent inline test code from vendored cli-sdk sources.

Usage:
    python3 generators/cli/scripts/strip-fixture-tests.py <src-dir>

Removes #[test] functions, #[cfg(test)] helper items, and entire
#[cfg(test)] modules that reference fixture files via
include_str!("../../cli/...") or include_str!("../bin/...") paths.
Those fixtures exist in the source cli-sdk repo but are NOT synced into
the vendored copy, so they break `cargo test` compilation.

Non-fixture tests are preserved. If stripping leaves a #[cfg(test)]
module with no remaining #[test] functions, the entire module is removed.

Called by sync-sdk.sh after rsyncing cli-sdk src/ into
generators/cli/sdk/src/.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

FIXTURE_RE = re.compile(r'include_str!\s*\(\s*"[^"]*\.\./(\.\./)?(cli|bin)/')


# ---------------------------------------------------------------------------
# Rust lexer — character-by-character scanner that properly handles
# strings (regular + raw), char literals, line/block comments.
# ---------------------------------------------------------------------------

class RustScanner:
    """Scans Rust source, tracking brace depth and string/comment state."""

    def __init__(self, lines: list[str], start_line: int = 0, start_col: int = 0):
        self.lines = lines
        self.i = start_line
        self.j = start_col
        self.depth = 0
        self._in_string = False
        self._in_char = False
        self._escape = False

    def _advance_line(self) -> bool:
        self.i += 1
        self.j = 0
        return self.i < len(self.lines)

    def find_matching_brace(self) -> int:
        """Scan forward until depth returns to 0 after going positive.
        Returns the line index of the matching closing brace."""
        found_open = False
        while self.i < len(self.lines):
            line = self.lines[self.i]
            while self.j < len(line):
                ch = line[self.j]

                if self._escape:
                    self._escape = False
                    self.j += 1
                    continue

                if self._in_char:
                    if ch == '\\':
                        self._escape = True
                    elif ch == "'":
                        self._in_char = False
                    self.j += 1
                    continue

                if self._in_string:
                    if ch == '\\':
                        self._escape = True
                    elif ch == '"':
                        self._in_string = False
                    self.j += 1
                    continue

                # Outside strings/chars
                if ch == '\\':
                    self._escape = True
                    self.j += 1
                    continue

                # Line comment
                if ch == '/' and self.j + 1 < len(line) and line[self.j + 1] == '/':
                    break  # skip rest of line

                # Block comment
                if ch == '/' and self.j + 1 < len(line) and line[self.j + 1] == '*':
                    self.j += 2
                    while True:
                        while self.j < len(self.lines[self.i]):
                            if (self.lines[self.i][self.j] == '*'
                                    and self.j + 1 < len(self.lines[self.i])
                                    and self.lines[self.i][self.j + 1] == '/'):
                                self.j += 2
                                break
                            self.j += 1
                        else:
                            if not self._advance_line():
                                return len(self.lines) - 1
                            continue
                        break
                    line = self.lines[self.i]
                    continue

                # Raw string r#"..."#
                if ch == '"':
                    raw_hashes = 0
                    k = self.j - 1
                    while k >= 0 and line[k] == '#':
                        raw_hashes += 1
                        k -= 1
                    if k >= 0 and line[k] == 'r':
                        close_pat = '"' + '#' * raw_hashes
                        self.j += 1
                        while True:
                            pos = self.lines[self.i].find(close_pat, self.j)
                            if pos >= 0:
                                self.j = pos + len(close_pat)
                                break
                            if not self._advance_line():
                                return len(self.lines) - 1
                        line = self.lines[self.i]
                        continue
                    self._in_string = True
                    self.j += 1
                    continue

                # Char literal vs lifetime
                if ch == "'" and self.j + 1 < len(line):
                    rest = line[self.j + 1: self.j + 5]
                    if rest and (rest[0] == '\\' or "'" in rest[1:4]):
                        self._in_char = True
                        self.j += 1
                        continue
                    self.j += 1
                    continue

                if ch == '{':
                    self.depth += 1
                    found_open = True
                elif ch == '}':
                    self.depth -= 1
                    if found_open and self.depth == 0:
                        return self.i

                self.j += 1

            if not self._advance_line():
                break
        return len(self.lines) - 1

    def find_item_end(self, max_line: int) -> int:
        """Find end of a Rust item: first `}` at depth 0 (if braces seen)
        or first `;` at depth 0 (if no braces yet). Respects strings."""
        found_brace = False
        while self.i <= max_line:
            line = self.lines[self.i]
            while self.j < len(line):
                ch = line[self.j]

                if self._escape:
                    self._escape = False
                    self.j += 1
                    continue

                if self._in_char:
                    if ch == '\\':
                        self._escape = True
                    elif ch == "'":
                        self._in_char = False
                    self.j += 1
                    continue

                if self._in_string:
                    if ch == '\\':
                        self._escape = True
                    elif ch == '"':
                        self._in_string = False
                    self.j += 1
                    continue

                if ch == '\\':
                    self._escape = True
                    self.j += 1
                    continue

                if ch == '/' and self.j + 1 < len(line) and line[self.j + 1] == '/':
                    break

                if ch == '/' and self.j + 1 < len(line) and line[self.j + 1] == '*':
                    self.j += 2
                    while True:
                        while self.j < len(self.lines[self.i]):
                            if (self.lines[self.i][self.j] == '*'
                                    and self.j + 1 < len(self.lines[self.i])
                                    and self.lines[self.i][self.j + 1] == '/'):
                                self.j += 2
                                break
                            self.j += 1
                        else:
                            self.i += 1
                            self.j = 0
                            if self.i > max_line:
                                return max_line
                            continue
                        break
                    line = self.lines[self.i]
                    continue

                if ch == '"':
                    raw_hashes = 0
                    k = self.j - 1
                    while k >= 0 and line[k] == '#':
                        raw_hashes += 1
                        k -= 1
                    if k >= 0 and line[k] == 'r':
                        close_pat = '"' + '#' * raw_hashes
                        self.j += 1
                        while True:
                            pos = self.lines[self.i].find(close_pat, self.j)
                            if pos >= 0:
                                self.j = pos + len(close_pat)
                                break
                            self.i += 1
                            self.j = 0
                            if self.i > max_line:
                                return max_line
                        line = self.lines[self.i]
                        continue
                    self._in_string = True
                    self.j += 1
                    continue

                if ch == "'" and self.j + 1 < len(line):
                    rest = line[self.j + 1: self.j + 5]
                    if rest and (rest[0] == '\\' or "'" in rest[1:4]):
                        self._in_char = True
                        self.j += 1
                        continue
                    self.j += 1
                    continue

                if ch == '{':
                    self.depth += 1
                    found_brace = True
                elif ch == '}':
                    self.depth -= 1
                    if found_brace and self.depth == 0:
                        return self.i
                elif ch == ';' and self.depth == 0 and not found_brace:
                    return self.i

                self.j += 1

            self.i += 1
            self.j = 0
        return max_line


# ---------------------------------------------------------------------------
# Item extraction & processing
# ---------------------------------------------------------------------------

def _extract_items(lines: list[str], body_start: int, body_end: int) -> list[dict]:
    """Extract top-level items from within a #[cfg(test)] module body."""
    items = []
    i = body_start
    while i <= body_end:
        stripped = lines[i].strip()
        if not stripped or stripped.startswith("//"):
            i += 1
            continue

        # Walk back to include preceding doc-comments and attributes.
        item_start = i
        while item_start > body_start:
            prev = lines[item_start - 1].strip()
            if prev.startswith("//") or prev.startswith("#["):
                item_start -= 1
            else:
                break

        # Find item end using the scanner.
        scanner = RustScanner(lines, i, 0)
        item_end = scanner.find_item_end(body_end)

        text = "\n".join(lines[item_start: item_end + 1])
        is_test = "#[test]" in text
        has_fixture = bool(FIXTURE_RE.search(text))
        name_match = re.search(
            r'\b(?:fn|const|static|struct|enum|mod|type)\s+(\w+)', text
        )
        name = name_match.group(1) if name_match else ""

        items.append({
            "start": item_start,
            "end": item_end,
            "text": text,
            "name": name,
            "is_test": is_test,
            "has_fixture_ref": has_fixture,
        })
        i = item_end + 1

    return items


def process_file(path: Path) -> bool:
    """Process a single .rs file. Returns True if the file was modified."""
    content = path.read_text()
    if '../../cli/' not in content:
        return False

    lines = content.split('\n')
    regions_to_remove: list[tuple[int, int]] = []

    i = 0
    while i < len(lines):
        stripped = lines[i].strip()

        if stripped != '#[cfg(test)]':
            i += 1
            continue

        cfg_line = i

        # Find the next non-blank, non-comment, non-attribute line
        j = i + 1
        while j < len(lines) and (
            not lines[j].strip()
            or lines[j].strip().startswith("//")
            or lines[j].strip().startswith("#[")
        ):
            j += 1

        if j >= len(lines):
            i += 1
            continue

        next_line = lines[j].strip()

        # Case 1: #[cfg(test)] mod ... { }
        if re.match(r'(pub\s+)?mod\s+\w+', next_line):
            scanner = RustScanner(lines, j, 0)
            mod_close = scanner.find_matching_brace()

            mod_text = "\n".join(lines[cfg_line: mod_close + 1])
            if not FIXTURE_RE.search(mod_text):
                i = mod_close + 1
                continue

            # Module body = lines between opening { and closing }
            # Find the { on the mod line
            brace_col = lines[j].index('{') if '{' in lines[j] else -1
            if brace_col < 0:
                i = mod_close + 1
                continue
            body_start = j + 1
            body_end = mod_close - 1

            if body_start > body_end:
                regions_to_remove.append((cfg_line, mod_close))
                i = mod_close + 1
                continue

            items = _extract_items(lines, body_start, body_end)

            # Transitive closure: propagate fixture-dependency.
            changed = True
            while changed:
                changed = False
                tainted = {
                    it["name"] for it in items
                    if it["has_fixture_ref"] and it["name"]
                }
                for it in items:
                    if it["has_fixture_ref"]:
                        continue
                    for tn in tainted:
                        if tn and tn in it["text"]:
                            it["has_fixture_ref"] = True
                            changed = True
                            break

            items_to_remove = [it for it in items if it["has_fixture_ref"]]
            if not items_to_remove:
                i = mod_close + 1
                continue

            remaining_tests = [
                it for it in items
                if it["is_test"] and not it["has_fixture_ref"]
            ]
            remaining_non_use = [
                it for it in items
                if not it["has_fixture_ref"]
                and not it["text"].strip().startswith("use ")
            ]

            if not remaining_tests and not remaining_non_use:
                # Remove entire module
                start = cfg_line
                while start > 0:
                    prev = lines[start - 1].strip()
                    if not prev or prev.startswith("//"):
                        start -= 1
                    else:
                        break
                regions_to_remove.append((start, mod_close))
            else:
                for it in items_to_remove:
                    start = it["start"]
                    while start > body_start and not lines[start - 1].strip():
                        start -= 1
                    if start < it["start"]:
                        start += 1
                    regions_to_remove.append((start, it["end"]))

            i = mod_close + 1
            continue

        # Case 2: #[cfg(test)] on a single item
        else:
            scanner = RustScanner(lines, j, 0)
            item_end = scanner.find_item_end(len(lines) - 1)
            item_text = "\n".join(lines[cfg_line: item_end + 1])
            if FIXTURE_RE.search(item_text):
                regions_to_remove.append((cfg_line, item_end))
            i = item_end + 1
            continue

    if not regions_to_remove:
        return False

    # Remove from bottom to top
    regions_to_remove.sort(key=lambda r: r[0], reverse=True)
    for start, end in regions_to_remove:
        del lines[start: end + 1]
        if 0 < start < len(lines):
            if not lines[start - 1].strip() and not lines[start].strip():
                del lines[start]

    # Ensure single trailing newline
    while lines and not lines[-1].strip():
        lines.pop()
    lines.append("")

    new_content = "\n".join(lines)
    if new_content != content:
        path.write_text(new_content)
        return True
    return False


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <src-dir>", file=sys.stderr)
        sys.exit(1)

    src_dir = Path(sys.argv[1])
    if not src_dir.is_dir():
        print(f"Error: {src_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    modified = []
    for rs_file in sorted(src_dir.rglob("*.rs")):
        if process_file(rs_file):
            modified.append(rs_file)

    if modified:
        print(f"Stripped fixture-dependent tests from {len(modified)} file(s):")
        for f in modified:
            print(f"  {f}")
    else:
        print("No fixture-dependent tests found.")


if __name__ == "__main__":
    main()
