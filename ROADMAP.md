# Roadmap

The following outlines a roadmap for the development of the Go generator.

## Model

- [x] Setup generator (i.e. `fern-go` binary)
- [x] Generate basic types (e.g. types, enums, and built-in types)
- [x] Generate unions, visitors, unmarshalers, etc
- [x] Generate undiscriminated unions
- [x] Handle object aliases (i.e. in `json.Unmarshaler`)
- [x] Generate the IR
- [x] Bootstrap the generator (i.e. Replace the manually-written IR with the generated IR)
- [x] Design and implement better generator output (i.e. generate into separate Go packages, files, etc)
- [x] Handle cross-package imports
- [x] Generate documentation for all relevant types
- [] Handle literal values in objects and [undiscriminated] unions
- [] Verify with round-trip tests (i.e. deserialize and re-serialize `ir.json` and verify its equivalent)
- [] Generate a basic `go.mod`, `go.sum`, etc (similar to Fern's Typescript generator's `package.json`)
- [] Add unsafe words to the Fern compiler (i.e. Go keywords).
- [] Add integration tests (i.e. with hard-coded `ir.json` files and fixtures)
- [] Polish (e.g. better method receiver identifiers)
- [] API review

## Client

- [] Design client API
- [] Generate documentation for all relevant types
