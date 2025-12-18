---
name: version-merge
description: "Resolve versions.yml merge conflicts by automatically reorganizing versions and adjusting semver differences"
---

# /fern:version-merge - Versions.yml Merge Conflict Resolver

## When to Use
- Git merge conflicts detected **only** in versions.yml files
- After merging main into feature branch with conflicting version entries

## Prerequisites
- Must be in git merge state with unresolved conflicts
- Only versions.yml files have conflicts (abort if other files conflicted)

## Algorithm

### 1. Detect & Validate
```bash
# Must find conflicts only in versions.yml files
git status --porcelain | grep "^UU"
git status --porcelain | grep "^UU" | grep -v "versions\.yml$"  # should be empty
```

### 2. For Each Conflicted versions.yml

**Parse conflict sections:**
- HEAD section = our branch (feature)
- Incoming section = their branch (main)

**Determine version placement:**
- Our version entry goes **first**
- Their version entry goes **second**
- Remaining history follows

**Adjust semver if their version is higher:**

1. Determine original difference type (our version vs original base):
   - Major: `1.x.x` → `2.0.0`
   - Minor: `1.2.x` → `1.3.0`
   - Patch: `1.2.3` → `1.2.4`

2. Apply same difference type to new base (their version):
   ```
   If our 3.28.0 was minor bump from 3.27.1,
   and theirs is 3.28.5,
   then ours becomes 3.29.0 (minor bump from 3.28.5)
   ```

**Handle split conflicts:** Fields outside markers (createdAt, irVersion) belong to the kept entry.

### 3. Write & Resolve
- Write resolved content preserving YAML structure
- `git add <file>` to mark resolved
- Report summary of adjustments

## Example: Split Conflict with Higher Main Version

**Input (conflict):**
```yaml
< <<<<<< HEAD
- version: 3.27.2
  changelogEntry:
    - summary: Fix bug
      type: fix
=======
- version: 3.28.0
  changelogEntry:
    - summary: Add feature
      type: feat
> >>>>>> main
  createdAt: "2025-12-17"
  irVersion: 61
```

**Analysis:**
- Ours: 3.27.2 (patch from 3.27.1)
- Theirs: 3.28.0 (higher)
- Adjustment: 3.28.0 + patch = 3.28.1

**Output:**
```yaml
- version: 3.28.1
  changelogEntry:
    - summary: Fix bug
      type: fix
  createdAt: "2025-12-17"
  irVersion: 61

- version: 3.28.0
  changelogEntry:
    - summary: Add feature
      type: feat
  createdAt: "2025-12-17"
  irVersion: 61
```

## Error Handling
- **Not in merge state**: Abort with message
- **Non-versions.yml conflicts**: Abort, list files to resolve first
- **Invalid version/YAML**: Warn, provide manual resolution instructions
- **Recovery**: `git checkout -- <file>` or `git merge --abort`

## Boundaries
- Only resolves versions.yml conflicts
- Does NOT commit (user runs `git commit`)
- Does NOT modify changelog content, only version numbers when needed