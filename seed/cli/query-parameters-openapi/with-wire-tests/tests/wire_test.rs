//! Auto-generated wire tests by @fern-api/cli-generator.
//!
//! Each test stands up an in-process `wiremock` server, points the
//! generated CLI at it via `--base-url`, drives one endpoint from an IR
//! example (`--params` / `--json`), and asserts the CLI (a) hit the mock
//! exactly once with the right method + path and (b) rendered the mocked
//! response body to stdout.
//!
//! No docker, no network — runs under a plain `cargo test`. Regenerated on
//! every `fern generate`; do not edit by hand.
#![allow(dead_code)]

use serde::Deserialize;
use std::collections::HashMap;
use wiremock::matchers::{method as match_method, path as match_path};
use wiremock::{Mock, MockServer, ResponseTemplate};

use fern_cli_sdk::openapi::discovery::RestResource;
use fern_cli_sdk::openapi::load_openapi_spec;

const MANIFEST: &str = include_str!("../wiremock/wire-test-cases.json");

#[derive(Deserialize)]
struct Manifest {
    #[serde(rename = "binaryName")]
    binary_name: String,
    #[serde(rename = "rootGroup")]
    root_group: Option<String>,
    specs: Vec<SpecEntry>,
    #[serde(rename = "authEnvVars")]
    auth_env_vars: Vec<String>,
    cases: Vec<Case>,
}

#[derive(Deserialize)]
struct SpecEntry {
    file: String,
    namespace: Option<String>,
}

#[derive(Deserialize)]
struct Case {
    id: String,
    method: String,
    path: String,
    params: serde_json::Map<String, serde_json::Value>,
    #[serde(default)]
    body: serde_json::Value,
    response: ExpectedResponse,
}

#[derive(Deserialize)]
struct ExpectedResponse {
    status: u16,
    body: String,
}

fn load_manifest() -> Manifest {
    serde_json::from_str(MANIFEST).expect("wire-test-cases.json is valid JSON")
}

/// Normalize a URL path for comparison: ensure a leading slash and drop any
/// trailing slash.
fn normalize_path(path: &str) -> String {
    let trimmed = path.trim_end_matches('/');
    if trimmed.starts_with('/') {
        trimmed.to_string()
    } else {
        format!("/{trimmed}")
    }
}

/// Recursively collect `(command_chain, http_method, path)` from a resource
/// tree, prefixing every chain with `prefix` (root group + spec namespace).
fn collect_commands(
    resources: &HashMap<String, RestResource>,
    prefix: &[String],
    out: &mut Vec<(Vec<String>, String, String)>,
) {
    for (name, resource) in resources {
        let mut chain = prefix.to_vec();
        chain.push(name.clone());
        for (method_name, method) in &resource.methods {
            let mut full = chain.clone();
            full.push(method_name.clone());
            out.push((full, method.http_method.to_uppercase(), method.path.clone()));
        }
        collect_commands(&resource.resources, &chain, out);
    }
}

/// Resolve the CLI command chain for a `(method, path)` by loading the baked
/// specs the binary runs on and matching against the SDK's discovery tree.
fn resolve_command(manifest: &Manifest, method: &str, path: &str) -> Vec<String> {
    let mut commands: Vec<(Vec<String>, String, String)> = Vec::new();
    for spec in &manifest.specs {
        let spec_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), spec.file);
        let contents = std::fs::read_to_string(&spec_path)
            .unwrap_or_else(|e| panic!("failed to read baked spec {spec_path}: {e}"));
        let doc = load_openapi_spec(&contents, &manifest.binary_name)
            .unwrap_or_else(|e| panic!("failed to parse baked spec {spec_path}: {e:?}"));
        let mut prefix: Vec<String> = Vec::new();
        if let Some(root_group) = &manifest.root_group {
            prefix.push(root_group.clone());
        }
        if let Some(namespace) = &spec.namespace {
            prefix.push(namespace.clone());
        }
        collect_commands(&doc.resources, &prefix, &mut commands);
    }

    let want_method = method.to_uppercase();
    let want_path = normalize_path(path);

    // Exact match on method + normalized path.
    let mut hits: Vec<Vec<String>> = commands
        .iter()
        .filter(|(_, m, p)| *m == want_method && normalize_path(p) == want_path)
        .map(|(chain, _, _)| chain.clone())
        .collect();

    // Fallback: tolerate base-path prefixes by matching path suffixes.
    if hits.is_empty() {
        hits = commands
            .iter()
            .filter(|(_, m, p)| {
                let np = normalize_path(p);
                *m == want_method && (np.ends_with(&want_path) || want_path.ends_with(&np))
            })
            .map(|(chain, _, _)| chain.clone())
            .collect();
    }

    match hits.len() {
        1 => hits.pop().unwrap(),
        0 => {
            let available: Vec<String> = commands
                .iter()
                .map(|(chain, m, p)| format!("{} {} ({m} {p})", manifest.binary_name, chain.join(" ")))
                .collect();
            panic!(
                "no CLI command found for {method} {path}.
available commands:
  {}",
                available.join("
  ")
            )
        }
        _ => {
            // Ambiguous (multi-spec with the same method+path). Take the first
            // deterministically; multi-spec disambiguation is best-effort.
            hits.remove(0)
        }
    }
}

/// Substitute `{param}` placeholders in a path template with values from the
/// case params, so we can assert the request landed on the resolved path.
fn substitute_path(template: &str, params: &serde_json::Map<String, serde_json::Value>) -> String {
    let mut path = template.to_string();
    for (key, value) in params {
        let placeholder = format!("{{{key}}}");
        if path.contains(&placeholder) {
            let rendered = match value {
                serde_json::Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            path = path.replace(&placeholder, &rendered);
        }
    }
    path
}

async fn run_case(id: &str) {
    let manifest = load_manifest();
    let case = manifest
        .cases
        .iter()
        .find(|c| c.id == id)
        .unwrap_or_else(|| panic!("wire-test case {id} not found in manifest"));

    let command = resolve_command(&manifest, &case.method, &case.path);
    let expected_path = substitute_path(&case.path, &case.params);

    let server = MockServer::start().await;

    let mut template = ResponseTemplate::new(case.response.status);
    if !case.response.body.is_empty() {
        template = template.set_body_raw(case.response.body.clone().into_bytes(), "application/json");
    }
    Mock::given(match_method(case.method.as_str()))
        .and(match_path(expected_path.clone()))
        .respond_with(template)
        .expect(1)
        .mount(&server)
        .await;

    let mut args: Vec<String> = command.clone();
    args.push("--base-url".to_string());
    args.push(server.uri());
    args.push("--no-pager".to_string());
    if !case.params.is_empty() {
        args.push("--params".to_string());
        args.push(serde_json::to_string(&case.params).expect("params serialize"));
    }
    if !case.body.is_null() {
        args.push("--json".to_string());
        args.push(serde_json::to_string(&case.body).expect("body serialize"));
    }

    let mut cmd = tokio::process::Command::new(env!("CARGO_BIN_EXE_query-parameters-api"));
    cmd.args(&args);
    // Dummy credentials so auth-gated endpoints don't bail on a missing secret.
    for var in &manifest.auth_env_vars {
        cmd.env(var, "test");
    }
    cmd.env("NO_COLOR", "1");

    let output = cmd
        .output()
        .await
        .unwrap_or_else(|e| panic!("failed to spawn generated CLI binary: {e}"));

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(
        output.status.success(),
        "CLI exited with {:?}
  command: {} {}
  stdout: {stdout}
  stderr: {stderr}",
        output.status.code(),
        manifest.binary_name,
        args.join(" ")
    );

    if case.response.body.trim().is_empty() {
        assert!(
            stdout.trim().is_empty(),
            "expected empty output for {id}, got: {stdout}"
        );
    } else {
        let expected: serde_json::Value =
            serde_json::from_str(&case.response.body).expect("expected response body is valid JSON");
        let actual: serde_json::Value = serde_json::from_str(stdout.trim())
            .unwrap_or_else(|e| panic!("CLI stdout for {id} was not valid JSON: {e}
  stdout: {stdout}"));
        assert_eq!(actual, expected, "rendered response body mismatch for {id}");
    }

    // `Mock::expect(1)` verifies exactly-one matching request on server drop.
}

#[tokio::test]
async fn wire_search() {
    run_case("search").await;
}
