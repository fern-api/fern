use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BearerAuth;
use fern_cli_sdk::openapi::OpenApiBinding;
use fern_cli_sdk::profiles::ProfilesConfig;

fn main() {
    CliApp::new("openapi-fixture")
        .auth(BearerAuth::new("bearer").env("OPENAPI_FIXTURE_API_KEY"))
        .error_docs_base_url("https://docs.example.com/errors")
        // Profiles are opt-in for generated CLIs (see `ProfilesConfig`); the
        // fixture opts in so `tests/profiles.rs` can drive the real binary.
        // `server_var` is deliberately *not* registered here — the fixture's
        // spec declares no server variables, and the profile-sourced
        // server-variable path is covered by unit tests in
        // `openapi::app` instead of by changing this fixture's help surface.
        .profiles(ProfilesConfig::new())
        .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
        .run()
}
