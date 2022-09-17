---
title: fern upgrade
---

Upgrade your Fern CLI in `fern.config.json` and code generators in `generators.yml` to the latest versions. This ensures that you have the latest `fern check` rules in your CLI and code generation improvements.

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
