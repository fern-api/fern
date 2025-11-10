Code samples
=====

This is our recommended convention for organizing `code_samples`:

[x-codeSamples](https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
Path `<lang>/<path>/<HTTP verb>.<extension>` where:
  * `<lang>` - name of the language from [this](https://github.com/github/linguist/blob/master/lib/linguist/popular.yml) list.
  * `<path>` - path of the target method, where all `/` are replaced with `_`.
  * `<HTTP verb>` - verb of target method.
  * `<extension>` - ignored.
