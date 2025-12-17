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

- **Package:** filelock (pip)
- **Severity:** MEDIUM
- **Vulnerable versions:** < 3.20.1
- **Patched version:** 3.20.1
- **CVE:** CVE-2025-68146
- **GHSA:** GHSA-w853-jp5j-5j7f
- **Manifest:** generators/python/poetry.lock

**Summary:**
filelock has a TOCTOU race condition which allows symlink attacks during lock file creation

**Description:**
### Impact

A Time-of-Check-Time-of-Use (TOCTOU) race condition allows local attackers to corrupt or truncate arbitrary user files through symlink attacks. The vulnerability exists in both Unix and Windows lock file creation where filelock checks if a file exists before opening it with O_TRUNC. An attacker can create a symlink pointing to a victim file in the time gap between the check and open, causing os.open() to follow the symlink and truncate the target file.

**Who is impacted:**

All users of filelock on Unix, Linux, macOS, and Windows systems. The vulnerability cascades to dependent libraries:

- **virtualenv users**: Configuration files can be overwritten with virtualenv metadata, leaking sensitive paths
- **PyTorch users**: CPU ISA cache or model checkpoints can be corrupted, causing crashes or ML pipeline failures
- **poetry/tox users**: through using virtualenv or filelock on their own.

Attack requires local filesystem access and ability to create symlinks (standard user permissions on Unix; Developer Mode on Windows 10+). Exploitation succeeds within 1-3 attempts when lock file paths are predictable.

### Patches

Fixed in version **3.20.1**.

**Unix/Linux/macOS fix:** Added O_NOFOLLOW flag to os.open() in UnixFileLock.\_acquire() to prevent symlink following.

**Windows fix:** Added GetFileAttributesW API check to detect reparse points (symlinks/junctions) before opening files in WindowsFileLock.\_acquire().

**Users should upgrade to filelock 3.20.1 or later immediately.**

### Workarounds

If immediate upgrade is not possible:

1. Use SoftFileLock instead of UnixFileLock/WindowsFileLock (note: different locking semantics, may not be suitable for all use cases)
2. Ensure lock file directories have restrictive permissions (chmod 0700) to prevent untrusted users from creating symlinks
3. Monitor lock file directories for suspicious symlinks before running trusted applications

**Warning:** These workarounds provide only partial mitigation. The race condition remains exploitable. Upgrading to version 3.20.1 is strongly recommended.

______________________________________________________________________

## Technical Details: How the Exploit Works

### The Vulnerable Code Pattern

**Unix/Linux/macOS** (`src/filelock/_unix.py:39-44`):

```python
def _acquire(self) -> None:
    ensure_directory_exists(self.lock_file)
    open_flags = os.O_RDWR | os.O_TRUNC  # (1) Prepare to truncate
    if not Path(self.lock_file).exists():  # (2) CHECK: Does file exist?
        open_flags |= os.O_CREAT
    fd = os.open(self.lock_file, open_flags, ...)  # (3) USE: Open and truncate
```

**Windows** (`src/filelock/_windows.py:19-28`):

```python
def _acquire(self) -> None:
    raise_on_not_writable_file(self.lock_file)  # (1) Check writability
    ensure_directory_exists(self.lock_file)
    flags = os.O_RDWR | os.O_CREAT | os.O_TRUNC  # (2) Prepare to truncate
    fd = os.open(self.lock_file, flags, ...)  # (3) Open and truncate
```

### The Race Window

The vulnerability exists in the gap between operations:

**Unix variant:**

```
Time    Victim Thread                          Attacker Thread
----    -------------                          ---------------
T0      Check: lock_file exists? → False
T1                                             ↓ RACE WINDOW
T2                                             Create symlink: lock → victim_file
T3      Open lock_file with O_TRUNC
        → Follows symlink
        → Opens victim_file
        → Truncates victim_file to 0 bytes! ☠️
```

**Windows variant:**

```
Time    Victim Thread                          Attacker Thread
----    -------------                          ---------------
T0      Check: lock_file writable?
T1                                             ↓ RACE WINDOW
T2                                             Create symlink: lock → victim_file
T3      Open lock_file with O_TRUNC
        → Follows symlink/junction
        → Opens victim_file
        → Truncates victim_file to 0 bytes! ☠️
```

### Step-by-Step Attack Flow

**1. Attacker Setup:**

```python
# Attacker identifies target application using filelock
lock_path = "/tmp/myapp.lock"  # Predictable lock path
victim_file = "/home/victim/.ssh/config"  # High-value target
```

**2. Attacker Creates Race Condition:**

```python
import os
import threading


def attacker_thread():
    # Remove any existing lock file
    try:
        os.unlink(lock_path)
    except FileNotFoundError:
        pass

    # Create symlink pointing to victim file
    os.symlink(victim_file, lock_path)
    print(f"[Attacker] Created: {lock_path} → {victim_file}")


# Launch attack
threading.Thread(target=attacker_thread).start()
```

**3. Victim Application Runs:**

```python
from filelock import UnixFileLock

# Normal application code
lock = UnixFileLock("/tmp/myapp.lock")
lock.acquire()  # ← VULNERABILITY TRIGGERED HERE
# At this point, /home/victim/.ssh/config is now 0 bytes!
```

**4. What Happens Inside os.open():**

On Unix systems, when `os.open()` is called:

```c
// Linux kernel behavior (simplified)
int open(const char *pathname, int flags) {
    struct file *f = path_lookup(pathname);  // Resolves symlinks by default!

    if (flags & O_TRUNC) {
        truncate_file(f);  // ← Truncates the TARGET of the symlink
    }

    return file_descriptor;
}
```

Without `O_NOFOLLOW` flag, the kernel follows the symlink and truncates the target file.

### Why the Attack Succeeds Reliably

**Timing Characteristics:**

- **Check operation** (Path.exists()): ~100-500 nanoseconds
- **Symlink creation** (os.symlink()): ~1-10 microseconds
- **Race window**: ~1-5 microseconds (very small but exploitable)
- **Thread scheduling quantum**: ~1-10 milliseconds

**Success factors:**

1. **Tight loop**: Running attack in a loop hits the race window within 1-3 attempts
2. **CPU scheduling**: Modern OS thread schedulers frequently context-switch during I/O operations
3. **No synchronization**: No atomic file creation prevents the race
4. **Symlink speed**: Creating symlinks is extremely fast (metadata-only operation)

### Real-World Attack Scenarios

**Scenario 1: virtualenv Exploitation**

```python
# Victim runs: python -m venv /tmp/myenv
# Attacker racing to create:
os.symlink("/home/victim/.bashrc", "/tmp/myenv/pyvenv.cfg")

# Result: /home/victim/.bashrc overwritten with:
# home = /usr/bin/python3
# include-system-site-packages = false
# version = 3.11.2
# ← Original .bashrc contents LOST + virtualenv metadata LEAKED to attacker
```

**Scenario 2: PyTorch Cache Poisoning**

```python
# Victim runs: import torch
# PyTorch checks CPU capabilities, uses filelock on cache
# Attacker racing to create:
os.symlink("/home/victim/.torch/compiled_model.pt", "/home/victim/.cache/torch/cpu_isa_check.lock")

# Result: Trained ML model checkpoint truncated to 0 bytes
# Impact: Weeks of training lost, ML pipeline DoS
```

### Why Standard Defenses Don't Help

**File permissions don't prevent this:**

- Attacker doesn't need write access to victim_file
- os.open() with O_TRUNC follows symlinks using the *victim's* permissions
- The victim process truncates its own file

**Directory permissions help but aren't always feasible:**

- Lock files often created in shared /tmp directory (mode 1777)
- Applications may not control lock file location
- Many apps use predictable paths in user-writable directories

**File locking doesn't prevent this:**

- The truncation happens *during* the open() call, before any lock is acquired
- fcntl.flock() only prevents concurrent lock acquisition, not symlink attacks

### Exploitation Proof-of-Concept Results

From empirical testing with the provided PoCs:

**Simple Direct Attack** (`filelock_simple_poc.py`):

- Success rate: 33% per attempt (1 in 3 tries)
- Average attempts to success: 2.1
- Target file reduced to 0 bytes in \<100ms

**virtualenv Attack** (`weaponized_virtualenv.py`):

- Success rate: ~90% on first attempt (deterministic timing)
- Information leaked: File paths, Python version, system configuration
- Data corruption: Complete loss of original file contents

**PyTorch Attack** (`weaponized_pytorch.py`):

- Success rate: 25-40% per attempt
- Impact: Application crashes, model loading failures
- Recovery: Requires cache rebuild or model retraining

**Discovered and reported by:** George Tsigourakos (@tsigouris007)

---
[View Dependabot Alert](https://github.com/fern-api/fern/security/dependabot/803)
