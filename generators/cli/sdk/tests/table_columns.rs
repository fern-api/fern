//! `x-fern-cli-table` end to end: curated columns in `table` output, the
//! `--columns` picker, and the paths that must keep the full response.
//!
//! Driven through the real binary because the curated table is applied by
//! the root `CliApp` after dispatch (and by the executor for `--page-all`).
//! Template-author-only: `tests/**` is excluded from generated output via
//! `.sdk-ignore.json`.

use std::process::{Command, Output};
use wiremock::matchers::{method, path, query_param, query_param_is_missing};
use wiremock::{Mock, MockServer, ResponseTemplate};

fn dataset(name: &str, version: u32, rows: u32, created: &str) -> serde_json::Value {
    serde_json::json!({
        "name": name,
        "version": version,
        "stage": "draft",
        "stats": { "rows": rows },
        "createdAt": created,
        "description": "Effort sampling across STEM and math tasks",
        "datasetId": format!("id-{name}"),
        "metadata": { "pipeline_url": "https://github.com/example/pipeline" },
    })
}

async fn server() -> MockServer {
    let server = MockServer::start().await;
    Mock::given(method("GET"))
        .and(path("/catalog/datasets"))
        .and(query_param_is_missing("cursor"))
        .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
            "datasets": [
                dataset("aa_lcr", 10, 3870, "2026-06-30T12:00:00Z"),
                dataset("aa_lcr_128k", 1, 3872, "2026-06-17T08:30:00Z"),
            ],
            "next": "p2",
        })))
        .mount(&server)
        .await;
    Mock::given(method("GET"))
        .and(path("/catalog/datasets"))
        .and(query_param("cursor", "p2"))
        .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
            "datasets": [dataset("math_v2", 2, 3303, "2026-09-08T00:00:00Z")],
        })))
        .mount(&server)
        .await;
    server
}

fn run(server: &MockServer, args: &[&str]) -> Output {
    Command::new(env!("CARGO_BIN_EXE_openapi-fixture"))
        .args(args)
        .args(["--base-url", &server.uri()])
        .env("OPENAPI_FIXTURE_API_KEY", "sk-test")
        .env_remove("OPENAPI_FIXTURE_OUTPUT")
        .output()
        .expect("failed to run the fixture binary")
}

fn stdout(out: &Output) -> String {
    assert_eq!(
        out.status.code(),
        Some(0),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    String::from_utf8_lossy(&out.stdout).into_owned()
}

#[tokio::test(flavor = "multi_thread")]
async fn table_output_uses_the_declared_columns() {
    let server = server().await;
    let text = stdout(&run(&server, &["catalog", "list", "--format", "table"]));
    assert_eq!(
        text,
        "NAME          V  STAGE  ROWS  CREATED\n\
         ───────────  ──  ─────  ────  ──────────\n\
         aa_lcr       10  draft  3870  2026-06-30\n\
         aa_lcr_128k   1  draft  3872  2026-06-17\n\n"
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn page_all_prints_the_header_once() {
    let server = server().await;
    let text = stdout(&run(
        &server,
        &["catalog", "list", "--format", "table", "--page-all"],
    ));
    assert_eq!(text.matches("NAME").count(), 1, "{text}");
    for name in ["aa_lcr ", "aa_lcr_128k", "math_v2"] {
        assert!(text.contains(name), "missing {name} in:\n{text}");
    }
    assert!(!text.contains("datasetId"), "{text}");
}

#[tokio::test(flavor = "multi_thread")]
async fn machine_formats_keep_the_full_response() {
    let server = server().await;
    let json: serde_json::Value = serde_json::from_str(&stdout(&run(
        &server,
        &["catalog", "list", "--format", "json"],
    )))
    .unwrap();
    assert_eq!(json[0]["datasetId"], "id-aa_lcr", "{json:#}");
    assert_eq!(
        json[0]["metadata"]["pipeline_url"],
        "https://github.com/example/pipeline"
    );
    for format in ["csv", "yaml", "jsonl"] {
        let text = stdout(&run(&server, &["catalog", "list", "--format", format]));
        assert!(text.contains("datasetId"), "{format}: {text}");
    }
}

#[tokio::test(flavor = "multi_thread")]
async fn query_overrides_the_declared_columns() {
    let server = server().await;
    let text = stdout(&run(
        &server,
        &[
            "catalog",
            "list",
            "--format",
            "table",
            "--query",
            "[].{id: datasetId}",
        ],
    ));
    assert!(text.starts_with("id "), "{text}");
    assert!(text.contains("id-aa_lcr"), "{text}");
    assert!(!text.contains("NAME"), "{text}");
}

#[tokio::test(flavor = "multi_thread")]
async fn columns_flag_picks_adds_and_resets_columns() {
    let server = server().await;
    // No --format: stdout is piped (JSON by default), and --columns asks
    // for a table.
    let picked = stdout(&run(
        &server,
        &["catalog", "list", "--columns", "name,datasetId"],
    ));
    assert!(picked.starts_with("NAME         datasetId\n"), "{picked}");
    assert!(picked.contains("aa_lcr_128k  id-aa_lcr_128k"), "{picked}");

    let added = stdout(&run(
        &server,
        &["catalog", "list", "--columns", "+description,-v"],
    ));
    let header = added.lines().next().unwrap();
    assert_eq!(header, "NAME         STAGE  ROWS  CREATED     DESCRIPTION");
    assert!(added.contains("Effort sampling acr…"), "{added}");

    let all = stdout(&run(&server, &["catalog", "list", "--columns", "all"]));
    assert!(all.contains("metadata.pipeline_url"), "{all}");
}

#[tokio::test(flavor = "multi_thread")]
async fn a_recovered_response_keeps_the_selected_columns() {
    let server = MockServer::start().await;
    Mock::given(method("GET"))
        .and(path("/catalog/datasets"))
        .respond_with(ResponseTemplate::new(409).set_body_json(serde_json::json!({
            "message": "conflict"
        })))
        .mount(&server)
        .await;
    let text = stdout(&run(&server, &["catalog", "list", "--columns", "name,v"]));
    assert_eq!(text, "NAME       V\n─────────  ─\nrecovered  1\n\n");
}

#[tokio::test(flavor = "multi_thread")]
async fn columns_flag_rejects_conflicting_flags() {
    let server = server().await;
    for args in [
        &["catalog", "list", "--columns", "name", "--format", "json"][..],
        &["catalog", "list", "--columns", "name", "--query", "[].name"][..],
        &["catalog", "list", "--columns", "name,+stage"][..],
    ] {
        let out = run(&server, args);
        assert_ne!(out.status.code(), Some(0), "{args:?} should fail");
    }
}

#[test]
fn an_operation_with_its_own_columns_parameter_keeps_it() {
    let out = Command::new(env!("CARGO_BIN_EXE_openapi-fixture"))
        .args(["catalog", "listExports", "--help"])
        .output()
        .unwrap();
    let help = String::from_utf8_lossy(&out.stdout);
    assert!(help.contains("--columns <"), "{help}");
    assert!(help.contains("--table-columns <COLS>"), "{help}");
}
