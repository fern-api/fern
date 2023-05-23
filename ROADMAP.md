# Roadmap

The following outlines a roadmap for the development of the Go generator.

## Model

- [x] Setup generator (i.e. `fern-go` binary)
- [x] Generate basic types (e.g. types, enums, and built-in types)
- [x] Generate unions, visitors, unmarshalers, etc
- [] Generate undiscriminated unions
- [] Handle object aliases (i.e. in `json.Unmarshaler`)
- [x] Generate the IR
- [x] Bootstrap the generator (i.e. Replace the manually-written IR with the generated IR)
- [] Handle cross-package imports
- [] Verify with round-trip tests (i.e. deserialize and re-serialize `ir.json` and verify its equivalent)
- [] Generate documentation for all relevant types.
- [x] Design and implement better generator output (i.e. generate into separate Go packages, files, etc)
- [] Generate a basic `go.mod`, `go.sum`, etc (similar to Fern's Typescript generator's `package.json`)
- [] Add unsafe words to the Fern compiler (i.e. Go keywords).
- [] Add integration tests (i.e. with hard-coded `ir.json` files and fixtures)
- [] API review

## Client

- [] Design client API
