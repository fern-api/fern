---
title: fern init
position: 1
---

Create a new **Fern Definition**.

## Usage

<!-- markdownlint-disable MD040 -->

```
fern init
```

This will create the following folder structure in your project:

```yml
fern/
└── api
  ├── definition
    ├── api.yml # Your API name and the authentication scheme
    └── imdb.yml # An example Fern Definition for IMDb (International Movie Database)
  └── generators.yml # A list of code generators you're using
fern.config.json # Configure your organization name and the version of Fern CLI you're using
```
