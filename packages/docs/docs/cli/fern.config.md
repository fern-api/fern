---
title: fern.config.json
---

`fern.config.json` is a file where you set configuration for all of the APIs in your project. It contains your organization name and the version of the Fern CLI you are using. Therefore you should include this file in your version control, to ensure that the correct version is being used next time you call the command.

```json
{
  "organization": "imdb", // your organization name
  "version": "0.0.xxx" // version of the Fern CLI you're using
}
```

Here's [an example](https://github.com/fern-api/fern-examples/blob/main/fern/fern.config.json).
