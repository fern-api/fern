//! Tests for the public library API surface.
//!
//! These verify that customers can use the library as documented.

#[test]
fn test_cli_app_builder_chain() {
    fn custom_handler(
        _args: &clap::ArgMatches,
        _ctx: &fern_cli_sdk::openapi::AppContext,
    ) -> Result<(), fern_cli_sdk::error::CliError> {
        Ok(())
    }

    let app = fern_cli_sdk::app::CliApp::new("test")
        .binding(
            fern_cli_sdk::openapi::OpenApiBinding::new()
                .spec(include_str!("../cli/openapi-fixture/openapi.yaml"))
                .auth_scheme_env("bearer", "TEST_TOKEN"),
        )
        .command(
            clap::Command::new("custom").about("A custom command"),
            fern_cli_sdk::openapi::OpenApiBinding::handler(custom_handler),
        );

    // Builder chain completes without panic — the app is ready to run
    // (We can't inspect private fields from integration tests, but the
    // builder pattern itself is the test: if it compiles, the API works.)
    drop(app);
}

#[test]
fn test_building_blocks_accessible() {
    // Verify all public modules are importable and types are usable
    let yaml = include_str!("../cli/openapi-fixture/openapi.yaml");
    let doc = fern_cli_sdk::openapi::load_openapi_spec(yaml, "test").unwrap();
    let cmd = fern_cli_sdk::openapi::commands::build_cli(&doc);

    assert!(cmd.find_subcommand("users").is_some());
    assert!(cmd.find_subcommand("files").is_some());

    // Verify key types are accessible
    let _format = fern_cli_sdk::formatter::OutputFormat::Json;
    let _pagination = fern_cli_sdk::openapi::executor::PaginationConfig::default();
}

#[test]
fn test_error_type_accessible() {
    let err = fern_cli_sdk::error::CliError::Validation("test".to_string());
    assert_eq!(err.exit_code(), 3);
}
