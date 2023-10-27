---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: dsinghvi

---

## Describe the Bug
A clear and concise description of what the bug is.

## Information to Reproduce

### CLI Version
The version of the Fern CLI you are using (found in `fern.config.json`). 

### Generator Version
The version of the OpenAPI generator you are using (found in `generators.yml`). 

### Custom Config
Any custom configuration requires to reproduce the bug (found in `generators.yml`).
```yaml
config: 
  format: json
  customOverrides: 
    license: MIT
```

### Fern Definition
The minimal fern definition required to reproduce the bug (found in `generators.yml`).
```yaml
types: 
  Movie: 
   name: string
   rating: double
```

### Actual OpenAPI
The buggy OpenAPI document that is produced: 
```yaml
paths: 
  /my/path: 
   post: 
     foo: bar # <----- This part is buggy
```

### Expected OpenAPI
The buggy OpenAPI document that is produced: 
```yaml
paths: 
  /my/path: 
   post: 
     baz: faz # <----- This is the fix
```

## Additional Context
Add any other context about the problem here.
