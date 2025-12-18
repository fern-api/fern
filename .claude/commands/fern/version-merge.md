---
name: version-merge
description: "Resolve versions.yml merge conflicts by automatically reorganizing versions and adjusting semver differences"
category: git
complexity: advanced
mcp-servers: []
personas: []
---

# /fern:version-merge - Versions.yml Merge Conflict Resolver

## Triggers
- Git merge conflicts detected in versions.yml files only
- After merging main branch into feature branch with conflicting version entries
- Manual invocation: `/fern:version-merge`

## Usage
```
/fern:version-merge
```

**No arguments required** - automatically detects and resolves all versions.yml merge conflicts in the repository.

## Prerequisites
- **Must be in a git merge state** with unresolved conflicts
- **Only versions.yml files should have conflicts** - command will abort if other files have conflicts
- **Must be in fern repository** or a repository with versions.yml files

## Behavioral Flow
1. **Validate**: Verify we're in a merge state with conflicts only in versions.yml files
2. **Detect**: Find all versions.yml files with merge conflicts
3. **Parse**: Extract conflicting version entries from both sides of the merge
4. **Reorganize**: Place main branch version below feature branch version
5. **Adjust**: Recalculate semver difference to maintain consistency
6. **Resolve**: Update files and mark conflicts as resolved

## Execution Steps

### Step 1: Validate merge state and conflict scope
```bash
# Check if we're in a merge state
git status --porcelain | grep "^UU"

# Verify conflicts are only in versions.yml files
git status --porcelain | grep "^UU" | grep -v "versions\.yml$"
```

If not in merge state or if non-versions.yml conflicts exist, abort with helpful error message.

### Step 2: Find all versions.yml files with conflicts
```bash
# Find all conflicted versions.yml files
git status --porcelain | grep "^UU.*versions\.yml$" | cut -c4-
```

### Step 3: Process each conflicted versions.yml file

For each conflicted file:

**3a. Extract merge conflict sections**
```bash
# Parse the file to extract conflict markers
# <<<<<<< HEAD (our changes - feature branch)
# ||||||| merged common ancestors (if available)
# =======
# >>>>>>> branch-name (their changes - main branch)
```

**3b. Parse version entries from both sides**
- Extract version entries from the HEAD section (our branch)
- Extract version entries from the incoming section (main branch)
- Identify the newest version from our branch (first entry)
- Identify the newest version from main branch (first entry)

**3c. Determine version placement strategy**
Based on the merge scenario, determine how to reorganize:

1. **Our version is newer than theirs**: Place our version first, their version second
2. **Their version is newer than ours**: Place our version first (keep precedence), their version second
3. **Same version number**: This shouldn't happen but if it does, merge their changelog entries into our version

**3d. Calculate semver difference preservation**

For the version from our branch that we're keeping:
1. Find what it was originally based on (the version that was previously first in our branch)
2. Calculate the original semver difference
3. Find the new immediate predecessor (the version from main that we're placing second)
4. Adjust our version's semver to maintain the same semantic difference type

**Semver difference types**:
- **Patch difference**: `1.2.3` → `1.2.4` (increment patch by 1)
- **Minor difference**: `1.2.3` → `1.3.0` (increment minor by 1, reset patch to 0)
- **Major difference**: `1.2.3` → `2.0.0` (increment major by 1, reset minor and patch to 0)

**Example scenario**:
```yaml
# Original state in our branch:
- version: 3.28.0  # Our new version (minor bump from 3.27.1)
- version: 3.27.1  # Was the previous latest

# Main branch has:
- version: 3.27.2  # Their new version (patch bump from 3.27.1)
- version: 3.27.1  # Same previous latest

# After merge, we want:
- version: 3.28.0  # Keep our version but adjust semver difference
- version: 3.27.2  # Their version becomes our new predecessor

# Semver adjustment logic:
# Original difference: 3.28.0 vs 3.27.1 = minor bump (1.2.3 → 1.3.0 pattern)
# New difference should be: 3.28.0 vs 3.27.2 = minor bump maintained
# Since 3.27.2 → 3.28.0 is already a minor bump, no adjustment needed

# But if theirs was 3.28.5:
# Original: 3.28.0 (minor from 3.27.1)
# New target: maintain minor bump from 3.28.5
# Result: 3.29.0 (minor bump from 3.28.5)
```

**3e. Generate resolved content**
Create the resolved versions.yml content:
- Start with the schema comment if present (`# yaml-language-server: ...`)
- Add our adjusted version entry first
- Add their version entry second
- Add all remaining version entries from the longer history
- Preserve all metadata (createdAt, irVersion, changelogEntry)

### Step 4: Write resolved files and mark as resolved
For each processed file:
```bash
# Write the resolved content
# (Use Write tool to replace file content)

# Mark the conflict as resolved
git add <versions.yml-file>
```

### Step 5: Report results
Show summary:
- Number of versions.yml files processed
- List of adjusted version numbers and their new semver relationships
- Reminder that user needs to review changes and commit the merge

## Version Adjustment Algorithm

### Parse Version Numbers
```bash
# Handle formats: X.Y.Z or X.Y.Z-rcN or X.Y.Z-beta.N
if [[ $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-.*)?$ ]]; then
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  patch="${BASH_REMATCH[3]}"
  suffix="${BASH_REMATCH[4]}"
fi
```

### Calculate Semver Difference Type
```bash
# Compare original_base → our_version to determine difference type
if [[ $our_major > $original_base_major ]]; then
  difference_type="major"
elif [[ $our_minor > $original_base_minor ]]; then
  difference_type="minor"
elif [[ $our_patch > $original_base_patch ]]; then
  difference_type="patch"
fi
```

### Apply Same Difference Type to New Base
```bash
# Apply the same difference type to new_base → adjusted_our_version
case $difference_type in
  "major")
    new_our_major=$((new_base_major + 1))
    adjusted_version="$new_our_major.0.0$suffix"
    ;;
  "minor")
    new_our_minor=$((new_base_minor + 1))
    adjusted_version="$new_base_major.$new_our_minor.0$suffix"
    ;;
  "patch")
    new_our_patch=$((new_base_patch + 1))
    adjusted_version="$new_base_major.$new_base_minor.$new_our_patch$suffix"
    ;;
esac
```

## Examples

### Example 1: Split version entry conflict (tricky case)

**Scenario**: Conflict markers split a version entry, with shared fields outside the conflict

Note: Conflict markers shown with `<` and `>` prefixes to avoid git detecting this file as conflicted.

```
< <<<<<< HEAD
- version: 3.27.2
  changelogEntry:
    - summary: Fix bug in error handling
      type: fix
=======
- version: 3.28.0
  changelogEntry:
    - summary: Add new authentication feature
      type: feat
> >>>>>> main
  createdAt: "2025-12-17"
  irVersion: 61
- version: 3.27.1
  changelogEntry:
    - summary: Previous version
      type: fix
  createdAt: "2025-12-16"
  irVersion: 61
```

**Analysis**:
- Note: The `createdAt` and `irVersion` fields are OUTSIDE the conflict markers - they belong to whichever version entry is kept
- Our version: `3.27.2` (patch bump from `3.27.1`) with `type: fix`
- Their version: `3.28.0` (minor bump from `3.27.1`) with `type: feat`
- Their version is higher, so we need to place ours after theirs and bump our version
- Our original difference type: patch bump
- New base: `3.28.0`
- Required adjustment: `3.28.0` → `3.28.1` (preserve patch bump pattern)

**Result**:
```yaml
- version: 3.28.1
  changelogEntry:
    - summary: Fix bug in error handling
      type: fix
  createdAt: "2025-12-17"
  irVersion: 61

- version: 3.28.0
  changelogEntry:
    - summary: Add new authentication feature
      type: feat
  createdAt: "2025-12-17"
  irVersion: 61

- version: 3.27.1
  changelogEntry:
    - summary: Previous version
      type: fix
  createdAt: "2025-12-16"
  irVersion: 61
```

### Example 2: Version number adjustment needed

**Scenario**: Main branch has higher version that affects our semver difference

```
< <<<<<< HEAD
- version: 3.28.0
  changelogEntry:
    - summary: Add new authentication feature
      type: feat
  createdAt: "2025-12-18"
  irVersion: 61
=======
- version: 3.28.5
  changelogEntry:
    - summary: Multiple fixes from main
      type: fix
  createdAt: "2025-12-17"
  irVersion: 61
> >>>>>> main
- version: 3.27.1
  changelogEntry:
    - summary: Previous version
      type: fix
  createdAt: "2025-12-16"
  irVersion: 61
```

**Analysis**:
- Our version: `3.28.0` (minor bump from `3.27.1`)
- Their version: `3.28.5` (minor then patches from `3.27.1`)
- Original difference type: minor bump
- New base: `3.28.5`
- Required adjustment: `3.28.5` → `3.29.0` (preserve minor bump pattern)

**Result**:
```yaml
- version: 3.29.0
  changelogEntry:
    - summary: Add new authentication feature
      type: feat
  createdAt: "2025-12-18"
  irVersion: 61

- version: 3.28.5
  changelogEntry:
    - summary: Multiple fixes from main
      type: fix
  createdAt: "2025-12-17"
  irVersion: 61

- version: 3.27.1
  changelogEntry:
    - summary: Previous version
      type: fix
  createdAt: "2025-12-16"
  irVersion: 61
```

## Error Handling

### Pre-execution Validation Errors
- **Not in merge state**: "No git merge in progress. This command only works during merge conflicts."
- **Non-versions.yml conflicts**: "Found conflicts in non-versions.yml files. Resolve these first: [file list]"
- **No versions.yml conflicts**: "No versions.yml conflicts found. Merge may already be resolved."

### Processing Errors
- **Invalid version format**: Skip problematic entries, warn user, continue with others
- **Missing conflict markers**: "Malformed conflict in [file]. Please resolve manually."
- **Unparseable YAML**: "Invalid YAML structure in [file] after conflict resolution."

### Recovery Options
- All changes are made to working directory only
- User can `git checkout -- <file>` to revert any file
- User can `git merge --abort` to abandon entire merge
- Command provides specific instructions for manual resolution if automatic resolution fails

## Success Criteria
- All versions.yml merge conflicts resolved automatically
- Version ordering: our branch version first, main branch version second
- Semver differences preserved relative to new immediate predecessor
- YAML structure and formatting maintained
- All files marked as resolved in git (`git add`)
- User can complete merge with `git commit`

## Implementation Notes

### Conflict Marker Parsing
```bash
# Extract sections between conflict markers
awk '/<<<<<<< HEAD/,/=======/' file.yml > our_section.tmp
awk '/=======/,/>>>>>>> /' file.yml > their_section.tmp
```

### YAML Structure Preservation
- Preserve indentation (2 spaces for YAML)
- Maintain comment structure (schema comments, etc.)
- Keep empty lines between version entries
- Preserve multiline changelog summaries with `|` indicator

### Git Integration
- Use `git status --porcelain` for reliable conflict detection
- Use `git add <file>` to mark conflicts as resolved
- Provide clear next steps for completing the merge

## Boundaries

**Will:**
- Resolve merge conflicts in versions.yml files automatically
- Preserve semver difference patterns between versions
- Reorganize version entries (ours first, theirs second)
- Maintain YAML formatting and structure
- Mark files as resolved in git
- Handle multiple conflicted versions.yml files in one operation
- Adjust version numbers when necessary to preserve semver semantics

**Will Not:**
- Resolve conflicts in non-versions.yml files
- Commit the merge (user must do `git commit` manually)
- Work outside of git merge conflicts
- Modify version entries beyond version number adjustment
- Change changelog content or metadata (createdAt, irVersion)
- Handle complex multi-way merges or rebase conflicts