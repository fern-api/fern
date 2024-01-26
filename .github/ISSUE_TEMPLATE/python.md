---
name: Python Generator Bug report
about: Report a bug with the Python Generator
title: "[Python]"
labels: bug
assignees: dsinghvi

---

## Describe the Bug
A clear and concise description of what the bug is.

## Information to Reproduce

### CLI Version
The version of the Fern CLI you are 
using (found in `fern.config.json`). 

### Generator Version
The version of the Python generator you 
are using (found in `generators.yml`). 

### Custom Config
Any custom configuration requires to r
eproduce the bug (found in `generators.yml`).
```yaml
config: 
  format: json
  customOverrides: 
    license: MIT
```

### Fern Definition
The minimal fern definition required to reproduce the bug.
```yaml
types: 
  Movie: 
   name: string
   rating: double
```

### Actual Python SDK
The buggy Python SDK that is produced: 
```python
# client.py

class PetStore: 
  def __init__(self): 
    self._client = None # <-------- This part is buggy
```

### Expected Python SDK
The expected Python SDK
```python
import httpx

# client.py
class PetStore: 
  def __init__(self): 
    self._client = new httpx.Client() # <----- This is the fix
```

## Additional Context
Add any other context about the problem here.
