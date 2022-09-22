---
title: fern upgrade
---

Upgrade version in `fern.config.json` and code generator versions in `generators.yml`. This ensures that you have the latest Fern CLI, including recently added `fern check` rules, and the latest code generation improvements.

## Usage

<!-- markdownlint-disable MD040 -->

```
fern upgrade
```

## Examples of changes

```diff title="/fern/fern.config.json"
{
   "organization": "imdb",
-  "version": "0.0.182"
+  "version": "0.0.188"
}
```

```diff title="/fern/api/generators.yml"
draft:
   - name: fernapi/fern-typescript
-    version: 0.0.189
+    version: 0.0.191
     config:
       mode: client
release: []
```
