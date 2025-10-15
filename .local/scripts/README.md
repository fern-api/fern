# Fern IR Diff Scripts

This directory contains scripts for analyzing differences between local and remote Fern IR (Intermediate Representation) files.

## Scripts

### `key-differences-summary.js`
Shows a clean summary of the key differences between local and remote IR files.

**Usage:**
```bash
node key-differences-summary.js
```

**Output:** Console summary of main differences including:
- Hosting configuration (self-hosted vs remote)
- Publish configuration
- Dynamic configuration
- SDK configuration
- File sizes

### `abbreviated-diff.js`
Generates a traditional line-by-line diff with identical sections skipped for readability.

**Usage:**
```bash
node abbreviated-diff.js
```

**Output:** `../abbreviated-diff.txt` - A git-style diff showing only the differences with context

### `diff-large-json.js`
Creates a structured diff report comparing JSON structure and key differences.

**Usage:**
```bash
node diff-large-json.js
```

**Output:** `../json-diff-report.md` - A markdown report with categorized differences

### `find-config-diffs.js`
Shows specific configuration sections (publish, dynamic, SDK) in detail.

**Usage:**
```bash
node find-config-diffs.js
```

**Output:** Console output showing detailed config comparisons

## File Structure

The scripts expect the following files to exist in the parent directory (`.local/`):
- `local-ir.json` - Local IR file
- `remote-ir.json` - Remote IR file

Output files are written to the parent directory (`.local/`):
- `abbreviated-diff.txt` - Line-by-line diff
- `json-diff-report.md` - Structured diff report

## Running Scripts

All scripts should be run from this directory (`.local/scripts/`):

```bash
cd .local/scripts
node <script-name>.js
```

## Notes

- Scripts use relative paths (`../`) to access files in the parent directory
- The abbreviated diff script has no line limits and may generate very large output files
- All scripts are designed to handle large JSON files efficiently
