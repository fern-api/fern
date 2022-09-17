---
title: fern upgrade
---

Upgrade version in `fern.config.json` and code generator versions in `generators.yml`. This ensures that you have the latest Fern CLI, including recently added `fern check` rules, and the latest code generation improvements.

## Usage

```bash
fern upgrade
```

## Examples of changes

```diff
# fern.config.json
{
   "organization": "imdb",
-  "version": "0.0.182"
+  "version": "0.0.188"
}
```

```diff
# generators.yml
draft:
   - name: fernapi/fern-typescript
-    version: 0.0.189
+    version: 0.0.191
     config:
       mode: client
release: []
```
