# protoc-gen-fern

A plugin used to generate Fern's Intermediate Representation (IR).

## Usage

A simple test case is setup for running the plugin in the `tests` directory. You will need [buf][buf]
installed to run the test:

```sh
pnpm dist
cd tests/simple
buf generate
```

[buf]: https://github.com/bufbuild/buf

## Contributing

The setup of this plugin is inspired by [protoc-gen-es][protoc-gen-es], but adapted so that it's
suitable for producing generic source files instead of TypeScript or JavaScript source files.

See the [user guide][user guide] for more details on how to get up and running.

[protoc-gen-es]: https://github.com/bufbuild/protobuf-es/blob/0d0c00e46cca489629a42b0c50e8e60d386f69b7/packages/protoc-gen-es/package.json#L2
[user guide]: https://github.com/bufbuild/protobuf-es/blob/main/MANUAL.md#example-hello-world-plugin
