---
name: Python Generator Bug report
about: Report a bug with the Python Generator
title: "[Bug]"
labels: python
assignees: armandobelardo
---

## Describe the Bug

A clear and concise description of what the bug is.

## Information to Reproduce

### CLI Version

The version of the Fern CLI you are
using (found in `fern.config.json`).

### Generator Version

The version of the generator you are using (found in `generators.yml`).
Plus any custom configuration required to reproduce the bug (found in `generators.yml`).

### API Definition

The minimal OpenAPI specification or Fern definition required to reproduce the bug.

```yaml
types:
  Pet:
    name: string
    age: double
```

### Actual SDK

The buggy SDK that is produced:

```python
# client.py

class PetStore:
  def __init__(self):
    self._client = None # <-------- This part is buggy
```

### Expected SDK

The expected SDK

```python
import httpx

# client.py
class PetStore:
  def __init__(self):
    self._client = new httpx.Client() # <----- This is the fix
```

## Additional Context

Add any other context about the problem here.
