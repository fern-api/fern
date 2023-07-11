# fern-go

Generate Go models, clients, and server interface from your Fern API Definition.

## Local file generation

When Fern is configured to generate code locally, it can write its output anywhere
on the local filesystem. The Go generator needs to know where to resolve its import
statements from, so you will either need to add an import path or module configuration
to do so.

### Import path

> This is recommended if you plan to depend on the generated Go SDK from within your project,
> and NOT depend on it as a separate, published Go module.

You can generate the Go SDK code into a `gen/go/api` package with the following `generators.yml`
configuration:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-go-sdk
        version: 0.0.11
        config:
          importPath: github.com/<YOUR_ORGANIZATION/<YOUR_REPOSITORY>/gen/go/api
        output:
          location: local-file-system
          path: ../../gen/go/api
```

Note that you will need to update the `<YOUR_ORGANIZATION>` and `<YOUR_REPOSITORY>` placeholders
with the relevant elements in your `go.mod` path.

In this case, the generated Go SDK uses the same `go.mod` path used by the rest of your Go module.

### Module

> This is recommended if you plan to distribute the generated Go SDK as a separate, published Go module.

Alternatively, you can generate the Go SDK code into a separate module (defined with its own `go.mod`)
with the following `generators.yml` configuration:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-go-sdk
        version: 0.0.11
        config:
          module:
            path: github.com/your/sdk
        output:
          location: local-file-system
          path: ../../gen/go/api
```

This configuration will generate a `go.mod` alongside the rest of the Go SDK code at the target output
location. With this, import statements within the generated Go SDK are all resolved from the configured
module path.

By default, the generated `go.mod` will include a `go` version equivalent to the version of the `go` binary
available on your local machine. You can override this behavior by specifying the `version` key like so:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-go-sdk
        version: 0.0.11
        config:
          module:
            path: github.com/your/sdk
            version: "1.19"
        output:
          location: local-file-system
          path: ../../gen/go/api
```

Note that if you want to depend on the generated Go SDK locally (without distributing it as a separate Go module),
and you use the `module` configuration option, you will need to modify your project's top-level `go.mod` to
include a [`replace`](https://go.dev/doc/modules/gomod-ref#replace) statement like so:

```
module github.com/your/module

require "github.com/your/sdk" v0.0.0
replace "github.com/your/sdk" v0.0.0 => "path/to/generated/sdk"
```

If you only plan to use the generated SDK within your own Go module, we recommend using the `importPath` configuration
option described above.
