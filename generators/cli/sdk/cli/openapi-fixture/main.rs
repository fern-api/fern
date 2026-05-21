// Template-author dev bin. Exists so the SDK template's own integration
// tests (tests/cli_integration.rs, tests/openapi_fixture_wire.rs) have an
// `openapi-fixture` binary to exec; the user-facing generator never ships
// this file — `cli/openapi-fixture/**` is in the generator's SDK_IGNORE,
// and copySpecs writes a fresh main.rs from scratch alongside the
// mounted spec(s) at codegen time.
//
// Embedding the lib-test fixture (rather than a separate copy in this
// folder) keeps the SDK source free of duplicate placeholder specs.
use fern_cli_sdk::openapi::CliApp;

fn main() {
    CliApp::new("openapi-fixture")
        .spec(include_str!("../../src/openapi/__fixtures__/openapi.json"))
        .auth_scheme_env("bearer", "OPENAPI_FIXTURE_API_KEY")
        .run()
}
