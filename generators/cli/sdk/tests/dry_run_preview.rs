//! `--dry-run` prints the whole request preview, in every output format.
//!
//! On a terminal the default format is `table`, whose list heuristic used to
//! pick the preview's `headers` array as "the items" and print a single header
//! row — no URL, method, or body. Driven through the real binary because the
//! preview is formatted by the root `CliApp` after dispatch, not by the
//! executor that builds it. Template-author-only: `tests/**` is excluded from
//! generated output via `.sdk-ignore.json`.

use std::process::{Command, Output};

fn run(args: &[&str], api_key: Option<&str>) -> Output {
    let mut command = Command::new(env!("CARGO_BIN_EXE_openapi-fixture"));
    command.args(args).env_remove("OPENAPI_FIXTURE_API_KEY");
    if let Some(key) = api_key {
        command.env("OPENAPI_FIXTURE_API_KEY", key);
    }
    command.output().expect("failed to run the fixture binary")
}

fn stdout(out: &Output) -> String {
    String::from_utf8_lossy(&out.stdout).into_owned()
}

#[test]
fn table_dry_run_shows_the_whole_request() {
    let out = run(
        &["users", "list", "--dry-run", "--format", "table"],
        Some("sk-secret"),
    );
    assert_eq!(out.status.code(), Some(0), "{}", stdout(&out));
    let text = stdout(&out);
    for needle in [
        "url                     https://api.fixture.example/v1/users",
        "method                  GET",
        "headers.X-API-Stage     production",
        "query_params.user_type  all",
        "auth.credentials        resolved",
        "auth.sources            OPENAPI_FIXTURE_API_KEY environment variable",
    ] {
        assert!(text.contains(needle), "missing {needle:?} in:\n{text}");
    }
    assert!(
        !text.contains("sk-secret"),
        "credential values must never be printed:\n{text}"
    );
}

#[test]
fn dry_run_reports_missing_credentials_without_failing() {
    let out = run(&["users", "list", "--dry-run", "--format", "json"], None);
    assert_eq!(out.status.code(), Some(0), "{}", stdout(&out));
    let preview: serde_json::Value = serde_json::from_str(&stdout(&out)).expect("JSON preview");
    assert_eq!(preview["dry_run"], true);
    assert_eq!(preview["url"], "https://api.fixture.example/v1/users");
    assert_eq!(preview["auth"]["credentials"], "missing", "{preview:#}");
    assert!(
        preview["auth"]["expected_sources"]
            .as_array()
            .is_some_and(|s| s.iter().any(|h| {
                h.as_str()
                    .is_some_and(|h| h.contains("OPENAPI_FIXTURE_API_KEY"))
            })),
        "{preview:#}"
    );
}
