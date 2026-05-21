//! Tests for the public library API surface.
//!
//! These verify that customers can use the library as documented.

#[test]
fn test_cli_app_builder_chain() {
    let app = fern_cli_sdk::openapi::CliApp::new("test")
        .spec(include_str!("../src/openapi/__fixtures__/openapi.json"))
        .auth_scheme_env("bearer", "TEST_TOKEN")
        .command(
            clap::Command::new("custom").about("A custom command"),
            |_args, _ctx| Ok(()),
        );

    // Builder chain completes without panic — the app is ready to run
    // (We can't inspect private fields from integration tests, but the
    // builder pattern itself is the test: if it compiles, the API works.)
    drop(app);
}

#[test]
fn test_building_blocks_accessible() {
    // Verify all public modules are importable and types are usable
    let spec = include_str!("../src/openapi/__fixtures__/openapi.json");
    let doc = fern_cli_sdk::openapi::load_openapi_spec(spec, "test").unwrap();
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
