use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BearerAuth;
use fern_cli_sdk::error::CliError;
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
        // `tests/table_columns.rs`: a recovered response keeps the
        // operation's `x-fern-cli-table` columns.
        .recover_error(&["catalog", "list"], |err, _| async move {
            match err {
                CliError::Api { code: 409, .. } => Ok(Some(serde_json::json!([
                    { "name": "recovered", "version": 1, "datasetId": "id-recovered" }
                ]))),
                other => Err(other),
            }
        })
        .run()
}
