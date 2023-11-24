Fern allows you to import other APIs into your API.

This is often useful if:

- you want to reuse another API's types in your API
- you want to combine multiple microservices' APIs into one SDK (similar to the AWS SDK)

## Registering the dependency API

The first step is to **register** the API you want to depend on. To do this, use
the `register` compiler command:

```
$ fern register
[some-dependency]: Uploading definition...
[some-dependency]: Registered @fern/some-dependency:0.0.1
```

## Depending on the registered API

To add a dependency on another API, you simply create a folder in your Fern
Definition to "house" the dependency. Inside the folder, create a special file
`__package__.yml` which specifies the dependency and version you want to add.

```yaml
fern/
├─ fern.config.json
└─ api/ # your API
  ├─ generators.yml
  └─ definition/
    ├─ api.yml
    ├─ imdb.yml
    └─ my-folder
      └─ __package__.yml
```

```yaml __package__.yml
export:
  name: @fern/some-dependency
  version: 0.0.1
```

When you compile the API with `fern generate`, the `__package__.yml` file will
effectively be replaced with the API you're depending on.
