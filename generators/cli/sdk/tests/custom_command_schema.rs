//! `--schema` describes hand-written commands registered through
//! `CliApp::command` / `command_under`.
//!
//! `--schema` is intercepted before clap parses, but custom commands are only
//! grafted onto the clap tree afterwards, so a path owned by a custom command
//! used to fail with `discoveryError` (exit 4) while `--help` on it worked.
use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::openapi::{AppContext, OpenApiBinding};

const SPEC: &str = r#"
openapi: 3.0.0
info: { title: Probe API, version: "1.0" }
paths:
  /plants:
    get:
      operationId: plants_list
      tags: [plants]
      responses:
        "200": { description: ok }
"#;

fn handle(_m: &clap::ArgMatches, _ctx: &AppContext) -> Result<(), CliError> {
    Ok(())
}

fn app() -> CliApp {
    CliApp::new("probe-cli")
        .binding(OpenApiBinding::new().spec(SPEC))
        .command(
            clap::Command::new("water")
                .about("Water every plant")
                .visible_alias("irrigate")
                .arg(
                    clap::Arg::new("amount")
                        .long("amount")
                        .help("Litres per plant")
                        .required(true),
                )
                .arg(
                    clap::Arg::new("dry-run")
                        .long("dry-run")
                        .action(clap::ArgAction::SetTrue),
                )
                .arg(
                    clap::Arg::new("schedule")
                        .long("schedule")
                        .value_parser(["daily", "weekly"]),
                ),
            OpenApiBinding::handler(handle),
        )
        .command_under(
            &["plants"],
            clap::Command::new("prune").about("Prune overgrown plants"),
            OpenApiBinding::handler(handle),
        )
        .command_under(
            &["garden"],
            clap::Command::new("check").about("Check the garden"),
            OpenApiBinding::handler(handle),
        )
        .command_under(
            &["garden"],
            clap::Command::new("seed").about("Seed a bed"),
            OpenApiBinding::handler(handle),
        )
}

fn run(args: &[&str]) -> (i32, serde_json::Value) {
    let mut argv = vec!["probe-cli"];
    argv.extend_from_slice(args);
    let mut out: Vec<u8> = Vec::new();
    let exit = app().try_run_from_with_output(argv, &mut out);
    let text = String::from_utf8_lossy(&out).into_owned();
    let parsed = serde_json::from_str(&text)
        .unwrap_or_else(|e| panic!("args {args:?}: not JSON ({e}): {text}"));
    (exit, parsed)
}

#[test]
fn schema_on_a_top_level_custom_command_describes_its_args() {
    let (exit, schema) = run(&["water", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    assert_eq!(schema["command"], "water");
    assert_eq!(schema["description"], "Water every plant");
    let flags = schema["flags"].as_array().expect("flags");
    let flag = |name: &str| {
        flags
            .iter()
            .find(|f| f["flag"] == name)
            .unwrap_or_else(|| panic!("no {name} in {schema:#}"))
    };
    assert_eq!(flag("--amount")["required"], true);
    assert_eq!(flag("--amount")["description"], "Litres per plant");
    assert_eq!(flag("--dry-run")["type"], "boolean");
    assert_eq!(
        flag("--schedule")["enum"],
        serde_json::json!(["daily", "weekly"])
    );
    assert!(flags.iter().all(|f| f["flag"] != "--help"), "{schema:#}");
}

#[test]
fn schema_resolves_a_custom_command_by_its_alias() {
    let (exit, schema) = run(&["irrigate", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    assert_eq!(schema["command"], "water");
}

#[test]
fn schema_on_a_custom_command_nested_under_a_spec_group() {
    let (exit, schema) = run(&["plants", "prune", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    assert_eq!(schema["command"], "plants prune");
}

#[test]
fn schema_on_a_custom_only_group_lists_its_commands() {
    let (exit, schema) = run(&["garden", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    let names: Vec<&str> = schema
        .as_array()
        .expect("array")
        .iter()
        .map(|e| e["command"].as_str().unwrap())
        .collect();
    assert_eq!(names, ["garden check", "garden seed"]);
}

#[test]
fn spec_operations_keep_their_schema_and_unknown_paths_still_error() {
    let (exit, schema) = run(&["plants", "list", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    assert!(schema.get("command").is_none(), "{schema:#}");

    let (exit, schema) = run(&["compost", "--schema"]);
    assert_eq!(exit, 4, "{schema:#}");
    assert_eq!(schema["error"]["reason"], "discoveryError");
}

#[test]
fn root_schema_lists_custom_commands() {
    let (exit, schema) = run(&["--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    let names: Vec<&str> = schema["customCommands"]
        .as_array()
        .unwrap_or_else(|| panic!("no customCommands in {schema:#}"))
        .iter()
        .map(|e| e["command"].as_str().unwrap())
        .collect();
    assert_eq!(
        names,
        ["water", "plants prune", "garden check", "garden seed"]
    );
}

#[test]
fn root_schema_omits_custom_commands_when_there_are_none() {
    let mut out: Vec<u8> = Vec::new();
    let exit = CliApp::new("probe-cli")
        .binding(OpenApiBinding::new().spec(SPEC))
        .try_run_from_with_output(["probe-cli", "--schema"], &mut out);
    assert_eq!(exit, 0);
    let schema: serde_json::Value = serde_json::from_slice(&out).unwrap();
    assert!(schema.get("customCommands").is_none(), "{schema:#}");
}

#[test]
fn schema_on_a_runnable_custom_command_with_subcommands_describes_it() {
    let app = || {
        CliApp::new("probe-cli")
            .binding(OpenApiBinding::new().spec(SPEC))
            .command(
                clap::Command::new("bloom")
                    .about("Report what is in bloom")
                    .arg(
                        clap::Arg::new("color")
                            .long("color")
                            .help("Only this color"),
                    )
                    .subcommand(clap::Command::new("config").about("Show bloom settings")),
                OpenApiBinding::handler(handle),
            )
    };
    let schema = |args: &[&str]| {
        let mut argv = vec!["probe-cli"];
        argv.extend_from_slice(args);
        let mut out: Vec<u8> = Vec::new();
        let exit = app().try_run_from_with_output(argv, &mut out);
        (
            exit,
            serde_json::from_slice::<serde_json::Value>(&out).unwrap(),
        )
    };

    let (exit, bloom) = schema(&["bloom", "--schema"]);
    assert_eq!(exit, 0, "{bloom:#}");
    assert_eq!(bloom["command"], "bloom", "{bloom:#}");
    assert_eq!(bloom["flags"][0]["flag"], "--color", "{bloom:#}");

    let (exit, config) = schema(&["bloom", "config", "--schema"]);
    assert_eq!(exit, 0, "{config:#}");
    assert_eq!(config["command"], "bloom config", "{config:#}");

    let (_, root) = schema(&["--schema"]);
    let names: Vec<&str> = root["customCommands"]
        .as_array()
        .unwrap()
        .iter()
        .map(|entry| entry["command"].as_str().unwrap())
        .collect();
    assert_eq!(names, ["bloom", "bloom config"], "{root:#}");
}

#[test]
fn schema_on_a_spec_group_also_lists_its_custom_commands() {
    let (exit, schema) = run(&["plants", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    let entries = schema.as_array().expect("array");
    assert!(
        entries.iter().any(|e| e["command"] == "plants prune"),
        "{schema:#}"
    );
    assert!(
        entries.iter().any(|e| e.get("command").is_none()),
        "spec operation missing: {schema:#}"
    );
}

fn run_with(app: CliApp, args: &[&str]) -> (i32, serde_json::Value) {
    let mut argv = vec!["probe-cli"];
    argv.extend_from_slice(args);
    let mut out: Vec<u8> = Vec::new();
    let exit = app.try_run_from_with_output(argv, &mut out);
    (exit, serde_json::from_slice(&out).unwrap())
}

#[test]
fn a_custom_command_replacing_a_spec_operation_owns_its_schema() {
    let app = CliApp::new("probe-cli")
        .binding(OpenApiBinding::new().spec(SPEC))
        .command_under(
            &["plants"],
            clap::Command::new("list").about("List plants from the local cache"),
            OpenApiBinding::handler(handle),
        );
    let (exit, schema) = run_with(app, &["plants", "list", "--schema"]);
    assert_eq!(exit, 0, "{schema:#}");
    assert_eq!(schema["command"], "plants list", "{schema:#}");
    assert_eq!(schema["description"], "List plants from the local cache");
}

#[test]
fn hidden_custom_commands_are_described_but_not_listed() {
    let app = || {
        CliApp::new("probe-cli")
            .binding(OpenApiBinding::new().spec(SPEC))
            .command(
                clap::Command::new("debug").about("Internal").hide(true),
                OpenApiBinding::handler(handle),
            )
            .command(
                clap::Command::new("lab").about("Experiments"),
                OpenApiBinding::handler(handle),
            )
            .command(
                clap::Command::new("water").about("Water every plant"),
                OpenApiBinding::handler(handle),
            )
            .hide(&["lab"])
    };
    let (_, root) = run_with(app(), &["--schema"]);
    let names: Vec<&str> = root["customCommands"]
        .as_array()
        .unwrap()
        .iter()
        .map(|e| e["command"].as_str().unwrap())
        .collect();
    assert_eq!(names, ["water"], "{root:#}");

    let (exit, debug) = run_with(app(), &["debug", "--schema"]);
    assert_eq!(exit, 0, "{debug:#}");
    assert_eq!(debug["command"], "debug");
}
