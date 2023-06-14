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
- [x] Add integration tests (i.e. with hard-coded `ir.json` files and fixtures)
- [x] Verify with round-trip tests (i.e. deserialize and re-serialize and verify it is equivalent)
- [x] Handle literal values in objects and [undiscriminated] unions
- [x] Add unsafe words to the Fern compiler (i.e. Go keywords).
- [x] Polish (e.g. better method receiver identifiers)
- [x] Generate a basic `go.mod`, `go.sum`, etc (similar to Fern's Typescript generator's `package.json`)
- [ ] API review

## Client

- [x] Design client API
- [x] Generate error types
- [x] Generate endpoint request types
- [x] Generate endpoint structures
- [x] Generate endpoint error decoders
- [x] Generate core utilities
- [ ] Generate authorization options
- [ ] Generate endpoint call method
- [ ] Generate client (w/ root endpoints and nested service endpoints)
- [ ] Generate documentation for all relevant types
- [ ] Generate examples
- [ ] Support optional client/endpoint variables (e.g. namespace)
- [ ] Support environment settings (e.g. a `Production` URL)
