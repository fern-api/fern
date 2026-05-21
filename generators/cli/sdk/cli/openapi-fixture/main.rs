// Template-author dev bin. Exists so the SDK template's own integration
// tests (tests/cli_integration.rs, tests/openapi_fixture_wire.rs) have an
// `openapi-fixture` binary to exec; the user-facing generator never ships
// this file — `cli/openapi-fixture/**` is in the generator's SDK_IGNORE,
// and copySpecs writes a fresh main.rs from scratch alongside the
// mounted spec(s) at codegen time.
//
// Uses `rich.json` (33 KB) rather than the slimmer `openapi.json` —
// the integration tests rely on the rich fixture's specific paths,
// groups, and x-fern-* extensions. `rich.json` is also in SDK_IGNORE
// so it never reaches user output; users only get the tiny
// `openapi.json` (≈ 1 KB) used by the lib-level overlay tests.
use fern_cli_sdk::openapi::CliApp;

fn main() {
    CliApp::new("openapi-fixture")
        .spec(include_str!("../../src/openapi/__fixtures__/rich.json"))
        .auth_scheme_env("bearer", "OPENAPI_FIXTURE_API_KEY")
        .run()
}
