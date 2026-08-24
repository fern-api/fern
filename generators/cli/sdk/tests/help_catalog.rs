//! `--help` with an explicit machine format emits the operation catalog.
//!
//! The generated README has always documented
//! `<cli> --help --format json | jq '.operations | length'` as the
//! machine-readable list of every operation; it printed prose instead, so the
//! documented command failed with a jq parse error.
//!
//! Driven through the real binary because the behaviour lives in
//! `dispatch_pipeline`'s pre-clap interception, which has no unit seam. These
//! tests are template-author-only — `tests/**` is excluded from generated
//! output via `.sdk-ignore.json`.

use std::process::{Command, Output};

fn run(args: &[&str]) -> Output {
    Command::new(env!("CARGO_BIN_EXE_openapi-fixture"))
        .args(args)
        .output()
        .expect("failed to run the fixture binary")
}

fn stdout(out: &Output) -> String {
    String::from_utf8_lossy(&out.stdout).into_owned()
}

#[test]
fn help_with_explicit_json_emits_the_operation_catalog() {
    let out = run(&["--help", "--format", "json"]);
    assert_eq!(out.status.code(), Some(0));
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout(&out)).expect("must be JSON, not prose");
    let ops = parsed["operations"]
        .as_array()
        .expect("catalog carries an `operations` array");
    assert!(!ops.is_empty(), "got: {parsed:#}");
    // Identical to what `--schema` produces for the same scope.
    assert_eq!(stdout(&out), stdout(&run(&["--schema"])));
}

#[test]
fn help_without_an_explicit_format_stays_prose() {
    // `<cli> --help | less` is piped, so the resolved format is machine-readable
    // by default. Keying off that instead of the explicit flag would replace
    // help with JSON for anyone paging it.
    let out = run(&["--help"]);
    assert_eq!(out.status.code(), Some(0));
    assert!(
        serde_json::from_str::<serde_json::Value>(&stdout(&out)).is_err(),
        "expected prose, got JSON: {}",
        stdout(&out)
    );

    // An explicit *human* format likewise stays prose.
    let out = run(&["--help", "--format", "table"]);
    assert!(serde_json::from_str::<serde_json::Value>(&stdout(&out)).is_err());
}

#[test]
fn help_on_a_builtin_subcommand_falls_back_to_prose() {
    // `completion`, `man` and `auth login` are not API operations, so the
    // catalog lookup finds nothing. Someone asking for help on one must get
    // help — erroring `discoveryError` with exit 4 is a worse answer than the
    // prose they asked for.
    for path in [
        vec!["completion", "--help", "--format", "json"],
        vec!["auth", "login", "--help", "--format", "json"],
    ] {
        let out = run(&path);
        assert_eq!(out.status.code(), Some(0), "args: {path:?}");
        assert!(!stdout(&out).is_empty(), "args: {path:?}");
    }
}

#[test]
fn explicit_schema_on_a_pathless_command_still_errors() {
    // The fallback above must not weaken `--schema` itself: asking for a
    // document that does not exist is a real error.
    let out = run(&["completion", "--schema"]);
    assert_eq!(out.status.code(), Some(4));
    let parsed: serde_json::Value = serde_json::from_str(&stdout(&out)).unwrap();
    assert_eq!(parsed["error"]["reason"], "discoveryError");
}
