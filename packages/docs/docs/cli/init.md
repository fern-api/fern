---
title: fern init
---

Initialize a **Fern API**.

## Usage

<!-- markdownlint-disable MD040 MD010 -->

```
fern init
```

This will create the following folder structure in your project:

```yml
fern/
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
  ├─ generators.yml # generators you're using
  └─ definition/
    ├─ api.yml  # configuration for your API
    └─ imdb.yml # a Service, which includes some endpoints
```
