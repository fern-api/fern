use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::auth::BearerAuth;
use fern_cli_sdk::openapi::OpenApiBinding;

fn main() {
    CliApp::new("openapi-fixture")
        .auth(BearerAuth::new("bearer").env("OPENAPI_FIXTURE_API_KEY"))
        .error_docs_base_url("https://docs.example.com/errors")
        .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
        .run()
}
