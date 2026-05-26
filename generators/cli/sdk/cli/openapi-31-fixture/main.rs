use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;

fn main() {
    CliApp::new("openapi-31-fixture")
        .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
        .run()
}
