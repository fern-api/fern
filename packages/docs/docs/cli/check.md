---
title: fern check
---

Check whether your **Fern Definition** is valid and ready to be used by code generators. This runs a validator/linter locally.

## Usage

<!-- markdownlint-disable MD040 -->

```
fern check
```

## Examples of invalid

- A type that is referenced is undefined.
- An endpoint is missing a path.
- An error name is used more than once.
