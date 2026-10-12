//! The generated CLI's own documentation surfaces — `--help`, `man`, and
//! `completion --help` — name the real binary, describe namespaced groups,
//! and keep subcommand help focused on the command's own flags.
//!
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use fern_cli_sdk::app::CliApp;
use fern_cli_sdk::openapi::OpenApiBinding;

const THINGS_SPEC: &str = r#"
openapi: 3.0.0
info:
  title: Things API
  version: "1.0"
  description: Create and manage things.
servers:
  - url: https://api.example.com
paths:
  /things:
    get:
      operationId: things_list
      tags: [things]
      summary: List things
      responses:
        "200": { description: ok }
"#;

fn run(args: &[&str]) -> (i32, String) {
    let mut out: Vec<u8> = Vec::new();
    let code = CliApp::new("acme-cli")
        .binding(OpenApiBinding::new().spec_under("things", THINGS_SPEC))
        .try_run_from_with_output(args, &mut out);
    (code, String::from_utf8_lossy(&out).into_owned())
}

#[test]
fn namespaced_group_is_described_by_the_spec_info_description() {
    let (code, output) = run(&["acme-cli", "--help"]);
    assert_eq!(code, 0, "{output}");
    assert!(output.contains("Create and manage things."), "{output}");
    assert!(!output.contains("Operations on"), "{output}");
}

#[test]
fn help_placeholders_name_the_binary() {
    for args in [
        vec!["acme-cli", "--help"],
        vec!["acme-cli", "things", "list", "--help"],
        vec!["acme-cli", "completion", "--help"],
        vec!["acme-cli", "man", "--help"],
    ] {
        let (code, output) = run(&args);
        assert_eq!(code, 0, "{args:?}: {output}");
        assert!(!output.contains("<NAME>_"), "{args:?}: {output}");
        assert!(!output.contains("<CLI>"), "{args:?}: {output}");
    }
    let (_, output) = run(&["acme-cli", "things", "list", "--help"]);
    assert!(output.contains("ACME_CLI_RETRIES"), "{output}");
    let (_, output) = run(&["acme-cli", "completion", "--help"]);
    assert!(output.contains("acme-cli completion bash"), "{output}");
}

#[test]
fn subcommand_help_indexes_global_flags_instead_of_repeating_them() {
    let (code, root) = run(&["acme-cli", "--help"]);
    assert_eq!(code, 0, "{root}");
    assert!(root.contains("--dry-run"), "{root}");
    assert!(root.contains("ACME_CLI_OUTPUT"), "{root}");

    let (code, leaf) = run(&["acme-cli", "things", "list", "--help"]);
    assert_eq!(code, 0, "{leaf}");
    let index = leaf
        .split("Global options:")
        .nth(1)
        .unwrap_or_else(|| panic!("no global options index: {leaf}"));
    assert!(index.contains("--format,"), "{leaf}");
    assert!(
        index.contains("Run `acme-cli --help` for details and environment variables."),
        "{leaf}"
    );
    // Only the index, not the root's per-flag descriptions.
    assert_eq!(leaf.matches("--dry-run").count(), 1, "{leaf}");
    // Request options stay listed with their descriptions.
    assert!(leaf.contains("--no-retry"), "{leaf}");
    assert!(leaf.contains("--params <JSON>"), "{leaf}");
}

#[test]
fn hidden_global_flags_are_still_accepted_on_subcommands() {
    let (code, output) = run(&[
        "acme-cli",
        "things",
        "list",
        "--dry-run",
        "--format",
        "json",
    ]);
    assert_eq!(code, 0, "{output}");
    assert!(
        output.contains("https://api.example.com/things"),
        "{output}"
    );
}

#[test]
fn man_renders_a_subcommand_page() {
    let (code, output) = run(&["acme-cli", "man", "things"]);
    assert_eq!(code, 0, "{output}");
    assert!(output.contains(".TH acme-cli-things 1"), "{output}");
    assert!(
        output.contains("\"acme-cli "),
        "footer names the CLI build: {output}"
    );
    assert!(output.contains("acme\\-cli things"), "{output}");
}

#[test]
fn man_rejects_an_unknown_command() {
    let (code, output) = run(&["acme-cli", "man", "nope"]);
    assert_ne!(code, 0, "{output}");
}

#[test]
fn man_output_dir_writes_every_cross_referenced_page() {
    let dir = std::env::temp_dir().join(format!("fern-cli-man-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let dir_arg = dir.to_string_lossy().into_owned();
    let (code, output) = run(&["acme-cli", "man", "--output-dir", &dir_arg]);
    assert_eq!(code, 0, "{output}");
    for page in ["acme-cli.1", "acme-cli-things.1", "acme-cli-things-list.1"] {
        assert!(dir.join(page).is_file(), "missing {page}; wrote:\n{output}");
    }
    let root = std::fs::read_to_string(dir.join("acme-cli.1")).unwrap();
    assert!(root.contains("acme\\-cli\\-things(1)"), "{root}");
    let _ = std::fs::remove_dir_all(&dir);
}
